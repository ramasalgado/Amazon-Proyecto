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
      bullets: ['Pack de 3 cuadernos con tapa dura', '84 hojas rayadas por cuaderno', 'Espiralados, tamaño 16 × 21 cm', 'Papel apto para birome y resaltador'] },
    { id: 'p7', colors: [{ n: 'Negro', h: '#262a31' }, { n: 'Gris', h: '#8a8f98' }, { n: 'Azul', h: '#2f5fa8' }], title: 'Zapatillas Nike Revolution 7 para hombre', short: 'Zapatillas Nike Revolution 7', price: 119999, rating: 4.5, reviews: 5762, cat: 'Ropa', art: 'sneaker', tint: '#EFEFF2',
      bullets: ['Capellada de malla liviana y transpirable', 'Mediasuela de espuma con amortiguación suave', 'Suela de goma con buena tracción', 'Para correr y para todos los días'] },
    { id: 'p8', colors: [{ n: 'Verde', h: '#2e5a45' }, { n: 'Negro', h: '#2a2d33' }, { n: 'Azul', h: '#2f5fa8' }], title: 'Termo Stanley Classic 1 L', short: 'Termo Stanley Classic 1 L', price: 189999, rating: 4.8, reviews: 8421, cat: 'Accesorios', art: 'thermos', tint: '#EEF1EE',
      bullets: ['Acero inoxidable 18/8 libre de BPA', 'Doble pared aislada al vacío: conserva frío y calor', 'La tapa funciona como vaso', 'Capacidad de 1 litro, con asa integrada'] },
    { id: 'p9', colors: [{ n: 'Negro', h: '#1b1f26' }, { n: 'Blanco', h: '#d9dce1' }], title: 'Teclado mecánico Redragon Kumara K552 retroiluminado', short: 'Teclado Redragon Kumara K552', price: 64999, rating: 4.6, reviews: 15210, cat: 'Tecnología', art: 'keyboard', tint: '#EDEEF2',
      bullets: ['Switches mecánicos Outemu', 'Formato compacto sin teclado numérico (87 teclas)', 'Retroiluminación LED', 'Cable USB y construcción metálica reforzada'] },
    { id: 'p10', colors: [{ n: 'Azul', h: '#2f5fa8' }, { n: 'Negro', h: '#262b33' }, { n: 'Naranja', h: '#f08a00' }], title: 'Parlante Bluetooth portátil JBL Go 3', short: 'Parlante JBL Go 3', price: 59999, rating: 4.7, reviews: 22340, cat: 'Tecnología', art: 'speaker', tint: '#ECEFF4',
      bullets: ['Bluetooth con sonido JBL Pro', 'Hasta 5 horas de reproducción', 'Resistente al agua y al polvo (IP67)', 'Tan chico que entra en el bolsillo'] },
    { id: 'p11', colors: [{ n: 'Negro', h: '#2d333c' }], title: 'Calculadora científica Casio fx-82LA Plus 2nd Edition', short: 'Calculadora Casio fx-82LA Plus', price: 27999, rating: 4.8, reviews: 6190, cat: 'Facultad', art: 'calculator', tint: '#F1F0EB',
      bullets: ['252 funciones', 'Pantalla Natural Display de 2 líneas', 'Alimentación solar y a pila', 'Muy usada en facultades y exámenes'] },
    { id: 'p12', colors: [{ n: 'Negro', h: '#262b33' }, { n: 'Azul', h: '#2f5fa8' }], title: 'Pendrive Kingston DataTraveler Exodia 64 GB USB 3.2', short: 'Pendrive Kingston 64 GB', price: 11999, rating: 4.7, reviews: 11870, cat: 'Facultad', art: 'usb', tint: '#EDF0F4',
      bullets: ['USB 3.2 de primera generación', 'Capacidad de 64 GB', 'Tapa protectora con anillo para llavero', 'Compatible con Windows, macOS y Linux'] },
    { id: 'p13', title: 'Resaltadores Stabilo Boss Original, pack x4 colores', short: 'Resaltadores Stabilo Boss x4', price: 13999, rating: 4.8, reviews: 2750, cat: 'Facultad', art: 'markers', tint: '#F5F3E8',
      bullets: ['Pack de 4 colores fluorescentes', 'Punta biselada para trazo fino o grueso', 'Tinta de colores intensos', 'Cuerpo con clip en la tapa'] }
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

/* ============================================================
   CIUDAD AUTÓNOMA DE BUENOS AIRES: 48 barrios y lockers por zona
   Los barrios y sus centros son aproximados. Los comercios, direcciones
   y disponibilidad de los lockers son ilustrativos (datos de prototipo).
   ============================================================ */
(function () {
  const D = window.DATA;
  D.defaultBarrio = 'Recoleta';
  D.barrios = [
    ['Agronomía', -34.5958, -58.4893], ['Almagro', -34.6097, -58.4166], ['Balvanera', -34.6094, -58.4025], ['Barracas', -34.6439, -58.3711],
    ['Belgrano', -34.5622, -58.4586], ['Boedo', -34.6265, -58.4186], ['Caballito', -34.6186, -58.4425], ['Chacarita', -34.5879, -58.4553],
    ['Coghlan', -34.5601, -58.4747], ['Colegiales', -34.5740, -58.4496], ['Constitución', -34.6270, -58.3830], ['Flores', -34.6290, -58.4640],
    ['Floresta', -34.6290, -58.4840], ['La Boca', -34.6345, -58.3631], ['La Paternal', -34.5979, -58.4690], ['Liniers', -34.6440, -58.5180],
    ['Mataderos', -34.6580, -58.5040], ['Monte Castro', -34.6190, -58.5030], ['Montserrat', -34.6134, -58.3790], ['Nueva Pompeya', -34.6500, -58.4210],
    ['Núñez', -34.5450, -58.4600], ['Palermo', -34.5800, -58.4260], ['Parque Avellaneda', -34.6480, -58.4780], ['Parque Chacabuco', -34.6360, -58.4380],
    ['Parque Chas', -34.5860, -58.4780], ['Parque Patricios', -34.6370, -58.4000], ['Puerto Madero', -34.6118, -58.3626], ['Recoleta', -34.5875, -58.3974],
    ['Retiro', -34.5920, -58.3750], ['Saavedra', -34.5550, -58.4880], ['San Cristóbal', -34.6220, -58.4010], ['San Nicolás', -34.6030, -58.3790],
    ['San Telmo', -34.6217, -58.3720], ['Vélez Sarsfield', -34.6330, -58.4920], ['Versalles', -34.6290, -58.5210], ['Villa Crespo', -34.5990, -58.4350],
    ['Villa del Parque', -34.6050, -58.4890], ['Villa Devoto', -34.6010, -58.5140], ['Villa General Mitre', -34.6110, -58.4690], ['Villa Lugano', -34.6770, -58.4690],
    ['Villa Luro', -34.6350, -58.5060], ['Villa Ortúzar', -34.5770, -58.4680], ['Villa Pueyrredón', -34.5780, -58.5000], ['Villa Real', -34.6260, -58.5250],
    ['Villa Riachuelo', -34.6910, -58.4790], ['Villa Santa Rita', -34.6130, -58.4800], ['Villa Soldati', -34.6640, -58.4380], ['Villa Urquiza', -34.5730, -58.4880]
  ].map(b => ({ n: b[0], lat: b[1], lon: b[2] }));

  /* Los 7 lockers originales conservan su id; ahora tienen coordenadas reales. */
  const fix = { ing: [-34.5893, -58.3996, 'Recoleta'], dia: [-34.5945, -58.3940, 'Recoleta'], carre: [-34.5972, -58.4000, 'Balvanera'], med: [-34.5998, -58.3975, 'Recoleta'],
    eco: [-34.6020, -58.4000, 'Balvanera'], der: [-34.5840, -58.3925, 'Recoleta'], coto: [-34.5880, -58.4120, 'Palermo'] };
  D.lockers.forEach(l => { const f = fix[l.id]; l.lat = f[0]; l.lon = f[1]; l.barrio = f[2]; });

  const RAW = [
    'Agronomía|F|Facultad de Agronomía (UBA)|Av. San Martín 4453', 'Agronomía|S|Supermercado Día|Av. San Martín 4900',
    'Almagro|F|UTN Facultad Regional Buenos Aires|Medrano 951', 'Almagro|S|Supermercado Carrefour Express|Av. Rivadavia 3921', 'Almagro|E|Estación Medrano (Subte B)|Av. Corrientes 3900',
    'Balvanera|F|Facultad de Psicología (UBA)|Hipólito Yrigoyen 3242', 'Balvanera|E|Estación Once (Tren Sarmiento)|Av. Pueyrredón 8', 'Balvanera|M|Abasto Shopping|Av. Corrientes 3247',
    'Barracas|S|Supermercado Coto|Av. Montes de Oca 1200', 'Barracas|E|Estación Hipólito Yrigoyen (Tren Roca)|Av. Montes de Oca 2100',
    'Belgrano|F|Universidad Di Tella|Av. Figueroa Alcorta 7350', 'Belgrano|M|Galerías Belgrano|Av. Cabildo 2150', 'Belgrano|S|Supermercado Jumbo|Av. Cabildo 1250',
    'Boedo|S|Supermercado Día|Av. Boedo 800', 'Boedo|E|Estación Boedo (Subte E)|Av. Independencia 3500',
    'Caballito|F|Facultad de Filosofía y Letras (UBA)|Puan 480', 'Caballito|S|Supermercado Coto|Av. Rivadavia 5150', 'Caballito|E|Estación Primera Junta (Subte A)|Av. Rivadavia 5400',
    'Chacarita|E|Estación Federico Lacroze (Subte B)|Av. Federico Lacroze 4000', 'Chacarita|S|Supermercado Disco|Av. Corrientes 6000',
    'Coghlan|S|Supermercado Día|Av. Congreso 3100', 'Coghlan|E|Estación Coghlan (Tren Mitre)|Av. Congreso 3500',
    'Colegiales|S|Supermercado Carrefour|Av. Federico Lacroze 2800', 'Colegiales|E|Estación Colegiales (Tren Mitre)|Av. Dorrego 1900',
    'Constitución|F|Facultad de Ciencias Sociales (UBA)|Santiago del Estero 1029', 'Constitución|E|Estación Constitución (Tren Roca)|Av. Brasil 1100', 'Constitución|S|Supermercado Día|Av. Garay 1300',
    'Flores|S|Supermercado Coto|Av. Rivadavia 6900', 'Flores|E|Estación Flores (Tren Sarmiento)|Av. Rivadavia 7000', 'Flores|M|Shopping Plaza Flores|Av. Rivadavia 7300',
    'Floresta|S|Supermercado Día|Av. Gaona 3500', 'Floresta|E|Estación Floresta (Tren Sarmiento)|Av. Gaona 3200',
    'La Boca|S|Supermercado Día|Av. Almirante Brown 1100', 'La Boca|M|Paseo Caminito|Caminito 1000',
    'La Paternal|F|Facultad de Veterinaria (UBA)|Av. Chorroarín 280', 'La Paternal|E|Estación La Paternal (Tren San Martín)|Av. San Martín 2400',
    'Liniers|S|Supermercado Coto|Av. Rivadavia 11200', 'Liniers|E|Estación Liniers (Tren Sarmiento)|Av. Rivadavia 11100',
    'Mataderos|S|Supermercado Carrefour|Av. Lisandro de la Torre 2300', 'Mataderos|M|Mercado de Liniers|Av. Lisandro de la Torre 2400',
    'Monte Castro|S|Supermercado Día|Av. Rivadavia 8900', 'Monte Castro|E|Estación Devoto (Tren San Martín)|Av. Beiró 5100',
    'Montserrat|F|UADE Campus Montserrat|Lima 717', 'Montserrat|E|Estación Plaza de Mayo (Subte A)|Av. de Mayo 500', 'Montserrat|S|Supermercado Día|Av. Belgrano 800',
    'Nueva Pompeya|S|Supermercado Coto|Av. Sáenz 800', 'Nueva Pompeya|M|Parque de la Ciudad|Av. Escalada 3000',
    'Núñez|F|Facultad de Ciencias Exactas (Ciudad Universitaria)|Intendente Güiraldes 2160', 'Núñez|F|Facultad de Arquitectura (Ciudad Universitaria)|Intendente Güiraldes 2160', 'Núñez|E|Estación Núñez (Tren Mitre)|Av. del Libertador 8300',
    'Palermo|F|Universidad de Palermo|Mario Bravo 1050', 'Palermo|M|Alto Palermo Shopping|Av. Santa Fe 3253', 'Palermo|E|Estación Plaza Italia (Subte D)|Av. Santa Fe 4000',
    'Parque Avellaneda|S|Supermercado Día|Av. Directorio 4700', 'Parque Avellaneda|M|Parque Avellaneda|Av. Directorio 4800',
    'Parque Chacabuco|S|Supermercado Coto|Av. Eva Perón 1800', 'Parque Chacabuco|E|Estación Parque Chacabuco (Subte E)|Av. Asamblea 1000',
    'Parque Chas|S|Supermercado Día|Av. Triunvirato 4800', 'Parque Chas|M|Plaza Parque Chas|Victorica 5000',
    'Parque Patricios|F|Distrito Tecnológico (Centro Metropolitano)|Av. Cobo 1000', 'Parque Patricios|S|Supermercado Coto|Av. Caseros 3100',
    'Puerto Madero|F|Universidad Católica Argentina (UCA)|Av. Alicia Moreau de Justo 1500', 'Puerto Madero|F|ITBA Instituto Tecnológico de Buenos Aires|Av. Eduardo Madero 399', 'Puerto Madero|M|Dique 3 Costanera Sur|Juana Manso 800',
    'Recoleta|F|Facultad de Odontología (UBA)|Marcelo T. de Alvear 2142', 'Recoleta|F|Facultad de Farmacia y Bioquímica (UBA)|Junín 956', 'Recoleta|M|Recoleta Mall|Vicente López 2050',
    'Retiro|E|Estación Retiro (Tren Mitre)|Av. Ramos Mejía 1358', 'Retiro|M|Galerías Pacífico|Florida 753', 'Retiro|S|Supermercado Carrefour|Av. Santa Fe 1000',
    'Saavedra|S|Supermercado Coto|Av. Cabildo 4800', 'Saavedra|E|Estación Saavedra (Tren Mitre)|Av. Crisólogo Larralde 4100',
    'San Cristóbal|F|Universidad de Belgrano (Sede Centro)|Av. Entre Ríos 1100', 'San Cristóbal|S|Supermercado Día|Av. Independencia 2800',
    'San Nicolás|F|Facultad de Derecho (Sede Centro)|Uruguay 1000', 'San Nicolás|E|Estación Diagonal Norte (Subte C)|Av. Roque Sáenz Peña 800', 'San Nicolás|S|Supermercado Coto|Av. Corrientes 1500',
    'San Telmo|F|Facultad de Ingeniería (UBA) Sede Paseo Colón|Av. Paseo Colón 850', 'San Telmo|S|Supermercado Día|Defensa 900',
    'Vélez Sarsfield|S|Supermercado Día|Av. Juan B. Justo 8000', 'Vélez Sarsfield|M|Estadio José Amalfitani|Av. Juan B. Justo 9200',
    'Versalles|S|Supermercado Coto|Av. Juan B. Justo 9500', 'Versalles|E|Estación Versalles (Tren Sarmiento)|Av. Rivadavia 10800',
    'Villa Crespo|S|Supermercado Disco|Av. Scalabrini Ortiz 600', 'Villa Crespo|M|Distrito Diseño|Av. Warnes 600', 'Villa Crespo|E|Estación Malabia (Subte B)|Av. Corrientes 5400',
    'Villa del Parque|S|Supermercado Día|Av. Cuenca 3000', 'Villa del Parque|E|Estación Villa del Parque (Tren San Martín)|Av. Beiró 3100',
    'Villa Devoto|S|Supermercado Carrefour|Av. Fernández de Enciso 4500', 'Villa Devoto|M|Plaza Arenales|Av. Chivilcoy 3000',
    'Villa General Mitre|S|Supermercado Día|Av. San Martín 5500', 'Villa General Mitre|E|Estación Villa General Mitre (Tren San Martín)|Av. San Martín 5800',
    'Villa Lugano|S|Supermercado Coto|Av. Eva Perón 6500', 'Villa Lugano|F|UTN Campus Villa Lugano|Mozart 2300', 'Villa Lugano|M|Parque de la Ciudad|Av. Cnel. Roca 6000',
    'Villa Luro|S|Supermercado Carrefour|Av. Rivadavia 9800', 'Villa Luro|E|Estación Villa Luro (Tren Sarmiento)|Av. Rivadavia 9900',
    'Villa Ortúzar|S|Supermercado Día|Av. Triunvirato 3400', 'Villa Ortúzar|E|Estación Villa Ortúzar (Tren San Martín)|Av. Triunvirato 3600',
    'Villa Pueyrredón|S|Supermercado Coto|Av. Mosconi 3000', 'Villa Pueyrredón|E|Estación Villa Pueyrredón (Tren San Martín)|Av. Mosconi 2800',
    'Villa Real|S|Supermercado Día|Av. Francisco Beiró 6600', 'Villa Real|E|Estación Villa Real (Tren Sarmiento)|Av. Gaona 4900',
    'Villa Riachuelo|S|Supermercado Día|Av. Cnel. Roca 4800', 'Villa Riachuelo|M|Plaza Riachuelo|Av. Cnel. Roca 4900',
    'Villa Santa Rita|S|Supermercado Coto|Av. Álvarez Jonte 3100', 'Villa Santa Rita|E|Estación Villa Santa Rita (Tren San Martín)|Av. Beiró 4000',
    'Villa Soldati|F|UTN Facultad Regional Buenos Aires (Campus)|Mozart 2300', 'Villa Soldati|S|Supermercado Coto|Av. Cnel. Roca 3300',
    'Villa Urquiza|S|Supermercado Jumbo|Av. Triunvirato 4400', 'Villa Urquiza|E|Estación Villa Urquiza (Subte B)|Av. Triunvirato 4300', 'Villa Urquiza|F|Universidad Argentina de la Empresa (UADE) Sede Villa Urquiza|Av. Triunvirato 4500'
  ];
  const TYPE = { F: 'facultad', S: 'super', E: 'estacion', M: 'shopping' };
  const HRS = { facultad: 'Lun - Vie 7:00 - 22:00', super: 'Lun - Dom 8:00 - 22:00', estacion: 'Todos los días 5:00 - 23:00', shopping: 'Lun - Dom 10:00 - 22:00' };
  const WHERE = { facultad: 'Hall principal, planta baja', super: 'Hall de entrada, junto a las cajas', estacion: 'Boletería, nivel calle', shopping: 'Planta baja, cerca del acceso principal' };
  const SIZES = ['Espacios grandes y medianos', 'Espacios pequeños y medianos', 'Espacios medianos', 'Espacios grandes, medianos y pequeños'];
  const hash = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const byName = n => D.barrios.find(b => b.n === n);
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const seen = {};
  RAW.forEach((line, i) => {
    const [barrio, t, name, address] = line.split('|'), b = byName(barrio), h = hash(line), type = TYPE[t];
    if (!b) return;
    let id = slug(barrio + '-' + name).slice(0, 40); if (seen[id]) id += '-' + i; seen[id] = 1;
    const full = h % 9 === 0, free = full ? 0 : 1 + (h % 14);
    // posición dentro del barrio: desvío determinístico de hasta ~450 m
    let dlat = ((h % 1000) / 1000 - .5) * .008, dlon = (((h >> 10) % 1000) / 1000 - .5) * .008;
    if (barrio === D.defaultBarrio) { const dd = Math.hypot(dlat * 111, dlon * 91.4); if (dd < .55) { const k = .55 / Math.max(dd, .01); dlat *= k; dlon *= k; } } // la Facultad de Ingeniería queda como el locker más cercano
    D.lockers.push({ id, name, type, address: address + ', CABA', barrio, km: 0, hours: HRS[type], status: full ? 'full' : 'available', free,
      sizes: full ? 'Sin espacios libres' : SIZES[h % SIZES.length], where: WHERE[type], thumb: type === 'facultad' ? 'assets/thumb-facultad.jpg' : null, lat: b.lat + dlat, lon: b.lon + dlon });
  });
})();
