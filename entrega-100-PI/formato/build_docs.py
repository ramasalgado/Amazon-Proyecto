import re,html,json,sys
from conv import blocks_for
def esc(s): return html.escape(s,quote=False)
def tbl(rows,head=True,cls=''):
    h=f'<table class="{cls}">'
    for i,r in enumerate(rows):
        tag='th' if (head and i==0) else 'td'
        h+='<tr>'+''.join(f'<{tag}>{esc(c or "").replace(chr(10),"<br>")}</{tag}>' for c in r)+'</tr>'
    return h+'</table>'
REFS={
1:["Cámara Argentina de Comercio Electrónico. (2026). <i>Estudio anual de comercio electrónico 2025.</i> https://cace.org.ar/blogs/news/estudio-anual-de-cace-2025-el-ecommerce-como-canal-estructural-del-consumo-argentino",
"Instituto Nacional de Estadística y Censos. (2026). <i>Índice de precios al consumidor: octubre de 2026.</i> https://www.indec.gob.ar/uploads/informesdeprensa/ipc_11_269335F5BA6B.pdf",
"Bolsa Red. (s. f.). <i>¿Quiénes somos?</i> https://bolsared.com.ar/quienes-somos/",
"Fracking Design. (s. f.). <i>Sitio institucional.</i> https://www.frackingdesign.com/",
"Instituto Nacional de Tecnología Industrial. (s. f.). <i>Fracking Design: marroquinería sustentable y de triple impacto.</i> Referencia citada en el trabajo original.",
"Ministerio de Ambiente de la Provincia de Buenos Aires. (2025). Información sobre residuos textiles. Referencia citada en el trabajo original; corroborar documento específico antes de la entrega.",
"Universidad de Palermo. (s. f.). Material de Comercialización I: Investigación de mercado; El marketing; El proceso de marketing; Necesidades; Demandas; La caja negra del consumidor (materiales de cátedra)."],
3:["Kotler, P. y Keller, K. (2012). <i>Dirección de Marketing.</i> Pearson Educación. https://www.pearsonenespanol.com/mexico/educacion-superior/kotler/direccion-de-marketing-14e?utm_source",
"Schnarch Kirberg, A. (2010). <i>Marketing para emprendedores.</i> Ecoe Ediciones. https://www.ecoeediciones.com/wp-content/uploads/2015/09/9789586486705-9789586489249-Marketing-para-emprendedores-contenido.pdf?srsltid=AfmBOorXz8htos5NDvO6SZN6k2v0fB7no-5NihwxvJv8foguxH5vI0VE&utm_source"],
4:["Kotler, P., y Keller, K. L. (2012). <i>Dirección de marketing</i> (14.ª ed.). Pearson.",
"Schnarch Kirberg, A. (2010). <i>Marketing para emprendedores.</i> Ecoe Ediciones.",
"Material de cátedra: “La relevancia del plan de marketing” (referido en la devolución docente; no adjuntado a esta entrega)."]}
REFHEAD={1:'Referencias bibliográficas',3:'Biografía',4:'12. Referencias bibliográficas'}
T2_REQ=[["Requisito","Aplicación al segmento"],["Medible","Puede describirse mediante edad, ubicación, ocupación e ingresos, complementados por variables psicográficas."],["Accesible","Puede alcanzarse mediante e-commerce, redes sociales, espacios de diseño y canales digitales."],["Sustancial","No se restringe a un grupo extremadamente pequeño y reúne consumidores con capacidad de compra."],["Diferenciable","Combina capacidad económica con preferencias por diseño, funcionalidad y consumo responsable."],["Aplicable","Permite diseñar acciones específicas de producto, comunicación y comercialización."]]
T2_EVAL=[["Criterio","Aplicación","Estado"],["Importante","Aporta diseño, funcionalidad e información sobre origen e impacto.","Sólido"],["Distintiva","El origen industrial recuperado y su relato permiten diferenciar la propuesta.","Sólido"],["Superior","Requiere comparación sistemática con competidores para afirmarlo.","A validar"],["Comunicable","Puede explicarse mediante etiquetas, QR, contenidos y punto de venta.","Sólido"],["Exclusiva","Otros actores pueden trabajar con recuperación de materiales.","Parcial"],["Costeable","Depende del poder adquisitivo y del valor percibido por el segmento.","A validar"],["Redituable","Debe contrastarse con costos, margen y respuesta comercial.","A validar"]]
T2_EVAL_P="La evaluación muestra que la diferencia es especialmente fuerte en importancia, distinción y comunicación, mientras que superioridad, costeabilidad y rentabilidad necesitan evidencia comercial adicional. Por eso se plantea como ventaja competitiva propuesta y no como superioridad absoluta ya demostrada."
T2_LIN=[["Objetivo","Acción","Indicador sugerido"],["Hacer visible el diferencial","Trazabilidad mediante etiqueta/QR y contenidos del proceso.","Interacciones con contenido; consultas; uso del QR."],["Aumentar valor percibido","Comunicar diseño, función, durabilidad e impacto en conjunto.","Conversión; tiempo en páginas de producto."],["Profundizar el nicho","Campañas dirigidas al perfil urbano económicamente activo.","Alcance cualificado; ventas del segmento."],["Validar decisiones","Recolectar datos de ventas y mercado por línea.","Información suficiente para futuras matrices BCG."]]
T3_MEZ=[["Dimensión","Aplicación a Fracking Design"],["Ancho","Aproximadamente tres líneas de referencia: mochilas, bolsos y accesorios pequeños de marroquinería. Es una agrupación analítica, no un catálogo verificado."],["Extensión (longitud)","La suma de los artículos de esas líneas; como ejemplo de análisis: mochila urbana, bolso de mano, bolso cruzado, riñonera y accesorios pequeños (cinco tipos ilustrativos, no cinco SKU comprobados)."],["Profundidad","Variantes de tamaño, formato o terminación dentro de cada tipo de artículo; no es posible establecer cuántas ofrece la marca sin un catálogo actualizado."],["Consistencia","Alta: uso de materiales industriales recuperados, diseño funcional, durabilidad, identidad urbana y público objetivo relacionado."]]
def build(n):
    B=blocks_for(n); out=[]; i=0; skip_refs=False
    sint_done=False
    for b in B:
        t=b['t']
        if skip_refs: continue
        if t=='h':
            txt=b['text']
            if n==1: lvl=2 if b['size']>=13 else 3
            elif n==2: lvl=2 if b['size']>=13.5 else 3
            elif n==3: lvl=2
            else: lvl=3 if (b.get('sub') or re.match(r'^3\.1\.|^(Introducción|Cierre|Enfoque|Evaluación)',txt)) else 2
            if n in REFHEAD and re.match(r'^(\d+\.\s*)?(Referencias bibliogr|Biografía)',txt):
                out.append(f'<h2>{esc(txt)}</h2>')
                out+= [f'<p class="ref">{r}</p>' for r in REFS[n]]
                skip_refs=True; continue
            out.append(f'<h{lvl}>{esc(txt)}</h{lvl}>')
        elif t=='p':
            txt=b['text']
            if n==2 and txt.startswith('Requisito Aplicación'): out.append(tbl(T2_REQ)); continue
            if n==2 and txt.startswith('Criterio Aplicación'): out.append(tbl(T2_EVAL)); out.append(f'<p>{esc(T2_EVAL_P)}</p>'); continue
            if n==2 and txt.startswith('Objetivo Acción'): out.append(tbl(T2_LIN)); continue
            txt=txt.replace('exhibición,actualización','exhibición, actualización').replace('medio- altos','medio-altos')
            lead=b.get('lead','')
            if lead and txt.startswith(lead): out.append(f'<p><b>{esc(lead)}</b>{esc(txt[len(lead):])}</p>')
            else: out.append(f'<p>{esc(txt)}</p>')
        elif t=='li':
            out.append(f'<li>{esc(b["text"])}</li>')
        elif t=='table':
            rows=b['rows']
            if n==2 and rows[0][0]=='Herramienta':
                rows=rows+[]  # merge with next
                b['_merge']=True
            out.append(('TABLE',b))
    # post: group li, tables
    html_out=[]; inlist=False; pending=None
    for x in out:
        if isinstance(x,tuple):
            b=x[1]; rows=b['rows']
            if n==3:
                if rows[0][0]=='Dimensión': html_out.append(tbl(T3_MEZ)); 
                continue
            if n==2:
                if rows[0][0]=='Herramienta': pending=[r[:] for r in rows]; continue
                if pending is not None and rows[0][0]=='' and rows[0][1]=='':
                    pending[-1][2]+=' '+rows[0][2]
                    pending+= [r for r in rows[1:]]
                    html_out.append(tbl([[c for c in r] for r in pending])); pending=None; continue
                if rows[0][0]=='' and rows[0][1] and not rows[0][1].startswith('RACIONAL'): pass
            hd=True
            if n==2 and rows[0][0] in ('FORTALEZAS',): hd=False
            if n==2 and rows[0][0]=='CRECIMIENTO DEL MERCADO': hd=True
            html_out.append(tbl(rows,head=hd)); continue
        if x.startswith('<li>'):
            if not inlist: html_out.append('<ul>'); inlist=True
            html_out.append(x)
        else:
            if inlist: html_out.append('</ul>'); inlist=False
            html_out.append(x)
    if inlist: html_out.append('</ul>')
    return '\n'.join(html_out)
CSS="""
@page{size:A4;margin:25mm 25mm 25mm 25mm}
*{box-sizing:border-box}
body{font-family:Arial,'Liberation Sans',sans-serif;font-size:11pt;line-height:1.5;text-align:justify;color:#000;margin:0}
p{margin:0 0 8pt;text-align:justify}
h2{font-size:14pt;line-height:1.5;margin:14pt 0 4pt;text-align:left;break-after:avoid;color:#1E6FD9}
h3{font-size:12pt;line-height:1.5;margin:10pt 0 3pt;text-align:left;break-after:avoid;color:#1E6FD9}
ul{margin:0 0 8pt;padding-left:18pt}li{margin:0 0 4pt;text-align:justify}
table{width:100%;border-collapse:collapse;margin:6pt 0 10pt;font-size:11pt;line-height:1.3;text-align:left;break-inside:avoid}
th,td{border:.6pt solid #000;padding:3pt 5pt;vertical-align:top;text-align:left}
th{background:#d9d9d9;font-weight:bold}
p.ref{padding-left:14pt;text-indent:-14pt;text-align:left;word-break:break-word}
"""
if __name__=='__main__':
    for n in (1,2,3,4):
        open(f'etapa{n}.html','w',encoding='utf-8').write(f'<!doctype html><html lang="es"><meta charset="utf-8"><style>{CSS}</style><body>{build(n)}</body></html>')
    print('ok')
