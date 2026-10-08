/* ============================================================
   DATOS MOCK — Amazon Hub Locker
   Todo es ficticio. Contexto: Tomás, 22 años, CABA.
   ============================================================ */
window.DATA = {
  demoAccount: { name: 'Tomás', email: 'tomas@mail.com', pass: 'demo1234' },

  address: 'Av. Principal 123, CABA',
  addresses: [
    { id: 'a1', label: 'Casa', text: 'Av. Principal 123, CABA' },
    { id: 'a2', label: 'Departamento compartido', text: 'Guardia Vieja 3320, CABA' }
  ],
  cards: [
    { id: 'c1', brand: 'Visa', last4: '1234' },
    { id: 'c2', brand: 'Mastercard', last4: '8801' }
  ],

  /* ---------- Productos ---------- */
  products: [
    { id: 'p1', colors: [{ n: 'Negro', h: '#262b33' }, { n: 'Blanco', h: '#e8eaee' }, { n: 'Azul', h: '#2f5fa8' }], title: 'Auriculares inalámbricos Sony WH-CH520 Bluetooth', short: 'Auriculares Sony WH-CH520', price: 89999, rating: 4.6, reviews: 12814, cat: 'Tecnología', art: 'headphones', tint: '#E9EDF2',
      bullets: ['Hasta 50 h de batería; con 3 min de carga rápida tenés 1,5 h', 'Bluetooth 5.2 con conexión multipunto (2 equipos a la vez)', 'Micrófono integrado para llamadas', 'Livianos: 147 g, con almohadillas acolchadas'] },
    { id: 'p2', colors: [{ n: 'Grafito', h: '#3b4048' }, { n: 'Blanco', h: '#e8eaee' }], title: 'Mouse inalámbrico Logitech M590 silencioso', short: 'Mouse Logitech M590', price: 42999, rating: 4.7, reviews: 9203, cat: 'Tecnología', art: 'mouse', tint: '#EEF0F4',
      bullets: ['Clics silenciosos: reduce el ruido hasta un 90 %', 'Se conecta por Bluetooth o receptor USB, hasta 2 equipos', 'Batería de hasta 24 meses con 1 pila AA', 'Rueda de desplazamiento y botones laterales'] },
    { id: 'p3', colors: [{ n: 'Negro', h: '#2a2f38' }, { n: 'Azul marino', h: '#1f3a63' }], title: 'Mochila Targus Classic para notebook de 15,6"', short: 'Mochila Targus Classic 15,6"', price: 59999, rating: 4.6, reviews: 3120, cat: 'Accesorios', art: 'backpack', tint: '#EDF1EE',
      bullets: ['Compartimento acolchado para notebook de hasta 15,6"', 'Bolsillo frontal con organizador', 'Bretelles acolchadas y respaldo ventilado', 'Tela resistente a las salpicaduras'] },
    { id: 'p4', colors: [{ n: 'Gris', h: '#7b818c' }, { n: 'Negro', h: '#2a2d33' }, { n: 'Azul', h: '#35588f' }], title: 'Buzo con capucha adidas Essentials Fleece', short: 'Buzo adidas Essentials', price: 69999, rating: 4.5, reviews: 2481, cat: 'Ropa', art: 'hoodie', tint: '#F1EEEA',
      bullets: ['Felpa suave de algodón con poliéster reciclado', 'Capucha con cordón y bolsillo canguro', 'Puños y botamangas de punto elastizado', 'Logo adidas bordado en el pecho'] },
    { id: 'p5', colors: [{ n: 'Negro', h: '#262b33' }, { n: 'Azul', h: '#2f5fa8' }], title: 'Batería portátil Anker PowerCore 10000', short: 'Anker PowerCore 10000', price: 34999, rating: 4.7, reviews: 18652, cat: 'Tecnología', art: 'powerbank', tint: '#EAEFF5',
      bullets: ['10.000 mAh: carga un celular hasta 2 veces', 'Salida de 12 W con tecnología PowerIQ', 'Entrada micro-USB y salida USB-A', 'Liviana: 180 g, entra en el bolsillo'] },
    { id: 'p6', title: 'Cuaderno universitario Rivadavia ABC, pack x3', short: 'Cuadernos Rivadavia ABC x3', price: 14999, rating: 4.7, reviews: 1389, cat: 'Facultad', art: 'notebook', tint: '#F4F0E6',
      bullets: ['Pack de 3 cuadernos con tapa dura', '84 hojas rayadas por cuaderno', 'Espiralados, tamaño 16 × 21 cm', 'Papel apto para birome y resaltador'] }
  ],
  /* Fotos reales opcionales: copiá la imagen a assets/products/ y declarala acá, por ejemplo:
     photos: { p1: 'assets/products/p1.jpg', p2: 'assets/products/p2.jpg' }
     Si un producto no tiene foto, se usa la ilustración. */
  photos: {},
  categories: ['Tecnología', 'Ropa', 'Accesorios', 'Facultad'],

  /* ---------- Lockers ----------
     x / y = posición en el mapa (en %). km = distancia desde Av. Principal 123. */
  lockers: [
    { id: 'ing',  name: 'Facultad de Ingeniería', type: 'facultad', address: 'Av. Principal 123, CABA', barrio: 'Recoleta', cp: '1063', km: 0.3,
      hours: 'Lun - Dom 7:00 - 22:00', status: 'available', free: 12, sizes: 'Espacios grandes y medianos',
      where: 'Entrada principal, planta baja', thumb: 'assets/thumb-facultad.jpg', x: 46, y: 47 },
    { id: 'dia',  name: 'Supermercado Día', type: 'super', address: 'Av. Callao 1020, CABA', barrio: 'Recoleta', cp: '1023', km: 0.8,
      hours: 'Lun - Dom 8:00 - 21:00', status: 'available', free: 3, sizes: 'Espacios pequeños y medianos',
      where: 'Junto a las cajas rápidas', thumb: null, x: 28, y: 30 },
    { id: 'carre', name: 'Supermercado Carrefour', type: 'super', address: 'Av. Córdoba 2122, CABA', barrio: 'Balvanera', cp: '1120', km: 1.1,
      hours: 'Lun - Dom 8:00 - 22:00', status: 'available', free: 9, sizes: 'Espacios grandes y medianos',
      where: 'Hall de entrada, a la derecha', thumb: 'assets/thumb-super.jpg', x: 71, y: 33 },
    { id: 'med',  name: 'Facultad de Medicina', type: 'facultad', address: 'Paraguay 2155, CABA', barrio: 'Recoleta', cp: '1121', km: 1.4,
      hours: 'Lun - Sáb 7:00 - 21:00', status: 'available', free: 6, sizes: 'Espacios grandes y medianos',
      where: 'Acceso por Paraguay, planta baja', thumb: 'assets/thumb-medicina.jpg', x: 24, y: 66 },
    { id: 'eco',  name: 'Facultad de Ciencias Económicas', type: 'facultad', address: 'Uriburu 763, CABA', barrio: 'Balvanera', cp: '1114', km: 1.6,
      hours: 'Lun - Vie 7:00 - 22:00', status: 'full', free: 0, sizes: 'Sin espacios libres',
      where: 'Hall central', thumb: null, x: 78, y: 62 },
    { id: 'der',  name: 'Facultad de Derecho', type: 'facultad', address: 'Av. Figueroa Alcorta 2263, CABA', barrio: 'Recoleta', cp: '1425', km: 1.9,
      hours: 'Lun - Vie 7:00 - 23:00', status: 'available', free: 4, sizes: 'Espacios medianos',
      where: 'Planta baja, frente al buffet', thumb: null, x: 60, y: 80 },
    { id: 'coto', name: 'Supermercado Coto', type: 'super', address: 'Av. Santa Fe 3140, CABA', barrio: 'Palermo', cp: '1425', km: 2.2,
      hours: 'Lun - Dom 8:00 - 22:00', status: 'available', free: 15, sizes: 'Espacios grandes y medianos',
      where: 'Entrada por calle, a la izquierda', thumb: null, x: 86, y: 18 }
  ],

  /* ---------- Pedidos de ejemplo (historial) ---------- */
  seedOrders: [
    { id: '114-2087731-5521', pid: 'p5', qty: 1, delivery: 'locker', lockerId: 'med', status: 'pickedUp', daysAgo: 21, cancelled: false }
  ]
};

/* Estados del pedido en orden */
window.STATUS = ['confirmed', 'preparing', 'transit', 'atLocker', 'ready', 'pickedUp'];
window.STATUS_LABEL = {
  confirmed: 'Pedido confirmado',
  preparing: 'En preparación',
  transit: 'En tránsito',
  atLocker: 'En el locker',
  ready: 'Listo para retirar',
  pickedUp: 'Retirado'
};
window.PICKUP_CODE = '123456';
