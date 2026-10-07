/* ============================================================
   PANTALLAS — cada una devuelve HTML a partir del estado
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, UI = window.UI, D = window.DATA;
  const { esc, ic, money, km, product, locker, norm, R } = C;
  const S = () => C.state;
  const SC = {};
  const L = { // estado de UI efímero (no se persiste)
    q: '', cat: null,
    ls: { q: '', type: 'all', quick: null, view: 'list', maxKm: null, onlyAvail: false, late: false, loading: false, sel: null, mode: 'select' },
    code: '', codeErr: '', survey: { score: null, text: '' }, tab: 'transit', open: {}
  };
  window.LSTATE = L;

  const itemsTitle = o => {
    const p = product(o.items[0].pid);
    return p.short + (o.items.length > 1 ? ' y ' + (o.items.length - 1) + ' más' : '');
  };
  const cartTotal = () => S().cart.reduce((a, i) => a + product(i.pid).price * i.qty, 0);
  const lockerName = l => (l.type === 'super' ? l.name : 'Amazon Hub Locker ' + l.name);

  /* ============================================================
     LOGIN
     ============================================================ */
  SC.login = {
    render() {
      return UI.page({ cls: 'login', body:
        '<div class="login-box"><div class="login-logo">' + C.LOGO + '</div><h1>Hola, qué bueno verte.</h1><p class="lead">Ingresá para ver tus pedidos y retirarlos cuando quieras.</p>' +
        '<label class="field"><span>Email</span><input id="lg-email" type="email" autocomplete="off" placeholder="nombre@mail.com" value="' + esc(D.user.email) + '"></label>' +
        '<label class="field"><span>Contraseña</span><input id="lg-pass" type="password" autocomplete="off" placeholder="Tu contraseña" value="demo1234"></label>' +
        '<p class="field-err" id="lg-err" hidden></p>' +
        UI.btn('Ingresar', 'login', { arrow: true }) + '</div>' });
    }
  };

  /* ============================================================
     HOME
     ============================================================ */
  SC.home = {
    render() {
      const orders = S().orders.filter(o => !o.cancelled).sort((a, b) => b.createdAt - a.createdAt).slice(0, 2);
      const header = '<header class="hdr hdr-home"><div class="hdr-row"><span class="hlogo big">' + C.LOGO + '</span><div class="hright">' + UI.bellBtn() + UI.cartBtn() + '</div></div>' +
        '<button type="button" class="searchbar" data-act="tab" data-to="search" aria-label="Buscar en Amazon">' + ic('search', 20) + '<span>Buscar en Amazon</span>' + ic('camera', 20) + '</button>' +
        '<button type="button" class="shipto" data-act="chooseAddress">' + ic('pin', 18) + '<span>Enviar a ' + esc(S().checkout.address.split(', ').pop() === 'CABA' ? 'CABA' : S().checkout.address) + '</span>' + ic('chevD', 16) + '</button></header>';
      const banner = '<button type="button" class="hub-banner" data-act="tab" data-to="lockerTab"><span class="hb-ic">' + ic('locker', 30) + '</span><span class="hb-tx"><strong>Amazon Hub Locker</strong><span>Retirá cuando quieras</span></span>' + ic('chevR', 22) + '</button>';
      const ordersHtml = orders.length ? orders.map(homeOrder).join('') : '<p class="muted pad">Todavía no hiciste pedidos. Cuando compres, los vas a ver acá.</p>';
      const prods = D.products.map(p => '<button type="button" class="pcard" data-act="openProduct" data-id="' + p.id + '">' + UI.art(p) + '<strong>' + esc(p.short) + '</strong><span class="price">' + money(p.price) + '</span><span class="free">Envío GRATIS</span></button>').join('');
      const body = '<div class="pad-x">' + banner +
        '<div class="sec-h"><h2>Mis pedidos</h2><button type="button" class="link" data-act="tab" data-to="orders">Ver todos ' + ic('chevR', 14) + '</button></div>' + ordersHtml +
        '<div class="sec-h"><h2>Para tu facultad</h2></div></div><div class="hscroll">' + prods + '</div><div class="sp-lg"></div>';
      return UI.page({ header, body, tab: 'home', cls: 'home' });
    }
  };
  function homeOrder(o) {
    const l = o.lockerId ? locker(o.lockerId) : null;
    const t = homeOrderTitle(o), sub = homeOrderSub(o, l);
    return '<button type="button" class="ocard ' + (o.status === 'ready' ? 'hl' : '') + '" data-act="openOrder" data-id="' + o.id + '">' + UI.art(product(o.items[0].pid), 56) +
      '<span class="ob"><strong>' + esc(t) + '</strong><span>' + esc(sub) + '</span></span>' + ic('chevR', 22) + '</button>';
  }
  function homeOrderTitle(o) {
    return { confirmed: 'Pedido confirmado', preparing: 'Estamos preparando tu pedido', transit: 'Tu pedido está en camino', atLocker: 'Tu pedido llegó al locker', ready: 'Tu pedido está listo', pickedUp: 'Pedido retirado', delivered: 'Pedido entregado' }[o.status];
  }
  function homeOrderSub(o, l) {
    if (o.status === 'ready') return 'Retiralo en ' + l.name + ' antes del ' + C.shortDate(C.deadline(o));
    if (o.status === 'pickedUp') return itemsTitle(o);
    if (o.delivery === 'home') return itemsTitle(o) + ' · a domicilio';
    return (o.status === 'transit' ? 'Llega al locker el ' + C.dayLabel(C.etaTransit(o)) + ', 14:00 – 16:00' : itemsTitle(o) + ' · ' + l.name);
  }

  /* ============================================================
     BUSCAR
     ============================================================ */
  function searchResults() {
    const q = norm(L.q.trim());
    let list = D.products;
    if (L.cat) list = list.filter(p => p.cat === L.cat);
    if (q) list = list.filter(p => norm(p.title + ' ' + p.cat).indexOf(q) >= 0);
    if (!q && !L.cat) {
      const rec = S().recent.length ? S().recent : ['auriculares', 'mochila', 'cuadernos'];
      return '<div class="pad-x"><div class="sec-h"><h2>Búsquedas recientes</h2></div><div class="chips wrap">' + rec.map(r => UI.chip(r, 'recentSearch', false, { q: r }, 'search')).join('') + '</div>' +
        '<div class="sec-h"><h2>Categorías</h2></div><div class="cats">' + D.categories.map(c => '<button type="button" class="cat" data-act="pickCat" data-cat="' + c + '"><span>' + ic({ 'Tecnología': 'phone', 'Ropa': 'user', 'Accesorios': 'box', 'Facultad': 'cap' }[c], 26) + '</span>' + c + '</button>').join('') + '</div>' +
        '<div class="sec-h"><h2>Más buscados</h2></div></div>' + plist(D.products.slice(0, 3));
    }
    if (!list.length) return UI.emptyState({ icon: 'search', title: 'No encontramos “' + L.q.trim() + '”.', body: 'Probá con otra palabra o explorá las categorías.', cta: UI.btn('Ver categorías', 'clearSearch', { kind: 'secondary', block: false }) });
    return '<div class="pad-x"><p class="muted rescount">' + list.length + (list.length === 1 ? ' resultado' : ' resultados') + (L.cat ? ' en ' + L.cat : '') + (L.cat ? ' <button type="button" class="link" data-act="clearSearch">Quitar filtro</button>' : '') + '</p></div>' + plist(list);
  }
  const plist = list => '<div class="plist">' + list.map(p => '<button type="button" class="prow" data-act="openProduct" data-id="' + p.id + '">' + UI.art(p, 92) +
    '<span class="pr-b"><strong>' + esc(p.title) + '</strong><span class="pr-r">' + UI.stars(p.rating) + '<em>' + p.rating.toString().replace('.', ',') + ' (' + p.reviews.toLocaleString('es-AR') + ')</em></span><span class="price">' + money(p.price) + '</span><span class="free">Envío GRATIS</span></span></button>').join('') + '</div>';
  SC.search = {
    render() {
      const header = '<header class="hdr hdr-home"><div class="hdr-row"><span class="hlogo big">' + C.LOGO + '</span><div class="hright">' + UI.bellBtn() + UI.cartBtn() + '</div></div>' +
        '<form class="searchbar real" id="search-form" role="search">' + ic('search', 20) + '<input id="q" type="search" placeholder="Buscar en Amazon" value="' + esc(L.q) + '" autocomplete="off" enterkeyhint="search"><button type="button" class="x" data-act="clearSearch" aria-label="Borrar búsqueda"' + (L.q ? '' : ' hidden') + '>' + ic('close', 18) + '</button></form></header>';
      return UI.page({ header, body: '<div id="results">' + searchResults() + '</div>', tab: 'search' });
    },
    results: searchResults
  };

  /* ============================================================
     PRODUCTO
     ============================================================ */
  SC.product = {
    render(p) {
      const pr = product(p.id);
      const body = '<div class="pdp-art">' + UI.art(pr) + '</div><div class="pad-x"><p class="muted">' + esc(pr.cat) + '</p><h1 class="pdp-t">' + esc(pr.title) + '</h1>' +
        '<div class="pr-r">' + UI.stars(pr.rating) + '<em>' + String(pr.rating).replace('.', ',') + ' (' + pr.reviews.toLocaleString('es-AR') + ' opiniones)</em></div>' +
        '<div class="pdp-price">' + money(pr.price) + '</div><p class="free big">Envío GRATIS</p><p class="muted">Llega en 2 a 4 días. Elegís cómo recibirlo cuando pagás.</p>' +
        '<h3 class="sub-h">Sobre este producto</h3><ul class="bul">' + pr.bullets.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul></div><div class="sp-lg"></div>';
      const footer = UI.btn('Agregar al carrito', 'addToCart', { data: { id: pr.id } }) + UI.btn('Comprar ahora', 'buyNow', { kind: 'secondary', data: { id: pr.id } });
      return UI.page({ header: UI.hdr({ right: [UI.cartBtn()] }), body, footer });
    }
  };

  /* ============================================================
     CARRITO
     ============================================================ */
  SC.cart = {
    render() {
      const items = S().cart, n = UI.cartCount();
      let body;
      if (!items.length) {
        body = UI.emptyState({ icon: 'cart', title: 'Tu carrito está vacío.', body: 'Sumá productos y los ves acá.', cta: UI.btn('Explorar productos', 'tab', { data: { to: 'home' }, block: false }) });
      } else {
        body = '<div class="pad-x"><h1 class="h1">Tu carrito (' + n + ')</h1>' + items.map(i => {
          const p = product(i.pid);
          return '<div class="crow">' + UI.art(p, 76) + '<div class="cr-b"><strong>' + esc(p.title) + '</strong><span class="price">' + money(p.price) + '</span><span class="free">Envío GRATIS</span>' +
            '<div class="stepper"><button type="button" data-act="qty" data-id="' + p.id + '" data-d="-1" aria-label="Quitar uno"' + (i.qty <= 1 ? ' disabled' : '') + '>' + ic('minus', 16) + '</button><output>' + i.qty + '</output><button type="button" data-act="qty" data-id="' + p.id + '" data-d="1" aria-label="Agregar uno"' + (i.qty >= 5 ? ' disabled' : '') + '>' + ic('plus', 16) + '</button>' +
            '<button type="button" class="trash" data-act="removeItem" data-id="' + p.id + '" aria-label="Eliminar ' + esc(p.short) + '">' + ic('trash', 20) + '</button></div></div></div>';
        }).join('') + '<div class="sum"><span>Subtotal (' + n + ')</span><strong>' + money(cartTotal()) + '</strong></div><button type="button" class="link" data-act="tab" data-to="home">Seguir comprando</button></div>';
      }
      return UI.page({ header: UI.hdr({}), body, footer: items.length ? UI.btn('Proceder al pago', 'toCheckout', { arrow: true }) : '' });
    }
  };

  /* ============================================================
     CHECKOUT
     ============================================================ */
  function deliveryRowText() {
    const c = S().checkout;
    if (c.delivery === 'locker' && c.lockerId) return ['Amazon Hub Locker', locker(c.lockerId).name];
    return ['Envío estándar', 'GRATIS · 2 a 4 días'];
  }
  SC.checkout = {
    render() {
      const c = S().checkout, card = D.cards.find(x => x.id === c.card);
      const d = deliveryRowText();
      if (!S().cart.length) return SC.cart.render();
      const body = '<div class="pad-x"><h1 class="h1">Checkout</h1><div class="list-card">' +
        row('pin', 'Dirección', c.address, 'chooseAddress') + row('card', 'Método de pago', '•••• ' + card.last4 + ' (' + card.brand + ')', 'choosePayment') + row(c.delivery === 'locker' && c.lockerId ? 'locker' : 'truck', 'Método de entrega', d[0] + ' · ' + d[1], 'toDelivery') + '</div>' +
        '<div class="sum"><span>Total</span><strong>' + money(cartTotal()) + '</strong></div></div>';
      return UI.page({ header: UI.hdr({}), body, footer: UI.btn('Continuar', 'toDelivery', { arrow: true }) });
    }
  };
  function row(icon, t, sub, act, data) {
    return '<button type="button" class="lrow" data-act="' + act + '"' + UI.attrs(data) + '><span class="lr-ic">' + ic(icon, 22) + '</span><span class="lr-b"><strong>' + esc(t) + '</strong><span>' + esc(sub) + '</span></span>' + ic('chevR', 20, 'lchev') + '</button>';
  }

  /* ============================================================
     MÉTODO DE ENTREGA
     ============================================================ */
  SC.delivery = {
    render() {
      const c = S().checkout;
      const opt = (id, icon, t, sub, o) => {
        o = o || {};
        return '<button type="button" role="radio" aria-checked="' + (c.delivery === id) + '" class="opt' + (c.delivery === id ? ' sel' : '') + (o.dis ? ' dis' : '') + '" data-act="pickDelivery" data-id="' + id + '"><span class="opt-ic">' + ic(icon, 28) + '</span><span class="opt-b"><strong>' + t + '</strong><span>' + sub + '</span>' + (o.extra || '') + '</span><span class="radio"><i></i></span></button>';
      };
      const body = '<div class="pad-x"><h1 class="h1">Método de entrega</h1><div class="opts" role="radiogroup" aria-label="Método de entrega">' +
        opt('home', 'house', 'A domicilio', 'Recibí en tu casa.', { extra: '<span class="opt-s">GRATIS · 2 a 4 días</span>' }) +
        opt('locker', 'locker', 'Amazon Hub Locker', 'Retirá cuando quieras.', { extra: '<span class="opt-s">GRATIS · Retiralo en tu facultad o en un súper cercano</span>' }) +
        opt('pickup', 'pin', 'Punto de retiro', 'Retirá en sucursal.', { dis: true }) + '</div></div>';
      return UI.page({ header: UI.hdr({}), body, footer: UI.btn('Continuar', 'confirmDelivery', { arrow: true }) });
    }
  };

  /* ============================================================
     BUSCAR LOCKERS (lista + mapa)
     ============================================================ */
  function filterLockers() {
    const f = L.ls; let list = D.lockers.slice().sort((a, b) => a.km - b.km);
    if (f.type !== 'all') list = list.filter(l => l.type === (f.type === 'facultades' ? 'facultad' : 'super'));
    const q = norm(f.q.trim());
    if (q) list = list.filter(l => norm(l.name + ' ' + l.address + ' ' + l.barrio + ' ' + l.cp + ' ' + (l.type === 'super' ? 'supermercado super' : 'facultad universidad')).indexOf(q) >= 0);
    if (f.quick === 'near') list = list.filter(l => l.km <= 1.5);
    if (f.quick === 'avail') list.sort((a, b) => b.free - a.free);
    if (f.maxKm) list = list.filter(l => l.km <= f.maxKm);
    if (f.onlyAvail) list = list.filter(l => l.status !== 'full');
    if (f.late) list = list.filter(l => /(22|23):00$/.test(l.hours));
    return list;
  }
  const extraFilters = () => (L.ls.maxKm ? 1 : 0) + (L.ls.onlyAvail ? 1 : 0) + (L.ls.late ? 1 : 0);
  function mapHtml(list) {
    const pins = list.map(l => '<button type="button" class="pin' + (L.ls.sel === l.id ? ' on' : '') + (l.status === 'full' ? ' full' : '') + '" style="left:' + l.x + '%;top:' + l.y + '%" data-act="pickPin" data-id="' + l.id + '" aria-label="' + esc(lockerName(l)) + ', a ' + km(l.km) + '">' + '<svg viewBox="0 0 40 50" width="38" height="48"><path d="M20 48C8 36 3 28 3 19a17 17 0 0134 0c0 9-5 17-17 29z"/></svg><span>' + ic(l.type === 'super' ? 'cart' : 'cap', 16) + '</span></button>').join('');
    const sel = list.find(l => l.id === L.ls.sel);
    return '<div class="map"><svg class="map-bg" viewBox="0 0 360 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="340" fill="#EDEFF2"/><path d="M0 250 L120 210 L200 262 L360 190 V340 H0Z" fill="#E4E8EE"/><rect x="236" y="38" width="86" height="64" rx="14" fill="#D5EBD2"/><rect x="26" y="226" width="64" height="54" rx="12" fill="#D5EBD2"/><g stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"><path d="M-10 78H380M-10 168H380M-10 262H380M70 -10V350M170 -10V350M262 -10V350"/></g><g stroke="#fff" stroke-width="4" fill="none"><path d="M-10 124H380M-10 214H380M120 -10V350M216 -10V350M310 -10V350"/></g><path d="M-10 300 Q120 270 200 292 T380 270" stroke="#fff" stroke-width="12" fill="none"/></svg>' +
      '<span class="me" style="left:46%;top:52%"><i></i></span>' + pins +
      '<div class="map-legend">Estás cerca de Av. Principal 123</div>' +
      (sel ? '<div class="map-sheet">' + UI.lockerRow(sel) + '</div>' : '') + '</div>';
  }
  function lockerResults() {
    const f = L.ls, list = filterLockers();
    if (f.loading) return '<div class="pad-x">' + '<div class="skel-row"></div>'.repeat(4) + '</div>';
    if (!list.length) {
      return UI.emptyState({ icon: 'pin', title: 'No encontramos lockers por ahí.', body: 'Probá con otra dirección o código postal, o sacá algún filtro.', cta: UI.btn('Quitar filtros', 'clearLockerFilters', { kind: 'secondary', block: false }) });
    }
    if (f.view === 'map') return mapHtml(list);
    return '<div class="pad-x"><p class="muted rescount">' + list.length + (list.length === 1 ? ' locker' : ' lockers') + ' cerca de Av. Principal 123</p><div class="lstack">' + list.map(l => UI.lockerRow(l, { hours: false })).join('') + '</div></div>' +
      '<button type="button" class="maplink" data-act="setView" data-v="map">' + ic('map', 20) + 'Ver en el mapa</button>';
  }
  SC.lockerSearch = {
    render(p) {
      const f = L.ls;
      const extra = '<div class="lsearch"><label class="searchbar light">' + ic('search', 20) + '<input id="lq" type="search" placeholder="Buscar por dirección, lugar o código postal" value="' + esc(f.q) + '" autocomplete="off"><button type="button" class="x" data-act="clearLq" aria-label="Borrar búsqueda"' + (f.q ? '' : ' hidden') + '>' + ic('close', 18) + '</button></label></div>';
      const chips = '<div class="chips scroll" role="group" aria-label="Tipo de lugar">' + [['all', 'Todos'], ['facultades', 'Facultades'], ['supers', 'Supermercados']].map(c => UI.chip(c[1], 'lockerType', f.type === c[0], { v: c[0] })).join('') + '</div>' +
        '<div class="chips scroll sm" role="group" aria-label="Filtros rápidos">' + UI.chip('Cercanos', 'lockerQuick', f.quick === 'near', { v: 'near' }, 'pin') + UI.chip('Más disponibles', 'lockerQuick', f.quick === 'avail', { v: 'avail' }, 'clock') + UI.chip('Más filtros' + (extraFilters() ? ' (' + extraFilters() + ')' : ''), 'moreFilters', extraFilters() > 0, null, 'sliders') + '</div>' +
        '<div class="seg" role="tablist"><button type="button" role="tab" aria-selected="' + (f.view === 'list') + '" class="' + (f.view === 'list' ? 'on' : '') + '" data-act="setView" data-v="list">' + ic('list', 18) + 'Lista</button><button type="button" role="tab" aria-selected="' + (f.view === 'map') + '" class="' + (f.view === 'map' ? 'on' : '') + '" data-act="setView" data-v="map">' + ic('map', 18) + 'Mapa</button></div>';
      const title = p.mode === 'browse' ? 'Lockers cercanos' : 'Seleccionar locker';
      const body = '<div class="ls-top">' + chips + '</div><div id="lres">' + lockerResults() + '</div>';
      return UI.page({ header: UI.hdr({ title, extra }), body, cls: 'lsearch-screen' });
    },
    results: lockerResults, filterLockers
  };

  /* ============================================================
     DETALLE DEL LOCKER
     ============================================================ */
  SC.lockerDetail = {
    render(p) {
      const l = locker(p.id), fav = S().favorites.indexOf(l.id) >= 0, open = !!L.open.moreInfo;
      const full = l.status === 'full';
      const right = ['<button type="button" class="hbtn" data-act="toggleFav" data-id="' + l.id + '" aria-label="' + (fav ? 'Quitar de favoritos' : 'Guardar en favoritos') + '" aria-pressed="' + fav + '">' + ic('heart', 24, fav ? 'filled' : '') + '</button>', '<button type="button" class="hbtn" data-act="shareLocker" data-id="' + l.id + '" aria-label="Compartir">' + ic('share', 24) + '</button>'];
      const body = '<div class="hero-img"><img src="assets/locker-detail.jpg" alt="Amazon Hub Locker de ' + esc(l.name) + '"></div><div class="pad-x"><h2 class="ld-t">' + esc(l.name) + '</h2><p class="muted">' + esc(l.address) + '</p>' +
        '<ul class="meta"><li>' + ic('user', 18) + 'A ' + km(l.km) + ' de tu ubicación</li><li>' + ic('clock', 18) + esc(l.hours) + '</li></ul>' +
        (full ? UI.callout('err', 'info', 'No disponible', 'Por ahora no tiene espacios libres. Elegí otro locker cercano.') : UI.callout('ok', 'check', 'Disponible', 'Hay compartimentos disponibles. ' + l.sizes + '.')) +
        '<button type="button" class="lrow bordered" data-act="lockerWhere" data-id="' + l.id + '"><span class="lr-ic">' + ic('pin', 22) + '</span><span class="lr-b"><strong>Ubicación</strong><span>' + esc(l.where) + '</span></span>' + ic('chevR', 20, 'lchev') + '</button>' +
        '<button type="button" class="link more" data-act="toggleMore" aria-expanded="' + open + '">Ver más información ' + ic(open ? 'chevU' : 'chevD', 14) + '</button>' +
        (open ? '<div class="moreinfo"><p><strong>Tiempo para retirar.</strong> Tenés 3 días desde que tu pedido está listo.</p><p><strong>Cómo se abre.</strong> Escaneás el QR o ingresás tu código de 6 dígitos en la pantalla del locker.</p><p><strong>Tamaños.</strong> ' + esc(l.sizes) + '.</p><p><strong>Accesibilidad.</strong> Pantalla a 1,20 m de altura y compartimentos a nivel del piso.</p></div>' : '') + '</div><div class="sp-lg"></div>';
      let footer;
      if (p.mode === 'browse') footer = UI.btn('Cómo llegar', 'lockerWhere', { data: { id: l.id }, icon: 'nav' });
      else footer = UI.btn('Seleccionar este locker', 'selectLocker', { data: { id: l.id }, disabled: full, arrow: !full });
      return UI.page({ header: UI.hdr({ title: 'Detalle del locker', right }), body, footer });
    }
  };

  /* ============================================================
     CONFIRMAR ENTREGA (locker elegido)
     ============================================================ */
  SC.lockerConfirm = {
    render() {
      const l = locker(S().checkout.lockerId);
      const body = '<div class="pad-x center"><img class="box-img" src="assets/box.jpg" alt=""><h2 class="h2 soft">Tu pedido se entregará en</h2>' +
        '<div class="lcard flat">' + UI.lockerThumb(l) + '<span class="lbody"><strong>Amazon Hub Locker<br>' + esc(l.name) + '</strong><span class="lsub">' + esc(l.address) + '</span><span class="lsub">A ' + km(l.km) + '</span></span></div>' +
        '<button type="button" class="link" data-act="changeLocker">Cambiar locker</button>' +
        UI.callout('info', 'clock', 'Te avisamos cuando esté listo.', 'Vas a recibir una notificación en cuanto puedas retirar tu pedido.') + '</div>';
      return UI.page({ header: UI.hdr({ title: 'Confirmar entrega' }), body, footer: UI.btn('Confirmar entrega', 'confirmLocker', { arrow: true }) });
    }
  };

  /* ============================================================
     REVISAR PEDIDO
     ============================================================ */
  SC.review = {
    render() {
      const c = S().checkout, card = D.cards.find(x => x.id === c.card);
      if (!S().cart.length) return SC.cart.render();
      const l = c.delivery === 'locker' && c.lockerId ? locker(c.lockerId) : null;
      const items = S().cart.map(i => { const p = product(i.pid); return '<div class="rv-item">' + UI.art(p, 64) + '<div><strong>' + esc(p.short) + '</strong><span class="muted">Cantidad: ' + i.qty + '</span><span class="price">' + money(p.price * i.qty) + '</span></div></div>'; }).join('');
      const ship = l ? '<div class="rv-ship">' + UI.lockerThumb(l) + '<div><strong>Amazon Hub Locker ' + esc(l.name) + '</strong><span class="muted">' + esc(l.address) + '</span></div></div>' : '<div class="rv-ship"><span class="lthumb icon">' + ic('house', 26) + '</span><div><strong>A domicilio</strong><span class="muted">' + esc(c.address) + '</span></div></div>';
      const body = '<div class="pad-x"><h1 class="h1">Revisar pedido</h1>' + items +
        '<div class="rv-h"><h3>Envío a</h3><button type="button" class="link" data-act="toDelivery">' + (l ? 'Cambiar locker' : 'Cambiar') + '</button></div>' + ship +
        '<div class="rv-h"><h3>Pago</h3><button type="button" class="link" data-act="choosePayment">Cambiar</button></div><p class="rv-pay">' + ic('card', 20) + '•••• ' + card.last4 + ' (' + card.brand + ')</p>' +
        (l ? UI.callout('info', 'clock', 'Tenés 3 días para retirarlo.', 'Los días empiezan a contar cuando tu pedido esté listo en el locker.') : '') +
        '<div class="sum"><span>Total</span><strong>' + money(cartTotal()) + '</strong></div></div>';
      return UI.page({ header: UI.hdr({}), body, footer: UI.btn('Realizar compra', 'placeOrder', { id: 'btn-place' }) });
    }
  };

  /* ============================================================
     COMPRA CONFIRMADA
     ============================================================ */
  SC.purchaseDone = {
    render(p) {
      const o = S().orders.find(x => x.id === p.id), l = o.lockerId ? locker(o.lockerId) : null;
      const body = '<div class="pad-x center done"><div class="check-big"><span>' + ic('check', 44) + '</span></div><h1 class="h1c">¡Compra confirmada!</h1>' +
        (l ? '<p class="lead">Tu pedido será entregado en el Amazon Hub Locker de ' + esc(l.name) + '.</p><div class="lcard flat">' + UI.lockerThumb(l) + '<span class="lbody"><strong>' + esc(l.name) + '</strong><span class="lsub">' + esc(l.address) + '</span></span></div>' + UI.callout('info', 'bell', 'Te avisamos cuando esté disponible.', 'Después, tenés 3 días para retirarlo.') :
          '<p class="lead">Te enviamos tu pedido a ' + esc(o.address) + '. Te avisamos cuando salga.</p>') +
        '<p class="muted">Pedido Nº ' + esc(o.id) + '</p></div>';
      const header = '<header class="hdr"><div class="hdr-row"><span class="hbtn ghost"></span><span class="hlogo">' + C.LOGO + '</span><div class="hright"><button type="button" class="hbtn" data-act="tab" data-to="home" aria-label="Cerrar">' + ic('close', 24) + '</button></div></div></header>';
      return UI.page({ header, body, footer: UI.btn('Ver mis pedidos', 'tab', { data: { to: 'orders' } }) + UI.btn('Seguir comprando', 'tab', { kind: 'secondary', data: { to: 'home' } }) });
    }
  };

  /* ============================================================
     MIS PEDIDOS
     ============================================================ */
  const cancellable = o => !o.cancelled && (o.status === 'confirmed' || o.status === 'preparing');
  function orderStatusPill(o) {
    if (o.cancelled) return '<span class="pill err">Cancelado</span>';
    const t = { confirmed: ['ok', 'Confirmado'], preparing: ['info', 'En preparación'], transit: ['info', 'En tránsito'], atLocker: ['warn', 'En el locker'], ready: ['warn', 'Listo para retirar'], pickedUp: ['ok', 'Retirado'], delivered: ['ok', 'Entregado'] }[o.status];
    return '<span class="pill ' + t[0] + '">' + t[1] + '</span>';
  }
  function orderCard(o) {
    const l = o.lockerId ? locker(o.lockerId) : null;
    const sub = o.cancelled ? 'Cancelaste este pedido' : o.status === 'pickedUp' ? 'Retirado el ' + C.dayLabel(o.times.pickedUp) : o.status === 'delivered' ? 'Entregado el ' + C.dayLabel(o.times.delivered) : o.status === 'ready' ? 'Retiralo antes del ' + C.shortDate(C.deadline(o)) : o.status === 'transit' ? 'Entrega estimada: ' + C.dayLabel(C.etaTransit(o)) : 'Pedido del ' + C.dayLabel(o.createdAt);
    const rows = [];
    if (!o.cancelled) rows.push(['Ver seguimiento', 'openOrder', 'locker']);
    rows.push(['Detalles del pedido', 'orderDetails', 'info']);
    if (!o.cancelled && !C.isDone(o)) rows.push(['Cancelar pedido', 'cancelOrder', 'close']);
    if (C.isDone(o)) rows.push(['Volver a comprar', 'openProduct', 'cart']);
    return '<div class="ocard2"><button type="button" class="oc-top" data-act="openOrder" data-id="' + o.id + '"' + (o.cancelled ? ' data-details="1"' : '') + '>' + UI.art(product(o.items[0].pid), 64) + '<span class="ob"><strong>' + esc(itemsTitle(o)) + '</strong><span class="price">' + money(o.total) + '</span><span>' + esc(sub) + '</span>' + orderStatusPill(o) + '</span>' + ic('chevR', 20, 'lchev') + '</button>' +
      '<div class="oc-rows">' + rows.map(r => '<button type="button" class="oc-row" data-act="' + r[1] + '" data-id="' + o.id + '"' + (r[1] === 'openProduct' ? ' data-pid="' + o.items[0].pid + '"' : '') + '>' + ic(r[2], 18) + r[0] + ic('chevR', 16, 'lchev') + '</button>').join('') + '</div></div>';
  }
  SC.orders = {
    render() {
      const all = S().orders.slice().sort((a, b) => b.createdAt - a.createdAt);
      const tabs = { transit: all.filter(o => !o.cancelled && !C.isDone(o)), done: all.filter(o => !o.cancelled && C.isDone(o)), cancelled: all.filter(o => o.cancelled) };
      const names = { transit: 'En tránsito', done: 'Entregados', cancelled: 'Cancelados' };
      const list = tabs[L.tab];
      const empty = {
        transit: ['No tenés pedidos en camino.', 'Cuando compres algo, lo seguís desde acá.', UI.btn('Explorar productos', 'tab', { data: { to: 'home' }, block: false })],
        done: ['Todavía no retiraste pedidos.', 'Los pedidos que recibas aparecen en esta lista.', ''],
        cancelled: ['No tenés pedidos cancelados.', 'Si cancelás alguno, lo ves acá.', '']
      }[L.tab];
      const body = '<div class="pad-x"><h1 class="h1">Mis pedidos</h1></div><div class="tabs" role="tablist">' + Object.keys(names).map(k => '<button type="button" role="tab" aria-selected="' + (L.tab === k) + '" class="' + (L.tab === k ? 'on' : '') + '" data-act="ordersTab" data-v="' + k + '">' + names[k] + (tabs[k].length ? ' <em>' + tabs[k].length + '</em>' : '') + '</button>').join('') + '</div>' +
        '<div class="pad-x">' + (list.length ? list.map(orderCard).join('') : UI.emptyState({ icon: 'box', title: empty[0], body: empty[1], cta: empty[2] })) + '</div>';
      return UI.page({ header: UI.hdr({ back: false, right: [UI.bellBtn(), UI.cartBtn()] }), body, tab: 'orders' });
    }
  };

  /* ============================================================
     SEGUIMIENTO DEL PEDIDO
     ============================================================ */
  function timeline(o) {
    const seq = C.seqFor(o), cur = C.statusIdx(o);
    const label = s => ({ confirmed: 'Pedido confirmado', preparing: 'En preparación', transit: 'En tránsito', atLocker: 'Llegó al locker', ready: 'Listo para retirar', pickedUp: 'Retirado', delivered: 'Entregado' }[s]);
    return '<ol class="tl">' + seq.map((s, i) => {
      const reached = i <= cur, now = i === cur;
      let sub = '';
      if (reached) sub = C.dayLabel(o.times[s]) + ', ' + C.hhmm(o.times[s]);
      else if (s === 'transit' || s === 'delivered') sub = 'Estimado: ' + C.dayLabel(C.etaTransit(o));
      return '<li class="' + (reached ? 'done' : '') + (now ? ' now' : '') + '"><span class="tl-dot">' + (reached && !now ? ic('check', 14) : '') + '</span><div><strong>' + label(s) + '</strong>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</div></li>';
    }).join('') + '</ol>';
  }
  function trackHero(o) {
    const l = o.lockerId ? locker(o.lockerId) : null;
    const dl = C.shortDate(C.deadline(o));
    if (o.cancelled) return '<div class="hero-card err">' + '<div class="hc-ic">' + ic('close', 34) + '</div><h2>Pedido cancelado</h2><p>No te cobramos nada por este pedido.</p></div>';
    switch (o.status) {
      case 'confirmed': return '<div class="hero-card ok"><div class="hc-ic">' + ic('check', 34) + '</div><h2>Pedido confirmado</h2><p>Estamos por empezar a prepararlo. Te mantenemos al tanto.</p></div>';
      case 'preparing': return '<div class="hero-card info"><div class="hc-ic">' + ic('box', 34) + '</div><h2>Estamos preparando tu pedido</h2><p>En breve sale hacia ' + (l ? 'el locker de ' + esc(l.name) : 'tu domicilio') + '.</p></div>';
      case 'transit': return '<div class="hero-card info"><div class="hc-ic big">' + ic('truck', 54) + '</div><div class="prog"><i class="on"></i><b class="on"></b><i class="on"></i><b></b><i></i></div><h2>Tu pedido está en camino</h2><p>' + (l ? 'Llega al locker el ' + C.dayLabel(C.etaTransit(o)) + ', 14:00 – 16:00' : 'Llega el ' + C.dayLabel(C.etaTransit(o)) + ', 12:00 – 18:00') + '</p>' + UI.btn('Ver más detalles', 'orderDetails', { kind: 'secondary', data: { id: o.id } }) + '</div>';
      case 'atLocker': return '<div class="hero-card info"><img class="hc-img" src="assets/locker-detail.jpg" alt=""><h2>Tu pedido llegó a Amazon Hub Locker</h2><p>' + esc(l.name) + ' · ' + esc(l.address) + '. Lo estamos dejando listo para que lo retires.</p>' + UI.btn('Ver detalles', 'lockerFromOrder', { kind: 'secondary', data: { id: o.id } }) + '</div>';
      case 'ready': return '<div class="hero-card ok"><img class="hc-box" src="assets/box.jpg" alt=""><h2>Tu pedido está listo.</h2><p>Podés retirarlo en el Amazon Hub Locker de ' + esc(l.name) + '.</p>' + UI.btn('Ver código de retiro', 'showCode', { data: { id: o.id } }) + '<p class="hc-note">' + ic('clock', 16) + 'Retiralo antes del ' + dl + '</p></div>';
      case 'pickedUp': return '<div class="hero-card ok"><div class="hc-ic">' + ic('check', 34) + '</div><h2>Retiraste tu pedido</h2><p>' + (o.surveyDone ? 'Gracias por usar Amazon Hub Locker.' : 'Contanos cómo fue tu experiencia en 10 segundos.') + '</p>' + (o.surveyDone ? '' : UI.btn('Contanos cómo fue', 'openSurvey', { kind: 'secondary', data: { id: o.id } })) + '</div>';
      case 'delivered': return '<div class="hero-card ok"><div class="hc-ic">' + ic('check', 34) + '</div><h2>Entregamos tu pedido</h2><p>Llegó a ' + esc(o.address) + '.</p></div>';
    }
    return '';
  }
  SC.tracking = {
    render(p) {
      const o = S().orders.find(x => x.id === p.id);
      if (o.status === 'ready' && !o._seen) { o._seen = true; }
      const l = o.lockerId ? locker(o.lockerId) : null;
      const body = '<div class="pad-x"><div class="track-prod">' + UI.art(product(o.items[0].pid), 56) + '<div><strong>' + esc(itemsTitle(o)) + '</strong><span class="price">' + money(o.total) + '</span></div></div>' +
        trackHero(o) + '<h3 class="sub-h">Estado del pedido</h3>' + timeline(o) +
        (l ? '<h3 class="sub-h">Retiro</h3><button type="button" class="lcard flat" data-act="lockerFromOrder" data-id="' + o.id + '">' + UI.lockerThumb(l) + '<span class="lbody"><strong>' + esc(lockerName(l)) + '</strong><span class="lsub">' + esc(l.address) + '</span><span class="lsub">' + esc(l.hours) + '</span></span>' + ic('chevR', 22, 'lchev') + '</button>' : '') +
        '<button type="button" class="link spaced" data-act="orderDetails" data-id="' + o.id + '">Detalles del pedido</button><button type="button" class="link spaced" data-act="support">¿Necesitás ayuda con este pedido?</button></div><div class="sp-lg"></div>';
      return UI.page({ header: UI.hdr({ title: 'Seguimiento del pedido', right: [UI.bellBtn()] }), body });
    }
  };

  /* ============================================================
     NOTIFICACIONES
     ============================================================ */
  const NIC = { confirmed: 'check', transit: 'truck', ready: 'box', error: 'info', info: 'info' };
  SC.notifications = {
    render() {
      const ns = S().notifications;
      const body = ns.length ? '<div class="pad-x"><div class="sec-h"><h2>Notificaciones</h2><button type="button" class="link" data-act="readAll">Marcar todo como leído</button></div><div class="nlist">' + ns.map(n =>
        '<button type="button" class="nitem ' + n.type + (n.read ? '' : ' unread') + '" data-act="openNotification" data-id="' + n.id + '"><span class="ni-ic">' + ic(NIC[n.type] || 'bell', 22) + '</span><span class="ni-b"><strong>' + esc(n.title) + '</strong><span>' + esc(n.body) + '</span></span><em>' + C.ago(n.ts) + '</em></button>').join('') + '</div></div>' :
        UI.emptyState({ icon: 'bell', title: 'Estás al día.', body: 'Cuando haya novedades de tus pedidos, te avisamos acá.' });
      return UI.page({ header: UI.hdr({ title: 'Notificaciones' }), body });
    }
  };
  SC.notice = {
    render(p) {
      const n = S().notifications.find(x => x.id === p.id) || { title: 'Notificación', body: '', type: 'info' };
      const cta = n.type === 'ready' ? UI.btn('Ver código de retiro', 'showCode', { data: { id: n.orderId } }) : UI.btn('Ver mi pedido', 'openOrder', { data: { id: n.orderId } });
      const body = '<div class="pad-x center notice"><div class="bell-big">' + ic('bell', 56) + '</div><h2 class="h2 soft">Notificación</h2><h1 class="h1c">' + (n.type === 'ready' ? '¡Tu pedido está disponible en el locker!' : esc(n.title)) + '</h1><p class="lead">' + (n.type === 'ready' ? 'Ya podés retirarlo con el código o QR desde la app. ' + esc(n.body.replace(/^.*?\. /, '')) : esc(n.body)) + '</p></div>';
      return UI.page({ header: UI.hdr({ title: 'Notificación' }), body, footer: n.orderId ? cta : '' });
    }
  };

  /* ============================================================
     CÓDIGO DE RETIRO
     ============================================================ */
  SC.pickupCode = {
    render(p) {
      const o = S().orders.find(x => x.id === p.id), l = locker(o.lockerId);
      if (o.status !== 'ready' && o.status !== 'pickedUp') {
        return UI.page({ header: UI.hdr({ title: 'Código de retiro' }), body: UI.emptyState({ icon: 'lock', title: 'Tu código todavía no está disponible.', body: 'Te avisamos con una notificación apenas puedas retirar tu pedido.', cta: UI.btn('Ver seguimiento', 'openOrder', { data: { id: o.id }, block: false, kind: 'secondary' }) }) });
      }
      const body = '<div class="pad-x center"><div class="qr-card">' + C.qr(o.code + o.id, 190) + '<div class="qr-code"><span>Código numérico</span><strong>' + o.code.slice(0, 3) + ' ' + o.code.slice(3) + '</strong></div><button type="button" class="link" data-act="copyCode" data-code="' + o.code + '">' + ic('copy', 16) + 'Copiar código</button></div>' +
        '<p class="lead">Escaneá el código en el locker o ingresá el número en la pantalla.</p>' +
        UI.callout('warn', 'clock', 'Retiralo antes del ' + C.shortDate(C.deadline(o)), l.name + ' · ' + l.hours) + '</div>';
      const footer = UI.btn('Ver instrucciones', 'instructions', { data: { id: o.id } }) + UI.btn('Ya estoy en el locker', 'toScan', { kind: 'secondary', data: { id: o.id } });
      return UI.page({ header: UI.hdr({ title: 'Código de retiro' }), body, footer });
    }
  };
  SC.lockerLocation = {
    render(p) {
      const l = locker(p.id);
      const body = '<div class="pad-x"><div class="lcard flat">' + UI.lockerThumb(l) + '<span class="lbody"><strong>Amazon Hub Locker<br>' + esc(l.name) + '</strong><span class="lsub">' + esc(l.address) + '</span><span class="lsub">A ' + km(l.km) + ' · ' + esc(l.where) + '</span></span></div>' +
        UI.btn('Cómo llegar', 'directions', { kind: 'dark', data: { id: l.id }, icon: 'nav' }) + '</div>' +
        '<div class="map static"><svg class="map-bg" viewBox="0 0 360 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="340" fill="#EDEFF2"/><rect x="236" y="38" width="86" height="64" rx="14" fill="#D5EBD2"/><g stroke="#fff" stroke-width="9" fill="none"><path d="M-10 78H380M-10 168H380M-10 262H380M70 -10V350M170 -10V350M262 -10V350"/></g><path d="M166 180 L166 78 L262 78" stroke="#3B82F6" stroke-width="5" stroke-dasharray="2 9" stroke-linecap="round" fill="none"/></svg><span class="me" style="left:46%;top:52%"><i></i></span><span class="pin on" style="left:73%;top:23%"><svg viewBox="0 0 40 50" width="44" height="54"><path d="M20 48C8 36 3 28 3 19a17 17 0 0134 0c0 9-5 17-17 29z"/></svg><span>' + ic('locker', 18) + '</span></span></div>';
      return UI.page({ header: UI.hdr({ title: 'Ubicación del locker' }), body, footer: (p.orderId && S().orders.find(x => x.id === p.orderId).status === 'ready') ? UI.btn('Ya estoy en el locker', 'toScan', { data: { id: p.orderId } }) : '', cls: 'loc' });
    }
  };

  /* ============================================================
     ESCANEAR / INGRESAR CÓDIGO / VALIDAR
     ============================================================ */
  SC.scan = {
    render(p) {
      const body = '<div class="pad-x center"><button type="button" class="viewfinder" data-act="doScan" data-id="' + p.id + '" aria-label="Escanear código QR del locker"><span class="vf-cam"><span class="vf-screen"><b>Hola, recogé aquí tu pedido</b>' + C.qr('locker-screen', 64) + '</span></span><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><u class="line"></u></button>' +
        '<p class="lead">Acercá el código QR a la pantalla del locker.</p><button type="button" class="link" data-act="toManual" data-id="' + p.id + '">o ingresá el código numérico</button><p class="proto-hint">Tocá el visor para simular el escaneo</p></div>';
      return UI.page({ header: UI.hdr({ title: 'Escanear código' }), body, footer: UI.btn('Ingresar código', 'toManual', { kind: 'dark', data: { id: p.id } }), cls: 'scan' });
    }
  };
  SC.manualCode = {
    render(p) {
      const v = L.code;
      const boxes = [0, 1, 2, 3, 4, 5].map(i => '<span class="cbox' + (i === v.length ? ' cur' : '') + (v[i] ? ' fill' : '') + (L.codeErr ? ' bad' : '') + '">' + (v[i] || '') + '</span>').join('');
      const body = '<div class="pad-x center"><p class="lead left">Ingresá el código de 6 dígitos que ves en tu app.</p><label class="codewrap" for="codein"><span class="sr">Código de retiro</span><input id="codein" class="codein" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="one-time-code" value="' + esc(v) + '"><span class="cboxes" aria-hidden="true">' + boxes + '</span></label>' +
        '<p class="field-err" id="code-err"' + (L.codeErr ? '' : ' hidden') + '>' + esc(L.codeErr) + '</p><button type="button" class="link" data-act="showMyCode" data-id="' + p.id + '">¿Dónde veo mi código?</button></div>';
      return UI.page({ header: UI.hdr({ title: 'Ingresar código' }), body, footer: UI.btn('Validar código', 'validateCode', { data: { id: p.id }, id: 'btn-validate', disabled: v.length < 6 }), cls: 'manual' });
    }
  };
  SC.validate = {
    render(p) {
      const ok = p.phase === 'ok';
      const body = '<div class="pad-x center vcenter">' + (ok ? '<div class="check-big pop"><span>' + ic('check', 44) + '</span></div><h1 class="h1c">Código aceptado</h1><p class="lead">El compartimento se está abriendo…</p>' : '<div class="spinner" role="status" aria-label="Validando"></div><h1 class="h1c">Validando tu código…</h1><p class="lead">Son solo unos segundos.</p>') + '</div>';
      return UI.page({ header: UI.hdr({ title: ok ? 'Código válido' : 'Validando', back: false }), body });
    }
  };
  SC.codeError = {
    render(p) {
      const body = '<div class="pad-x center vcenter"><div class="err-big"><span>!</span></div><h1 class="h1c">No pudimos validar el código.</h1><p class="lead">Revisá que tenga <strong>6 dígitos</strong> e intentá nuevamente. Si el problema continúa, contactá a soporte.</p></div>';
      return UI.page({ header: UI.hdr({ title: 'Código no válido' }), body, footer: UI.btn('Intentar de nuevo', 'retryCode', { data: { id: p.id } }) + UI.btn('Contactar soporte', 'support', { kind: 'secondary' }) });
    }
  };
  SC.open = {
    render(p) {
      const o = S().orders.find(x => x.id === p.id);
      const body = '<div class="pad-x center"><div class="locker-open"><div class="lo-door"></div><div class="lo-in"><img src="assets/box.jpg" alt=""></div><span class="lo-tag">' + esc(o.compartment) + '</span></div><h1 class="h1c">Retirá tu paquete</h1><p class="lead">El compartimento <strong>' + esc(o.compartment) + '</strong> se abrió. Retirá tu paquete y cerrá la puerta.</p></div>';
      return UI.page({ header: UI.hdr({ title: 'Retirá tu paquete', back: false }), body, footer: UI.btn('Ya retiré mi paquete', 'pickedUp', { data: { id: o.id } }) + UI.btn('No se abrió el compartimento', 'openFail', { kind: 'secondary', data: { id: o.id } }) });
    }
  };
  SC.openError = {
    render(p) {
      const body = '<div class="pad-x center vcenter"><div class="err-big"><span>!</span></div><h1 class="h1c">No pudimos abrir el locker.</h1><p class="lead">Revisá el <strong>código</strong> e intentá nuevamente. Si el problema continúa, contactá a soporte.</p></div>';
      return UI.page({ header: UI.hdr({ title: 'No se abrió' , back: false }), body, footer: UI.btn('Intentar de nuevo', 'retryOpen', { data: { id: p.id } }) + UI.btn('Contactar soporte', 'support', { kind: 'secondary' }) });
    }
  };
  SC.retrieved = {
    render(p) {
      const body = '<div class="pad-x center vcenter"><img class="box-img lg" src="assets/box.jpg" alt=""><h1 class="h1c">¡Listo!</h1><p class="lead">Ya retiraste tu paquete del Amazon Hub Locker.</p></div>';
      return UI.page({ header: UI.hdr({ title: 'Paquete retirado', back: false }), body, footer: UI.btn('Continuar', 'toCompleted', { data: { id: p.id } }) + UI.btn('Volver al inicio', 'tab', { kind: 'tertiary', data: { to: 'home' } }) });
    }
  };
  SC.completed = {
    render(p) {
      const o = S().orders.find(x => x.id === p.id);
      const body = '<div class="pad-x center vcenter"><div class="check-big dark"><span>' + ic('check', 44) + '</span></div><h1 class="h1c">Retiro completado</h1><p class="lead">Gracias por utilizar Amazon Hub Locker.</p>' +
        (o.surveyDone ? '' : '<button type="button" class="survey-card" data-act="openSurvey" data-id="' + o.id + '"><span>' + ic('star', 22) + '</span><span><strong>¿Cómo fue tu experiencia?</strong><em>Contanos en 10 segundos</em></span>' + ic('chevR', 20) + '</button>') + '</div>';
      return UI.page({ header: UI.hdr({ title: 'Retiro completado', back: false }), body, footer: UI.btn('Ver mis pedidos', 'tab', { data: { to: 'orders' } }) });
    }
  };
  const FACES = [['😞', 'Muy mal'], ['🙁', 'Mal'], ['🙂', 'Bien'], ['😄', 'Muy bien']];
  SC.survey = {
    render(p) {
      const sv = L.survey;
      if (p.thanks) return UI.page({ header: UI.hdr({ title: 'Encuesta', back: false }), body: '<div class="pad-x center vcenter"><div class="check-big"><span>' + ic('check', 44) + '</span></div><h1 class="h1c">¡Gracias por contarnos!</h1><p class="lead">Tu opinión nos ayuda a mejorar cada retiro.</p></div>', footer: UI.btn('Ver mis pedidos', 'tab', { data: { to: 'orders' } }) });
      const body = '<div class="pad-x center"><h1 class="h1c left">¿Cómo fue tu experiencia?</h1><p class="lead left">Te dejamos una breve encuesta para que nos digas cómo fue tu experiencia.</p><div class="faces" role="radiogroup" aria-label="Calificación">' +
        FACES.map((f, i) => '<button type="button" role="radio" aria-checked="' + (sv.score === i) + '" class="face' + (sv.score === i ? ' on' : '') + '" data-act="pickFace" data-i="' + i + '"><span>' + f[0] + '</span><em>' + f[1] + '</em></button>').join('') + '</div>' +
        (sv.score !== null ? '<label class="field left"><span>' + (sv.score <= 1 ? '¿Qué podríamos mejorar?' : '¿Algo más que quieras contarnos? (opcional)') + '</span><textarea id="svtext" rows="3" maxlength="200" placeholder="Escribí acá">' + esc(sv.text) + '</textarea></label>' : '') + '</div>';
      return UI.page({ header: UI.hdr({ title: 'Encuesta' }), body, footer: UI.btn('Enviar', 'sendSurvey', { data: { id: p.id }, disabled: sv.score === null, id: 'btn-send' }) + UI.btn('Ahora no', 'tab', { kind: 'tertiary', data: { to: 'orders' } }) });
    }
  };

  /* ============================================================
     TAB LOCKER
     ============================================================ */
  SC.lockerTab = {
    render() {
      const near = D.lockers.filter(l => l.status !== 'full').slice(0, 3);
      const ready = S().orders.find(o => !o.cancelled && o.status === 'ready');
      const favs = S().favorites.map(locker);
      const steps = [['cart', 'Comprá en Amazon'], ['locker', 'Elegí tu locker'], ['qr', 'Retirá cuando quieras'], ['box', 'Disfrutá tu pedido']];
      const ben = [['clock', 'Más libertad', 'Retirá tus pedidos cuando te quede cómodo.'], ['pin', 'Cerca tuyo', 'Lockers en facultades y supermercados.'], ['shield', 'Seguro y confiable', 'Tu pedido siempre protegido.'], ['bolt', 'Rápido y simple', 'Pocos pasos, de la compra al retiro.']];
      const body = '<div class="hub-hero"><img src="assets/locker-cover.jpg" alt=""><div class="hh-tx"><span>Amazon Hub Locker</span><h1>Tus pedidos,<br>en tus tiempos.</h1></div></div><div class="pad-x">' +
        (ready ? '<button type="button" class="hub-banner ready" data-act="showCode" data-id="' + ready.id + '"><span class="hb-ic">' + ic('qr', 28) + '</span><span class="hb-tx"><strong>Tu pedido te espera</strong><span>Tocá para ver tu código de retiro</span></span>' + ic('chevR', 22) + '</button>' : '') +
        '<div class="sec-h"><h2>Cómo funciona</h2></div><ol class="steps">' + steps.map((s, i) => '<li><span class="st-n">' + (i + 1) + '</span>' + ic(s[0], 22) + s[1] + '</li>').join('') + '</ol>' +
        '<div class="sec-h"><h2>Lockers cercanos</h2><button type="button" class="link" data-act="browseLockers">Ver lista ' + ic('chevR', 14) + '</button></div><div class="lstack">' + near.map(l => UI.lockerRow(l)).join('') + '</div>' +
        (favs.length ? '<div class="sec-h"><h2>Tus favoritos</h2></div><div class="lstack">' + favs.map(l => UI.lockerRow(l)).join('') + '</div>' : '') +
        '<div class="sec-h"><h2>Por qué elegirlo</h2></div><div class="bens">' + ben.map(b => '<div class="ben"><span>' + ic(b[0], 22) + '</span><strong>' + b[1] + '</strong><em>' + b[2] + '</em></div>').join('') + '</div></div><div class="sp-lg"></div>';
      return UI.page({ header: UI.hdr({ back: false, right: [UI.bellBtn(), UI.cartBtn()] }), body, tab: 'lockerTab' });
    }
  };

  /* ============================================================
     PERFIL / AYUDA
     ============================================================ */
  SC.profile = {
    render() {
      const pr = S().prefs, favs = S().favorites.length;
      const body = '<div class="pad-x"><div class="who"><span class="avatar">' + D.user.initial + '<i></i></span><div><h1>Hola, ' + D.user.name + '</h1><span class="muted">' + esc(D.user.email) + '</span></div></div>' +
        '<div class="list-card">' + row('orders', 'Mis pedidos', 'Seguí tus compras', 'tab', { to: 'orders' }) + row('heart', 'Lockers favoritos', favs ? favs + (favs === 1 ? ' guardado' : ' guardados') : 'Todavía no guardaste ninguno', 'showFavs') + row('pin', 'Direcciones', S().checkout.address, 'chooseAddress') + row('card', 'Métodos de pago', 'Visa •••• 1234', 'choosePayment') + '</div>' +
        '<div class="sec-h"><h2>Avisos</h2></div><div class="list-card pad">' + UI.sw('push', pr.push, 'Notificaciones en la app', 'Estado del pedido y código de retiro') + UI.sw('email', pr.email, 'Avisos por email', 'Resumen de tus compras') + '</div>' +
        '<div class="list-card spaced">' + row('help', 'Ayuda', 'Preguntas frecuentes y soporte', 'goHelp') + row('out', 'Cerrar sesión', 'Salir de tu cuenta', 'logout') + '</div></div><div class="sp-lg"></div>';
      return UI.page({ header: UI.hdr({ back: false, right: [UI.bellBtn(), UI.cartBtn()] }), body, tab: 'profile' });
    }
  };
  const FAQ = [
    ['¿Cuánto tiempo tengo para retirar mi pedido?', 'Tenés 3 días desde que te avisamos que está listo. Te recordamos antes de que se termine el plazo.'],
    ['¿Qué hago si el locker no abre?', 'Revisá que el código tenga 6 dígitos e intentá de nuevo. Si sigue sin abrir, tocá “Contactar soporte” desde la pantalla del locker y te ayudamos al instante.'],
    ['¿Puedo cambiar el locker después de comprar?', 'Sí, mientras el pedido no haya salido del depósito. Escribinos desde “Mis pedidos”.'],
    ['¿Tiene costo usar Amazon Hub Locker?', 'No. Elegirlo como método de entrega no tiene costo adicional.'],
    ['¿Qué pasa si no retiro mi pedido a tiempo?', 'Lo devolvemos a Amazon y te reintegramos el dinero. Antes de eso, te avisamos.']
  ];
  SC.help = {
    render() {
      const body = '<div class="pad-x"><h1 class="h1">Ayuda</h1><div class="faq">' + FAQ.map((f, i) => '<div class="acc' + (L.open['f' + i] ? ' open' : '') + '"><button type="button" aria-expanded="' + !!L.open['f' + i] + '" data-act="toggleFaq" data-i="' + i + '"><span>' + f[0] + '</span>' + ic('chevD', 20) + '</button><div class="acc-b"><p>' + f[1] + '</p></div></div>').join('') + '</div>' + '<div class="sp"></div>' + UI.btn('Contactar soporte', 'support', { icon: 'support' }) + '</div>';
      return UI.page({ header: UI.hdr({ title: 'Ayuda' }), body });
    }
  };

  window.SCREENS = SC;
  window.SCH = { lockerName, itemsTitle, cartTotal, cancellable, filterLockers, extraFilters };
})();
