"""Three text/vector guides only. Never reads or regenerates Session 1 assets."""
import hashlib
import json
import pathlib
import tempfile
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf/module3-sessions-2-4'
OUT.mkdir(parents=True, exist_ok=True)
INK = colors.HexColor('#202b29')
PINK = colors.HexColor('#b5245b')
GREEN = colors.HexColor('#185750')
BODY = ParagraphStyle('body', fontName='Helvetica', fontSize=13, leading=19, textColor=INK, spaceAfter=10)
HEADING = ParagraphStyle('heading', parent=BODY, fontName='Helvetica-Bold', fontSize=19, leading=24, textColor=PINK, spaceAfter=18)
LABEL = ParagraphStyle('label', parent=BODY, fontName='Helvetica-Bold', fontSize=14, leading=20, textColor=GREEN, spaceBefore=12)
SMALL = ParagraphStyle('small', parent=BODY, fontSize=9, leading=13)

def p(text, style=BODY):
    return Paragraph(text, style)

def checklist(items):
    rows = [[p('[ ]'), p(item)] for item in items]
    table = Table(rows, colWidths=[27, 261], hAlign='LEFT')
    table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),4),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),('LINEBELOW',(0,0),(-1,-1),0.4,colors.HexColor('#ead2dc'))]))
    return table

def footer(canvas, doc):
    canvas.setFillColor(GREEN)
    canvas.setFont('Helvetica', 9)
    canvas.drawString(24, 20, 'Warmi Digital | Módulo 3')
    canvas.drawRightString(336, 20, str(doc.page))

guides = []
questions = ['¿Me piden RUC o basta mi DNI?', '¿Cobran comisión por cada venta?', '¿Quién envía el producto?', '¿Quién paga el envío?', '¿Cuándo recibo mi dinero?']
platforms = [
    ('Artesanías del Perú', 'Vitrina de productos artesanales. Revisa cómo participar en el portal oficial.', 'www.artesaniasdelperu.gob.pe'),
    ('Ruraq Maki', 'Arte tradicional, promoción y tiendas. Consulta las condiciones de cada actividad.', 'ruraqmaki.pe'),
    ('Facebook Marketplace', 'Publicaciones y contacto con compradores. Comprueba el acceso de tu cuenta y las reglas.', 'www.facebook.com/marketplace'),
    ('Mercado Libre Perú', 'Venta y opciones de envío. Revisa cargos y condiciones en el simulador oficial.', 'vendedores.mercadolibre.com.pe')
]
guides.append((2, 'elegir-donde-vender', 'Guía para elegir dónde vender por internet', [
    p('Antes de elegir una tienda', LABEL), checklist(questions),
    p('No necesitas estar en todas las tiendas. Empieza por una, aprende cómo funciona y después puedes probar otra.'),
    PageBreak(), p('Comparo mis opciones', HEADING),
    *[item for name, description, url in platforms for item in [p(name, LABEL), p(description), p(url, SMALL)]],
    p('Requisitos, cargos y convocatorias pueden cambiar. Confirma la información en los canales oficiales antes de decidir.', SMALL),
    PageBreak(), p('Mi primera elección', HEADING),
    p('Elijo una plataforma y respondo las cinco preguntas. Si alguna respuesta no está clara, la consulto antes de publicar.'),
    checklist(['Elegí una plataforma para empezar.', 'Revisé requisitos y costos.', 'Sé quién envía y quién paga el envío.', 'Revisé cuándo recibiré mi dinero.']),
    p('Puedo pedir acompañamiento a mi facilitadora.')
]))
guides.append((3, 'cobros-seguros-yape-plin', 'Guía de cobros seguros con Yape y Plin', [
    p('La captura no confirma el pago.', HEADING),
    p('Confirma el dinero dentro de tu propia aplicación.'),
    p('Antes de entregar', LABEL),
    checklist(['Abro yo misma Yape o Plin.', 'Reviso mis movimientos.', 'Confirmo el monto.', 'Recién entrego el producto.']),
    p('Yape y Plin son opciones de cobro. Los pasos y requisitos dependen de la aplicación o entidad que utilizas. Revisa sus canales oficiales.'),
    PageBreak(), p('Reconozco señales de alerta', HEADING),
    checklist(['Me apuran para entregar.', 'La captura llega desde otro número.', 'El monto o la hora no coinciden.', 'Dicen que el dinero aparecerá después.', 'Me piden devolver dinero antes de verificar.']),
    p('Si algo no coincide, me detengo. Verifico en mi aplicación y pido ayuda a mi facilitadora o a mi entidad por sus canales oficiales.'),
    p('Nunca comparto contraseñas ni códigos de verificación.'),
    p('Fuentes oficiales consultadas el 07/10/2026:<br/>www.yape.com.pe/seguridad/estafas<br/>plin.pe', SMALL)
]))
guides.append((4, 'entregar-venta-en-linea', 'Checklist para entregar una venta en línea', [
    p('Antes: acuerdo la entrega', LABEL),
    checklist(['Acuerdo de entrega escrito en el chat.', 'Dirección o punto de entrega confirmado.', 'Fecha acordada.', 'Costo de envío y quién lo paga.']),
    p('Antes de entregar también confirmo el pago dentro de mi propia aplicación.'),
    PageBreak(), p('Durante: protejo y envío', HEADING),
    checklist(['Empaque limpio y producto protegido.', 'Protección frente a humedad o lluvia.', 'Nombre y teléfono cuando corresponda.', 'Foto del paquete.', 'Comprobante y datos de la agencia guardados.']),
    p('El comprobante es mi respaldo del envío.'),
    PageBreak(), p('Después: hago seguimiento', HEADING),
    checklist(['Comparto el seguimiento cuando exista.', 'Aviso la fecha estimada según el envío.', 'Consulto si llegó correctamente.', 'Confirmo la satisfacción de mi clienta.']),
    p('Si algo todavía no me sale, puedo practicarlo nuevamente con mi facilitadora.')
]))
manifest = []
for order, key, title, content in guides:
    filename = f'{key}.pdf'
    file = OUT / filename
    story = [p(f'SESIÓN {order}', SMALL), p(title, HEADING), *content]
    SimpleDocTemplate(str(file), pagesize=(360, 640), leftMargin=30, rightMargin=30, topMargin=28, bottomMargin=42, title=title, author='Warmi Digital', invariant=1).build(story, onFirstPage=footer, onLaterPages=footer)
    data = file.read_bytes()
    manifest.append(dict(order=order, key=key, title=title, filename=filename, bytes=len(data), sha256=hashlib.sha256(data).hexdigest()))
(OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
import fitz
review = pathlib.Path(tempfile.gettempdir()) / 'warmi-m3-journey/pdf-review'
review.mkdir(parents=True, exist_ok=True)
for guide in manifest:
    doc = fitz.open(OUT / guide['filename'])
    assert all(page.get_text().strip() for page in doc)
    for index, page in enumerate(doc):
        page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(review / f"{guide['key']}-{index+1}.png")
    print(guide['key'], len(doc), 'pages', guide['bytes'], 'bytes')
