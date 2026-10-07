/* ============================================================
   UI — componentes reutilizables y overlays
   Todo lo clickeable se declara con data-act="nombreDeAccion".
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE;
  const { esc, ic, $, money, locker } = C;

  const attrs = d => Object.keys(d || {}).map(k => ' data-' + k + '="' + esc(d[k]) + '"').join('');

  /* ---------- Botones ---------- */
  function btn(label, act, o) {
    o = o || {};
    const kind = o.kind || 'primary';
    const cls = ['btn', 'btn-' + kind, o.block === false ? '' : 'btn-block', o.cls || ''].join(' ');
    const dis = o.disabled ? ' disabled' : '';
    const arrow = o.arrow ? '<span class="btn-arrow">' + ic('chevR', 20) + '</span>' : '';
    const lead = o.icon ? ic(o.icon, 20) : '';
    return '<button type="button" class="' + cls + '" data-act="' + act + '"' + attrs(o.data) + dis + (o.id ? ' id="' + o.id + '"' : '') + '>' +
      '<span class="btn-spin" aria-hidden="true"></span><span class="btn-label">' + lead + esc(label) + '</span>' + arrow + '</button>';
  }

  /* ---------- Header ---------- */
  function cartCount() { return C.state.cart.reduce((a, i) => a + i.qty, 0); }
  function unread() { return C.state.notifications.filter(n => !n.read).length; }
  function cartBtn() {
    const n = cartCount();
    return '<button type="button" class="hbtn" data-act="goCart" aria-label="Carrito, ' + n + ' productos">' + ic('cart', 24) + '<span class="badge" data-badge="cart"' + (n ? '' : ' hidden') + '>' + n + '</span></button>';
  }
  function bellBtn() {
    const n = unread();
    return '<button type="button" class="hbtn" data-act="goNotifications" aria-label="Notificaciones">' + ic('bell', 24) + '<span class="dot" data-badge="bell"' + (n ? '' : ' hidden') + '></span></button>';
  }
  function hdr(o) {
    o = o || {};
    const back = o.back === false ? '<span class="hbtn ghost"></span>' : '<button type="button" class="hbtn" data-act="back" aria-label="Volver">' + ic('back', 24) + '</button>';
    const center = o.title ? '<h1 class="htitle">' + esc(o.title) + '</h1>' : '<span class="hlogo" aria-label="Amazon">' + C.LOGO + '</span>';
    const right = (o.right || []).join('') || '<span class="hbtn ghost"></span>';
    return '<header class="hdr' + (o.extra ? ' hdr-ext' : '') + '"><div class="hdr-row">' + back + center + '<div class="hright">' + right + '</div></div>' + (o.extra || '') + '</header>';
  }

  /* ---------- Tab bar ---------- */
  function tabbar(active) {
    const tabs = [['home', 'Inicio', 'home'], ['search', 'Buscar', 'search'], ['orders', 'Pedidos', 'orders'], ['lockerTab', 'Locker', 'locker'], ['profile', 'Perfil', 'user']];
    return '<nav class="tabbar" aria-label="Navegación principal">' + tabs.map(t =>
      '<button type="button" class="tab' + (t[0] === active ? ' on' : '') + '" data-act="tab" data-to="' + t[0] + '"' + (t[0] === active ? ' aria-current="page"' : '') + '>' + ic(t[2], 24) + '<span>' + t[1] + '</span></button>').join('') + '</nav>';
  }

  /* ---------- Página ---------- */
  function page(o) {
    return '<div class="screen ' + (o.cls || '') + '">' + (o.header || '') +
      '<main class="content" id="content">' + (o.body || '') + '</main>' +
      (o.footer ? '<div class="footer-cta">' + o.footer + '</div>' : '') +
      (o.tab ? tabbar(o.tab) : '') + '</div>';
  }

  /* ---------- Piezas ---------- */
  function callout(kind, icon, title, body, extra) {
    return '<div class="callout ' + kind + '"><span class="co-ic">' + ic(icon, 22) + '</span><div class="co-tx"><strong>' + esc(title) + '</strong>' + (body ? '<span>' + esc(body) + '</span>' : '') + '</div>' + (extra || '') + '</div>';
  }
  function chip(label, act, on, data, icon) {
    return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-act="' + act + '"' + attrs(data) + ' aria-pressed="' + (!!on) + '">' + (icon ? ic(icon, 18) : '') + esc(label) + '</button>';
  }
  function stars(r) {
    let s = '';
    for (let i = 1; i <= 5; i++) s += '<svg width="14" height="14" viewBox="0 0 24 24" class="star ' + (r >= i - 0.25 ? 'full' : (r >= i - 0.75 ? 'half' : '')) + '" aria-hidden="true"><path d="M12 3.5l2.7 5.5 6 .9-4.400 4.200 1 6-5.300-2.800-5.300 2.800 1-6L3.300 9.900l6-.9z"/></svg>';
    return '<span class="stars" aria-label="' + r + ' de 5">' + s + '</span>';
  }
  function emptyState(o) {
    return '<div class="empty"><div class="empty-ic">' + (o.art || ic(o.icon || 'box', 40)) + '</div><h2>' + esc(o.title) + '</h2><p>' + esc(o.body) + '</p>' + (o.cta || '') + '</div>';
  }
  function lockerStatus(l) {
    if (l.status === 'full') return '<span class="lstat err"><i></i>Sin espacios libres</span>';
    if (l.free <= 3) return '<span class="lstat warn"><i></i>Pocos espacios</span>';
    return '<span class="lstat ok"><i></i>Disponible</span>';
  }
  function lockerThumb(l) {
    if (l.thumb) return '<span class="lthumb"><img src="' + l.thumb + '" alt=""></span>';
    return '<span class="lthumb icon">' + ic(l.type === 'super' ? 'cart' : 'cap', 26) + '</span>';
  }
  function lockerRow(l, o) {
    o = o || {};
    const fav = C.state.favorites.indexOf(l.id) >= 0;
    return '<button type="button" class="lcard' + (o.sel ? ' sel' : '') + (l.status === 'full' ? ' muted' : '') + '" data-act="openLocker" data-id="' + l.id + '">' + lockerThumb(l) +
      '<span class="lbody"><strong>' + (l.type === 'super' ? esc(l.name) : 'Amazon Hub Locker<br>' + esc(l.name)) + '</strong>' +
      '<span class="lsub">' + esc(l.address) + '</span><span class="lsub">A ' + C.km(l.km) + (o.hours ? ' · ' + esc(l.hours) : '') + '</span>' + lockerStatus(l) + '</span>' +
      (fav ? '<span class="lfav">' + ic('heart', 16) + '</span>' : '') + ic('chevR', 22, 'lchev') + '</button>';
  }

  /* ---------- Overlays ---------- */
  const ov = () => $('#overlay');
  let lastFocus = null;
  function closeSheet(silent) {
    const s = $('.sheet-wrap', ov());
    if (!s) return;
    s.classList.add('out');
    setTimeout(() => s.remove(), 180);
    if (!silent && lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* noop */ } }
  }
  function sheet(html, o) {
    o = o || {};
    closeModal(); const old = $('.sheet-wrap', ov()); if (old) old.remove();
    lastFocus = document.activeElement;
    const w = document.createElement('div');
    w.className = 'sheet-wrap';
    w.innerHTML = '<div class="backdrop" data-act="closeSheet"></div><section class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(o.title || '') + '"><div class="grab"></div>' +
      (o.title ? '<div class="sheet-h"><h2>' + esc(o.title) + '</h2><button type="button" class="hbtn dark" data-act="closeSheet" aria-label="Cerrar">' + ic('close', 22) + '</button></div>' : '') +
      '<div class="sheet-b">' + html + '</div></section>';
    ov().appendChild(w);
    const f = $('button, input', $('.sheet-b', w)); if (f && o.focus) f.focus();
    return w;
  }
  function closeModal() { const m = $('.modal-wrap', ov()); if (m) m.remove(); }
  function modal(o) {
    closeModal();
    const w = document.createElement('div');
    w.className = 'modal-wrap';
    w.innerHTML = '<div class="backdrop" data-act="closeModal"></div><section class="modal" role="alertdialog" aria-modal="true" aria-label="' + esc(o.title) + '">' +
      (o.icon ? '<div class="modal-ic ' + (o.tone || '') + '">' + ic(o.icon, 28) + '</div>' : '') +
      '<h2>' + esc(o.title) + '</h2><p>' + esc(o.body) + '</p><div class="modal-actions">' +
      o.actions.map(a => btn(a.label, a.act, { kind: a.kind || 'primary', data: a.data })).join('') + '</div></section>';
    ov().appendChild(w);
    const b = $('button', w); if (b) b.focus();
  }

  let toastT;
  function toast(msg, o) {
    o = o || {};
    const t = $('#toast');
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (o.action ? '<button type="button" data-act="toastAction">' + esc(o.action.label) + '</button>' : '');
    t.className = 'toast show';
    UI.toastFn = o.action ? o.action.fn : null;
    clearTimeout(toastT);
    toastT = setTimeout(() => { t.className = 'toast'; }, o.ms || 3200);
  }

  /* Notificación push dentro de la app */
  let pushT;
  function push(n) {
    const p = $('#push');
    const ico = { confirmed: ['ok', 'a'], transit: ['info', 'truck'], ready: ['warn', 'box'], error: ['err', 'info'], info: ['info', 'info'] }[n.type] || ['info', 'bell'];
    p.innerHTML = '<button type="button" class="push-card ' + ico[0] + '" data-act="openNotification" data-id="' + n.id + '"><span class="push-ic">' + (ico[1] === 'a' ? '<b>a</b>' : ic(ico[1], 22)) + '</span><span class="push-tx"><strong>' + esc(n.title) + '</strong><span>' + esc(n.body) + '</span></span><em>ahora</em></button>';
    p.className = 'push show';
    clearTimeout(pushT);
    pushT = setTimeout(() => { p.className = 'push'; }, 6500);
  }
  function hidePush() { const p = $('#push'); if (p) p.className = 'push'; }

  /* ---------- Switch ---------- */
  function sw(id, on, label, sub) {
    return '<div class="row-sw"><div><strong>' + esc(label) + '</strong>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</div><button type="button" role="switch" aria-checked="' + !!on + '" class="sw' + (on ? ' on' : '') + '" data-act="toggleSw" data-id="' + id + '" aria-label="' + esc(label) + '"><i></i></button></div>';
  }

  const UI = { art: C.art, btn, hdr, cartBtn, bellBtn, tabbar, page, callout, chip, stars, emptyState, lockerRow, lockerStatus, lockerThumb, sheet, closeSheet, modal, closeModal, toast, push, hidePush, sw, attrs, cartCount, unread, toastFn: null };
  window.UI = UI;
})();
