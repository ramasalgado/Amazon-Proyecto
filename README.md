# Amazon Hub Locker — Prototipo funcional

Prototipo web (HTML/CSS/JS, sin dependencias ni backend) de la experiencia de compra, seguimiento y retiro en Amazon Hub Locker. Pensado para pruebas de usabilidad.

## Cómo ejecutarlo
Abrí `index.html` en el navegador (doble clic). Arranca en la bienvenida (iniciar sesión o crear cuenta; hay un acceso rápido a la cuenta de prueba tomas@mail.com / demo1234). En escritorio se muestra dentro de un marco de iPhone 17 con el **panel del facilitador** al costado; en un celular ocupa toda la pantalla.

- `?f=0` oculta el panel · `?f=1` lo muestra · `Shift+F` lo alterna.
- El estado se guarda en `localStorage`. Para empezar de cero: botón **Reiniciar prototipo** del panel.

## Panel del facilitador
El pedido avanza solo cada ~7 s hasta "Listo para retirar" (se apaga desde el panel). Además se puede avanzar o saltar el estado del pedido (confirmado → preparación → tránsito → en el locker → listo → retirado), crear un pedido ya listo para probar solo el retiro, tareas con cronómetro y conteo de clics/errores, registro de eventos y copia de resultados en JSON.

## Estructura
`index.html` · `css/styles.css` (tokens del UI Kit) · `js/data.js` (datos mock) · `js/core.js` (estado, router, íconos) · `js/ui.js` (componentes) · `js/screens.js` (pantallas) · `js/app.js` (acciones y facilitador) · `assets/` (recortes de los PDF).

## Datos
Todo es ficticio. Código de retiro válido: `123456`. El QR es un patrón de prototipo, no un QR real.

## Novedades
- Plazo de **72 h** para retirar, con cuenta regresiva en el código de retiro y en el seguimiento.
- "Cómo llegar" abre **Google Maps** (nueva pestaña) con el recorrido a pie hasta el locker.
- Productos con renders más realistas y **selector de color**.
- Animaciones: entrada escalonada de listas, confeti al confirmar compra y retiro, check animado, camión en tránsito, campana, QR con escaneo, pulso en el mapa. Respetan "reducir movimiento".
- "Cómo llegar" ahora es una pantalla de navegación a pie **dentro del celular** (ruta, pasos, recorrido simulado y llegada). Queda un link secundario para abrir la app de Google Maps.
- Categorías de Buscar abren su propia pantalla, con flecha atrás arriba a la izquierda.
- Catálogo de 13 productos reales (Sony WH-CH520, Logitech M590, Targus Classic, adidas Essentials, Anker PowerCore 10000, Rivadavia ABC, Nike Revolution 7, Stanley Classic 1 L, Redragon Kumara K552, JBL Go 3, Casio fx-82LA, Kingston DataTraveler, Stabilo Boss) y renders con materiales.
- Fotos reales opcionales: copiá la imagen en `assets/products/` y declarala en `photos` dentro de `js/data.js`.

## Publicarlo con un link (sin build)
Es un sitio estático: la raíz del repo ya es el sitio (`index.html`).

**Netlify (arrastrando)**: entrá a https://app.netlify.com/drop y soltá `amazon-hub-locker-prototipo.zip` (o la carpeta del proyecto). Te da un link `https://<nombre>.netlify.app`.

**Netlify (desde GitHub)**: *Add new site → Import an existing project → GitHub →* elegí este repo y la rama `claude/functional-web-prototype-enzx5o`. Deja el build command vacío y el publish directory en `.` (ya lo define `netlify.toml`).

**GitHub Pages**: *Settings → Pages → Build and deployment → Deploy from a branch →* rama `claude/functional-web-prototype-enzx5o`, carpeta `/ (root)`. El link queda `https://ramasalgado.github.io/Amazon-Proyecto/`.
- **Lockers en toda la Ciudad**: 48 barrios de CABA y 119 lockers. En "Seleccionar locker" (y en la pestaña Locker) se elige el barrio con "Estás en … Cambiar" o "Usar mi ubicación"; las distancias, la lista y el mapa se recalculan desde ese barrio. Los barrios son aproximados; los comercios, direcciones y disponibilidad son ilustrativos.
- **Mapa del camión** en el seguimiento del pedido: sale del centro logístico de Ezeiza, pasa por una base de reparto en la Ciudad y avanza hacia el locker (o el domicilio). Cambia con cada estado y, en tránsito, muestra el barrio por el que pasa, los km restantes y los minutos.

## Pantalla táctil del locker (kiosco de 17")
Se abre desde el celular con **En el locker → Abrir pantalla del locker** (o desde el panel del facilitador). En escritorio aparece al lado de la app y se sincronizan; en celular ocupa toda la pantalla.

Reglas del sistema:
- **Dos formas de abrir**: escanear el QR de la app en el lector (luz roja, debajo de la pantalla) o ingresar los 6 dígitos con el teclado numérico.
- **Validación**: solo abre pedidos "Listo para retirar", dentro de las 72 h y de **ese** locker.
- **Errores**: código incorrecto (te quedan N intentos) → 3 intentos fallidos pausan la pantalla 30 s; pedido ya retirado; pedido todavía no listo; plazo vencido; pedido de otro locker; casillero que no abre (reintentar o soporte).
- **Casillero abierto**: se resalta el casillero en el esquema del locker y se espera el cierre de la puerta.
- **Cierre de puerta** → el pedido pasa a "Retirado" y la app muestra "Retiro completado".
- **Inactividad**: a los 40 s sin tocar la pantalla vuelve al inicio.
- Controles de simulación (debajo del kiosco): "Simular lectura del QR" y "Simular: cerré la puerta".
