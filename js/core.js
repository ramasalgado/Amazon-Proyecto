/* ============================================================
   CORE — estado, router, utilidades, íconos, ilustraciones
   ============================================================ */
(function () {
  'use strict';
  const D = window.DATA;
  const KEY = 'amazon-hub-locker-proto-v2';

  /* ---------- Utilidades ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const money = n => '$ ' + Math.round(n).toLocaleString('es-AR');
  const km = n => String(n).replace('.', ',') + ' km';
  const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const pad = n => String(n).padStart(2, '0');
  const hhmm = ts => { const d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const dayLabel = ts => { const d = new Date(ts); return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; };
  const shortDate = ts => { const d = new Date(ts); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); };
  const whenLabel = ts => {
    const t = new Date(), d = new Date(ts);
    const same = t.toDateString() === d.toDateString();
    return (same ? 'Hoy' : dayLabel(ts)) + ', ' + hhmm(ts);
  };
  const ago = ts => {
    const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (m < 1) return 'ahora';
    if (m < 60) return 'hace ' + m + ' min';
    const h = Math.round(m / 60);
    if (h < 24) return 'hace ' + h + ' h';
    return 'hace ' + Math.round(h / 24) + ' d';
  };
  const DAY = 86400000;
  const product = id => D.products.find(p => p.id === id);
  const locker = id => D.lockers.find(l => l.id === id);

  /* ---------- Estado persistente ---------- */
  function initialState() {
    const t = Date.now();
    return {
      cart: [],
      checkout: { delivery: 'home', lockerId: null, address: D.addresses[0].text, card: 'c1' },
      orders: D.seedOrders.map(o => {
        const created = t - o.daysAgo * DAY;
        return {
          id: o.id, items: [{ pid: o.pid, qty: o.qty }], total: product(o.pid).price * o.qty, delivery: o.delivery,
          lockerId: o.lockerId, address: D.addresses[0].text, status: o.status, createdAt: created,
          times: { confirmed: created, preparing: created + 3600000 * 4, transit: created + DAY, atLocker: created + DAY * 2, ready: created + DAY * 2 + 3600000, pickedUp: created + DAY * 3 },
          code: window.PICKUP_CODE, compartment: 'B-07', cancelled: false, surveyDone: true
        };
      }),
      favorites: [],
      notifications: [],
      prefs: { push: true, email: true },
      recent: [],
      loggedIn: false,
      user: null,
      accounts: [Object.assign({}, D.demoAccount)],
      nav: [{ name: 'welcome', params: {} }],
      log: [],
      tasks: {},
      seen: {}
    };
  }
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || initialState(); } catch (e) { S = initialState(); }
  if (!S.nav || !S.nav.length) S.nav = [{ name: 'welcome', params: {} }];
  let saveT;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sin storage */ } }, 30);
  }
  function resetAll() {
    try { localStorage.removeItem(KEY); } catch (e) { /* noop */ }
    location.reload();
  }

  /* ---------- Log de eventos (para el facilitador) ---------- */
  function logEvent(type, detail) {
    S.log.push({ t: Date.now(), type, detail: detail || '' });
    if (S.log.length > 400) S.log.shift();
    save();
    if (window.FAC) window.FAC.refresh();
  }

  /* ---------- Pedidos: helpers ---------- */
  const seqFor = o => (o.delivery === 'home' ? ['confirmed', 'preparing', 'transit', 'delivered'] : window.STATUS);
  const isDone = o => o.status === 'pickedUp' || o.status === 'delivered';
  const statusIdx = o => seqFor(o).indexOf(o.status);
  const lastOrder = () => S.orders.filter(o => !o.cancelled).sort((a, b) => b.createdAt - a.createdAt)[0];
  const HOURS72 = 72 * 3600000;
  const deadline = o => (o.times.ready || Date.now()) + HOURS72;
  const deadlineLabel = o => dayLabel(deadline(o)) + ', ' + hhmm(deadline(o));
  const remaining = o => {
    const left = Math.max(0, deadline(o) - Date.now()), m = Math.floor(left / 60000);
    return { text: Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min', pct: Math.max(0, Math.min(100, left / HOURS72 * 100)) };
  };
  const mapsUrl = l => 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Amazon Hub Locker ' + l.name + ', ' + l.address + ', Buenos Aires, Argentina') + '&travelmode=walking';
  const etaTransit = o => (o.times.preparing || o.createdAt) + 2 * DAY;

  function notify(n) {
    const item = Object.assign({ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 5), ts: Date.now(), read: false }, n);
    S.notifications.unshift(item);
    save();
    if (S.prefs.push && window.UI) window.UI.push(item);
    if (window.APP) window.APP.refreshBadges();
    return item;
  }

  function advanceOrder(o, to) {
    const seq = seqFor(o);
    const next = to || seq[Math.min(seq.length - 1, statusIdx(o) + 1)];
    if (!next || next === o.status) return false;
    const targetIdx = seq.indexOf(next);
    for (let i = statusIdx(o) + 1; i <= targetIdx; i++) o.times[seq[i]] = Date.now();
    o.status = next;
    const l = o.lockerId ? locker(o.lockerId) : null;
    if (next === 'transit' && o.delivery === 'locker') {
      notify({ type: 'transit', orderId: o.id, title: 'Tu pedido está en camino', body: 'Tu pedido ya fue despachado y llegará al locker de ' + l.name + ' entre las 12 h y las 14 h.' });
    }
    if (next === 'transit' && o.delivery === 'home') {
      notify({ type: 'transit', orderId: o.id, title: 'Tu pedido está en camino', body: 'Tu pedido ya fue despachado. Llega a tu domicilio entre las 12 h y las 18 h.' });
    }
    if (next === 'ready') {
      notify({ type: 'ready', orderId: o.id, title: 'Tu pedido está disponible', body: 'Ya podés retirarlo en el Amazon Hub Locker de ' + l.name + '. Tenés 72 h para retirarlo (hasta el ' + deadlineLabel(o) + ').' });
    }
    if (next === 'delivered') {
      notify({ type: 'info', orderId: o.id, title: 'Tu pedido fue entregado', body: 'Entregamos tu pedido en tu domicilio.' });
    }
    save();
    logEvent('estado', 'Pedido ' + o.id + ' → ' + (window.STATUS_LABEL[next] || 'Entregado'));
    return true;
  }

  /* ---------- Router ---------- */
  const R = {
    dir: 'none',
    cur() { return S.nav[S.nav.length - 1]; },
    go(name, params) { R.dir = 'fwd'; S.nav.push({ name, params: params || {} }); logEvent('nav', name); save(); window.APP.render(); },
    replace(name, params) { R.dir = 'fade'; S.nav[S.nav.length - 1] = { name, params: params || {} }; logEvent('nav', name + ' (replace)'); save(); window.APP.render(); },
    reset(name, params) { R.dir = 'fade'; S.nav = [{ name, params: params || {} }]; logEvent('nav', name + ' (tab)'); save(); window.APP.render(); },
    back() {
      if (S.nav.length > 1) { R.dir = 'back'; S.nav.pop(); logEvent('nav', 'atrás → ' + R.cur().name); save(); window.APP.render(); }
    },
    /* vuelve hasta una pantalla del stack; si no está, la apila */
    backTo(name, params) {
      const i = S.nav.map(n => n.name).lastIndexOf(name);
      if (i >= 0) { R.dir = 'back'; S.nav = S.nav.slice(0, i + 1); logEvent('nav', 'atrás → ' + name); save(); window.APP.render(); }
      else R.reset(name, params);
    },
    /* quita las N pantallas anteriores a la actual para que "atrás" no repita pasos */
    dropBefore(names) { S.nav = S.nav.filter((n, i) => i === S.nav.length - 1 || names.indexOf(n.name) < 0); }
  };

  /* ---------- Íconos ---------- */
  const P = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    orders: '<rect x="5" y="4" width="14" height="17" rx="2.2"/><path d="M9 4V2.8h6V4M9 11h6M9 15h4"/>',
    locker: '<path d="M12 3l8 4.5v9L12 21l-8-4.500v-9L12 3z"/><path d="M4 7.500l8 4.500 8-4.500M12 12v9"/>',
    user: '<circle cx="12" cy="8" r="3.800"/><path d="M4.500 20.500c0-3.900 3.400-6.300 7.500-6.300s7.500 2.400 7.500 6.300"/>',
    pin: '<path d="M12 21.500c-4.200-3.600-7.200-7.100-7.200-11a7.200 7.200 0 0114.400 0c0 3.900-3 7.400-7.200 11z"/><circle cx="12" cy="10.300" r="2.600"/>',
    qr: '<rect x="3.500" y="3.500" width="6.500" height="6.500" rx="1"/><rect x="14" y="3.500" width="6.500" height="6.500" rx="1"/><rect x="3.500" y="14" width="6.500" height="6.500" rx="1"/><path d="M14 14h3v3h-3zM20.500 14v3M17 20.500h3.500M14 20.500v.01"/>',
    bell: '<path d="M6 16.500V11a6 6 0 0112 0v5.500l1.800 1.800H4.200L6 16.500z"/><path d="M10 21h4"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.300 9.300a2.700 2.700 0 115.100 1.200c-.7 1-2.400 1.400-2.400 3M12 17v.01"/>',
    more: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    heart: '<path d="M12 20.500S4 15.300 4 9.600A4.300 4.300 0 018 5.300c1.700 0 3.200.9 4 2.300.8-1.400 2.300-2.300 4-2.300a4.300 4.300 0 014 4.300c0 5.700-8 10.900-8 10.900z"/>',
    share: '<path d="M12 15V3.500M7.500 8L12 3.500 16.500 8"/><path d="M5 12v7.500h14V12"/>',
    back: '<path d="M19 12H5M11 5.500L4.500 12 11 18.500"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevR: '<path d="M9 5l7 7-7 7"/>',
    chevL: '<path d="M15 5l-7 7 7 7"/>',
    chevD: '<path d="M5 9l7 7 7-7"/>',
    chevU: '<path d="M5 15l7-7 7 7"/>',
    check: '<path d="M4.500 12.500l5 5L19.500 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.200l3.300 2"/>',
    camera: '<path d="M4 8h3l1.500-2.500h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.500"/>',
    cart: '<path d="M2.500 3.500H5l2.200 11h10.600l2-8H6.200"/><circle cx="9" cy="19.500" r="1.400"/><circle cx="17" cy="19.500" r="1.400"/>',
    truck: '<path d="M2.500 6h11v10h-11zM13.500 9.500h4l3 3.500v3h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    store: '<path d="M3.500 9.500l1.500-5h14l1.500 5M4.500 9.500v10h15v-10M3.500 9.500c0 1.700 1.300 2.800 2.800 2.800s2.800-1.100 2.800-2.800c0 1.700 1.300 2.800 2.800 2.800s2.800-1.100 2.800-2.800c0 1.700 1.300 2.800 2.800 2.800s2.800-1.100 2.800-2.800"/>',
    cap: '<path d="M2 9.500L12 5l10 4.500-10 4.500z"/><path d="M6 11.500v4.300c0 1.200 2.700 2.700 6 2.700s6-1.500 6-2.700v-4.300M22 9.500v5.500"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    map: '<path d="M3.500 6.500l5.500-2.500 6 2.500 5.500-2.500v13.500l-5.500 2.500-6-2.500-5.500 2.500z"/><path d="M9 4v13.500M15 6.500V20"/>',
    list: '<path d="M8.500 6.500H20M8.500 12H20M8.500 17.500H20"/><path d="M4 6.500v.01M4 12v.01M4 17.500v.01"/>',
    trash: '<path d="M4.500 7h15M9.500 7V4.500h5V7M6.500 7l.8 12.500h9.400L17.500 7M10 11v5M14 11v5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.500M12 7.700v.01"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.800v2.400M12 18.800v2.400M2.800 12h2.400M18.800 12h2.400M5.500 5.500l1.700 1.700M16.800 16.800l1.700 1.700M5.500 18.500l1.700-1.700M16.800 7.200l1.700-1.700"/>',
    house: '<path d="M3 11l9-8 9 8"/><path d="M5 9.500V20h14V9.500"/><rect x="9.500" y="13" width="5" height="7"/>',
    lock: '<rect x="5" y="10.500" width="14" height="10" rx="2"/><path d="M8 10.500V8a4 4 0 018 0v2.500"/>',
    shield: '<path d="M12 3l7.500 3v5.500c0 4.600-3.100 8-7.500 9.500-4.400-1.500-7.500-4.900-7.500-9.500V6z"/><path d="M8.800 12l2.400 2.400 4-4.400"/>',
    bolt: '<path d="M13 2.500L5 13.500h6l-1 8 8-11h-6z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    copy: '<rect x="8.500" y="8.500" width="11" height="11" rx="2"/><path d="M15.500 8.500V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7.500a2 2 0 002 2h2.500"/>',
    nav: '<path d="M4 11.500L20 4l-7.500 16-1.800-6.700z"/>',
    box: '<path d="M12 3l8 4.200v9.600L12 21l-8-4.200V7.200L12 3z"/><path d="M4 7.200l8 4.300 8-4.300M12 11.500V21M8 5l8 4.200"/>',
    out: '<path d="M14 4.500h4.500a1.500 1.500 0 011.500 1.500v12a1.500 1.500 0 01-1.500 1.500H14M10 8l-4 4 4 4M6 12h10"/>',
    phone: '<rect x="7" y="2.500" width="10" height="19" rx="2.500"/><path d="M11 18.500h2"/>',
    card: '<rect x="3" y="5.500" width="18" height="13" rx="2.500"/><path d="M3 10h18M7 15h3"/>',
    star: '<path d="M12 3.500l2.700 5.500 6 .9-4.400 4.200 1 6-5.300-2.800-5.300 2.800 1-6L3.300 9.900l6-.9z"/>',
    scan: '<path d="M4 8V5.500A1.500 1.500 0 015.500 4H8M16 4h2.500A1.500 1.500 0 0120 5.500V8M20 16v2.500a1.500 1.500 0 01-1.500 1.500H16M8 20H5.500A1.500 1.500 0 014 18.500V16"/>',
    eye: '<path d="M2 12s3.600-6.500 10-6.500S22 12 22 12s-3.600 6.500-10 6.500S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.600 6a9.800 9.800 0 011.400-.1C18.400 5.900 22 12 22 12a17 17 0 01-3.200 3.900M6.600 7.600A16.600 16.600 0 002 12s3.600 6.500 10 6.500c1.600 0 3-.4 4.300-1M9.900 9.900a3 3 0 004.200 4.200"/>',
    support: '<path d="M4 13v-1a8 8 0 0116 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.500"/><rect x="17" y="13" width="4" height="6" rx="1.500"/><path d="M19 19c0 1.400-1.800 2-4 2"/>'
  };
  function ic(name, size, cls) {
    const s = size || 24;
    return '<svg class="ic ' + (cls || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  }
  const LOGO = '<svg class="logo" viewBox="0 0 92 30" role="img" aria-label="amazon"><text x="1" y="19" font-family="Arial Rounded MT Bold, Trebuchet MS, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="-1.100" fill="currentColor">amazon</text><path d="M8 24.500c14 6 31 6 44-1.500" fill="none" stroke="#FF9900" stroke-width="2.600" stroke-linecap="round"/><path d="M51 20.500l3.800 1.200-1.800 3.500" fill="none" stroke="#FF9900" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- Ilustraciones de producto (renders con volumen, brillos y sombra) ---------- */
  let uid = 0;
  const hex2 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (h, t, k) => '#' + hex2(h).map((v, i) => Math.round(v + (t[i] - v) * k).toString(16).padStart(2, '0')).join('');
  const lighten = (h, k) => mixHex(h, [255, 255, 255], k), darken = (h, k) => mixHex(h, [0, 0, 0], k);
  const FX = u => '<filter id="bl' + u + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter><filter id="bm' + u + '" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>' +
    '<filter id="nz' + u + '" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 0 0 0 -.32" result="a"/><feComposite in="a" in2="SourceGraphic" operator="in"/></filter>' +
    '<filter id="nl' + u + '" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".04 .55" numOctaves="2" seed="3" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 -.35" result="a"/><feComposite in="a" in2="SourceGraphic" operator="in"/></filter>' +
    '<linearGradient id="mt' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1f3f6"/><stop offset=".45" stop-color="#8f98a4"/><stop offset=".7" stop-color="#d7dce2"/><stop offset="1" stop-color="#7b838e"/></linearGradient>' +
    '<radialGradient id="ao' + u + '" cx=".5" cy=".42" r=".72"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>';
  const G = u => '<defs>' + FX(u) + '<linearGradient id="b' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--hi)"/><stop offset=".55" style="stop-color:var(--pc)"/><stop offset="1" style="stop-color:var(--lo)"/></linearGradient>' +
    '<linearGradient id="d' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--hi)"/><stop offset="1" style="stop-color:var(--lo)"/></linearGradient>' +
    '<radialGradient id="c' + u + '" cx=".3" cy=".22" r=".95"><stop offset="0" style="stop-color:var(--hi)"/><stop offset=".55" style="stop-color:var(--pc)"/><stop offset="1" style="stop-color:var(--lo)"/></radialGradient>' +
    '<radialGradient id="s' + u + '"><stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset=".6" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>';
  const SH = (u, rx) => '<ellipse cx="100" cy="178" rx="' + (rx || 62) + '" ry="7.500" fill="url(#s' + u + ')"/><ellipse cx="100" cy="176" rx="' + ((rx || 62) * .62) + '" ry="3" fill="#000" fill-opacity=".28" filter="url(#bl' + u + ')"/>';
  const W = (x, y, rx, ry, o, u, rot) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" fill-opacity="' + o + '" filter="url(#bl' + u + ')"' + (rot ? ' transform="rotate(' + rot + ' ' + x + ' ' + y + ')"' : '') + '/>';
  const ART = {
    headphones: u => G(u) + SH(u, 70) +
      /* diadema */
      '<path d="M45 124C38 30 162 30 155 124" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="16" stroke-linecap="round" transform="translate(0 2.500)" filter="url(#bl' + u + ')"/>' +
      '<path d="M45 124C38 30 162 30 155 124" fill="none" stroke="url(#b' + u + ')" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="M45 124C38 30 162 30 155 124" fill="none" stroke="#000" stroke-width="14" stroke-linecap="round" filter="url(#nz' + u + ')" opacity=".28"/>' +
      '<path d="M50 118C46 42 154 42 150 118" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2.500" stroke-linecap="round"/>' +
      '<path d="M66 60C86 44 114 44 134 60" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="19" stroke-linecap="round"/><path d="M66 60C86 44 114 44 134 60" fill="none" stroke="url(#b' + u + ')" stroke-width="15" stroke-linecap="round" opacity=".9"/><path d="M70 55C88 43 112 43 130 55" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2.500" stroke-linecap="round"/>' +
      /* sliders metálicos */
      '<rect x="33" y="108" width="14" height="36" rx="5" fill="url(#mt' + u + ')"/><rect x="153" y="108" width="14" height="36" rx="5" fill="url(#mt' + u + ')"/><path d="M36 116h8M36 122h8M36 128h8M156 116h8M156 122h8M156 128h8" stroke="#000" stroke-opacity=".25" stroke-width="1"/>' +
      /* auriculares */
      '<rect x="14" y="120" width="50" height="58" rx="24" fill="#000" fill-opacity=".3" transform="translate(2 3)" filter="url(#bl' + u + ')"/><rect x="136" y="120" width="50" height="58" rx="24" fill="#000" fill-opacity=".3" transform="translate(2 3)" filter="url(#bl' + u + ')"/>' +
      '<rect x="14" y="118" width="50" height="60" rx="25" fill="url(#c' + u + ')"/><rect x="136" y="118" width="50" height="60" rx="25" fill="url(#c' + u + ')"/>' +
      '<rect x="14" y="118" width="50" height="60" rx="25" fill="url(#ao' + u + ')"/><rect x="136" y="118" width="50" height="60" rx="25" fill="url(#ao' + u + ')"/>' +
      '<rect x="14" y="118" width="50" height="60" rx="25" fill="#000" filter="url(#nz' + u + ')" opacity=".16"/><rect x="136" y="118" width="50" height="60" rx="25" fill="#000" filter="url(#nz' + u + ')" opacity=".16"/>' +
      '<ellipse cx="39" cy="148" rx="16" ry="23" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="2"/><ellipse cx="39" cy="148" rx="13" ry="20" fill="none" stroke="#FF9900" stroke-width="2.200"/><ellipse cx="161" cy="148" rx="16" ry="23" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="2"/><ellipse cx="161" cy="148" rx="13" ry="20" fill="none" stroke="#FF9900" stroke-width="2.200"/>' +
      '<circle cx="168" cy="166" r="2" fill="#fff" fill-opacity=".5"/><circle cx="160" cy="170" r="1.500" fill="#fff" fill-opacity=".35"/>' +
      W(28, 128, 7, 14, .55, u, -20) + W(150, 128, 6, 12, .4, u, -20) +
      '<path d="M63 134q5 14 0 28" stroke="#0b0d11" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M137 134q-5 14 0 28" stroke="#0b0d11" stroke-width="4" fill="none" stroke-linecap="round"/>',

    mouse: u => G(u) + SH(u, 50) +
      '<defs><clipPath id="mc' + u + '"><path d="M100 24C136 24 154 52 154 90v32c0 38-22 58-54 58s-54-20-54-58V90c0-38 18-66 54-66z"/></clipPath><linearGradient id="sd' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient></defs>' +
      '<path d="M100 24C136 24 154 52 154 90v32c0 38-22 58-54 58s-54-20-54-58V90c0-38 18-66 54-66z" fill="#000" fill-opacity=".3" transform="translate(3 4)" filter="url(#bl' + u + ')"/>' +
      '<g clip-path="url(#mc' + u + ')"><rect x="40" y="20" width="120" height="164" fill="url(#c' + u + ')"/><rect x="40" y="20" width="120" height="164" fill="url(#sd' + u + ')"/>' +
      '<path d="M38 96q24 12 62 12t62-12v-80H38z" fill="#fff" fill-opacity=".05"/>' +
      /* agarre lateral de goma */
      '<path d="M40 100c10 6 18 20 18 44s-8 36-18 40z" fill="#000" fill-opacity=".35" filter="url(#nz' + u + ')"/><path d="M46 112c8 8 12 20 12 36" stroke="#000" stroke-opacity=".3" stroke-width="3" fill="none"/>' +
      '<rect x="40" y="20" width="120" height="164" fill="url(#ao' + u + ')"/>' + W(78, 56, 26, 36, .5, u, -18) + W(120, 40, 12, 6, .35, u) + '</g>' +
      '<path d="M100 26v66M48 96q52 14 104 0" stroke="#000" stroke-opacity=".5" stroke-width="2" fill="none"/><path d="M101 26v66M49 97q52 14 104 0" stroke="#fff" stroke-opacity=".12" stroke-width="1" fill="none"/>' +
      /* rueda */
      '<rect x="90" y="40" width="20" height="38" rx="9" fill="#0c0f13"/><rect x="93" y="43" width="14" height="32" rx="6" fill="url(#mt' + u + ')"/><path d="M93 50h14M93 55h14M93 60h14M93 65h14M93 70h14" stroke="#000" stroke-opacity=".45" stroke-width="1.500"/>' +
      '<rect x="95" y="104" width="10" height="3" rx="1.500" fill="#FF9900"/>' +
      '<path d="M100 24C136 24 154 52 154 90v32c0 38-22 58-54 58s-54-20-54-58V90c0-38 18-66 54-66z" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1.200"/>',

    backpack: u => G(u) + SH(u, 60) +
      '<defs><path id="bp' + u + '" d="M52 62C52 40 72 32 100 32s48 8 48 30l8 88c1 18-14 28-56 28S44 168 44 150z"/><clipPath id="bc' + u + '"><use href="#bp' + u + '"/></clipPath></defs>' +
      '<path d="M82 40c0-18 6-26 18-26s18 8 18 26" fill="none" stroke="#000" stroke-width="8" stroke-linecap="round" opacity=".45"/><path d="M82 40c0-18 6-26 18-26s18 8 18 26" fill="none" stroke="url(#d' + u + ')" stroke-width="7" stroke-linecap="round"/>' +
      '<use href="#bp' + u + '" fill="#000" fill-opacity=".3" transform="translate(3 4)" filter="url(#bl' + u + ')"/>' +
      /* correas y bolsillos laterales (detrás) */
      '<path d="M46 108q-18 6-18 32 0 22 16 28" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="12" stroke-linecap="round"/><path d="M154 108q18 6 18 32 0 22-16 28" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="12" stroke-linecap="round"/>' +
      '<path d="M46 108q-18 6-18 32 0 22 16 28" fill="none" stroke="url(#d' + u + ')" stroke-width="9" stroke-linecap="round"/><path d="M154 108q18 6 18 32 0 22-16 28" fill="none" stroke="url(#d' + u + ')" stroke-width="9" stroke-linecap="round"/>' +
      '<g clip-path="url(#bc' + u + ')"><rect x="40" y="28" width="124" height="160" fill="url(#c' + u + ')"/><rect x="40" y="28" width="124" height="160" fill="#000" filter="url(#nz' + u + ')" opacity=".38"/>' +
      /* compartimento principal */
      '<path d="M54 74Q100 56 146 74" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/><path d="M54 74Q100 56 146 74" fill="none" stroke="#cfd4da" stroke-opacity=".8" stroke-width="2.500" stroke-dasharray="1.500 2" stroke-linecap="butt"/>' +
      '<path d="M54 86Q100 68 146 86" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1.500" stroke-dasharray="3 3"/>' +
      /* bolsillo frontal */
      '<path d="M60 112Q100 102 140 112L138 160Q100 170 62 160Z" fill="#000" fill-opacity=".35" transform="translate(1.500 2.500)" filter="url(#bl' + u + ')"/><path d="M60 110Q100 100 140 110L138 158Q100 168 62 158Z" fill="url(#d' + u + ')"/><path d="M60 110Q100 100 140 110L138 158Q100 168 62 158Z" fill="#000" filter="url(#nz' + u + ')" opacity=".5"/>' +
      '<path d="M64 118Q100 109 136 118" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="4"/><path d="M64 118Q100 109 136 118" fill="none" stroke="#cfd4da" stroke-opacity=".7" stroke-width="2" stroke-dasharray="1.500 2"/>' +
      '<path d="M64 154Q100 164 136 154" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.200" stroke-dasharray="3 2.500"/><rect x="88" y="132" width="24" height="9" rx="2" fill="#0b0d11" fill-opacity=".7"/><rect x="92" y="135" width="16" height="2.500" rx="1" fill="#FF9900"/>' +
      '<rect x="40" y="28" width="124" height="160" fill="url(#ao' + u + ')"/>' + W(74, 62, 14, 26, .35, u, -14) + '</g>' +
      '<rect x="95" y="76" width="9" height="13" rx="3" fill="url(#mt' + u + ')"/><rect x="97" y="86" width="5" height="9" rx="2" fill="#FF9900"/><rect x="95" y="116" width="9" height="12" rx="3" fill="url(#mt' + u + ')"/><rect x="97" y="124" width="5" height="8" rx="2" fill="#FF9900"/>' +
      '<use href="#bp' + u + '" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="1.200"/>',

    hoodie: u => G(u) + SH(u, 70) +
      '<defs><path id="hb' + u + '" d="M72 42L38 56Q18 64 14 122L21 130Q34 132 45 126L50 102L52 172Q100 184 148 172L150 102L155 126Q166 132 179 130L186 122Q182 64 162 56L128 42Q100 64 72 42Z"/><clipPath id="hc' + u + '"><use href="#hb' + u + '"/></clipPath></defs>' +
      '<use href="#hb' + u + '" fill="#000" fill-opacity=".28" transform="translate(3 4)" filter="url(#bl' + u + ')"/>' +
      '<g clip-path="url(#hc' + u + ')"><rect x="8" y="30" width="184" height="160" fill="url(#c' + u + ')"/><rect x="8" y="30" width="184" height="160" fill="#000" filter="url(#nz' + u + ')" opacity=".28"/>' +
      /* pliegues */
      '<g filter="url(#bm' + u + ')" fill="none" stroke="#000" stroke-linecap="round"><path d="M30 70Q36 100 26 124" stroke-opacity=".35" stroke-width="7"/><path d="M170 70Q164 100 174 124" stroke-opacity=".35" stroke-width="7"/><path d="M62 96Q74 124 66 168" stroke-opacity=".3" stroke-width="8"/><path d="M138 96Q126 124 134 168" stroke-opacity=".3" stroke-width="8"/><path d="M96 100Q100 130 98 160" stroke-opacity=".18" stroke-width="10"/></g>' +
      '<g filter="url(#bm' + u + ')" fill="#fff"><ellipse cx="48" cy="82" rx="8" ry="22" fill-opacity=".14" transform="rotate(-14 48 82)"/><ellipse cx="152" cy="82" rx="8" ry="22" fill-opacity=".1" transform="rotate(14 152 82)"/><ellipse cx="82" cy="120" rx="10" ry="26" fill-opacity=".12"/></g>' +
      '<rect x="8" y="30" width="184" height="160" fill="url(#ao' + u + ')"/>' +
      /* bolsillo canguro */
      '<path d="M64 130L136 130L148 170L52 170Z" fill="#000" fill-opacity=".18"/><path d="M64 130L52 170M136 130L148 170" stroke="#000" stroke-opacity=".38" stroke-width="2"/><path d="M66 132L135 132" stroke="#000" stroke-opacity=".3" stroke-width="2"/><path d="M62 130L137 130" stroke="#fff" stroke-opacity=".15" stroke-width="1.500"/>' +
      '<path d="M64 134L137 134M57 158L143 158" stroke="#fff" stroke-opacity=".14" stroke-width="1" stroke-dasharray="3 2.500"/>' +
      /* puños y ruedo acanalados */
      '<path d="M14 122L21 130Q34 132 45 126L40 112Q28 116 14 112Z" fill="#000" fill-opacity=".3"/><path d="M186 122L179 130Q166 132 155 126L160 112Q172 116 186 112Z" fill="#000" fill-opacity=".3"/>' +
      '<path d="M18 120l5 8M24 118l5 9M30 117l5 9M36 115l5 9M42 113l4 9M182 120l-5 8M176 118l-5 9M170 117l-5 9M164 115l-5 9M158 113l-4 9" stroke="#000" stroke-opacity=".3" stroke-width="1.200"/>' +
      '<rect x="48" y="168" width="104" height="16" fill="#000" fill-opacity=".3"/><path d="M52 169v14M58 169v14M64 169v14M70 169v14M76 169v14M82 169v14M88 169v14M94 169v14M100 169v14M106 169v14M112 169v14M118 169v14M124 169v14M130 169v14M136 169v14M142 169v14M148 169v14" stroke="#000" stroke-opacity=".28" stroke-width="1.200"/></g>' +
      /* capucha */
      '<path d="M68 44C66 12 134 12 132 44 126 72 114 80 100 80S74 72 68 44z" fill="#000" fill-opacity=".3" transform="translate(0 3)" filter="url(#bl' + u + ')"/>' +
      '<path d="M68 44C66 12 134 12 132 44 126 72 114 80 100 80S74 72 68 44z" fill="url(#c' + u + ')"/><path d="M68 44C66 12 134 12 132 44 126 72 114 80 100 80S74 72 68 44z" fill="#000" filter="url(#nz' + u + ')" opacity=".4"/>' +
      '<path d="M80 46C82 28 118 28 120 46 116 64 108 72 100 72S84 64 80 46z" fill="#0d0f12"/><path d="M80 46C82 28 118 28 120 46 116 64 108 72 100 72S84 64 80 46z" fill="url(#ao' + u + ')" opacity=".9"/><path d="M84 40C90 31 110 31 116 40" stroke="#fff" stroke-opacity=".12" stroke-width="2" fill="none"/>' +
      W(84, 24, 12, 5, .35, u, -10) +
      /* cordones */
      '<circle cx="92" cy="76" r="3" fill="url(#mt' + u + ')"/><circle cx="108" cy="76" r="3" fill="url(#mt' + u + ')"/><path d="M92 79q-4 14 -2 30M108 79q4 14 2 30" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="4.500" stroke-linecap="round"/><path d="M92 79q-4 14 -2 30M108 79q4 14 2 30" fill="none" stroke="#eceff2" stroke-width="3" stroke-linecap="round"/><rect x="87.500" y="108" width="5" height="9" rx="2" fill="url(#mt' + u + ')"/><rect x="107.500" y="108" width="5" height="9" rx="2" fill="url(#mt' + u + ')"/>',

    powerbank: u => G(u) + SH(u, 56) +
      '<path d="M50 34Q50 24 60 24H116Q126 24 126 34V166Q126 176 116 176H60Q50 176 50 166Z" fill="#000" fill-opacity=".35" transform="translate(5 5)" filter="url(#bl' + u + ')"/>' +
      /* cara lateral */
      '<path d="M120 26L142 20Q148 20 148 28V162Q148 172 140 174L120 178Z" fill="url(#b' + u + ')"/><path d="M120 26L142 20Q148 20 148 28V162Q148 172 140 174L120 178Z" fill="#000" opacity=".42"/>' +
      /* frente */
      '<path d="M50 34Q50 24 60 24H116Q126 24 126 34V166Q126 176 116 176H60Q50 176 50 166Z" fill="url(#c' + u + ')"/><path d="M50 34Q50 24 60 24H116Q126 24 126 34V166Q126 176 116 176H60Q50 176 50 166Z" fill="#000" filter="url(#nz' + u + ')" opacity=".28"/><path d="M50 34Q50 24 60 24H116Q126 24 126 34V166Q126 176 116 176H60Q50 176 50 166Z" fill="url(#ao' + u + ')"/>' +
      '<path d="M52 36Q52 26 61 26H115" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.500" stroke-linecap="round"/><path d="M51 40V160" stroke="#fff" stroke-opacity=".22" stroke-width="1.500"/>' +
      '<rect x="60" y="30" width="56" height="3" rx="1.500" fill="#fff" fill-opacity=".1"/>' +
      '<g><circle cx="68" cy="48" r="3.200" fill="#34d058"/><circle cx="80" cy="48" r="3.200" fill="#34d058"/><circle cx="92" cy="48" r="3.200" fill="#34d058"/><circle cx="104" cy="48" r="3.200" fill="#3a4350"/><circle cx="68" cy="48" r="7" fill="#34d058" opacity=".3" filter="url(#bl' + u + ')"/><circle cx="80" cy="48" r="7" fill="#34d058" opacity=".3" filter="url(#bl' + u + ')"/><circle cx="92" cy="48" r="7" fill="#34d058" opacity=".25" filter="url(#bl' + u + ')"/></g>' +
      '<text x="88" y="108" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="17" font-weight="800" fill="#fff" fill-opacity=".92" letter-spacing="-.3">10000</text><text x="88" y="121" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="8" font-weight="700" fill="#fff" fill-opacity=".7" letter-spacing="1">mAh</text><text x="88" y="150" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="6.500" font-weight="700" fill="#fff" fill-opacity=".45" letter-spacing="1.600">POWERCORE</text>' +
      '<rect x="64" y="132" width="48" height="1.200" rx=".6" fill="#fff" fill-opacity=".16"/>' +
      '<rect x="62" y="162" width="20" height="8" rx="2" fill="#07090c"/><rect x="65" y="164.500" width="14" height="3" rx="1" fill="#586270"/><rect x="88" y="162" width="14" height="8" rx="3" fill="#07090c"/><rect x="91" y="164.500" width="8" height="3" rx="1.500" fill="#586270"/>' +
      W(62, 74, 6, 26, .35, u, 0),

    notebook: u => '<defs>' + FX(u) + '<radialGradient id="s' + u + '"><stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="n1' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#e07b00"/></linearGradient><linearGradient id="n2' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#46556a"/><stop offset="1" stop-color="#1b2431"/></linearGradient><linearGradient id="n3' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8db7e6"/><stop offset="1" stop-color="#4d79b3"/></linearGradient>' +
      '<linearGradient id="gl' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      '<ellipse cx="100" cy="178" rx="70" ry="8" fill="url(#s' + u + ')"/>' +
      (c => { const nb = (x, y, w, h, g, rot, lab) => '<g transform="rotate(' + rot + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')">' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="#000" fill-opacity=".3" transform="translate(3 4)" filter="url(#bl' + u + ')"/>' +
        '<rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + w + '" height="' + h + '" rx="5" fill="#f4f1ea"/><path d="M' + (x + 6) + ' ' + (y + h + 1) + 'h' + (w - 4) + 'M' + (x + w + 1.500) + ' ' + (y + 8) + 'v' + (h - 6) + '" stroke="#c9c4b8" stroke-width="1" stroke-dasharray="1.500 1.200"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="url(#' + g + u + ')"/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="#000" filter="url(#nl' + u + ')" opacity=".28"/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="url(#gl' + u + ')"/>' +
        [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const cy = y + 12 + i * ((h - 22) / 7); return '<ellipse cx="' + (x + 2) + '" cy="' + cy + '" rx="2.200" ry="1.600" fill="#10141a"/><path d="M' + (x - 5) + ' ' + (cy + 1.500) + 'q3-5.500 9-2.200" fill="none" stroke="#e9edf2" stroke-width="1.500" stroke-linecap="round"/><path d="M' + (x - 4) + ' ' + (cy + .2) + 'q2-3 6-1.200" fill="none" stroke="#7d8793" stroke-width=".7" stroke-linecap="round"/>'; }).join('') +
        '<rect x="' + (x + 14) + '" y="' + (y + 16) + '" width="' + (w - 24) + '" height="26" rx="3" fill="#fff" fill-opacity=".95"/><path d="M' + (x + 19) + ' ' + (y + 24) + 'h' + (w - 34) + 'M' + (x + 19) + ' ' + (y + 31) + 'h' + (w - 44) + '" stroke="#a7b0bb" stroke-width="2" stroke-linecap="round"/>' + (lab || '') + '</g>';
        return nb(36, 34, 70, 126, 'n3', -13, '') + nb(96, 30, 70, 126, 'n1', 11, '') + nb(62, 46, 72, 128, 'n2', 0, '<rect x="76" y="150" width="46" height="5" rx="2.500" fill="#FF9900"/>'); })()
  };
  function art(p, size, colorName) {
    const list = p.colors || [], c = list.find(x => x.n === colorName) || list[0];
    const base = c ? c.h : '#2a2f38', u = 'u' + (++uid);
    const st = '--pc:' + base + ';--hi:' + lighten(base, .38) + ';--lo:' + darken(base, .38) + ';background:radial-gradient(circle at 50% 36%,#ffffff 0%,' + p.tint + ' 78%);' + (size ? 'width:' + size + 'px;height:' + size + 'px' : '');
    const ph = (window.DATA.photos || {})[p.id];
    return '<span class="art" style="' + st + '"><svg viewBox="0 0 200 200" aria-hidden="true">' + (ART[p.art] ? ART[p.art](u) : '') + '</svg>' + (ph ? '<img class="photo" src="' + ph + '" alt="" onload="this.previousElementSibling.style.display=\'none\'" onerror="this.remove()">' : '') + '</span>';
  }
  const colorList = p => (p.colors || []);

  /* ---------- QR de prototipo (patrón determinístico, no es un QR real) ---------- */
  function qr(seedStr, size) {
    const N = 25; let h = 2166136261;
    for (const ch of seedStr) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };
    const m = Array.from({ length: N }, () => Array.from({ length: N }, () => rnd() > 0.52));
    const finder = (x0, y0) => {
      for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) {
        const X = x0 + x, Y = y0 + y; if (X < 0 || Y < 0 || X >= N || Y >= N) continue;
        const edge = x === 0 || y === 0 || x === 6 || y === 6, core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        m[Y][X] = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (edge || core);
      }
    };
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    let r = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (m[y][x]) r += '<rect x="' + x + '" y="' + y + '" width="1.020" height="1.020"/>';
    return '<svg class="qr" width="' + (size || 180) + '" height="' + (size || 180) + '" viewBox="0 0 ' + N + ' ' + N + '" fill="#131A22" shape-rendering="crispEdges" role="img" aria-label="Código QR de retiro">' + r + '</svg>';
  }

  window.CORE = { $, $$, esc, norm, money, km, hhmm, dayLabel, shortDate, whenLabel, ago, DAY, product, locker, S: () => S, save, resetAll, logEvent, seqFor, isDone, statusIdx, lastOrder, deadline, deadlineLabel, remaining, mapsUrl, colorList, etaTransit, notify, advanceOrder, R, ic, LOGO, art, qr, KEY };
  Object.defineProperty(window.CORE, 'state', { get: () => S });
})();
