# Genera carpeta.html y PDF. Uso: python3 build.py
pages = []
TOTAL = [0]
def page(section, title, body, sub=""):
    pages.append((section, title, sub, body))

def cards(items, cols=3):
    h = f'<div class="grid c{cols}">'
    for t, b in items:
        h += f'<div class="card"><h4>{t}</h4><p>{b}</p></div>'
    return h + '</div>'

def dark(t, b):
    return f'<div class="dark"><h4>{t}</h4><p>{b}</p></div>'

def table(head, rows, cls=""):
    h = f'<table class="{cls}"><tr>' + ''.join(f'<th>{x}</th>' for x in head) + '</tr>'
    for r in rows:
        h += '<tr>' + ''.join(f'<td>{x}</td>' for x in r) + '</tr>'
    return h + '</table>'

# ---------- Índice
page("CARPETA CONCEPTUAL", "Recorrido del Proyecto Integrador",
 cards([
  ("ETAPA 1 · Análisis situacional","Elección del proyecto creativo, investigación exploratoria (5C), comportamiento del consumidor y oportunidad de negocio."),
  ("ETAPA 2 · Segmentación y estrategia","Mercado meta, ventaja competitiva, propuesta de valor, posicionamiento, matrices y estrategias."),
  ("ETAPA 3 · Marketing operativo","Identidad de marca, decisiones de producto y estrategia de precios."),
  ("ETAPA 4 · Plan de marketing","Distribución, comunicación integrada, plan de acción, presupuesto y control."),
 ],2) +
 '<div class="note"><b>Cómo leer esta carpeta.</b> Cada página resume una decisión del proyecto y su fundamento. Todas las propuestas son <b>recomendaciones académicas sujetas a validación</b>: no se presentan cifras ni acuerdos comerciales que no estén respaldados por fuentes.</div>'
 + dark("HILO CONDUCTOR","Investigación → segmentación y posicionamiento → marketing operativo → plan de marketing: una misma lógica de especialista con diferenciación."),
 "Contenido y lógica del trabajo")

# ---------- Proyecto
page("EL PROYECTO CREATIVO","Fracking Design: del descarte al diseño",
 '<div class="two"><div>'
 '<p>Emprendimiento argentino de <b>diseño sustentable</b> creado por Carla, Ornella y Mora Basilotta. Recupera <b>big bags plásticas</b> de la actividad petrolera y las transforma en accesorios y marroquinería.</p>'
 '<p>La innovación no está solo en la estética, sino en <b>reinterpretar el material y su función original</b>: el residuo pasa a ser materia prima con posibilidades de diseño (innovación emprendedora, Schumpeter).</p>'
 '<p>El diseño es la herramienta que convierte un problema ambiental en oportunidad: selección de materiales, desarrollo de producto, funcionalidad, estética y comunicación.</p>'
 '</div><div>'
 + cards([("AMBIENTAL","Recuperar descartes y extender su ciclo de vida."),
          ("SOCIAL","Talleres, cooperativas y unidades productivas en la cadena de transformación."),
          ("ECONÓMICO","Productos comercializables a partir de materiales recuperados.")],1)
 + '</div></div>' + dark("TRIPLE IMPACTO","Las tres dimensiones se integran al modelo de negocio y deben evaluarse con información verificable sobre sus resultados."),
 "Justificación de la elección")

# ---------- Etapa 1
page("ETAPA 1 · ANÁLISIS SITUACIONAL","Investigación exploratoria de mercado",
 '<div class="two"><div>'
 '<div class="card"><h4>PROBLEMA</h4><p>Existen alternativas funcionales y estéticas de distintos precios, pero no se conoce cuánto valoran los jóvenes adultos la <b>modularidad</b> y la <b>recuperación de materiales</b>, ni cuánto pagarían por ellas.</p></div>'
 '<div class="card"><h4>PREGUNTA</h4><p>¿En qué medida los jóvenes adultos urbanos económicamente activos valoran la modularidad y la sustentabilidad al elegir accesorios, y cómo incide en su disposición a pagar?</p></div>'
 '<div class="card"><h4>HIPÓTESIS EXPLORATORIA</h4><p>Quienes combinan estudio, trabajo y movilidad podrían valorar una solución adaptable y durable; el origen recuperado suma diferenciación, pero no compensa un precio percibido como excesivo. <i>No validada.</i></p></div>'
 '</div><div>'
 '<div class="card"><h4>METODOLOGÍA</h4><p>Exploración documental del emprendimiento, del e-commerce argentino y de competidores, organizada con la <b>matriz de las 5C</b>. Los datos sectoriales generales no se presentan como evidencia de preferencias por mochilas modulares.</p></div>'
 '<div class="card"><h4>USO DE IA GENERATIVA</h4><p>ChatGPT como apoyo para estructurar las 5C y ordenar hipótesis. Los resultados no se tomaron como datos: se revisaron y contrastaron con fuentes institucionales, distinguiendo <b>hechos, inferencias e hipótesis</b>.</p></div>'
 '<div class="card"><h4>LIMITACIONES</h4><p>La IA puede citar fuentes desactualizadas, atribuir datos generales a segmentos particulares o sugerir competidores no equivalentes. La aceptación de la modularidad y la disposición a pagar quedan pendientes de investigación primaria.</p></div>'
 '</div></div>',
 "Problema, pregunta, hipótesis y método")

page("ETAPA 1 · ANÁLISIS SITUACIONAL","Matriz de las 5C",
 cards([
  ("COMPAÑÍA","Recupera big bags petroleras para marroquinería y accesorios. Certificación Empresa B y reconocimientos de diseño: a mantener vinculados a documentación institucional."),
  ("CONSUMIDOR","Valora procedencia, proceso, durabilidad e impacto, además de estética, comodidad, precio y garantía. Perfil formulado como hipótesis de segmentación."),
  ("COMPETIDORES","<b>Directa:</b> Bolsa Red, BIOTICO. <b>Indirecta:</b> Samsonite, JanSport. <b>Circunstancial:</b> reparar, comprar usado, pedir prestado, seguir con el bolso actual."),
  ("COLABORADORES","Industrias proveedoras de descartes, talleres y unidades productivas; participación técnica del INTI en pruebas de resistencia, fricción e impermeabilidad."),
  ("CONTEXTO · ECONÓMICO","INDEC (oct. 2026): IPC 2,2 % mensual y 33,1 % interanual. Compra postergable y alta sensibilidad al precio."),
  ("CONTEXTO · COMERCIAL","CACE 2025: 25,1 M de compradores online, 253 M de órdenes; 85 % busca información online antes de comprar en tienda física."),
 ],3) +
 '<div class="note">Las cifras describen el comercio electrónico general, no el nicho de accesorios sustentables. Contexto ambiental: ~570 t diarias de residuos textiles en la Prov. de Buenos Aires (2025), indicador contextual y no medición de big bags. Las marcas citadas son referencias, no un ranking de participación.</div>',
 "Compañía, Consumidor, Competidores, Colaboradores y Contexto")

page("ETAPA 1 · ANÁLISIS SITUACIONAL","Consumidor y oportunidad de negocio",
 '<div class="two"><div>'
 + cards([("NECESIDADES","Innatas: seguridad y protección. Relativas: identidad, pertenencia, diferenciación y coherencia con valores. Derivadas: mochilas, bolsos, organizadores."),
          ("DESEO → DEMANDA","El deseo solo se vuelve demanda con intención <b>y capacidad</b> de compra: la conciencia ambiental no equivale a poder adquisitivo."),
          ("COMPORTAMIENTO","Compra <b>compleja</b> como hipótesis principal: alto involucramiento, diferencias perceptibles y uso prolongado."),
          ("PROCESO DE DECISIÓN","Reconocimiento → búsqueda → evaluación → decisión → poscompra (recompra de módulos).")],1)
 + '</div><div>'
 + dark("OPORTUNIDAD IDENTIFICADA","Explorar una línea de accesorios urbanos modulares con materiales recuperados: mochila principal y módulos intercambiables. Es una extensión de línea <b>propuesta</b>, no un producto existente.")
 + '<div class="card"><h4>PÚBLICO PRIORITARIO</h4><p>Jóvenes adultos urbanos <b>económicamente activos</b> (profesionales y estudiantes que trabajan). Los estudiantes sin ingresos quedan como segmento condicionado por precio o compra de terceros.</p></div>'
 '<div class="card"><h4>PRÓXIMOS PASOS DE VALIDACIÓN</h4><p>Entrevistas · prueba de prototipo vs. mochila convencional · relevamiento de precios · registro de roles de compra e ingreso disponible.</p></div>'
 '</div></div>',
 "Cómo decide el consumidor y dónde está la oportunidad")

# ---------- Etapa 2
page("ETAPA 2 · SEGMENTACIÓN","Segmentación y mercado meta",
 cards([
  ("GEOGRÁFICA","Argentina, grandes centros urbanos; acceso por canales digitales."),
  ("DEMOGRÁFICA","25 a 40 años, económicamente activos, ingresos compatibles con diseño de precio medio-alto."),
  ("PSICOGRÁFICA","Estilo urbano; afinidad con diseño, funcionalidad, consumo responsable y economía circular."),
  ("CONDUCTUAL","Beneficios buscados: calidad, diseño, durabilidad, funcionalidad y sustentabilidad; también compara precio."),
 ],4) +
 dark("MERCADO META","Adultos jóvenes de ~25 a 40 años, residentes en grandes centros urbanos de Argentina, económicamente activos, con capacidad adquisitiva media a media-alta, que valoran diseño, calidad, funcionalidad y durabilidad, con interés en el consumo responsable.") +
 '<div class="note"><b>Revisión de la Etapa 1:</b> se pasó de «estudiantes» a adultos económicamente activos porque el poder adquisitivo es condición de la demanda. <b>Cobertura:</b> marketing concentrado o de nicho. Segmento medible, accesible, sustancial, diferenciable y aplicable.</div>',
 "Segmentación combinada y estrategia de cobertura")

page("ETAPA 2 · POSICIONAMIENTO","Ventaja competitiva, valor y posicionamiento",
 '<div class="two"><div>'
 + cards([("VENTAJA COMPETITIVA PROPUESTA","Transformar descartes industriales con historia y procedencia identificables en productos de diseño funcionales y durables. La ventaja no es «ser sustentable», sino <b>cómo se materializa</b>: trazabilidad."),
          ("PROPUESTA DE VALOR","Beneficios funcionales (transportar, proteger, organizar), simbólicos (identidad, diferenciación) y ambientales/sociales."),
          ("PRECIO-BENEFICIOS","«Más por más»: un precio superior respaldado por beneficios superiores percibidos.")],1)
 + '</div><div>'
 + dark("DECLARACIÓN DE POSICIONAMIENTO","Para adultos jóvenes urbanos económicamente activos que valoran el diseño y buscan consumir de manera más responsable, Fracking Design es una marca de accesorios de diseño sustentable que transforma descartes industriales en productos funcionales, durables y diferenciados, haciendo del origen y la transformación del material parte del valor del producto.")
 + table(["Criterio","Estado"],[["Importante · Distintiva · Comunicable","Sólido"],["Exclusiva","Parcial"],["Superior · Costeable · Redituable","A validar"]],"small")
 + '</div></div>',
 "Base de posicionamiento: por atributo")

page("ETAPA 2 · DIAGNÓSTICO","Matrices del marketing",
 '<div class="grid c3">'
 '<div class="card"><h4>CICLO DE VIDA</h4><p>Sin series de ventas no se fija la etapa. La trazabilidad QR está en <b>desarrollo y validación</b>.</p></div>'
 '<div class="card"><h4>BCG</h4><p>Mochilas y bolsos urbanos: <b>interrogante</b> (hipótesis de trabajo). No se asignan cifras ni se clasifica como «perro» ningún producto real.</p></div>'
 '<div class="card"><h4>FCB</h4><p><b>Alta implicación y predominio afectivo</b>, con evaluación racional de precio, resistencia y funcionalidad.</p></div>'
 '<div class="card"><h4>ANSOFF</h4><p><b>Penetración de mercado</b>: fortalecer la oferta actual en el segmento urbano elegido; no equivale a precios bajos.</p></div>'
 '<div class="card"><h4>FODA</h4><p><b>F:</b> material recuperado, triple impacto. <b>D:</b> precio restrictivo, alcance. <b>O:</b> circularidad, canales digitales. <b>A:</b> sustitutos, contexto económico.</p></div>'
 '<div class="card"><h4>CONVERGENCIA</h4><p>Todas las matrices llevan a <b>especialista con diferenciación</b>, sin competir principalmente por precio.</p></div>'
 '</div>'
 + table(["Fuerza de Porter","Intensidad","Implicancia"],[
   ["Poder de compradores","Medio/alto","Comparan precios: comunicar valor"],
   ["Poder de proveedores","Medio","Gestionar red de materiales y transformación"],
   ["Nuevos competidores","Media","Sostener la diferenciación en diseño y cadena de valor"],
   ["Sustitutos","Alta","Muchos bolsos satisfacen la misma función"],
   ["Rivalidad","Media/alta","Marcas tradicionales y sustentables"]],"small tight"),
 "Ciclo de vida, BCG, FCB, Porter, Ansoff y FODA")

page("ETAPA 2 · ESTRATEGIAS","Estrategias definidas",
 cards([
  ("GENERAL DE MERCADO","<b>Especialista con diferenciación.</b> Concentrarse en el segmento definido y ofrecer diseño, material recuperado, funcionalidad, durabilidad, identidad y trazabilidad."),
  ("DE CRECIMIENTO","<b>Intensivo por penetración de mercado.</b> Reforzar la comunicación del origen, un sistema de trazabilidad comprensible, contenidos digitales y claridad sobre producto y proceso."),
  ("COMPETITIVA","<b>Especialista.</b> No hay datos para clasificar a la marca como líder, retador o seguidor; se construye una posición fuerte en un nicho."),
 ],3) +
 table(["Objetivo","Acción","Indicador sugerido"],[
  ["Hacer visible el diferencial","Trazabilidad por etiqueta/QR y contenidos del proceso","Interacciones, consultas, uso del QR"],
  ["Aumentar valor percibido","Comunicar diseño, función, durabilidad e impacto en conjunto","Conversión; tiempo en páginas de producto"],
  ["Profundizar el nicho","Campañas al perfil urbano económicamente activo","Alcance cualificado; ventas del segmento"],
  ["Validar decisiones","Recolectar ventas y datos de mercado por línea","Información para futuras matrices BCG"]],"small"),
 "Lineamientos de implementación")

# ---------- Etapa 3
page("ETAPA 3 · MARKETING OPERATIVO","Identidad de marca",
 '<div class="two"><div>'
 + cards([("MISIÓN","Transformar materiales industriales descartados en accesorios funcionales, durables y diferenciados, extendiendo su vida útil y generando valor ambiental, social y económico."),
          ("VISIÓN","Fortalecer el reconocimiento dentro del mercado argentino de diseño sustentable, con recuperación, diseño y trazabilidad como base de confianza."),
          ("VALORES","Sustentabilidad · diseño · responsabilidad · calidad y durabilidad · transparencia."),
          ("PERSONALIDAD","Consciente, creativa, auténtica, urbana y cercana; no solo ambientalista.")],1)
 + '</div><div>'
 '<div class="card"><h4>IDENTIDAD VISUAL (PROPUESTA ACADÉMICA)</h4><p>Logotipo tipográfico «FRACKING DESIGN» en mayúsculas, geométrico y de alto contraste, con símbolo opcional que evoque la trama del material. Títulos en Montserrat SemiBold; textos en Arial Regular. Fotografía de texturas, costuras y uso urbano.</p>'
 '<div class="sw"><span style="background:#202522"></span><span style="background:#42664F"></span><span style="background:#8B928B"></span><span style="background:#F6F5F0;border:1px solid #cfd3cd"></span></div>'
 '<p class="cap">Negro carbón #202522 · Verde petróleo #42664F · Gris industrial #8B928B · Blanco roto #F6F5F0</p></div>'
 + dark("TRAZABILIDAD","Etiquetas o códigos QR para conocer el material recuperado, su procedencia y su transformación: hace tangible el diferencial. No es el manual oficial de la marca.")
 + '</div></div>',
 "Misión, visión, valores, personalidad e identidad visual")

page("ETAPA 3 · MARKETING OPERATIVO","Decisiones de producto",
 cards([
  ("ATRIBUTOS","<b>Calidad:</b> resistencia y durabilidad. <b>Características:</b> transporte, protección y organización. <b>Estilo:</b> los rastros del origen industrial son parte de la estética."),
  ("MARCA","Todos los productos bajo <b>Fracking Design</b>: identidad común y reconocible."),
  ("EMPAQUE","Simple, funcional, con pocos materiales; primer contacto con la historia del producto."),
  ("ETIQUETADO","Información del material y <b>QR de trazabilidad</b> que amplía el contenido sin saturar la etiqueta."),
  ("SERVICIOS DE APOYO","Información clara antes de comprar; canales de consulta sobre uso, mantenimiento y cuidado."),
  ("LÍNEA","<b>Relleno de línea:</b> variantes cercanas (organizadores, complementos) sujetas a validación, antes que extender a categorías alejadas."),
 ],3) +
 table(["Mezcla","Aplicación (descripción aproximada, no es inventario)"],[
  ["Ancho","~3 líneas: mochilas, bolsos y accesorios pequeños"],
  ["Extensión","Ejemplo analítico: mochila urbana, bolso de mano, cruzado, riñonera, accesorios (5 tipos ilustrativos)"],
  ["Profundidad","Variantes de tamaño, formato o terminación; no verificable sin catálogo"],
  ["Consistencia","Alta: materiales recuperados, diseño funcional, identidad urbana"]],"small"),
 "Atributos, marca, empaque, etiquetado, servicios, línea y mezcla")

page("ETAPA 3 · MARKETING OPERATIVO","Decisiones de precio",
 '<div class="two"><div>'
 + cards([("FIJACIÓN","Costos (piso de precio) <b>y</b> valor percibido, con énfasis en el valor para el cliente."),
          ("SEIS FACTORES","Costos · cliente · competencia · situación financiera · segmentación · reacción competitiva."),
          ("LÍMITE DE LOS DATOS","Sin información financiera no se fija un volumen de equilibrio ni un precio concreto.")],1)
 + '</div><div>'
 + dark("ESTRATEGIA: PRECIOS NEUTROS","Orientados al valor percibido. Sin penetración por precio bajo (debilitaría el valor percibido) ni descreme (sin evidencia que lo justifique). Un precio relativamente alto es neutro si el consumidor lo percibe justo.")
 + '<div class="card"><h4>COHERENCIA CON EL POSICIONAMIENTO</h4><p>Los costos marcan el mínimo viable; la percepción del consumidor, el máximo que pagaría. La comunicación y la trazabilidad por QR muestran qué recibe a cambio: diseño, funcionalidad, durabilidad, material recuperado e impacto.</p></div>'
 '</div></div>',
 "Fijación, factores y estrategia de precios")

# ---------- Etapa 4
page("ETAPA 4 · PLAN DE MARKETING","Plan de marketing: resumen y diagnóstico",
 '<div class="two"><div>'
 + dark("RESUMEN EJECUTIVO","Transformar descartes industriales en accesorios de diseño funcionales, durables y con identidad, para personas de 25 a 40 años, económicamente activas, de centros urbanos argentinos. Especialización y diferenciación, precios neutros por valor percibido, venta digital directa, distribución selectiva y comunicación integrada con predominio pull. Implementación gradual y sujeta a validación.")
 + '<div class="card"><h4>OBJETIVOS</h4><p>Aumentar el conocimiento de marca en el segmento, facilitar la comprensión de los atributos, mejorar el acceso a los canales y fortalecer conversión y satisfacción. Las metas numéricas se fijan con datos de base, presupuesto y capacidad productiva.</p></div>'
 '</div><div>'
 '<div class="card"><h4>CICLO DE VIDA (HIPÓTESIS)</h4><p>Introducción o consolidación temprana: dar a conocer la marca, explicar el material, validar canales y registrar consultas, conversión, recompra y rotación. Con crecimiento sostenido se amplía la distribución; con madurez, se refuerza la fidelización. Se revisa por línea.</p></div>'
 '<div class="card"><h4>ESTRATEGIAS</h4><p>Especialista y diferenciación con penetración de mercado. <b>Producto:</b> calidad, diseño y materialidad. <b>Precio:</b> neutro por valor percibido. <b>Distribución:</b> directo + indirecto corto. <b>Comunicación:</b> pull prioritario con apoyo push.</p></div>'
 '</div></div>',
 "Resumen ejecutivo, objetivos, ciclo de vida y estrategias")

page("ETAPA 4 · DISTRIBUCIÓN","Decisiones de distribución",
 '<div class="flow"><div class="n">Fracking Design</div><div class="a">→</div><div class="n">Tienda online propia</div><div class="a">→</div><div class="n g">Consumidor</div></div>'
 '<div class="flow"><div class="n">Fracking Design</div><div class="a">→</div><div class="n">Comercio minorista seleccionado</div><div class="a">→</div><div class="n g">Consumidor</div></div>'
 + cards([
  ("NIVEL DEL CANAL","<b>Directo</b> (tienda online y contacto digital) e <b>indirecto corto</b> con un único intermediario: tiendas de diseño independiente."),
  ("SISTEMA","<b>Multicanal</b> coordinado: identidad, información y precios consistentes. No es vertical integrado: cooperación mediante fichas, pautas de exhibición y criterios de atención."),
  ("COBERTURA","<b>Selectiva:</b> afinidad con el público, ubicación, calidad de exhibición, conocimiento del producto, condiciones y logística. Inicio en grandes centros urbanos."),
 ],3)
 + '<div class="note"><b>Operación:</b> consolidar venta directa y atención → prueba con pocos comercios afines → ampliar según resultados. Indicadores: conversión digital, pedidos por canal, rotación, cumplimiento de entregas, devoluciones, rentabilidad por canal y satisfacción. Son recomendaciones, no acuerdos existentes.</div>',
 "Canal directo e indirecto corto, multicanal y cobertura selectiva")

page("ETAPA 4 · COMUNICACIÓN","Decisiones de comunicación",
 '<div class="two"><div>'
 + dark("MENSAJE RECTOR","«Fracking Design transforma descartes industriales en productos de diseño funcionales, durables y con identidad.»")
 + cards([("PULL · PRIORITARIO","Interés del consumidor final con contenidos, publicidad digital e información accesible."),
          ("PUSH · COMPLEMENTARIO","Minoristas: fichas técnicas, material de exhibición, fotos y capacitación breve sobre los materiales.")],2)
 + '</div><div>'
 + cards([("HERRAMIENTAS","Contenidos y marketing digital · publicidad digital segmentada · POP (etiquetas y exhibidores) · relaciones públicas · marketing directo con consentimiento · promociones puntuales."),
          ("COMUNICACIÓN INTEGRADA","Mismos criterios de logotipo, paleta, tipografía, fotografía y tono (cercano, auténtico, informativo) en redes, tienda, etiquetas, empaque, atención y comercios."),
          ("EVALUACIÓN","Alcance, interacciones, visitas, consultas, conversión, ventas por campaña y respuesta en punto de venta; accesos al QR si se implementa.")],1)
 + '</div></div>',
 "Estrategia pull/push, herramientas y comunicación integrada")

page("ETAPA 4 · IMPLEMENTACIÓN","Plan de acción, recursos y control",
 table(["Fase","Acción principal","Indicador de seguimiento"],[
  ["1 · Inicial","Organizar fichas de producto, catálogo, contenidos y atención digital","Consultas, visitas, conversión"],
  ["2 · Prueba","Ensayar exhibición en comercios seleccionados y contenidos de campaña","Ventas por canal, respuesta del público"],
  ["3 · Desarrollo","Ajustar y ampliar los canales que demuestren resultados","Rotación, rentabilidad, satisfacción"]]) +
 cards([
  ("RECURSOS Y PRESUPUESTO","Contenidos, fotografía, publicidad digital, material POP, embalaje, logística y gestión comercial. Se define con cotizaciones y recursos disponibles, separando costos fijos, variables y por canal."),
  ("CONTROL","Seguimiento <b>mensual</b> de alcance, visitas, consultas, conversión, ventas, margen por canal, entregas y satisfacción; revisión estratégica <b>trimestral</b>."),
 ],2),
 "Fases, indicadores, presupuesto y seguimiento")

page("CIERRE","Conclusiones",
 '<div class="two"><div>'
 + dark("OPORTUNIDAD","Diferenciarse transformando descartes industriales en accesorios de diseño. El origen sustentable debe acompañarse de funcionalidad, calidad, durabilidad, estética y una relación razonable entre precio y valor.")
 + '<div class="card"><h4>ESTRATEGIA</h4><p>Adultos jóvenes urbanos, económicamente activos, con poder adquisitivo medio a medio-alto. Especialista con diferenciación y penetración de mercado; identidad auténtica, creativa y responsable; precios neutros por valor percibido.</p></div>'
 '</div><div>'
 '<div class="card"><h4>MARKETING OPERATIVO</h4><p>Distribución multicanal (directa + indirecta corta, cobertura selectiva) y comunicación integrada con predominio pull y apoyo push.</p></div>'
 '<div class="card"><h4>PENDIENTE DE VALIDACIÓN</h4><p>Aceptación de la modularidad y disposición a pagar · precios reales de la competencia · ventas y margen por línea · funcionamiento de la trazabilidad por QR · metas numéricas y presupuesto.</p></div>'
 + dark("EN SÍNTESIS","Lograr que el público valore tanto la recuperación de materiales como el diseño y la utilidad concreta de los productos.")
 + '</div></div>',
 "Lo construido y lo que falta validar")

page("REFERENCIAS","Referencias bibliográficas y documentales",
 '<ul class="refs">'
 '<li>Bolsa Red. (s. f.). <i>¿Quiénes somos?</i> https://bolsared.com.ar/quienes-somos/</li>'
 '<li>Cámara Argentina de Comercio Electrónico. (2026). <i>Estudio anual de comercio electrónico 2025.</i> https://cace.org.ar/blogs/news/estudio-anual-de-cace-2025-el-ecommerce-como-canal-estructural-del-consumo-argentino</li>'
 '<li>Fracking Design. (s. f.). <i>Sitio institucional.</i> https://www.frackingdesign.com/</li>'
 '<li>Instituto Nacional de Estadística y Censos. (2026). <i>Índice de precios al consumidor: octubre de 2026.</i> https://www.indec.gob.ar/uploads/informesdeprensa/ipc_11_269335F5BA6B.pdf</li>'
 '<li>Instituto Nacional de Tecnología Industrial. (s. f.). <i>Fracking Design: marroquinería sustentable y de triple impacto.</i> Referencia citada en el trabajo original.</li>'
 '<li>Kotler, P., y Keller, K. L. (2012). <i>Dirección de marketing</i> (14.ª ed.). Pearson.</li>'
 '<li>Ministerio de Ambiente de la Provincia de Buenos Aires. (2025). Información sobre residuos textiles. Referencia citada en el trabajo original.</li>'
 '<li>Schnarch Kirberg, A. (2010). <i>Marketing para emprendedores.</i> Ecoe Ediciones.</li>'
 '<li>Universidad de Palermo. (s. f.). Material de Comercialización I: Investigación de mercado; El marketing; El proceso de marketing; Necesidades; Demandas; La caja negra del consumidor; La relevancia del plan de marketing (materiales de cátedra).</li>'
 '</ul>',
 "")

css = """
@page { size: 297mm 210mm; margin: 0 }
*{box-sizing:border-box;margin:0;padding:0}
:root{--c:#202522;--g:#42664F;--s:#8B928B;--b:#F6F5F0;--t:#E1E8E0}
body{font-family:Arial,'Liberation Sans',sans-serif;color:var(--c);background:var(--b)}
.pg{width:297mm;height:210mm;position:relative;background:var(--b);padding:15mm 18mm 14mm 24mm;page-break-after:always;overflow:hidden}
.pg:before{content:"";position:absolute;left:0;top:0;bottom:0;width:6mm;background:var(--g)}
.hd{display:flex;justify-content:space-between;font-size:9.5pt;font-weight:700;color:var(--g);letter-spacing:.4pt}
h1{font-size:28pt;margin:5mm 0 1.5mm;letter-spacing:-.2pt}
.sub{font-size:13pt;color:var(--g);margin-bottom:6mm}
.card{background:var(--t);border-radius:5mm;padding:5mm 6mm;box-shadow:0 1.2mm 2.4mm rgba(32,37,34,.18);margin-bottom:4mm}
.card h4,.dark h4{font-size:10pt;letter-spacing:.5pt;color:var(--g);margin-bottom:1.6mm}
.card p,.dark p,.note,li,td,th{font-size:12.4pt;line-height:1.42}
.card p+p{margin-top:2mm}
.dark{background:var(--g);color:#fff;border-radius:5mm;padding:4.5mm 6mm;margin:0 0 4mm;box-shadow:0 1.2mm 2.4mm rgba(32,37,34,.25)}
.dark h4{color:#cfe0d3}
.dark p{font-size:13.4pt}
.note{background:#fff;border-left:1.4mm solid var(--g);border-radius:2mm;padding:3.2mm 5mm;margin-bottom:4mm;color:#2b312d}
.grid{display:grid;gap:0 4mm}.c1{grid-template-columns:1fr}.c2{grid-template-columns:1fr 1fr}.c3{grid-template-columns:repeat(3,1fr)}.c4{grid-template-columns:repeat(4,1fr)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:0 6mm}
.two>div>p{font-size:13pt;line-height:1.48;margin-bottom:4mm}
table{width:100%;border-collapse:collapse;margin-bottom:4mm}
th{background:var(--g);color:#fff;text-align:left;padding:2.6mm 3.5mm;font-size:10.5pt;letter-spacing:.4pt}
td{padding:2.6mm 3.5mm;border-bottom:.3mm solid #cfd3cd;background:#fff}
table.small td,table.small th{font-size:11pt;padding:2mm 3mm}
.ft{position:absolute;left:24mm;right:18mm;bottom:8mm;display:flex;justify-content:space-between;font-size:9pt;color:var(--s)}
.flow{display:flex;align-items:center;gap:3mm;margin-bottom:4mm}
.flow .n{background:var(--t);border-radius:4mm;padding:4mm 7mm;font-weight:700;font-size:13pt;box-shadow:0 1mm 2mm rgba(32,37,34,.15)}
.flow .n.g{background:var(--g);color:#fff}.flow .a{font-size:16pt;color:var(--g)}
.sw{display:flex;gap:3mm;margin:2mm 0 1.5mm}.sw span{width:18mm;height:11mm;border-radius:2mm;display:block}
.cap{font-size:10pt!important;color:#555}
.refs{list-style:none}.refs li{margin-bottom:4.2mm;padding-left:5mm;text-indent:-5mm;font-size:12.4pt;word-break:break-word}
table.tight td,table.tight th{padding:1.1mm 3mm;font-size:10.5pt}
.pg .grid .card{margin-bottom:3mm}
/* portadas */
.cover{padding:0}
.cover:before{width:6mm}
.rotulo{position:absolute;left:24mm;right:18mm;top:14mm;border:.4mm solid var(--c);}
.rotulo .top{background:var(--c);color:#fff;padding:3.5mm 5mm;font-size:10.5pt;letter-spacing:.8pt;font-weight:700}
.rotulo table{margin:0}.rotulo td{background:var(--b);font-size:12pt;padding:3mm 5mm;border:.3mm solid var(--c)}
.rotulo td.k{width:48mm;font-weight:700;color:var(--g);font-size:10pt;letter-spacing:.4pt;background:var(--t)}
.ctitle{position:absolute;left:24mm;right:18mm;top:98mm}
.ctitle .e{font-size:11pt;letter-spacing:2pt;font-weight:700;color:var(--g)}
.ctitle h2{font-size:40pt;line-height:1.05;margin:4mm 0 3mm}
.ctitle p{font-size:14pt;color:var(--g)}
.ctitle .box{margin-top:9mm;background:var(--t);border-radius:6mm;padding:7mm 9mm;box-shadow:0 1.5mm 3mm rgba(32,37,34,.18)}
.ctitle .box b{font-size:26pt;display:block;line-height:1.1;margin-bottom:2mm}
.ctitle .box span{font-size:13.5pt;color:var(--g)}
"""

def render():
    out = ['<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Entrega del 100% del PI — Fracking Design</title><style>'+css+'</style></head><body>']
    # Portada institucional
    out.append('''<div class="pg cover">
<div class="rotulo"><div class="top">UNIVERSIDAD DE PALERMO · FACULTAD DE DISEÑO Y COMUNICACIÓN</div>
<table>
<tr><td class="k">ASIGNATURA</td><td>Comercialización I · Marketing para proyectos creativos</td></tr>
<tr><td class="k">PROFESOR</td><td>Martín Picaroni</td></tr>
<tr><td class="k">ALUMNO</td><td>Santiago Martínez Salgado Cotrone</td></tr>
<tr><td class="k">PERÍODO</td><td>Primer cuatrimestre · 2026</td></tr>
<tr><td class="k">TRABAJO</td><td>Proyecto Integrador · Entrega del 100% del PI</td></tr>
</table></div>
<div class="ctitle"><div class="e">PROYECTO INTEGRADOR</div>
<h2>Entrega del 100% del PI</h2><p>Carpeta conceptual · Investigación y plan de marketing</p>
<div class="box"><b>FRACKING DESIGN</b><span>Transformar materiales industriales recuperados en productos con identidad.</span></div></div>
</div>''')
    n = len(pages)
    for i,(sec,title,sub,body) in enumerate(pages, start=2):
        out.append(f'<div class="pg"><div class="hd"><span>FRACKING DESIGN &nbsp;/&nbsp; {sec}</span><span>{i:02d} / {n+1:02d}</span></div>'
                   f'<h1>{title}</h1>' + (f'<div class="sub">{sub}</div>' if sub else '<div class="sub">&nbsp;</div>') +
                   body + f'<div class="ft"><span>Entrega del 100% del PI · Comercialización I · Universidad de Palermo</span><span>Santiago Martínez Salgado Cotrone</span></div></div>')
    out.append('</body></html>')
    open('carpeta.html','w',encoding='utf-8').write('\n'.join(out))
render()
