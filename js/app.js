/* ============================================================
   APP — render, acciones, inputs y panel del facilitador
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, UI = window.UI, D = window.DATA, SC = window.SCREENS, H = window.SCH, L = window.LSTATE;
  const { $, $$, esc, ic, money, km, product, locker, R } = C;
  const S = () => C.state;
  const ACT = {};
  const timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  /* ---------- Render ---------- */
  const scrollMem = {};
  function render(o) {
    o = o || {};
    timers.splice(0).forEach(clearTimeout);
    if (!o.keep) { UI.closeSheet(true); UI.closeModal(); }
    const cur = R.cur();
    const name = S().loggedIn ? cur.name : 'login';
    const sc = SC[name] || SC.home;
    const stage = $('#screen');
    const prev = $('#content', stage);
    const keepTop = o.keep && prev ? prev.scrollTop : 0;
    stage.innerHTML = sc.render(cur.params || {});
    const el = stage.firstElementChild;
    if (!o.keep) el.classList.add('enter-' + (R.dir || 'fade'));
    const content = $('#content', stage);
    if (content) content.scrollTop = o.keep ? keepTop : (R.dir === 'back' ? (scrollMem[S().nav.length] || 0) : 0);
    R.dir = 'none';
    if (!o.keep) mount(name, cur.params || {});
    else if (name === 'manualCode') { const i = $('#codein'); if (i) i.focus(); }
    refreshBadges();
    if (window.FAC) window.FAC.refresh();
  }
  const rerender = () => render({ keep: true });

  function refreshBadges() {
    const n = UI.cartCount(), u = UI.unread();
    $$('[data-badge="cart"]').forEach(b => { b.textContent = n; b.hidden = !n; });
    $$('[data-badge="bell"]').forEach(b => { b.hidden = !u; });
  }

  /* ---------- Hooks al entrar a cada pantalla ---------- */
  function mount(name, p) {
    if (name === 'lockerSearch' && L.ls.loading) {
      later(() => { L.ls.loading = false; if (R.cur().name === 'lockerSearch') { const r = $('#lres'); if (r) r.innerHTML = SC.lockerSearch.results(); } }, 700);
    }
    if (name === 'validate') {
      if (p.phase !== 'ok') later(() => R.replace('validate', { id: p.id, phase: 'ok' }), 1500);
      else later(() => R.replace('open', { id: p.id }), 1700);
    }
    if (name === 'retrieved') later(() => R.replace('completed', { id: p.id }), 3200);
    if (name === 'manualCode') { const i = $('#codein'); if (i) i.focus(); }
    if (name === 'purchaseDone') {
      const o = S().orders.find(x => x.id === p.id);
      if (o && !o.announced) { o.announced = true; later(() => C.notify({ type: 'confirmed', orderId: o.id, title: 'Tu pedido está confirmado', body: o.delivery === 'locker' ? '¡Listo! Estamos preparando tu pedido para enviarlo al Amazon Hub Locker de ' + locker(o.lockerId).name + '.' : '¡Listo! Estamos preparando tu pedido para enviarlo a tu domicilio.' }), 900); }
    }
    if (name === 'tracking') {
      S().notifications.forEach(n => { if (n.orderId === p.id) n.read = true; });
      refreshBadges();
    }
  }

  /* ---------- Navegación de checkout ---------- */
  function resetLs(mode) {
    L.ls = { q: '', type: 'all', quick: null, view: 'list', maxKm: null, onlyAvail: false, late: false, loading: true, sel: null, mode };
  }
  const btnLoading = (el, on) => { if (!el) return; el.classList.toggle('loading', on); el.disabled = on; };
  function copyText(t) {
    try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(t); return; } } catch (e) { /* fallback */ }
    const a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select();
    try { document.execCommand('copy'); } catch (e) { /* noop */ } a.remove();
  }
  const orderOf = id => S().orders.find(o => o.id === id);

  /* ============================================================
     ACCIONES
     ============================================================ */
  Object.assign(ACT, {
    back() { R.back(); },
    tab(el) {
      const to = el.dataset.to;
      if (to === 'orders') L.tab = L.tab || 'transit';
      if (R.cur().name === to && S().nav.length === 1) { const c = $('#content'); if (c) c.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (to === 'search') { L.q = ''; L.cat = null; }
      R.reset(to);
    },
    goCart() { if (R.cur().name !== 'cart') R.go('cart'); },
    goNotifications() { R.go('notifications'); },
    goHelp() { R.go('help'); },

    /* ----- Login ----- */
    login() {
      const e = $('#lg-email').value.trim(), p = $('#lg-pass').value, err = $('#lg-err');
      let m = '';
      if (!/^\S+@\S+\.\S+$/.test(e)) m = 'Revisá tu email. Tiene que tener un formato como nombre@mail.com.';
      else if (p.length < 6) m = 'Tu contraseña tiene que tener al menos 6 caracteres.';
      if (m) { err.textContent = m; err.hidden = false; return; }
      S().loggedIn = true; C.logEvent('login', e); R.reset('home');
    },
    logout() { UI.modal({ title: '¿Querés cerrar sesión?', body: 'Para ver tus pedidos de nuevo, vas a tener que ingresar otra vez.', icon: 'out', actions: [{ label: 'Cerrar sesión', act: 'doLogout' }, { label: 'Quedarme', act: 'closeModal', kind: 'secondary' }] }); },
    doLogout() { S().loggedIn = false; S().nav = [{ name: 'home', params: {} }]; C.save(); render(); },

    /* ----- Producto y carrito ----- */
    openProduct(el) { R.go('product', { id: el.dataset.pid || el.dataset.id }); },
    addToCart(el) {
      const id = el.dataset.id, it = S().cart.find(i => i.pid === id);
      if (it) it.qty = Math.min(5, it.qty + 1); else S().cart.push({ pid: id, qty: 1 });
      C.save(); C.logEvent('carrito', '+ ' + id); R.go('cart');
    },
    buyNow(el) {
      const id = el.dataset.id;
      if (!S().cart.find(i => i.pid === id)) S().cart.push({ pid: id, qty: 1 });
      C.save(); R.go('checkout');
    },
    qty(el) {
      const it = S().cart.find(i => i.pid === el.dataset.id); if (!it) return;
      it.qty = Math.max(1, Math.min(5, it.qty + Number(el.dataset.d))); C.save(); rerender();
    },
    removeItem(el) {
      const i = S().cart.findIndex(x => x.pid === el.dataset.id); if (i < 0) return;
      const [gone] = S().cart.splice(i, 1); C.save(); rerender();
      UI.toast('Quitaste “' + product(gone.pid).short + '”.', { action: { label: 'Deshacer', fn: () => { S().cart.splice(i, 0, gone); C.save(); rerender(); } } });
    },
    toCheckout() { R.go('checkout'); },
    toastAction() { const f = UI.toastFn; $('#toast').className = 'toast'; if (f) f(); },

    /* ----- Dirección / pago ----- */
    chooseAddress() { openAddressSheet(); },
    setAddr(el) { S().checkout.address = el.dataset.t; C.save(); UI.closeSheet(); rerender(); UI.toast('Listo, enviamos a ' + el.dataset.t + '.'); },
    addrForm() { const f = $('#addr-form'); f.hidden = false; $('#addr-in').focus(); el_hide('#addr-add'); },
    addAddress() {
      const v = $('#addr-in').value.trim(), err = $('#addr-err');
      if (v.length < 5 || !/\d/.test(v)) { err.textContent = 'Ingresá calle y número, por ejemplo: Av. Corrientes 1234.'; err.hidden = false; return; }
      const t = /caba/i.test(v) ? v : v + ', CABA';
      D.addresses.push({ id: 'a' + Date.now(), label: 'Nueva', text: t });
      S().checkout.address = t; C.save(); UI.closeSheet(); rerender(); UI.toast('Agregamos tu dirección.');
    },
    choosePayment() {
      UI.sheet('<div class="opts tight" role="radiogroup">' + D.cards.map(c => '<button type="button" role="radio" aria-checked="' + (S().checkout.card === c.id) + '" class="opt' + (S().checkout.card === c.id ? ' sel' : '') + '" data-act="setCard" data-id="' + c.id + '"><span class="opt-ic">' + ic('card', 26) + '</span><span class="opt-b"><strong>' + c.brand + ' •••• ' + c.last4 + '</strong><span>Vence 08/28</span></span><span class="radio"><i></i></span></button>').join('') + '</div>', { title: 'Método de pago' });
    },
    setCard(el) { S().checkout.card = el.dataset.id; C.save(); UI.closeSheet(); rerender(); },

    /* ----- Método de entrega ----- */
    toDelivery() { if (S().nav.some(n => n.name === 'delivery') && R.cur().name !== 'checkout') R.backTo('delivery'); else R.go('delivery'); },
    pickDelivery(el) {
      if (el.dataset.id === 'pickup') { UI.toast('Por ahora no hay puntos de retiro cerca de Av. Principal 123.'); return; }
      S().checkout.delivery = el.dataset.id; C.save(); rerender();
    },
    confirmDelivery() {
      const c = S().checkout;
      if (c.delivery === 'home') { R.go('review'); return; }
      if (c.lockerId) { R.go('lockerConfirm'); return; }
      resetLs('select'); R.go('lockerSearch', { mode: 'select' });
    },

    /* ----- Lockers: búsqueda / filtros ----- */
    lockerType(el) { L.ls.type = el.dataset.v; L.ls.sel = null; rerender(); },
    lockerQuick(el) { L.ls.quick = L.ls.quick === el.dataset.v ? null : el.dataset.v; rerender(); },
    setView(el) { L.ls.view = el.dataset.v; L.ls.sel = null; rerender(); },
    clearLq() { L.ls.q = ''; rerender(); const i = $('#lq'); if (i) i.focus(); },
    clearLockerFilters() { Object.assign(L.ls, { q: '', type: 'all', quick: null, maxKm: null, onlyAvail: false, late: false, sel: null }); rerender(); },
    moreFilters() { openFiltersSheet(); },
    fMax(el) { const v = Number(el.dataset.v) || null; L.ls.maxKm = L.ls.maxKm === v ? null : v; refreshFilters(); },
    fAvail() { L.ls.onlyAvail = !L.ls.onlyAvail; refreshFilters(); },
    fLate() { L.ls.late = !L.ls.late; refreshFilters(); },
    fClear() { Object.assign(L.ls, { maxKm: null, onlyAvail: false, late: false }); refreshFilters(); },
    pickPin(el) { L.ls.sel = el.dataset.id; rerender(); },
    openLocker(el) {
      const cur = R.cur(), mode = cur.name === 'lockerSearch' ? cur.params.mode : 'browse';
      L.open.moreInfo = false; R.go('lockerDetail', { id: el.dataset.id, mode });
    },
    toggleFav(el) {
      const id = el.dataset.id, f = S().favorites, i = f.indexOf(id);
      if (i >= 0) { f.splice(i, 1); UI.toast('Quitaste el locker de tus favoritos.'); } else { f.push(id); UI.toast('Guardamos este locker en tus favoritos.'); }
      C.save(); rerender();
    },
    shareLocker(el) { copyText('https://amazon.com/hub/' + el.dataset.id); UI.toast('Copiamos el link de este locker.'); },
    toggleMore() { L.open.moreInfo = !L.open.moreInfo; rerender(); },
    lockerWhere(el) { R.go('lockerLocation', { id: el.dataset.id }); },
    selectLocker(el) { S().checkout.lockerId = el.dataset.id; S().checkout.delivery = 'locker'; C.save(); C.logEvent('locker', 'elegido ' + el.dataset.id); R.go('lockerConfirm'); },
    changeLocker() { R.backTo('lockerSearch'); },
    confirmLocker() { R.go('review'); },
    showFavs() {
      const f = S().favorites.map(locker);
      UI.sheet(f.length ? '<div class="lstack">' + f.map(l => UI.lockerRow(l)).join('') + '</div>' : '<p class="muted">Todavía no guardaste lockers. Tocá el corazón en el detalle de un locker para tenerlo a mano.</p>', { title: 'Lockers favoritos' });
    },
    browseLockers() { resetLs('browse'); R.go('lockerSearch', { mode: 'browse' }); },

    /* ----- Compra ----- */
    placeOrder(el) {
      const c = S().checkout;
      if (c.delivery === 'locker' && !c.lockerId) { UI.toast('Elegí un locker para continuar.'); R.go('delivery'); return; }
      btnLoading(el, true);
      later(() => {
        const t = Date.now(), r = () => String(Math.floor(Math.random() * 9e6 + 1e6));
        const o = { id: '114-' + r() + '-' + String(Math.floor(Math.random() * 9000 + 1000)), items: S().cart.map(i => ({ pid: i.pid, qty: i.qty })), total: H.cartTotal(), delivery: c.delivery === 'locker' ? 'locker' : 'home', lockerId: c.delivery === 'locker' ? c.lockerId : null, address: c.address, card: c.card, status: 'confirmed', createdAt: t, times: { confirmed: t }, code: window.PICKUP_CODE, compartment: 'B-14', cancelled: false, surveyDone: false };
        S().orders.unshift(o); S().cart = []; c.delivery = 'home'; c.lockerId = null;
        L.tab = 'transit'; C.logEvent('compra', o.id + ' (' + o.delivery + ')');
        S().nav = [{ name: 'home', params: {} }, { name: 'purchaseDone', params: { id: o.id } }]; R.dir = 'fade'; C.save(); render();
      }, 1300);
    },

    /* ----- Pedidos ----- */
    openOrder(el) { R.go('tracking', { id: el.dataset.id }); },
    ordersTab(el) { L.tab = el.dataset.v; rerender(); },
    orderDetails(el) {
      const o = orderOf(el.dataset.id), l = o.lockerId ? locker(o.lockerId) : null, card = D.cards.find(c => c.id === o.card) || D.cards[0];
      const dl = (a, b) => '<div><dt>' + a + '</dt><dd>' + b + '</dd></div>';
      UI.sheet('<dl class="dl">' + dl('Nº de pedido', esc(o.id)) + dl('Fecha', C.dayLabel(o.createdAt) + ', ' + C.hhmm(o.createdAt)) + dl('Producto', esc(H.itemsTitle(o))) + dl('Total', money(o.total)) + dl('Pago', card.brand + ' •••• ' + card.last4) + dl('Entrega', l ? 'Amazon Hub Locker ' + esc(l.name) + '<br><span class="muted">' + esc(l.address) + '</span>' : 'A domicilio<br><span class="muted">' + esc(o.address) + '</span>') + '</dl>', { title: 'Detalles del pedido' });
    },
    cancelOrder(el) {
      const o = orderOf(el.dataset.id);
      if (H.cancellable(o)) UI.modal({ title: '¿Cancelamos tu pedido?', body: 'Todavía no salió de nuestro depósito, así que no te cobramos nada.', icon: 'close', tone: 'err', actions: [{ label: 'Sí, cancelar pedido', act: 'doCancel', data: { id: o.id } }, { label: 'No, mantenerlo', act: 'closeModal', kind: 'secondary' }] });
      else UI.modal({ title: 'Ya no se puede cancelar', body: 'Tu pedido ya está en camino. Cuando lo recibas, podés pedir la devolución desde esta misma lista.', icon: 'info', actions: [{ label: 'Entendido', act: 'closeModal' }] });
    },
    doCancel(el) {
      const o = orderOf(el.dataset.id); o.cancelled = true; C.save(); C.logEvent('cancelar', o.id); UI.closeModal(); L.tab = 'cancelled'; rerender(); UI.toast('Cancelamos tu pedido. No se te cobró nada.');
    },
    lockerFromOrder(el) { const o = orderOf(el.dataset.id); L.open.moreInfo = false; R.go('lockerDetail', { id: o.lockerId, mode: 'browse' }); },
    showCode(el) { R.go('pickupCode', { id: el.dataset.id }); },
    copyCode(el) { copyText(el.dataset.code); UI.toast('Copiamos tu código.'); },
    readAll() { S().notifications.forEach(n => { n.read = true; }); C.save(); rerender(); },
    openNotification(el) {
      const n = S().notifications.find(x => x.id === el.dataset.id); if (!n) return;
      n.read = true; C.save(); UI.hidePush(); refreshBadges();
      if (n.type === 'ready') R.go('notice', { id: n.id });
      else if (n.orderId && orderOf(n.orderId)) R.go('tracking', { id: n.orderId });
    },

    /* ----- Retiro ----- */
    instructions(el) {
      const o = orderOf(el.dataset.id), l = locker(o.lockerId);
      UI.sheet('<ol class="how">' + [['Andá al locker', l.name + ' · ' + l.address + '.'], ['Escaneá tu QR', 'Acercalo a la pantalla del locker o ingresá tu código de 6 dígitos.'], ['Retirá tu paquete', 'Se abre solo el compartimento que corresponde a tu pedido.'], ['Cerrá la puerta', 'Y listo. Te confirmamos el retiro en la app.']].map((s, i) => '<li><span>' + (i + 1) + '</span><div><strong>' + s[0] + '</strong><em>' + esc(s[1]) + '</em></div></li>').join('') + '</ol>' + UI.btn('Ir al locker', 'toLocation', { data: { id: o.id }, arrow: true }), { title: '¿Cómo retirar mi pedido?' });
    },
    toLocation(el) { const o = orderOf(el.dataset.id); UI.closeSheet(true); R.go('lockerLocation', { id: o.lockerId, orderId: o.id }); },
    directions(el) {
      const l = locker(el.dataset.id);
      UI.sheet('<div class="route"><div class="rt-big">4 min</div><p>caminando · ' + km(l.km) + '</p></div><ol class="how"><li><span>1</span><div><strong>Salí por Av. Principal</strong><em>Seguí derecho 2 cuadras.</em></div></li><li><span>2</span><div><strong>Llegás a ' + esc(l.address) + '</strong><em>' + esc(l.where) + '.</em></div></li></ol>' + UI.btn('Abrir en Mapas', 'openMaps', { icon: 'nav' }), { title: 'Cómo llegar' });
    },
    openMaps() { UI.closeSheet(); UI.toast('Abriendo tu app de mapas…'); },
    toScan(el) { L.code = ''; L.codeErr = ''; R.go('scan', { id: el.dataset.id }); },
    doScan(el) {
      const o = orderOf(el.dataset.id); el.classList.add('hit');
      later(() => { if (o.status === 'ready') R.replace('validate', { id: o.id, phase: 'wait' }); else R.go('codeError', { id: o.id }); }, 450);
    },
    toManual(el) { L.code = ''; L.codeErr = ''; R.go('manualCode', { id: el.dataset.id }); },
    showMyCode(el) { const o = orderOf(el.dataset.id); UI.sheet('<div class="center"><p class="muted">Tu código de retiro es</p><div class="bigcode">' + o.code.slice(0, 3) + ' ' + o.code.slice(3) + '</div><p class="muted">Lo ves siempre en Mis pedidos, en “Ver código de retiro”.</p></div>', { title: '¿Dónde veo mi código?' }); },
    validateCode(el) {
      const o = orderOf(el.dataset.id), v = L.code;
      if (v.length < 6) { L.codeErr = 'Faltan dígitos. El código tiene 6 números.'; rerender(); return; }
      if (v !== o.code || o.status !== 'ready') { C.logEvent('error', 'código incorrecto: ' + v); L.codeErr = ''; R.go('codeError', { id: o.id }); return; }
      L.code = ''; R.replace('validate', { id: o.id, phase: 'wait' });
    },
    retryCode(el) { L.code = ''; L.codeErr = ''; R.back(); },
    openFail(el) { C.logEvent('error', 'el compartimento no abrió'); R.replace('openError', { id: el.dataset.id }); },
    retryOpen(el) { R.replace('validate', { id: el.dataset.id, phase: 'wait' }); },
    pickedUp(el) { const o = orderOf(el.dataset.id); C.advanceOrder(o, 'pickedUp'); R.replace('retrieved', { id: o.id }); },
    toCompleted(el) { R.replace('completed', { id: el.dataset.id }); },
    openSurvey(el) { L.survey = { score: null, text: '' }; R.go('survey', { id: el.dataset.id }); },
    pickFace(el) { L.survey.score = Number(el.dataset.i); rerender(); },
    sendSurvey(el) {
      btnLoading(el, true);
      later(() => { const o = orderOf(el.dataset.id); o.surveyDone = true; C.save(); C.logEvent('encuesta', 'puntaje ' + L.survey.score + (L.survey.text ? ' · “' + L.survey.text + '”' : '')); R.replace('survey', { id: o.id, thanks: true }); }, 800);
    },

    /* ----- Búsqueda de productos ----- */
    recentSearch(el) { L.q = el.dataset.q; L.cat = null; rerender(); },
    pickCat(el) { L.cat = el.dataset.cat; rerender(); },
    clearSearch() { L.q = ''; L.cat = null; rerender(); const i = $('#q'); if (i) i.focus(); },

    /* ----- Soporte / varios ----- */
    support() {
      UI.sheet('<p class="muted sp-b">Contanos qué pasó y te ayudamos.</p><div class="list-card">' +
        '<button type="button" class="lrow" data-act="supportDone" data-t="Listo. Un asesor te escribe por la app en menos de 5 minutos."><span class="lr-ic">' + ic('help', 22) + '</span><span class="lr-b"><strong>Chatear con soporte</strong><span>Respuesta en menos de 5 minutos</span></span>' + ic('chevR', 20, 'lchev') + '</button>' +
        '<button type="button" class="lrow" data-act="supportDone" data-t="Perfecto. Te llamamos en unos minutos al número de tu cuenta."><span class="lr-ic">' + ic('phone', 22) + '</span><span class="lr-b"><strong>Que me llamen</strong><span>Te llamamos al número de tu cuenta</span></span>' + ic('chevR', 20, 'lchev') + '</button></div>', { title: 'Contactar soporte' });
    },
    supportDone(el) { UI.closeSheet(); UI.toast(el.dataset.t, { ms: 4200 }); C.logEvent('soporte', el.dataset.t); },
    toggleFaq(el) { L.open['f' + el.dataset.i] = !L.open['f' + el.dataset.i]; rerender(); },
    toggleSw(el) { const k = el.dataset.id; S().prefs[k] = !S().prefs[k]; C.save(); rerender(); UI.toast(S().prefs[k] ? 'Listo, te vamos a avisar.' : 'Listo, desactivamos estos avisos.'); },
    closeSheet() { UI.closeSheet(); },
    closeModal() { UI.closeModal(); },
    noop() {}
  });
  function el_hide(sel) { const e = $(sel); if (e) e.hidden = true; }
  function refreshFilters() { const b = $('.sheet-b'); if (b) b.innerHTML = filtersBody(); rerender(); }

  function openAddressSheet() {
    UI.sheet('<div class="opts tight" role="radiogroup">' + D.addresses.map(a => '<button type="button" role="radio" aria-checked="' + (S().checkout.address === a.text) + '" class="opt' + (S().checkout.address === a.text ? ' sel' : '') + '" data-act="setAddr" data-t="' + esc(a.text) + '"><span class="opt-ic">' + ic('pin', 26) + '</span><span class="opt-b"><strong>' + esc(a.label) + '</strong><span>' + esc(a.text) + '</span></span><span class="radio"><i></i></span></button>').join('') + '</div>' +
      '<button type="button" class="link spaced" id="addr-add" data-act="addrForm">' + ic('plus', 16) + 'Agregar dirección</button>' +
      '<div id="addr-form" hidden><label class="field"><span>Calle y número</span><input id="addr-in" placeholder="Av. Corrientes 1234" autocomplete="off"></label><p class="field-err" id="addr-err" hidden></p>' + UI.btn('Guardar dirección', 'addAddress') + '</div>', { title: 'Dirección de envío' });
  }
  function openFiltersSheet() { UI.sheet(filtersBody(), { title: 'Más filtros' }); }
  function filtersBody() {
    const f = L.ls, n = H.filterLockers().length;
    return ('<h3 class="sub-h first">Distancia máxima</h3><div class="chips wrap">' + [[0.5, 'Hasta 0,5 km'], [1, 'Hasta 1 km'], [2, 'Hasta 2 km']].map(d => UI.chip(d[1], 'fMax', f.maxKm === d[0], { v: d[0] })).join('') + '</div>' +
      '<div class="list-card pad spaced">' + UI.sw('fAvail', f.onlyAvail, 'Solo con espacio disponible', 'Ocultamos los lockers llenos') + UI.sw('fLate', f.late, 'Abiertos hasta las 22 h o más', 'Para cuando salís tarde') + '</div>' +
      '<div class="two">' + UI.btn('Limpiar', 'fClear', { kind: 'secondary' }) + UI.btn(n ? 'Ver ' + n + (n === 1 ? ' locker' : ' lockers') : 'Sin resultados', 'closeSheet', { disabled: !n }) + '</div>');
  }
  // los switches del sheet de filtros reutilizan data-act="toggleSw" → ruteamos por id
  const origSw = ACT.toggleSw;
  ACT.toggleSw = function (el) {
    const id = el.dataset.id;
    if (id === 'fAvail') return ACT.fAvail(el);
    if (id === 'fLate') return ACT.fLate(el);
    return origSw(el);
  };

  /* ============================================================
     EVENTOS GLOBALES
     ============================================================ */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const a = el.dataset.act;
    if (!ACT[a]) { console.warn('Acción sin definir:', a); return; }
    if (a !== 'closeSheet' && a !== 'closeModal' && a !== 'toastAction') C.logEvent('click', a + (el.dataset.id ? ' · ' + el.dataset.id : '') + (el.dataset.to ? ' · ' + el.dataset.to : ''));
    scrollMem[S().nav.length] = ($('#content') || {}).scrollTop || 0;
    ACT[a](el, e);
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'q') {
      L.q = t.value; L.cat = null;
      $('#results').innerHTML = SC.search.results();
      const x = $('.searchbar .x'); if (x) x.hidden = !L.q;
    } else if (t.id === 'lq') {
      L.ls.q = t.value; L.ls.sel = null;
      const r = $('#lres'); if (r) r.innerHTML = SC.lockerSearch.results();
      const x = $('.lsearch .x'); if (x) x.hidden = !L.ls.q;
    } else if (t.id === 'codein') {
      t.value = t.value.replace(/\D/g, '').slice(0, 6); L.code = t.value; L.codeErr = '';
      $('.cboxes').innerHTML = [0, 1, 2, 3, 4, 5].map(i => '<span class="cbox' + (i === L.code.length ? ' cur' : '') + (L.code[i] ? ' fill' : '') + '">' + (L.code[i] || '') + '</span>').join('');
      const er = $('#code-err'); if (er) er.hidden = true;
      const b = $('#btn-validate'); if (b) { b.disabled = L.code.length < 6; }
    } else if (t.id === 'svtext') { L.survey.text = t.value; }
  });
  document.addEventListener('submit', e => {
    if (e.target.id === 'search-form') {
      e.preventDefault();
      const q = L.q.trim();
      if (q.length > 1) { const r = S().recent.filter(x => x !== q); r.unshift(q); S().recent = r.slice(0, 5); C.save(); C.logEvent('búsqueda', q); }
      document.activeElement.blur();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if ($('.modal-wrap')) UI.closeModal(); else if ($('.sheet-wrap')) UI.closeSheet(); }
    if (e.key === 'Enter' && e.target.id === 'lg-pass') ACT.login();
    if (e.key === 'Enter' && e.target.id === 'codein' && L.code.length === 6) { const b = $('#btn-validate'); if (b) b.click(); }
    if (e.key === 'Enter' && e.target.id === 'lq') e.target.blur();
  });
  // Los elementos con data-act dentro de <label> (searchbar) no deben disparar el foco extra
  document.addEventListener('focusin', e => { if (e.target.classList && e.target.classList.contains('codein')) e.target.setSelectionRange(99, 99); });

  /* ============================================================
     PANEL DEL FACILITADOR
     ============================================================ */
  const TASKS = [
    ['t1', 'Tarea 1 · Elegir dónde retirar', 'Comprá los auriculares inalámbricos y elegí retirarlos en el locker de tu facultad.'],
    ['t2', 'Tarea 2 · Seguimiento y código', 'Tu pedido ya llegó. Encontrá cómo ver tu código de retiro.'],
    ['t3', 'Tarea 3 · Retirar el paquete', 'Ya estás en el locker. Retirá tu paquete.']
  ];
  const FAC = {
    el: null, open: true,
    init() {
      this.el = $('#fac');
      this.el.addEventListener('click', e => {
        const b = e.target.closest('[data-f]'); if (!b) return;
        this.act(b.dataset.f, b.dataset);
      });
      this.el.addEventListener('change', e => { if (e.target.id === 'f-status') this.act('jump', { to: e.target.value }); });
      const q = new URLSearchParams(location.search);
      const narrow = window.matchMedia('(max-width: 900px)').matches;
      this.setOpen(q.has('f') ? q.get('f') !== '0' : !narrow);
      document.addEventListener('keydown', e => { if ((e.key === 'F' && e.shiftKey) && !/INPUT|TEXTAREA/.test(e.target.tagName)) this.setOpen(!this.open); });
      this.refresh();
    },
    setOpen(v) { this.open = v; document.body.classList.toggle('fac-open', v); $('#fac-toggle').setAttribute('aria-expanded', v); },
    activeOrder() { return S().orders.filter(o => !o.cancelled && !C.isDone(o)).sort((a, b) => b.createdAt - a.createdAt)[0]; },
    act(a, d) {
      const o = this.activeOrder();
      if (a === 'next' && o) { C.advanceOrder(o); rerender(); }
      if (a === 'jump' && o && d.to) { C.advanceOrder(o, d.to); rerender(); }
      if (a === 'ready') this.createReady();
      if (a === 'reset') { if (confirm('¿Reiniciar el prototipo? Se borran pedidos, carrito y registro.')) C.resetAll(); }
      if (a === 'go') { S().nav = [{ name: d.to, params: {} }]; R.dir = 'fade'; render(); }
      if (a === 'start') this.taskStart(d.id);
      if (a === 'done') this.taskEnd(d.id, 'ok');
      if (a === 'fail') this.taskEnd(d.id, 'abandonó');
      if (a === 'copy') { copyText(JSON.stringify({ tareas: S().tasks, registro: S().log }, null, 2)); UI.toast('Copiamos los resultados.'); }
      if (a === 'toggle') this.setOpen(!this.open);
      this.refresh();
    },
    createReady() {
      const t = Date.now(), id = '114-' + Math.floor(Math.random() * 9e6 + 1e6) + '-' + Math.floor(Math.random() * 9000 + 1000);
      const o = { id, items: [{ pid: 'p1', qty: 1 }], total: product('p1').price, delivery: 'locker', lockerId: 'ing', address: D.addresses[0].text, card: 'c1', status: 'ready', createdAt: t - 2 * C.DAY, times: { confirmed: t - 2 * C.DAY, preparing: t - 2 * C.DAY + 7200000, transit: t - C.DAY, atLocker: t - 7200000, ready: t }, code: window.PICKUP_CODE, compartment: 'B-14', cancelled: false, surveyDone: false, announced: true };
      S().orders.unshift(o); C.save(); C.logEvent('facilitador', 'pedido listo creado');
      C.notify({ type: 'ready', orderId: o.id, title: 'Tu pedido está disponible', body: 'Ya podés retirarlo en el Amazon Hub Locker de Facultad de Ingeniería. Tenés tiempo hasta el ' + C.shortDate(C.deadline(o)) + '.' });
      rerender();
    },
    taskStart(id) { S().tasks[id] = { start: Date.now(), status: 'en curso', logFrom: S().log.length }; C.logEvent('tarea', id + ' inicio'); },
    taskEnd(id, st) {
      const t = S().tasks[id]; if (!t || t.status !== 'en curso') return;
      t.end = Date.now(); t.status = st; t.seg = Math.round((t.end - t.start) / 1000);
      t.clics = S().log.slice(t.logFrom).filter(l => l.type === 'click').length;
      t.errores = S().log.slice(t.logFrom).filter(l => l.type === 'error').length;
      C.logEvent('tarea', id + ' ' + st + ' (' + t.seg + ' s, ' + t.clics + ' clics)');
    },
    refresh() {
      if (!this.el) return;
      const o = this.activeOrder(), labels = window.STATUS_LABEL;
      const seq = o ? C.seqFor(o) : [];
      const tasks = TASKS.map(t => {
        const r = S().tasks[t[0]], run = r && r.status === 'en curso';
        const res = r ? (run ? '<em class="run" data-t0="' + r.start + '">en curso…</em>' : '<em>' + r.status + ' · ' + r.seg + ' s · ' + r.clics + ' clics · ' + r.errores + ' errores</em>') : '';
        return '<div class="ft"><strong>' + t[1] + '</strong><p>' + t[2] + '</p>' + res + '<div class="fbtns">' + (run ? '<button data-f="done" data-id="' + t[0] + '">Completó</button><button data-f="fail" data-id="' + t[0] + '">Abandonó</button>' : '<button data-f="start" data-id="' + t[0] + '">' + (r ? 'Repetir' : 'Iniciar') + '</button>') + '</div></div>';
      }).join('');
      const logs = S().log.slice(-9).reverse().map(l => '<li><time>' + C.hhmm(l.t) + ':' + String(new Date(l.t).getSeconds()).padStart(2, '0') + '</time><b>' + esc(l.type) + '</b> ' + esc(l.detail) + '</li>').join('');
      this.el.innerHTML = '<div class="fac-h"><strong>Panel del facilitador</strong><button data-f="toggle" aria-label="Ocultar panel">' + ic('close', 18) + '</button></div>' +
        '<p class="fac-n">Esto no lo ve quien prueba. Mostralo solo si hace falta (<kbd>Shift</kbd>+<kbd>F</kbd> lo oculta).</p>' +
        '<section><h4>Pedido activo</h4>' + (o ? '<p class="fst"><b>' + (labels[o.status] || 'Entregado') + '</b> · ' + (o.delivery === 'locker' ? 'Locker' : 'Domicilio') + '</p><div class="fbtns"><button class="pri" data-f="next"' + (C.statusIdx(o) >= seq.length - 1 ? ' disabled' : '') + '>Avanzar estado →</button></div><select id="f-status" aria-label="Saltar a estado">' + seq.map(s => '<option value="' + s + '"' + (s === o.status ? ' selected' : '') + '>' + (labels[s] || 'Entregado') + '</option>').join('') + '</select>' : '<p class="fst muted">No hay pedidos en curso. Completá una compra o creá un pedido listo.</p>') +
        '<div class="fbtns"><button data-f="ready">Crear pedido listo para retirar</button></div></section>' +
        '<section><h4>Ir a</h4><div class="fbtns"><button data-f="go" data-to="home">Inicio</button><button data-f="go" data-to="orders">Pedidos</button><button data-f="go" data-to="lockerTab">Locker</button></div></section>' +
        '<section><h4>Tareas</h4>' + tasks + '</section>' +
        '<section><h4>Registro</h4><ul class="flog">' + (logs || '<li class="muted">Sin eventos todavía.</li>') + '</ul><div class="fbtns"><button data-f="copy">Copiar resultados</button><button class="danger" data-f="reset">Reiniciar prototipo</button></div></section>';
    }
  };
  window.FAC = FAC;
  setInterval(() => { $$('.run[data-t0]').forEach(e => { e.textContent = 'en curso · ' + Math.round((Date.now() - Number(e.dataset.t0)) / 1000) + ' s'; }); }, 1000);

  /* ---------- Boot ---------- */
  window.APP = { render, rerender, refreshBadges };
  document.addEventListener('DOMContentLoaded', () => {
    $('#fac-toggle').addEventListener('click', () => FAC.setOpen(!FAC.open));
    FAC.init();
    render();
  });
})();
