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
