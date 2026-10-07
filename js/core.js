/* ============================================================
   CORE — estado, router, utilidades, íconos, ilustraciones
   ============================================================ */
(function () {
  'use strict';
  const D = window.DATA;
  const KEY = 'amazon-hub-locker-proto-v1';

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
      loggedIn: true,
      nav: [{ name: 'home', params: {} }],
      log: [],
      tasks: {},
      seen: {}
    };
  }
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || initialState(); } catch (e) { S = initialState(); }
  if (!S.nav || !S.nav.length) S.nav = [{ name: 'home', params: {} }];
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
  const deadline = o => (o.times.ready || Date.now()) + 3 * DAY;
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
      notify({ type: 'ready', orderId: o.id, title: 'Tu pedido está disponible', body: 'Ya podés retirarlo en el Amazon Hub Locker de ' + l.name + '. Tenés tiempo hasta el ' + shortDate(deadline(o)) + '.' });
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
    support: '<path d="M4 13v-1a8 8 0 0116 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.500"/><rect x="17" y="13" width="4" height="6" rx="1.500"/><path d="M19 19c0 1.400-1.800 2-4 2"/>'
  };
  function ic(name, size, cls) {
    const s = size || 24;
    return '<svg class="ic ' + (cls || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  }
  const LOGO = '<svg class="logo" viewBox="0 0 92 30" role="img" aria-label="amazon"><text x="1" y="19" font-family="Arial Rounded MT Bold, Trebuchet MS, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="-1.100" fill="currentColor">amazon</text><path d="M8 24.500c14 6 31 6 44-1.500" fill="none" stroke="#FF9900" stroke-width="2.600" stroke-linecap="round"/><path d="M51 20.500l3.800 1.200-1.800 3.500" fill="none" stroke="#FF9900" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- Ilustraciones de producto (SVG simple) ---------- */
  const ART = {
    headphones: '<path d="M44 118V98a56 56 0 01112 0v20" fill="none" stroke="#1F2937" stroke-width="10" stroke-linecap="round"/><rect x="32" y="108" width="28" height="48" rx="12" fill="#131A22"/><rect x="140" y="108" width="28" height="48" rx="12" fill="#131A22"/><rect x="36" y="118" width="8" height="28" rx="4" fill="#FF9900"/><rect x="156" y="118" width="8" height="28" rx="4" fill="#FF9900"/>',
    mouse: '<path d="M100 34c-26 0-42 18-42 44v36c0 30 18 52 42 52s42-22 42-52V78c0-26-16-44-42-44z" fill="#131A22"/><path d="M100 34v44M58 78h84" stroke="#374151" stroke-width="3" fill="none"/><rect x="94" y="52" width="12" height="22" rx="6" fill="#FF9900"/>',
    backpack: '<rect x="52" y="48" width="96" height="124" rx="38" fill="#1F2937"/><path d="M78 48c0-14 6-22 22-22s22 8 22 22" fill="none" stroke="#131A22" stroke-width="8"/><rect x="72" y="104" width="56" height="44" rx="12" fill="#131A22"/><rect x="82" y="122" width="36" height="6" rx="3" fill="#FF9900"/><path d="M52 98q-14 6-14 30M148 98q14 6 14 30" stroke="#131A22" stroke-width="8" fill="none" stroke-linecap="round"/>',
    hoodie: '<path d="M70 40l-38 22 10 36 18-8v78h80V90l18 8 10-36-38-22c-4 14-16 22-30 22S74 54 70 40z" fill="#3B4252"/><path d="M82 52c4 14 12 20 18 20s14-6 18-20" fill="none" stroke="#2A303C" stroke-width="6"/><path d="M92 74v26M108 74v26" stroke="#E5E7EB" stroke-width="3" stroke-linecap="round"/><rect x="78" y="128" width="44" height="28" rx="8" fill="#2A303C"/>',
    powerbank: '<rect x="60" y="30" width="80" height="140" rx="18" fill="#131A22"/><rect x="74" y="46" width="52" height="8" rx="4" fill="#374151"/><circle cx="100" cy="102" r="14" fill="none" stroke="#FF9900" stroke-width="5"/><path d="M100 94v16M93 102h14" stroke="#FF9900" stroke-width="4" stroke-linecap="round"/><rect x="86" y="148" width="28" height="8" rx="4" fill="#374151"/>',
    notebook: '<rect x="44" y="52" width="80" height="106" rx="8" fill="#FF9900" transform="rotate(-8 84 105)"/><rect x="70" y="40" width="80" height="106" rx="8" fill="#131A22" transform="rotate(6 110 93)"/><rect x="88" y="62" width="46" height="8" rx="4" fill="#FF9900" transform="rotate(6 110 93)"/><path d="M92 82h42M90 94h42M88 106h30" stroke="#4B5563" stroke-width="3" stroke-linecap="round" transform="rotate(6 110 93)"/>'
  };
  function art(p, size) {
    return '<span class="art" style="background:' + p.tint + ';' + (size ? 'width:' + size + 'px;height:' + size + 'px' : '') + '"><svg viewBox="0 0 200 200" aria-hidden="true">' + (ART[p.art] || '') + '</svg></span>';
  }

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

  window.CORE = { $, $$, esc, norm, money, km, hhmm, dayLabel, shortDate, whenLabel, ago, DAY, product, locker, S: () => S, save, resetAll, logEvent, seqFor, isDone, statusIdx, lastOrder, deadline, etaTransit, notify, advanceOrder, R, ic, LOGO, art, qr, KEY };
  Object.defineProperty(window.CORE, 'state', { get: () => S });
})();
