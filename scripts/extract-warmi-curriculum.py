"""Reproduce the reviewed Canva source; requires pymupdf and Pillow.

Usage: python scripts/extract-warmi-curriculum.py <source.pdf>
No database or Cloudinary writes. The source hash prevents using another edition.
"""
import hashlib
import io
import json
import pathlib
import re
import sys
import uuid

import pymupdf
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE_HASH = "31744df4404ad0d302f57d99fb059f31f031cec8c6d98789fddf80460bad7262"
NAMESPACE = uuid.UUID("93dc7355-d746-4acd-87df-29f71d16a955")
# Page labels are transcribed from the source, not inferred instructions.
PAGE_TITLES = {
    8: "Gmail y documentos adjuntos", 9: "Crear una cuenta Gmail desde el celular",
    10: "Enviar un documento adjunto en Gmail", 11: "Instituciones y enlaces oficiales",
    12: "Plataforma Artesanías del Perú: registro", 13: "Requisitos generales previos",
    14: "Antes de postular prepara estos 3 requisitos", 15: "Ingresar a una reunión por Zoom",
    16: "Ingresar a una reunión por Google Meet", 17: "Logros del módulo 1",
    18: "Conociendo las oportunidades", 19: "Ferias: diferencias y beneficios",
    20: "Concursos: diferencias y beneficios", 21: "Capacitaciones: ejemplos del PDF",
    22: "Warmi Digital: oportunidades", 23: "Aprende a leer una convocatoria",
    24: "Somos Artesanía: requisitos, bases y cronograma", 25: "Convertir una foto a PDF",
    26: "Tomar una buena foto de mi producto", 27: "Llenar un formulario paso a paso",
    28: "La ficha de María para Somos Artesanía", 29: "Simulación de postulación de María",
    30: "Logros del módulo 2", 31: "WhatsApp o WhatsApp Business",
    32: "Configurar WhatsApp Business", 33: "Crea un catálogo básico",
    34: "Catálogo básico: guía paso a paso", 35: "Estados de WhatsApp",
    36: "Mi primer estado: cinco pasos", 37: "Crear mi cuenta en Facebook: pasos 1 a 6",
    38: "Facebook: pasos 7 a 9 y seguridad", 39: "Vender en Facebook Marketplace",
    40: "Marketplace: pasos 1 a 4", 41: "Marketplace: pasos 5 a 8",
    42: "Estados o Facebook: cuándo uso cada uno", 43: "Conociendo tiendas virtuales que venden",
    44: "Aprende a cobrar desde el celular: Yape y Plin", 45: "Cuidado con los pagos falsos",
    46: "Simulación de primera venta en línea: entrega", 47: "Logros del módulo 3",
    48: "Mi producto, mi historia, mi cultura", 49: "Cómo describir el producto y su historia",
    50: "La experiencia de mi cliente", 51: "Formas de destacar el valor cultural o el producto",
    52: "El valor de la artesanía: patrimonio cultural", 53: "Simulación de venta sin ayuda",
    54: "Logros del módulo 4", 59: "Crear cuenta Gmail: guía visual de nueve pasos",
    60: "Crear cuenta Gmail y enviar adjuntos: práctica guiada"
}
SESSION_SPECS = [
    (1, 1, "Crear cuenta Gmail y enviar correos con adjuntos", [8, 9, 10, 59, 60]),
    (1, 2, "Instituciones que acompañan a las artesanas y enlaces útiles para tu formación", [11, 12]),
    (1, 3, "Requisitos generales previos", [13, 14]),
    (1, 4, "Acceder a capacitaciones virtuales (Zoom y Google Meet)", [15, 16, 17]),
    (2, 1, "Conociendo las oportunidades", [18, 19, 20, 21, 22]),
    (2, 2, "Aprendiendo a postular: requisitos y documentos", [23, 24]),
    (2, 3, "Preparando los documentos y llenando formularios", [25, 26, 27, 28]),
    (2, 4, "Simulación de postulación", [29, 30]),
    (3, 1, "Publica tu arte en redes", list(range(31, 43))),
    (3, 2, "Llega a nuevos clientes / Conociendo tiendas virtuales que venden", [43]),
    (3, 3, "Aprende a cobrar desde el celular", [44, 45]),
    (3, 4, "Simulación de primera venta en línea", [46, 47]),
    (4, 1, "Mi producto, mi historia, mi cultura", [48, 49]),
    (4, 2, "Cómo presentar mi producto", [50, 51]),
    (4, 3, "El valor de la artesanía", [52]),
    (4, 4, "Simulación de venta sin ayuda", [53, 54]),
]
# Text contained in raster graphics: visually checked against the source pages.
RASTER_TEXT = {
    18: "Concursos: Somos Artesanía; Ruraq Maki, hecho a mano; Premio Nacional Amautas de la Artesanía Peruana 2026.\nFerias: Feria Solidaria - Artesanías del Perú; Feria Nacional de Nuestras Manos; ferias regionales y/o distritales.\nLas ferias son espacios donde puedes mostrar tus productos y conectarte con más personas.",
    19: "Ferias\nExhibes tus productos al público. Puedes vender directamente. Conoces clientes y otros artesanos. Sirven para promocionar tu negocio.\n¿Qué me beneficia? Más ventas y nuevos clientes; das a conocer tu marca; creas contactos y oportunidades.",
    20: "Concursos\nCompites con tu producto o talento. El jurado evalúa y selecciona. Puedes ganar premios o reconocimientos. Tienen bases y fechas de inscripción.\n¿Qué me beneficia? Reconocimiento a tu trabajo; premios o apoyo para crecer; más visibilidad para tu artesanía.",
    34: "1. Ve al catálogo.\n2. Haz clic en Añadir un artículo nuevo.\n3. Añade detalles del producto y guárdalos.\n4. Usa las colecciones para organizar los artículos de tu catálogo.",
    37: "Para mostrar mis productos y llegar a más clientes desde mi celular.\nAntes de empezar necesito: mi celular con internet; mi número de celular, que pueda recibir mensajes; unos 20 minutos, con calma.\nSi algo no sale a la primera, no pasa nada. Vuelve atrás y vuelve a intentar. Nada se rompe.\n\nEncuentro la aplicación\n1. Abro la tienda de aplicaciones de mi celular. Arriba hay una barra para buscar. Toco ahí y escribo la palabra Facebook.\n2. Toco el botón Instalar. Espero a que termine de descargar. Puede tardar unos minutos si la señal está lenta.\n3. Abro la aplicación y toco «Crear cuenta nueva». Cuidado: el otro botón dice «Iniciar sesión» y es para quien ya tiene cuenta. Yo toco el primero.\n\nEscribo mis datos\n4. Escribo mi nombre y mi apellido tal como aparecen en mi DNI. Este es el nombre que van a ver mis clientes, así que conviene el verdadero.\n5. Escribo mi fecha de nacimiento: día, mes y año, igual que en mi DNI. Después me pregunta mi género: elijo la opción que me corresponde.\n6. Escribo mi número de celular, el que uso todos los días. A este número va a llegar un mensaje con un código, así que tiene que estar conmigo.",
    38: "Cierro mi registro\n7. Creo mi contraseña. Al menos 8 letras o números. En la hoja 5 te explico cómo armar una buena. Luego toco Registrarte.\n8. Escribo el código que me llega por mensaje. Salgo un momento a mis mensajes, veo el número y vuelvo a escribirlo. Si no llega, espero un minuto y pido que lo manden otra vez.\n9. Pongo mi foto de perfil. Puedo poner una foto mía o de mis productos. Si prefiero, toco «Ahora no» y lo hago después. Mi cuenta ya está creada.\n\nMi contraseña y mi seguridad\nUna contraseña que recuerdo y nadie adivina. Junto tres palabras que solo yo relaciono, sin espacios. Es más segura que una palabra corta, y mucho más fácil de recordar. Ejemplo del PDF: lana + telar + rojo. Elijo mis propias palabras, no estas. Yo no uso mi nombre, mi fecha de nacimiento ni mi número de DNI: eso lo sabe cualquiera.\nNunca doy mi contraseña ni mi código a nadie: ni por mensaje, ni por llamada, ni a alguien que dice trabajar en Facebook. Facebook nunca pide eso. Quien lo pide, me quiere robar la cuenta.\nPongo clave a mi celular. Si presto mi celular o lo pierdo, esa clave protege mi cuenta y mis conversaciones con clientes.\nSi algo se ve raro, pregunto antes de tocar. Un mensaje que promete premios, o que apura o que pide dinero por adelantado casi siempre es falso. Le pregunto a mi facilitadora o a mi promotora.\n\n¿Y ahora qué hago?\n1. Completo mi perfil: pongo una foto donde se me vea bien y escribo en una línea qué hago: «Tejo chalinas y fajas en San Miguel, Cajamarca».\n2. Publico mi primer producto: una foto con luz de día, qué es y de qué está hecho, para qué sirve, quién lo hizo y dónde, y el precio.\n3. Lo comparto por WhatsApp: mis primeras clientas son las personas que ya me conocen. Les mando la publicación y les pido que la compartan.\nLo que vendo no es solo un tejido. Es una forma de trabajar que aprendí de mi comunidad. Cuando lo cuento, mi producto vale más.",
    52: "Reconocido como Patrimonio Cultural de la Nación.\nResolución Viceministerial N.º 211-2019-VMPCIC-MC, Lima, 15 de noviembre de 2019.\nArtículo 1.- Declarar como Patrimonio Cultural de la Nación, a los Conocimientos, técnicas y prácticas asociados a la producción de tejidos en qallwa en la provincia de San Miguel, departamento de Cajamarca, en tanto son resultado de sofisticadas técnicas de creación textil además de ser testimonio de antiguos y vigentes intercambios culturales y económicos entre la población de San Miguel y distintas poblaciones del norte del país, constituyendo hoy un símbolo de la identidad cultural de esta provincia de Cajamarca.",
}

# Reading order for columns, numbered diagrams and chat bubbles. Same source wording.
RASTER_TEXT.update({
    25: "Muchas convocatorias solo aceptan documentos en PDF. No necesito computadora: mi propio celular lo hace.\n\n1. Abro la foto. En mi galería, busco la foto que voy a enviar.\n2. Toco los tres puntos. Y elijo la opción «Imprimir». Ahí está el PDF escondido.\n3. Elijo «Guardar como PDF». Aparece arriba, donde dice el nombre de la impresora.\n4. Guardo con nombre claro. Por ejemplo: «DNI María Quispe». Así lo encuentro después.",
    26: "La foto es lo primero que ven mis clientes y los jurados. Con mi celular es suficiente.\n\nLuz natural: cerca de la ventana o afuera, de día. Nunca con flash.\nFondo simple: una tela lisa o una pared. Que se vea el tejido, no el desorden.\nVarias tomas: de frente, de cerca y puesto. Tres fotos convencen más que una.\nPulso firme: apoyo el codo antes de disparar. Foto movida, foto que no vende.",
    27: "1. Leo todo el formulario antes de escribir. Así sé qué me van a pedir y no me apuro al final.\n2. Junto mis documentos primero. DNI, mi constancia del RNA y las fotos de mi producto ya en PDF.\n3. Escribo mis datos igual que en mi DNI. Nombres completos, sin apodos y sin abreviar nada.\n4. Lleno primero los campos obligatorios. Son los que tienen asterisco (*). Sin ellos no se puede enviar.\n5. Reviso y guardo una copia antes de enviar. Le tomo captura al formulario enviado: esa foto es mi comprobante.",
    28: "Simulación: la ficha de María para «Somos Artesanía».\nConcurso de Mincetur. Requisito: estar inscrita en el RNA. Modalidad «Fortalece tu taller»: S/ 5 000.\n\n1. Nombre del producto. ¿Cómo lo lleno? Digo qué es y con qué técnica. Nada de «bonito» ni «lindo». Lo que escribió María: Chal de lana de oveja tejido en qallwa.\n2. Materiales. Nombro la fibra y el tinte. Si es natural, lo digo. María: Lana de oveja hilada a mano, teñida con cochinilla.\n3. Medidas. Mido con cinta y lo anoto en metros o centímetros. María: 1.80 m de largo por 0.60 m de ancho.\n4. Tiempo de elaboración. Cuento los días reales de trabajo, no las horas sueltas. María: 12 días de trabajo.\n5. Precio. Sumo materiales + mis días de trabajo. No adivino. María: S/ 180.\n6. Historia breve. Respondo: ¿quién me enseñó y de dónde es la técnica? María: Tejo con la técnica que me enseñó mi abuela en San Miguel, Cajamarca.",
    30: "Al terminar el Módulo 2, yo puedo…\n\nReconocer una oportunidad: distingo un concurso de una feria y sé cuál me conviene según lo que tejo.\nLeer una convocatoria: encuentro quién convoca, qué pide, hasta cuándo hay plazo y qué me ofrece.\nPreparar mis documentos: tomo buenas fotos de mi producto y las convierto en PDF desde mi celular.\nLlenar mi postulación: completo el formulario y la ficha de mi producto sin depender de nadie.",
    36: "Paso 1: Abro WhatsApp y toco «Actualizaciones», abajo.\nPaso 2: Toco el círculo «Mi estado», con el signo +.\nPaso 3: Elijo la foto de mi producto.\nPaso 4: Escribo el precio y cómo pedirlo.\nPaso 5: Toco el botón verde para enviar.\n\nRECUERDA: Tu estado se ve durante 24 horas.",
    40: "Paso 1: Abro Facebook en mi celular y toco el menú de las tres rayitas, abajo a la derecha.\nPaso 2: En la lista busco Marketplace y lo toco. Es el ícono de la tiendita.\nPaso 3: Dentro de Marketplace toco «Vender» o «Tus publicaciones».\nPaso 4: Toco «Crear publicación» y elijo «Un artículo», porque vendo un producto.",
    41: "Paso 5: Toco «Agregar fotos» y subo fotos claras de mi tejido, con buena luz.\nPaso 6: Lleno la ficha del producto: título, precio, categoría, estado y descripción.\nPaso 7: Reviso precio y descripción: así es como lo va a ver mi clienta.\nPaso 8: Toco «Publicar». Mi producto queda en Marketplace y aparece en mis publicaciones.",
    42: "Estados de WhatsApp: para quien ya me conoce.\nLo ven solo mis contactos guardados. Dura 24 horas y después desaparece. Gasta pocos datos, sube con señal débil. No necesito crear ninguna cuenta nueva.\nLO USO PARA: Avisar que tengo producto nuevo, mostrar cómo tejo, recordar que sigo vendiendo.\n\nFacebook: para llegar a gente nueva.\nLo puede ver cualquier persona. Queda publicado y se puede buscar después. Gasta más datos, necesita mejor señal. Creo mi cuenta una sola vez.\nLO USO PARA: Que me encuentren clientas de otras provincias y de la ciudad.\n\nUso los dos: estados casi todos los días, Facebook cuando tengo producto listo para vender.",
    43: "Otras tiendas donde puedo vender\n\nArtesanías del Perú (Mincetur): Es la que vemos en pantalla: la vitrina del Estado para artesanas, ligada al RNA.\nRuraq maki, hecho a mano: Tienda del Ministerio de Cultura. Se entra por convocatoria y valora el arte tradicional.\nFacebook Marketplace: Gratis y desde el celular. Es por donde empezamos: sin comisión y con trato directo.\nMercado Libre Perú: La más grande del país. Llega a muchísima gente, pero cobra comisión por cada venta.\n\nAntes de entrar a una tienda virtual, pregunto:\n¿Me piden RUC o basta mi DNI?\n¿Cobran comisión por cada venta?\n¿Quién envía el producto y quién paga el envío?\n¿Cuándo y cómo me llega mi dinero?\n\nNo tengo que estar en todas. Empiezo por una, aprendo cómo funciona y recién sumo otra.",
    45: "La captura no es el pago. El pago es la notificación en mi aplicación.\n\nANTES DE ENTREGAR, REVISO\n1. Abro yo misma mi aplicación de Yape o Plin.\n2. Busco el pago en mi lista de movimientos.\n3. Si no aparece ahí, no me han pagado.\n\nSEÑALES DE ALERTA\nMe apura para que entregue de una vez.\nLa captura llega desde otro número.\nEl monto o la hora no coinciden.\nMe dice que el dinero «llegará mañana».\nPide que le devuelva un vuelto antes de que yo vea el pago.\n\nPrimero el dinero en mi cuenta. Después entrego el producto.",
    46: "La venta no termina cuando me pagan. Termina cuando mi clienta recibe lo que esperaba.\n\n1. Acuerdo antes de cobrar. Dónde lo recibe, qué día llega y quién paga el envío. Lo escribo en el chat para que quede.\n2. Empaco con cuidado. Bolsa limpia, el tejido doblado y protegido de la lluvia. Adentro pongo un papel con mi nombre y mi WhatsApp.\n3. Envío y guardo la prueba. Le tomo foto al paquete y al recibo de la agencia. Si algo se pierde, esa foto es mi respaldo.\n4. Aviso y me despido bien. Le paso el número de seguimiento y le escribo cuando debe llegar. Le pregunto si le gustó.\n\nUna clienta contenta vuelve a comprar y me recomienda. Entregar bien vale tanto como tejer bien.",
    47: "Estos son los logros que la facilitadora revisa con cada artesana antes de pasar al Módulo 4.\n\nPublico en mis estados: subo la foto de mi producto con su precio, y sé que se ve durante 24 horas.\nPublico en Facebook: tengo mi cuenta y publiqué al menos un producto con foto, descripción y precio.\nCobro con seguridad: uso Yape o Plin, y verifico el pago en mi propia aplicación antes de entregar.\nEntrego y hago seguimiento: acuerdo la entrega, empaco, guardo el comprobante y aviso a mi clienta.\n\nSi algo de esto todavía no me sale, lo practico con mi promotora antes de seguir. Ninguna avanza sola.",
    49: "Una foto sola no vende. Lo que hace que alguien valore y pague más por el producto es saber qué es, quién lo hizo y cuánto tiempo me tomó.\n\n1. ¿Qué es y de qué está hecho?\n2. ¿Quién lo hizo y dónde?\n3. ¿Cuánto tiempo se demoró en la elaboración?\n\nEJEMPLO DE DESCRIPCIÓN\nChalina tejida en qallwa. Elaborada a mano por Maribel Quispe con lana de oveja de San Miguel, Cajamarca. Tres días de trabajo dedicado, S/ 100.\n\nLlaveros tejidos a mano: S/. 25.00. Cojín decorativo: S/. 70.00. Canasta de fibra natural: S/. 100.00. Muñecas artesanales: S/. 50.00.",
    51: "Formas de destacar el valor cultural o el producto\n\nDestacar el valor cultural y después el producto en la siguiente fotografía.\nTeodora Chomba: «Aprendí a convertir mis tejidos en una oportunidad para mejorar los ingresos de mi familia y dar valor a nuestra cultura.»\nCamino de mesa tejido: S/. 120.00.\n\nDestacar el producto, establecer el precio y nombre del producto.\nMaribel Quispe: «Cada bordado representa nuestra historia, pero también una nueva posibilidad de crecimiento para nosotras.»\nBolso Artesanal: S/. 80.00.",
    53: "Te mostramos un ejemplo de cómo podrías realizar una venta por WhatsApp o redes sociales.\n\n1. Presenta tu producto\nBolso Artesanal — S/. 80.00.\nArtesana: Hola, soy Rosa de San Miguel. Te presento el bolso artesanal tejido a mano con lana de alpaca, con diseños inspirados en nuestra cultura. Es resistente, ligera y perfecta para el día a día.\n\n2. Responde consultas\nCliente: Qué lindo. ¿De qué material es?, ¿Tienes colores?\nArtesana: Hola, gracias por tu interés 🙂 Está hecha de lana de alpaca y es resistente. Sí, tengo otros colores: rojo, azul y beige. Te puedo enviar más fotos si deseas.\n\n3. Informar sobre el precio y características\nArtesana: El precio es de S/. 85.00 soles. Aceptamos Yape, Plin y efectivo. El envío es a todo Cajamarca mediante Shalom courier. Costo del envío es adicional de 8 a 10 soles. Tiempo de demora: 3 a 5 días.\n\n4. Cierra la venta\nCliente: Perfecto, me encanta. Te transfiero ahora, ¿puedes brindarme el número de Yape?\nArtesana: Sí, claro, este es mi número 999888777.\nCliente: Listo, ya lo pagué, te envío la captura.\nArtesana: Gracias, ya verifiqué el pago, el día de mañana te envío tu cartera y te comparto el número de seguimiento. Muchas gracias por tu compra 🙂\n\nRecuerda: La presentación del producto es importante. Toma fotos con buena iluminación. Destaca lo que hace especial a tu producto. Sé amable y responde los mensajes. ¡Confía en tu talento, tú puedes!",
})

def stable(name):
    return str(uuid.uuid5(NAMESPACE, name))

def body_text(page, full=False):
    lines = []
    for block in sorted(page.get_text("blocks"), key=lambda b: (b[1], b[0])):
        if (not full and (block[1] < 135 or block[3] > 707)) or len(block) < 5 or not isinstance(block[4], str):
            continue
        for line in block[4].splitlines():
            line = re.sub(r"\s+", " ", line).strip()
            if full and line in ["(Paralelo al uso de la plataforma)", "TALLERES PRESENCIALES"]:
                continue
            if line and not re.match(r"^(Módulo [1-4]:?|Sesión [1-4]|APRENDER PARA CRECER)$", line):
                lines.append(line)
    return "\n".join(lines)

def main():
    source = pathlib.Path(sys.argv[1])
    if hashlib.sha256(source.read_bytes()).hexdigest() != SOURCE_HASH:
        raise SystemExit("Source PDF differs from the reviewed edition; inspect it before exporting.")
    doc = pymupdf.open(source)
    assets = ROOT / "public/images/learning/modules"
    assets.mkdir(parents=True, exist_ok=True)
    sessions = []
    overrides = {(1, 1): "699a22ef-7d43-4133-8710-96b33284396a", (3, 1): "8a8e449b-76a6-4a6d-9693-6238f75092bc", (3, 2): "9bd401d6-5c80-4099-aa7b-e1b90b62d9b7"}
    for module, order, title, pages in SESSION_SPECS:
        guides = []
        sections = []
        for number in pages:
            page = doc[number - 1]
            # Keep the source body, omit the repeated header/contact footer.
            clip = pymupdf.Rect(20, 135, 1420, 707) if number < 55 else page.rect
            pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), clip=clip, alpha=False)
            image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            filename = f"module-{module}-session-{order}-page-{number:02}.webp"
            image.save(assets / filename, "WEBP", quality=91, method=6)
            guides.append({"id": stable(filename), "src": f"/images/learning/modules/{filename}", "page": number, "title": PAGE_TITLES[number], "alt": f"Guía original: {PAGE_TITLES[number]}. Página {number} del currículo Warmi Digital.", "width": image.width, "height": image.height, "size": (assets / filename).stat().st_size})
            text = RASTER_TEXT.get(number, body_text(page, full=number >= 55))
            sections.append({"page": number, "title": PAGE_TITLES[number], "text": text})
        session_id = overrides.get((module, order), stable(f"module-{module}-session-{order}"))
        sessions.append({"id": session_id, "module": module, "order": order, "status": "published", "title": f"Sesión {order}: {title}", "slug": f"warmi-curriculum-module-{module}-session-{order}", "pages": pages, "sections": sections, "guides": guides, "content": "\n\n".join(s["title"] + "\n" + s["text"] for s in sections)})
    # Covers are crops of the reviewed source; no generated or stock substitutions.
    covers = [(1, 9, (940, 245, 1310, 695)), (2, 18, (50, 265, 655, 700)), (3, 34, (135, 275, 1285, 680)), (4, 48, (679, 216, 1359, 657))]
    for module, number, bounds in covers:
        pix = doc[number - 1].get_pixmap(matrix=pymupdf.Matrix(2, 2), clip=pymupdf.Rect(bounds), alpha=False)
        image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        image.save(assets / f"module-{module}-cover.webp", "WEBP", quality=91, method=6)
    result = {"source": {"filename": source.name, "sha256": SOURCE_HASH, "pageCount": len(doc)}, "sessions": sessions}
    (ROOT / "shared/learning/curriculum.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    publication = [{"id": session["id"], "module": session["module"], "status": session["status"], "hasContent": bool(session["content"].strip() and session["guides"])} for session in sessions]
    (ROOT / "shared/learning/publication.json").write_text(json.dumps(publication, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"sessions": len(sessions), "guides": sum(len(s['guides']) for s in sessions), "bytes": sum(p.stat().st_size for p in assets.glob('*.webp'))}))

if __name__ == "__main__":
    main()
