/* ============================================================
   PANTALLA DEL LOCKER (kiosco táctil de 17")
   Simula la pantalla que se usa al retirar un pedido y la
   sincroniza con la app: al abrirse el casillero y al cerrar
   la puerta el celular se actualiza solo.

   Reglas del sistema
   - Dos formas de abrir: escanear el QR de la app o ingresar los 6 dígitos.
   - 3 intentos fallidos → la pantalla se pausa 30 s.
   - Sin tocar nada 40 s → vuelve al inicio.
   - Solo abre pedidos "Listo para retirar", dentro de las 72 h y de ESTE locker.
   - El casillero se cierra al detectar la puerta cerrada → retiro completado.
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, UI = window.UI, D = window.DATA;
  const { $, $$, esc, ic } = C;
  const S = () => C.state;
  const MAX_FAILS = 3, LOCK_MS = 30000, IDLE_MS = 40000, CHECK_MS = 1200;
  const K = { st: 'home', code: '', fails: 0, lockUntil: 0, order: null, lockerId: 'ing', via: 'pin', timers: [], clock: null };

  const readyOrder = () => S().orders.filter(o => !o.cancelled && o.status === 'ready').sort((a, b) => b.createdAt - a.createdAt)[0];
  const lockerName = () => C.locker(K.lockerId).name;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); K.timers.push(t); return t; };
  const clearTimers = () => { K.timers.splice(0).forEach(clearTimeout); };

  /* ---------- Vistas ---------- */
  const err = (icon, tone, title, body, btns) => '<div class="k-body center"><div class="k-ic ' + tone + '">' + ic(icon, 54) + '</div><h2>' + title + '</h2><p class="k-lead">' + body + '</p><div class="k-btns">' + btns + '</div></div>';
  const kb = (act, label, kind) => '<button type="button" class="kbtn ' + (kind || 'pri') + '" data-k="' + act + '">' + label + '</button>';
  const boxes = () => '<div class="k-code" aria-label="Código ingresado">' + [0, 1, 2, 3, 4, 5].map(i => '<span class="' + (K.code[i] ? 'fill' : (i === K.code.length ? 'cur' : '')) + '">' + (K.code[i] || '') + '</span>').join('') + '</div>';
  const pad = () => '<div class="k-pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button type="button" data-k="num" data-n="' + n + '">' + n + '</button>').join('') +
    '<button type="button" class="sec" data-k="del" aria-label="Borrar">' + ic('back', 30) + '</button><button type="button" data-k="num" data-n="0">0</button><button type="button" class="ok" data-k="confirm"' + (K.code.length < 6 ? ' disabled' : '') + '>Confirmar</button></div>';
  const grid = n => '<div class="k-grid" aria-label="Casillero ' + n + ' resaltado">' + Array.from({ length: 20 }, (_, i) => '<span class="' + (i + 1 === n ? 'on' : '') + '">' + (i + 1) + '</span>').join('') + '</div>';

  const VIEWS = {
    home: () => '<div class="k-body center home"><img class="k-box" src="assets/box.jpg" alt=""><h1>Hola, recogé aquí<br>tu pedido</h1><p class="k-lead">Tus pedidos, en tus tiempos.</p>' + kb('start', 'Retirar mi pedido') + '<button type="button" class="klink" data-k="help">¿Necesitás ayuda?</button></div>',
    method: () => '<div class="k-body"><h2>¿Cómo querés abrir<br>tu casillero?</h2>' +
      '<button type="button" class="kopt" data-k="toQr"><span>' + ic('qr', 40) + '</span><div><strong>Escanear QR</strong><em>Acercá el QR de tu app al lector</em></div></button>' +
      '<button type="button" class="kopt" data-k="toPin"><span>' + ic('lock', 40) + '</span><div><strong>Ingresar código</strong><em>Escribí los 6 dígitos de tu app</em></div></button>' +
      '<p class="k-tip">' + ic('info', 20) + 'Tu código está en la app: Mis pedidos → Ver código de retiro.</p>' + kb('home', 'Volver', 'sec') + '</div>',
    qr: () => '<div class="k-body center"><h2>Acercá tu QR al lector</h2><p class="k-lead">Está debajo de esta pantalla, con la luz roja. Subí el brillo del celular.</p>' +
      '<div class="k-phone"><div>' + C.qr('kiosk-demo', 120) + '</div></div><div class="k-arrow">' + ic('chevD', 54) + '</div><p class="k-wait"><i></i>Esperando el código…</p>' +
      '<div class="k-btns row">' + kb('toPin', 'Ingresar código', 'sec') + kb('method', 'Volver', 'sec') + '</div></div>',
    pin: () => '<div class="k-body center"><h2>Ingresá tu código</h2><p class="k-lead">Son 6 números. Los ves en tu app.</p>' + boxes() + pad() + '<button type="button" class="klink" data-k="method">Volver</button></div>',
    checking: () => '<div class="k-body center"><div class="k-spin" role="status" aria-label="Verificando"></div><h2>Verificando tu código…</h2><p class="k-lead">Son solo unos segundos.</p></div>',
    open: () => { const o = K.order, n = parseInt(String(o.compartment).replace(/\D/g, ''), 10) || 14; return '<div class="k-body center"><div class="k-ok"><span>' + ic('check', 40) + '</span><div><strong>¡Código verificado!</strong><em>Se abrió tu casillero</em></div></div>' +
      '<div class="k-slot"><span>Tu casillero</span><b>N° ' + n + '</b></div>' + grid(n) + '<p class="k-lead">Retirá tu paquete y cerrá la puerta.</p><p class="k-wait"><i></i>Esperando que cierres la puerta…</p><button type="button" class="klink" data-k="stuck">¿No se abrió el casillero?</button></div>'; },
    thanks: () => '<div class="k-body center"><div class="k-ic ok">' + ic('check', 60) + '</div><h1>¡Gracias!</h1><p class="k-lead">Ya retiraste tu compra.<br>¡Que la disfrutes!</p><p class="k-tip center">' + ic('star', 20) + 'Contanos cómo fue desde tu app.</p><p class="k-small">Volvemos al inicio en unos segundos…</p></div>',
    bad: () => err('close', 'err', 'No pudimos validar<br>el código', 'Revisá que tenga <strong>6 dígitos</strong> e intentá nuevamente. <strong>Te quedan ' + (MAX_FAILS - K.fails) + (MAX_FAILS - K.fails === 1 ? ' intento' : ' intentos') + '.</strong>', kb('toPin', 'Intentar de nuevo') + kb('help', 'Pedir ayuda', 'sec')),
    locked: () => err('lock', 'warn', 'Pausamos la pantalla', 'Hubo 3 intentos seguidos. Podés volver a probar en <b id="klock">30</b> segundos. Si necesitás ayuda, contactá a soporte.', kb('help', 'Contactar soporte', 'sec')),
    used: () => err('info', 'info', 'Este pedido ya<br>fue retirado', 'Si no fuiste vos, contactá a soporte y lo revisamos enseguida.', kb('help', 'Contactar soporte') + kb('home', 'Volver al inicio', 'sec')),
    notready: () => err('clock', 'info', 'Tu pedido todavía<br>no está listo', 'Cuando llegue al locker te avisamos con una notificación en la app.', kb('home', 'Volver al inicio')),
    expired: () => err('clock', 'warn', 'El plazo de retiro<br>terminó', 'Pasaron las 72 h y tu pedido volvió al vendedor. Te reintegramos el dinero.', kb('help', 'Contactar soporte', 'sec') + kb('home', 'Volver al inicio')),
    other: () => err('pin', 'info', 'Este pedido es de<br>otro locker', 'Lo retirás en <strong>Amazon Hub Locker ' + esc(C.locker(K.order.lockerId).name) + '</strong>. Te mostramos cómo llegar desde la app.', kb('home', 'Volver al inicio')),
    stuck: () => err('info', 'warn', 'El casillero<br>no se abrió', 'Probá abrirlo de nuevo. Si sigue trabado, soporte lo destraba a distancia.', kb('retry', 'Abrir de nuevo') + kb('help', 'Contactar soporte', 'sec')),
    help: () => '<div class="k-body"><h2>¿Cómo retirar tu pedido?</h2><ol class="k-steps"><li><span>1</span><div><strong>Tocá “Retirar mi pedido”</strong></div></li><li><span>2</span><div><strong>Escaneá tu QR o escribí el código</strong><em>Lo ves en tu app</em></div></li><li><span>3</span><div><strong>Retirá tu paquete</strong><em>Se abre solo tu casillero</em></div></li><li><span>4</span><div><strong>Cerrá la puerta</strong><em>Y listo, te confirmamos en la app</em></div></li></ol>' +
      '<p class="k-tip">' + ic('support', 20) + 'Soporte 24 h desde la app: Ayuda → Contactar soporte.</p>' + kb('back', 'Entendido') + '</div>'
  };

  /* ---------- Render ---------- */
  const time = () => C.hhmm(Date.now());
  function render() {
    const root = $('#kiosk'); if (!root) return;
    const sim = { qr: '<button type="button" data-k="simQr">Simular lectura del QR</button>', open: '<button type="button" data-k="simDoor">Simular: cerré la puerta</button>' }[K.st] || '';
    root.innerHTML = '<div class="k-fit"><div class="k-device"><div class="k-screen" id="kscr"><header class="k-head"><span class="k-logo">' + C.LOGO + '</span><span class="k-sub">Hub Locker · ' + esc(lockerName()) + '</span><time id="kclock">' + time() + '</time></header>' + VIEWS[K.st]() + '</div>' +
      '<button type="button" class="k-reader" data-k="reader" aria-label="Lector de QR"><i></i><span>LECTOR QR</span></button></div>' +
      '<div class="k-sim"><span>Simulación de la pantalla del locker</span><div>' + sim + '<button type="button" data-k="exit">Volver a la app</button></div></div></div>';
    fit();
  }
  function fit() {
    const f = $('.k-fit'); if (!f) return;
    const narrow = window.innerWidth < 1100;
    f.style.zoom = Math.min(1, (window.innerHeight - (narrow ? 8 : 24)) / 930, (window.innerWidth - 8) / 600);
  }
  function go(st) { K.st = st; if (st !== 'pin') K.code = K.code; render(); resetIdle(); if (st === 'locked') tickLock(); if (st === 'thanks') later(() => { reset(); render(); }, 9000); }
  function reset() { K.st = 'home'; K.code = ''; K.fails = 0; K.order = null; }
  function resetIdle() {
    clearTimeout(K.idleT);
    if (['home', 'open', 'thanks', 'locked', 'checking'].indexOf(K.st) >= 0) return;
    K.idleT = setTimeout(() => { reset(); render(); }, IDLE_MS);
  }
  function tickLock() {
    const left = Math.ceil((K.lockUntil - Date.now()) / 1000), el = $('#klock');
    if (el) el.textContent = Math.max(0, left);
    if (left <= 0) { K.fails = 0; K.code = ''; go('home'); return; }
    later(tickLock, 500);
  }

  /* ---------- Lógica de validación ---------- */
  function submit(code, via) {
    K.via = via; go('checking');
    later(() => {
      const o = S().orders.find(x => x.code === code && !x.cancelled);
      C.logEvent('locker', 'código ' + (via === 'qr' ? 'QR' : 'PIN') + ' ' + (o ? 'de pedido ' + o.id : 'inexistente'));
      if (!o) return fail();
      K.order = o;
      if (o.status === 'pickedUp') return go('used');
      if (o.status !== 'ready') return go('notready');
      if (Date.now() > C.deadline(o)) return go('expired');
      if (o.lockerId !== K.lockerId) return go('other');
      K.fails = 0; o.opened = true; C.save(); C.logEvent('locker', 'se abrió el casillero ' + o.compartment);
      go('open');
      if (window.APP && APP.onKiosk) APP.onKiosk('opened', o);
    }, CHECK_MS);
  }
  function fail() {
    K.fails++; K.code = '';
    C.logEvent('error', 'locker: código inválido (' + K.fails + '/' + MAX_FAILS + ')');
    if (K.fails >= MAX_FAILS) { K.lockUntil = Date.now() + LOCK_MS; go('locked'); } else go('bad');
  }
  function closeDoor() {
    const o = K.order; if (!o || K.st !== 'open') return;
    C.advanceOrder(o, 'pickedUp'); C.logEvent('locker', 'puerta cerrada · retiro completado');
    go('thanks');
    if (window.APP && APP.onKiosk) APP.onKiosk('closed', o);
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b || !b.closest('#kiosk')) return;
    if (b.disabled) return;
    const a = b.dataset.k; C.logEvent('click', 'locker · ' + a); resetIdle();
    if (a === 'start') go('method');
    else if (a === 'home') { reset(); go('home'); }
    else if (a === 'method') go('method');
    else if (a === 'toQr') go('qr');
    else if (a === 'toPin') { K.code = ''; go('pin'); }
    else if (a === 'help') { K.prev = K.st; go('help'); }
    else if (a === 'back') go(K.prev && K.prev !== 'help' ? K.prev : 'home');
    else if (a === 'num') { if (K.code.length < 6) { K.code += b.dataset.n; render(); resetIdle(); } }
    else if (a === 'del') { K.code = K.code.slice(0, -1); render(); resetIdle(); }
    else if (a === 'confirm') { if (K.code.length === 6) submit(K.code, 'pin'); }
    else if (a === 'reader' || a === 'simQr') { if (K.st === 'qr') { const o = readyOrder(); submit(o ? o.code : '000000', 'qr'); } }
    else if (a === 'simDoor') closeDoor();
    else if (a === 'stuck') { C.logEvent('error', 'locker: el casillero no abrió'); go('stuck'); }
    else if (a === 'retry') { go('checking'); later(() => go('open'), CHECK_MS); }
    else if (a === 'exit') api.close();
  });
  document.addEventListener('keydown', e => {
    if (!document.body.classList.contains('kiosk-open') || K.st !== 'pin') return;
    if (/^\d$/.test(e.key) && K.code.length < 6) { K.code += e.key; render(); resetIdle(); }
    else if (e.key === 'Backspace') { K.code = K.code.slice(0, -1); render(); }
    else if (e.key === 'Enter' && K.code.length === 6) submit(K.code, 'pin');
  });
  window.addEventListener('resize', fit);

  /* ---------- API ---------- */
  const api = {
    open() {
      clearTimers(); reset(); const o = readyOrder(); K.lockerId = (o && o.lockerId) || 'ing';
      document.body.classList.add('kiosk-open'); $('#kiosk').hidden = false; render();
      clearInterval(K.clock); K.clock = setInterval(() => { const c = $('#kclock'); if (c) c.textContent = time(); }, 15000);
      C.logEvent('locker', 'se abrió la pantalla del locker');
    },
    close() {
      clearTimers(); clearTimeout(K.idleT); clearInterval(K.clock);
      document.body.classList.remove('kiosk-open'); $('#kiosk').hidden = true; $('#kiosk').innerHTML = '';
      if (window.APP && APP.onKiosk) APP.onKiosk('closedPanel', K.order);
    },
    isOpen: () => document.body.classList.contains('kiosk-open'),
    state: () => K
  };
  window.KIOSK = api;
})();
