"""Build small mobile-readable guides from the supplied slides, never whole slides."""

import argparse
import hashlib
import json
from pathlib import Path
from xml.sax.saxutils import escape

import pymupdf
from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

W, H = 420, 680
PINK, TEAL, INK = "#b5245b", "#24756f", "#202b29"


class Guide:
    def __init__(self, path, title, pages, source):
        self.pdf = canvas.Canvas(str(path), pagesize=(W, H), invariant=1, pageCompression=1)
        self.pdf.setTitle(title)
        self.pdf.setAuthor("Warmi Digital")
        self.title, self.total, self.source, self.number = title, pages, source, 0

    def text(self, text, size=16, color=INK, bold=False, gap=12):
        style = ParagraphStyle("guide", fontName="WarmiBold" if bold else "Warmi", fontSize=size, leading=size * 1.35, textColor=HexColor(color))
        p = Paragraph(escape(text), style)
        _, height = p.wrap(W - 56, H)
        if self.y - height < 55:
            raise ValueError(f"Overflow: {self.title}, page {self.number}: {text}")
        p.drawOn(self.pdf, 28, self.y - height)
        self.y -= height + gap

    def page(self, subtitle):
        if self.number:
            self.pdf.showPage()
        self.number += 1
        self.pdf.setFillColor(HexColor(PINK))
        self.pdf.rect(0, H - 8, W, 8, fill=1, stroke=0)
        self.y = H - 32
        self.text("WARMI DIGITAL / APRENDER PARA CRECER", 10, TEAL, True, 8)
        self.text(self.title, 24, INK, True, 8)
        self.text(subtitle, 14, TEAL, False, 16)
        self.pdf.setStrokeColor(HexColor("#ead2dc"))
        self.pdf.line(28, 44, W - 28, 44)
        self.pdf.setFont("Warmi", 9)
        self.pdf.setFillColor(HexColor(TEAL))
        self.pdf.drawString(28, 28, f"Módulo 3 - Sesión 1 | {self.source}")
        self.pdf.drawRightString(W - 28, 28, f"{self.number}/{self.total}")

    def step(self, number, title, detail):
        self.text(f"{number}. {title}", 18, PINK, True, 6)
        self.text(detail, 16)

    def image(self, image, max_height=230):
        width = min(W - 56, max_height * image.width / image.height)
        height = width * image.height / image.width
        if self.y - height < 55:
            raise ValueError(f"Image overflow: {self.title}, page {self.number}")
        from reportlab.lib.utils import ImageReader
        self.pdf.drawImage(ImageReader(image), (W - width) / 2, self.y - height, width=width, height=height, mask="auto")
        self.y -= height + 12

    def save(self):
        if self.number != self.total:
            raise ValueError("Unexpected page count")
        self.pdf.save()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--output", default="output/pdf/module3-session1")
    args = parser.parse_args()
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    for name, file in [("Warmi", "arial.ttf"), ("WarmiBold", "arialbd.ttf")]:
        pdfmetrics.registerFont(TTFont(name, str(Path("C:/Windows/Fonts") / file)))
    source = pymupdf.open(args.source)
    source_hash = hashlib.sha256(Path(args.source).read_bytes()).hexdigest()
    manifest = []

    def image(xref, crop=None):
        import io
        result = Image.open(io.BytesIO(source.extract_image(xref)["image"])).convert("RGB")
        return result.crop(crop) if crop else result

    def new(key, title, pages, source_pages, mode):
        path = output / f"{key}.pdf"
        manifest.append({"key": key, "filename": path.name, "pages": pages, "sourcePages": source_pages, "mode": mode, "sourceSha256": source_hash})
        return Guide(path, title, pages, "Fuente: pp. " + ", ".join(map(str, source_pages)))

    g = new("whatsapp-o-business", "¿WhatsApp o WhatsApp Business?", 1, [31], "recreated")
    g.page("Elige una herramienta para tu emprendimiento.")
    g.step(1, "WhatsApp: conversar", "Envía mensajes, fotos y estados a tus contactos.")
    g.step(2, "Business: presentar mi negocio", "Añade un perfil del negocio, horarios y un catálogo de productos.")
    g.step(3, "Antes de cambiar", "No borres tus conversaciones. Revisa tu copia de seguridad y pide apoyo a tu facilitadora.")
    g.text("Recuerda: leer esta guía no necesita internet si ya la descargaste. Instalar y verificar la aplicación sí necesita conexión.", 14, TEAL)
    g.save()

    g = new("configurar-whatsapp-business", "Configurar WhatsApp Business", 2, [32], "recreated")
    g.page("Antes de empezar: celular, número y conexión.")
    g.step(1, "Instala la aplicación oficial", "Busca WhatsApp Business en Play Store o App Store. No borres tu WhatsApp actual antes de revisar la copia de seguridad.")
    g.step(2, "Verifica tu número", "Sigue las instrucciones de la aplicación. El código de verificación es privado: no lo compartas.")
    g.step(3, "Pon nombre y foto", "Usa el nombre de tu emprendimiento y una foto que lo represente. Revisa el nombre antes de confirmar.")
    g.text("Si ya tienes Business, no crees otra cuenta: revisa tu perfil del negocio.", 14, TEAL)
    g.page("Un perfil claro ayuda a que te conozcan.")
    g.step(4, "Elige la categoría", "Selecciona la categoría que mejor describa tu trabajo artesanal.")
    g.step(5, "Cuenta qué elaboras", "Escribe una frase corta con tus piezas, técnica y comunidad. Comparte solo información cultural que puedas difundir.")
    g.step(6, "Completa y revisa", "Añade tu horario de atención y los datos públicos del negocio que quieras compartir. Guarda y comprueba el resultado.")
    g.text("Recuerda: los nombres de los menús pueden variar. Busca Perfil del negocio o Herramientas para la empresa.", 14, TEAL)
    g.save()

    g = new("crear-catalogo-basico", "Crear un catálogo básico", 4, [33, 34], "recreated-with-extracts")
    catalog = [
        ("Entra al catálogo", "Abre WhatsApp Business y busca Catálogo en las herramientas del negocio.", 880, (38, 400, 298, 558)),
        ("Añade una pieza", "Elige Añadir un artículo nuevo. Empieza con una sola pieza que tengas disponible.", 881, (38, 490, 298, 652)),
        ("Completa sus datos", "Añade fotos claras, nombre, precio y moneda si corresponde, materiales, medidas y técnica. Completa el país de origen si aparece y guarda.", 882, (38, 284, 300, 600)),
        ("Organiza y revisa", "Si ya tienes varias piezas, puedes agruparlas en colecciones. Actualiza el catálogo cuando cambie la disponibilidad.", 883, (38, 284, 298, 520))
    ]
    for n, (title, detail, xref, crop) in enumerate(catalog, 1):
        g.page(f"Paso {n} de 4 / Tu pieza, tu historia")
        g.step(n, title, detail)
        if n == 3:
            g.text("Ejemplo de ficha", 18, TEAL, True)
            g.text("Nombre: Bolso tejido a mano", 16)
            g.text("Descripción: elaborado con algodón. Medidas: 25 por 30 centímetros. Consulta colores y tiempo de preparación.", 16)
            g.text("Precio: el monto y la moneda de tu propia pieza.", 16)
            g.text("Usa este ejemplo como guía y reemplaza los datos por los tuyos.", 14, TEAL)
        else:
            g.image(image(xref, crop), 235)
            g.text("Recorte del ejemplo original. Usa fotos y datos de tu propia artesanía; los botones pueden variar.", 12, TEAL)
    g.save()

    g = new("publicar-estados-whatsapp", "Publicar en Estados de WhatsApp", 3, [35, 36], "recreated-with-extracts")
    g.page("Para mostrar novedades a tus contactos.")
    g.step(1, "Busca tus estados", "Abre WhatsApp y entra a Actualizaciones o Novedades.")
    g.step(2, "Añade un estado", "Busca Mi estado y el signo + o el botón para crear una actualización.")
    g.image(image(934, (0, 85, 296, 380)), 240)
    g.page("Una foto clara y pocas palabras.")
    g.step(3, "Elige la foto", "Selecciona una foto de tu pieza o de tu proceso, sin filtros que cambien sus colores.")
    g.step(4, "Escribe cómo pedirla", "Añade una frase corta, precio si corresponde y cómo pueden consultarte. Ejemplo: Chal tejido a mano. Escríbeme por colores y disponibilidad.")
    g.image(image(930, (0, 30, 259, 310)), 230)
    g.page("Revisa antes de compartir.")
    g.step(5, "Publica con conexión", "Revisa la audiencia de tus estados y toca el botón de enviar. Responde las consultas con calma.")
    g.image(image(932, (0, 35, 259, 510)), 280)
    g.text("Recuerda: tu estado dura 24 horas. Puedes preparar fotos y textos sin internet, pero necesitas conexión para publicarlo.", 14, TEAL)
    g.save()

    g = new("crear-cuenta-facebook", "Crear mi cuenta en Facebook", 6, [37, 38], "extracted")
    panels = [953, 954, 955, 972, 973, 974]
    labels = ["Antes de empezar", "Encuentra la aplicación / pasos 1 a 3", "Escribe tus datos / pasos 4 a 6", "Completa el registro / pasos 7 a 9", "Cuida tu contraseña y tus códigos", "Presenta tu trabajo con identidad"]
    for n, (xref, label) in enumerate(zip(panels, labels), 1):
        g.page(label)
        panel = image(xref)
        if xref != 974:
            panel = panel.crop((0, 26, panel.width, panel.height))
        g.image(panel, 438)
        if n == 1:
            g.text("Si ya tienes cuenta, inicia sesión en ella. No necesitas crear otra.", 12, TEAL)
        elif n == 5:
            g.text("Elige tu propia contraseña; no copies las palabras del ejemplo.", 12, TEAL)
    g.save()

    g = new("vender-facebook-marketplace", "Vender en Facebook Marketplace", 4, [39, 40, 41], "recreated-with-extracts")
    marketplace = [
        ((1, "Abre Facebook", "Entra con tu cuenta y busca el menú. La posición puede cambiar según el celular."), (2, "Busca Marketplace", "Toca el icono de la tienda. Si no aparece, pide apoyo; puedes seguir usando tu catálogo."), 1012, (0, 60, 370, 250)),
        ((3, "Busca la opción para vender", "Entra a Vender o Tus publicaciones."), (4, "Crea una publicación", "Elige Crear publicación y Un artículo o Artículo en venta."), 1014, (0, 35, 370, 190)),
        ((5, "Completa la ficha", "Pon título, precio, categoría, estado y descripción. No publiques tu dirección de casa."), (6, "Añade fotos propias", "Usa imágenes claras, con buena luz, que muestren la pieza real."), 1035, (0, 130, 333, 495)),
        ((7, "Revisa tu publicación", "Comprueba precio, descripción y disponibilidad."), (8, "Publica con conexión", "Toca Publicar. Revisa Tus publicaciones y acuerda con cuidado la entrega."), 1038, (0, 140, 370, 435))
    ]
    for n, (first, second, xref, crop) in enumerate(marketplace, 1):
        g.page(f"Pasos {first[0]} y {second[0]} de 8")
        g.step(*first)
        g.step(*second)
        g.image(image(xref, crop), 210)
        g.text("Recuerda: acceso y botones pueden variar según la cuenta y el dispositivo. Nunca compartas contraseñas ni códigos.", 12, TEAL)
    g.save()

    g = new("estados-o-facebook", "¿Estados o Facebook?", 2, [42], "recreated")
    g.page("Estados: para quien ya te conoce.")
    g.step(1, "A quién llego", "A tus contactos, según la privacidad que elijas para tus estados.")
    g.step(2, "Qué comparto", "Producto nuevo, avances del tejido o una pieza que ya está disponible.")
    g.step(3, "Cuánto dura", "El estado desaparece después de 24 horas. Usa una foto y una frase corta.")
    g.text("Recuerda: prepara el contenido sin internet y publica cuando tengas conexión.", 14, TEAL)
    g.page("Facebook: para llegar a nuevas personas.")
    g.step(1, "A quién llego", "A otras personas según la audiencia de tu publicación, página o grupo. No todo lo que publiques será público automáticamente.")
    g.step(2, "Qué comparto", "Una pieza lista para vender: foto, descripción, precio si corresponde y forma de contacto.")
    g.step(3, "Cómo los combino", "Usa Estados para novedades y Facebook para presentar una pieza. No tienes que usar los dos todos los días.")
    g.text("Recuerda: ambos necesitan internet para compartir. El consumo de datos depende de tus fotos y videos, no solo de la aplicación.", 14, TEAL)
    g.save()

    for entry in manifest:
        path = output / entry["filename"]
        data = path.read_bytes()
        entry.update(bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
        pdf = pymupdf.open(path)
        if len(pdf) != entry["pages"]:
            raise ValueError("Invalid PDF")
        pdf.close()
    (output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
