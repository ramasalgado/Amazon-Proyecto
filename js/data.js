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
    { id: 'p1', colors: [{ n: 'Negro', h: '#262b33' }, { n: 'Blanco', h: '#e8eaee' }, { n: 'Azul', h: '#2f5fa8' }], title: 'Auriculares inalámbricos Bluetooth', short: 'Auriculares inalámbricos Bluetooth', price: 89999, rating: 4.5, reviews: 2318, cat: 'Tecnología', art: 'headphones', tint: '#E9EDF2',
      bullets: ['Cancelación de ruido activa', 'Hasta 30 h de batería', 'Micrófono integrado para llamadas', 'Plegables, con estuche incluido'] },
    { id: 'p2', colors: [{ n: 'Negro', h: '#262b33' }, { n: 'Gris', h: '#8b929c' }, { n: 'Azul', h: '#2f5fa8' }], title: 'Mouse inalámbrico ergonómico', short: 'Mouse inalámbrico ergonómico', price: 24999, rating: 4.3, reviews: 874, cat: 'Tecnología', art: 'mouse', tint: '#EEF0F4',
      bullets: ['Conexión Bluetooth y USB', 'Batería de hasta 6 meses', 'Silencioso'] },
    { id: 'p3', colors: [{ n: 'Negro', h: '#2a2f38' }, { n: 'Azul marino', h: '#1f3a63' }, { n: 'Verde', h: '#2d5a45' }], title: 'Mochila porta notebook 25 L', short: 'Mochila porta notebook 25 L', price: 54999, rating: 4.6, reviews: 1203, cat: 'Accesorios', art: 'backpack', tint: '#EDF1EE',
      bullets: ['Entra notebook de hasta 15,6"', 'Material resistente al agua', 'Puerto de carga USB externo'] },
    { id: 'p4', colors: [{ n: 'Gris', h: '#7b818c' }, { n: 'Negro', h: '#2a2d33' }, { n: 'Azul', h: '#35588f' }], title: 'Buzo canguro de algodón', short: 'Buzo canguro de algodón', price: 39999, rating: 4.4, reviews: 640, cat: 'Ropa', art: 'hoodie', tint: '#F1EEEA',
      bullets: ['Algodón peinado', 'Capucha con cordón', 'Disponible en varios talles'] },
    { id: 'p5', colors: [{ n: 'Negro', h: '#262b33' }, { n: 'Blanco', h: '#e8eaee' }, { n: 'Naranja', h: '#f08a00' }], title: 'Batería portátil 10.000 mAh', short: 'Batería portátil 10.000 mAh', price: 29999, rating: 4.5, reviews: 1522, cat: 'Tecnología', art: 'powerbank', tint: '#EAEFF5',
      bullets: ['Carga rápida USB-C', 'Carga 2 dispositivos a la vez', 'Liviana: 210 g'] },
    { id: 'p6', title: 'Pack de 3 cuadernos universitarios', short: 'Pack 3 cuadernos universitarios', price: 12999, rating: 4.7, reviews: 389, cat: 'Facultad', art: 'notebook', tint: '#F4F0E6',
      bullets: ['80 hojas rayadas cada uno', 'Tapa dura', 'Espiral doble anillo'] }
  ],
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
