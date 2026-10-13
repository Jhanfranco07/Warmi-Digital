"""Build original vector PDF guides and approval previews; never publish assets."""

import argparse
import hashlib
import json
from pathlib import Path
from xml.sax.saxutils import escape

import pymupdf
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

W, H = 432, 832
INK = "#253444"
PINK = "#B5245B"
BLUE = "#275B87"
ROSE = "#FFF1F6"
PALE = "#EDF4FB"
LINE = "#E6DAE1"
GREEN = "#25734E"
WHITE = "#FFFFFF"

SOURCES = {
    "business": "https://faq.whatsapp.com/641572844337957",
    "catalog": "https://faq.whatsapp.com/833697274483076/?cms_platform=iphone",
    "status": "https://faq.whatsapp.com/643144237275579/?cms_platform=iphone",
    "facebook": "https://www.facebook.com/help/550954179351183/",
    "safety": "https://www.facebook.com/help/123884166448529/",
}

# Screen labels are illustrative, not replicas of Android/iOS interfaces.
GUIDES = [
    {
        "key": "whatsapp-o-business",
        "title": "¿WhatsApp o WhatsApp Business?",
        "learn": "Elige cómo conversar y presentar tu trabajo artesanal.",
        "sourcePages": [31], "source": "business", "comparison": "apps",
    },
    {
        "key": "configurar-whatsapp-business",
        "title": "Configurar WhatsApp Business",
        "learn": "Prepara un perfil que ayude a conocer tu negocio.",
        "sourcePages": [32], "source": "business",
        "steps": [
            ("Busca la app oficial", "Abre Play Store en Android o App Store en iPhone. Busca WhatsApp Business y comprueba que sea de WhatsApp.", "store-business", "Necesitas conexión para instalar."),
            ("Instala y abre", "Instala la aplicación y ábrela. Si ya la tienes, entra en ella; no crees otra cuenta.", "open-business", "Antes de cambiar, revisa tu copia de seguridad."),
            ("Verifica tu número", "Sigue el registro de la app y escribe el código que recibas. Puedes trasladar tu número actual a Business.", "verify", "El mismo número no funciona en ambas apps a la vez."),
            ("Prepara tu perfil", "Busca el perfil del negocio en las herramientas comerciales. Añade una foto propia y el nombre de tu emprendimiento.", "profile", "Comparte solo datos que quieras hacer públicos."),
            ("Cuenta qué ofreces", "Añade una descripción breve y tu horario. Por ejemplo: tejidos hechos a mano, de lunes a viernes.", "profile-details", "Elige la categoría que represente tu trabajo."),
            ("Conoce tus herramientas", "Revisa el catálogo y las herramientas de mensajes. Puedes empezar por una pieza y un saludo sencillo.", "tools", "Resumen: tu perfil presenta qué haces y cuándo atiendes."),
        ],
        "final": "Tu siguiente paso: revisa tu nombre, foto y horario antes de compartir tu perfil.",
    },
    {
        "key": "crear-catalogo-basico", "title": "Crear un catálogo básico",
        "learn": "Presenta una pieza con foto, nombre y precio claro.",
        "sourcePages": [33, 34], "source": "catalog",
        "steps": [
            ("Entra a las herramientas", "Abre WhatsApp Business y busca Herramientas. Allí se agrupan las opciones de tu negocio.", "tools", "El nombre o la ubicación puede variar."),
            ("Abre el catálogo", "Busca Catálogo. Aquí se mostrarán tus productos; no es necesario tener muchas piezas para empezar.", "catalog-empty", "Comienza con una artesanía disponible."),
            ("Añade un producto", "Busca Añadir un artículo nuevo. Prepararás una ficha para esa pieza.", "catalog-add", "Una ficha corresponde a un producto."),
            ("Añade una foto propia", "Elige una foto clara de tu bolso, tejido o prenda. Usa buena luz y conserva los colores reales.", "photo", "Solo usa imágenes tuyas o con permiso."),
            ("Completa los datos", "Escribe el nombre y país de origen. Añade precio si está disponible, descripción y medidas útiles.", "product-form", "Ejemplo: bolso tejido a mano, S/ 65, origen Perú."),
            ("Guarda y revisa", "Guarda la ficha y comprueba foto, precio y descripción. WhatsApp revisa los artículos antes de mostrarlos a clientes.", "catalog-ready", "Resumen: una foto clara y datos completos ayudan a elegir."),
        ],
        "final": "Tu siguiente paso: prepara la ficha de una sola pieza y actualiza su disponibilidad.",
    },
    {
        "key": "publicar-estados-whatsapp", "title": "Publicar estados de WhatsApp",
        "learn": "Muestra una novedad a la audiencia que elijas.",
        "sourcePages": [35, 36], "source": "status",
        "steps": [
            ("Busca tus estados", "Abre WhatsApp y entra a Novedades o Actualizaciones. Busca Mi estado o la opción para añadir un estado.", "status-home", "Los nombres cambian según el celular."),
            ("Elige una foto", "Selecciona una fotografía de tu artesanía. Una pieza y un fondo sencillo ayudan a verla mejor.", "photo-shawl", "Evita filtros que cambien sus colores."),
            ("Escribe una frase breve", "Cuenta qué pieza muestras. Añade unas pocas palabras para que sea fácil leerlas en el celular.", "status-caption", "Ejemplo: Chal tejido a mano."),
            ("Añade precio y contacto", "Indica el precio, si corresponde, y cómo consultarte. Revisa los datos antes de enviar.", "status-price", "Ejemplo: S/ 80. Escríbeme por los colores disponibles."),
            ("Revisa y publica", "Elige quién ve tu estado y envíalo con conexión. Desaparece a las 24 horas.", "status-send", "Resumen: foto, frase, precio y contacto."),
        ],
        "final": "Ejemplo ilustrativo: Chal tejido a mano - S/ 80. Escríbeme para consultar colores disponibles.",
    },
    {
        "key": "crear-cuenta-facebook", "title": "Crear mi cuenta en Facebook",
        "learn": "Abre tu cuenta con calma y protege tus datos.",
        "sourcePages": [37, 38], "source": "facebook",
        "steps": [
            ("Busca o abre Facebook", "Abre la app oficial de Facebook. Si necesitas instalarla, búscala en la tienda de tu celular.", "store-facebook", "Si ya tienes cuenta, usa esa misma cuenta."),
            ("Inicia el registro", "Busca la opción para crear una cuenta nueva. No elijas iniciar sesión si todavía no tienes cuenta.", "facebook-start", "La forma de mostrar estas opciones puede variar."),
            ("Escribe tus datos", "Completa los datos que Facebook solicite, como nombre, nacimiento y correo o teléfono. Crea tu propia contraseña.", "facebook-data", "No pongas tu dirección de casa en una publicación."),
            ("Confirma el registro", "Sigue la verificación que aparezca. Puede llegar un código o enlace a tu teléfono o correo.", "verify", "No compartas contraseñas ni códigos, tampoco con Warmi."),
            ("Revisa tu perfil", "Entra a tu perfil y añade la foto que quieras compartir. Revisa qué información pueden ver otras personas.", "facebook-profile", "Activa la protección de acceso que tengas disponible."),
            ("Comparte con cuidado", "Prepara una foto de tu pieza y un texto breve. Antes de publicar, revisa la audiencia: no todo debe ser público.", "facebook-post", "Resumen: cuenta propia, perfil cuidado y audiencia elegida."),
        ],
        "final": "Tu siguiente paso: protege tu contraseña y revisa la privacidad de tu primera publicación.",
    },
    {
        "key": "vender-facebook-marketplace", "title": "Vender en Facebook Marketplace",
        "learn": "Prepara una publicación clara y coordina con cuidado.",
        "sourcePages": [39, 40, 41], "source": "facebook",
        "steps": [
            ("Busca Marketplace", "Entra en Facebook y busca Marketplace, identificado con una tienda. Su acceso depende de tu cuenta y región.", "market-home", "Si no aparece, usa tu catálogo y pide apoyo."),
            ("Empieza una publicación", "Busca la opción para vender un artículo. Crea una publicación para una pieza disponible.", "market-create", "Los nombres y la ubicación de los controles varían."),
            ("Elige la categoría", "Selecciona la categoría que mejor describa tu pieza. Si pide su estado, responde de forma honesta.", "market-category", "Ejemplo ilustrativo: un bolso artesanal."),
            ("Añade fotos claras", "Muestra la pieza completa y un detalle del tejido. Las fotos deben representar el producto real que entregas.", "photo", "Usa luz natural y un fondo sencillo."),
            ("Completa la ficha", "Añade título, precio y descripción. Cuenta materiales, medidas, colores y disponibilidad.", "market-form", "Ejemplo: Bolso tejido a mano - S/ 65."),
            ("Acuerda la entrega", "Indica una zona aproximada y cómo coordinarás la entrega. No publiques la dirección de tu casa.", "market-location", "Elige un lugar público y ve acompañada si puedes."),
            ("Revisa y publica", "Comprueba los datos y publica con conexión. Responde consultas y verifica el pago antes de entregar.", "market-ready", "No compartas códigos ni pagues para liberar una venta."),
        ],
        "final": "Resumen: una pieza, fotos propias y datos claros. Mantén la coordinación dentro de canales conocidos.",
    },
    {
        "key": "estados-o-facebook", "title": "¿Estados de WhatsApp o Facebook?",
        "learn": "Elige dónde presentar tu pieza según a quién quieras llegar.",
        "sourcePages": [42], "source": "status", "comparison": "reach",
    },
]


class Drawing:
    def __init__(self, pdf):
        self.c = pdf

    def box(self, x, y, w, h, fill=WHITE, stroke=None, radius=6):
        self.c.setFillColor(HexColor(fill))
        self.c.setStrokeColor(HexColor(stroke or fill))
        self.c.setLineWidth(1.2)
        self.c.roundRect(x, H-y-h, w, h, radius, fill=1, stroke=bool(stroke))

    def line(self, x1, y1, x2, y2, color=LINE, width=1):
        self.c.setStrokeColor(HexColor(color))
        self.c.setLineWidth(width)
        self.c.line(x1, H-y1, x2, H-y2)

    def circle(self, x, y, r, fill=PINK, stroke=None):
        self.c.setFillColor(HexColor(fill))
        self.c.setStrokeColor(HexColor(stroke or fill))
        self.c.circle(x, H-y, r, fill=1, stroke=bool(stroke))

    def text(self, text, x, y, size=16, color=INK, bold=False, width=None):
        if width is None:
            width = W-x-28
        style=ParagraphStyle('text', fontName='WarmiV2Bold' if bold else 'WarmiV2', fontSize=size, leading=size*1.3, textColor=HexColor(color))
        p=Paragraph(escape(text), style)
        _, h=p.wrap(width, H)
        if y+h > H-12:
            raise ValueError(f'Text overflow: {text}')
        p.drawOn(self.c, x, H-y-h)
        return y+h

    def product(self, x, y, w, h, kind='bag'):
        self.box(x,y,w,h,PALE,radius=6)
        bx, by = x+w*.24, y+h*.30
        bw, bh = w*.52, h*.54
        if kind == 'detail':
            for n in range(7):
                self.line(x+w*.2,y+h*.2+n*h*.1,x+w*.8,y+h*.2+n*h*.1,PINK,2)
                self.line(x+w*.2+n*w*.1,y+h*.2,x+w*.2+n*w*.1,y+h*.8,BLUE,1.2)
        elif kind == 'shawl':
            self.box(bx-4,by-5,bw+8,bh,ROSE, PINK, 2)
            for n in range(5):
                self.line(bx-2,by+4+n*bh/6,bx+bw+2,by+4+n*bh/6,PINK,2)
            for n in range(7):
                self.line(bx+n*bw/6,by+bh-5,bx+n*bw/6,by+bh+5,BLUE,1.6)
        else:
            self.c.setStrokeColor(HexColor(PINK));self.c.setLineWidth(3)
            self.c.ellipse(bx+bw*.22,H-by-12,bx+bw*.78,H-by+16,fill=0,stroke=1)
            self.box(bx,by,bw,bh,ROSE,PINK,3)
            for n in range(4):
                self.line(bx+3,by+10+n*bh/5,bx+bw-3,by+10+n*bh/5,BLUE,1.6)

    def check(self, x, y, size=12):
        self.line(x,y+size*.5,x+size*.4,y+size,GREEN,2.5)
        self.line(x+size*.4,y+size,x+size,y,GREEN,2.5)

    def phone(self, x, y, scene, width=150, height=206):
        self.box(x,y,width,height,INK, radius=16)
        self.box(x+5,y+6,width-10,height-12,WHITE,radius=12)
        self.box(x+width*.35,y+10,width*.3,3,LINE,radius=1)
        self.line(x+width*.36,y+height-10,x+width*.64,y+height-10,INK,2)
        sx, sy, sw = x+12, y+24, width-24
        title, rows = screen(scene)
        title_end=self.text(title,sx,sy,14,BLUE,True,sw)
        yy = title_end+10
        for kind, label in rows:
            if kind == 'product':
                self.product(sx,yy,sw,58,'shawl' if scene.startswith('status') else 'bag')
                yy += 65
            elif kind == 'gallery':
                self.product(sx,yy,sw*.60,62,'shawl' if scene=='photo-shawl' else 'bag')
                self.product(sx+sw*.65,yy,sw*.35,62,'detail')
                yy += 69
            elif kind == 'check':
                self.check(sx+4,yy+5)
                yy=self.text(label,sx+24,yy,14,GREEN,True,sw-24)+8
            elif kind == 'send':
                self.circle(sx+16,yy+14,14,GREEN)
                self.line(sx+8,yy+10,sx+24,yy+14,WHITE,1.8)
                self.line(sx+24,yy+14,sx+8,yy+18,WHITE,1.8)
                self.line(sx+12,yy+14,sx+24,yy+14,WHITE,1.5)
                self.text(label,sx+38,yy+4,14,GREEN,True,sw-38)
                yy += 35
            elif kind == 'field':
                self.box(sx,yy,sw,32,PALE,radius=3)
                end=self.text(label,sx+5,yy+6,13.5,INK,False,sw-10)
                if end>yy+30:raise ValueError(f'Field label overflow: {label}')
                yy += 39
            elif kind == 'focus':
                self.box(sx,yy,sw,36,ROSE,PINK,4)
                self.text(label,sx+6,yy+7,14,PINK,True,sw-12)
                self.circle(sx+sw-4,yy+34,6,PINK)
                self.line(sx+sw-4,yy+42,sx+sw-4,yy+52,PINK,2)
                yy += 47
            else:
                yy=self.text(label,sx,yy,14,INK,False,sw)+8
        if yy > y+height-15:
            raise ValueError(f'Illustration overflow: {scene} ({yy-y:.1f}/{height})')


def screen(scene):
    scenes={
        'store-business':('Tu tienda de apps',[('field','WhatsApp Business'),('text','App de WhatsApp'),('focus','Instalar')]),
        'open-business':('Tu celular',[('text','WhatsApp Business'),('focus','Abrir'),('text','Tu negocio, contigo')]),
        'verify':('Verificación',[('text','Código privado'),('field','-  -  -  -  -  -'),('text','Solo dentro de la app')]),
        'profile':('Perfil del negocio',[('product',''),('field','Tejidos de Elena')]),
        'profile-details':('Tu perfil',[('field','Tejidos a mano'),('field','Lun - vie'),('field','9:00 - 17:00')]),
        'tools':('Herramientas',[('focus','Catálogo'),('text','Perfil del negocio'),('text','Mensajes')]),
        'catalog-empty':('Tu catálogo',[('text','Empieza con una pieza'),('focus','Añadir artículo')]),
        'catalog-add':('Tu catálogo',[('product',''),('focus','Añadir artículo')]),
        'photo':('Tus fotografías',[('gallery',''),('check','Foto propia')]),
        'photo-shawl':('Tus fotografías',[('gallery',''),('check','Foto propia')]),
        'product-form':('Datos del producto',[('field','Bolso tejido'),('field','S/ 65'),('field','Origen: Perú')]),
        'catalog-ready':('Tu catálogo',[('product',''),('text','Bolso tejido - S/ 65'),('check','Guardado')]),
        'status-home':('Novedades',[('focus','Mi estado +'),('text','Elige una foto')]),
        'status-caption':('Mi estado',[('product',''),('field','Chal tejido a mano')]),
        'status-price':('Mi estado',[('product',''),('field','S/ 80'),('text','Consulta colores')]),
        'status-send':('Antes de enviar',[('product',''),('text','Revisa la audiencia'),('send','Enviar')]),
        'store-facebook':('Tu tienda de apps',[('field','Facebook'),('text','App de Meta'),('focus','Abrir / instalar')]),
        'facebook-start':('Registro',[('text','¿Ya tienes cuenta?'),('text','Usa tu cuenta actual.'),('field','Nueva cuenta')]),
        'facebook-data':('Tus datos',[('field','Nombre'),('field','Nacimiento'),('field','Correo o teléfono')]),
        'facebook-profile':('Mi perfil',[('product',''),('text','Tejidos de Elena'),('text','Privacidad primero')]),
        'facebook-post':('Tu publicación',[('product',''),('text','Mi tejido, mi historia'),('text','Elige la audiencia')]),
        'market-home':('Facebook',[('text','Busca la tienda'),('field','Marketplace'),('text','Si tienes acceso')]),
        'market-create':('Una pieza en venta',[('product',''),('text','Prepara una ficha')]),
        'market-category':('Sobre tu pieza',[('product',''),('field','Categoría: bolsos')]),
        'market-form':('Datos de la pieza',[('field','Bolso tejido'),('field','S/ 65'),('field','25 x 30 cm')]),
        'market-location':('Coordinar entrega',[('field','Zona aproximada'),('text','Lugar público'),('text','No tu domicilio')]),
        'market-ready':('Antes de publicar',[('product',''),('check','Datos revisados'),('text','Responde consultas')]),
        'personal':('WhatsApp',[('text','Conversaciones'),('field','Familia'),('field','Amigas'),('text','Fotos y mensajes')]),
        'business':('WhatsApp Business',[('product',''),('text','Perfil de negocio'),('text','Catálogo y atención')]),
        'reach-status':('Estados',[('product',''),('text','Tus contactos'),('text','Novedades por 24 h')]),
        'reach-facebook':('Facebook',[('product',''),('text','Más personas'),('text','Nuevas consultas')]),
    }
    return scenes[scene]


class Guide(Drawing):
    def __init__(self, path, data, pages):
        pdf=canvas.Canvas(str(path),pagesize=(W,H),pageCompression=1,invariant=1)
        super().__init__(pdf)
        self.data=data;self.pages=pages;self.number=0
        pdf.setTitle(data['title']);pdf.setAuthor('Warmi Digital')
        pdf.setSubject('Aprender para crecer / Módulo 3 / Sesión 1 / Guía visual v2')
        self.bounds=[]

    def page(self):
        if self.number:self.c.showPage()
        self.number+=1
        self.box(0,0,W,6,PINK,radius=0)
        self.text('WARMI DIGITAL',28,20,11,PINK,True)
        self.text('APRENDER PARA CRECER',230,20,10,BLUE,True,174)
        end=self.text(self.data['title'],28,45,25,INK,True,W-56)
        if self.number==1:
            end=self.text(self.data['learn'],28,end+8,16,BLUE,False,W-56)
        else:
            end=self.text('Sigue los pasos a tu ritmo.',28,end+8,15,BLUE)
        self.line(28,H-58,W-28,H-58)
        self.text('Módulo 3 · Sesión 1',28,H-48,11,BLUE)
        self.text(f'Guía v2 · {self.number}/{self.pages}',295,H-48,11,BLUE,False,109)
        self.text('Esquemas ilustrativos. Los menús pueden variar.',28,H-25,10,INK,False,W-56)
        return max(137,end+20)

    def step(self, index, item, y):
        title, body, scene, tip=item
        self.circle(42,y+14,14)
        self.text(str(index),38,y+3,16,WHITE,True,21)
        end=self.text(title,65,y+1,19,INK,True,W-93)
        diagram_y=max(y+39,end+8)
        end=self.text(body,28,diagram_y+3,17.5,INK,False,194)
        self.line(28,end+14,52,end+14,BLUE,2)
        end=self.text(tip,28,end+23,14.5,BLUE,False,190)
        self.phone(246,diagram_y,scene,158,207)
        if end>y+258:raise ValueError(f'Step text overflow: {self.data["key"]}: {title}')
        self.bounds.append((y,y+258))

    def final(self, y):
        style=ParagraphStyle('summary',fontName='WarmiV2',fontSize=16,leading=20.8)
        paragraph=Paragraph(escape(self.data['final']),style)
        _, height=paragraph.wrap(W-84,H)
        self.box(28,y,W-56,42+height,ROSE,radius=6)
        self.text('ME LLEVO ESTA IDEA',42,y+11,11,PINK,True,W-84)
        self.text(self.data['final'],42,y+30,16,INK,False,W-84)

    def comparison(self):
        apps=self.data['comparison']=='apps'
        y=self.page()
        self.text('PARA CONVERSAR' if apps else 'PARA QUIEN YA TE CONOCE',28,y,12,PINK,True)
        self.text('PARA TU NEGOCIO' if apps else 'PARA AMPLIAR TU ALCANCE',226,y,12,BLUE,True,178)
        self.phone(48,y+28,'personal' if apps else 'reach-status',146,226)
        self.phone(246,y+28,'business' if apps else 'reach-facebook',146,226)
        by=y+277
        self.text('WhatsApp' if apps else 'Estados de WhatsApp',28,by,19,PINK,True,178)
        self.text('WhatsApp Business' if apps else 'Facebook / Marketplace',226,by,19,BLUE,True,178)
        left='Mensajes, llamadas y fotos para conversar con tus contactos.' if apps else 'Una foto y pocas palabras para mostrar novedades a tu audiencia.'
        right='Conversaciones y herramientas para presentar tu emprendimiento.' if apps else 'Una pieza con datos claros para recibir consultas de nuevas personas.'
        end=max(self.text(left,28,by+56,17.5,INK,False,178),self.text(right,226,by+56,17.5,INK,False,178))
        self.box(28,end+23,376,84,PALE,radius=6)
        note='Ambas sirven para conversar. Business añade herramientas del negocio; no es necesario empezar con todo.' if apps else 'El alcance depende de tu audiencia y de la disponibilidad de Marketplace. No todas las publicaciones son públicas.'
        self.text(note,42,end+37,16,BLUE,False,348)
        self.text('Celulares ilustrados: no son capturas de las aplicaciones.',28,H-88,12,BLUE,False,376)
        y=self.page()
        sections=[
            ('Perfil de negocio','Muestra qué elaboras, tu descripción y tu horario.'),
            ('Catálogo','Presenta piezas con foto y datos útiles para elegir.'),
            ('Atención al cliente','Organiza tus conversaciones y responde con claridad.'),
        ] if apps else [
            ('Estados: una novedad rápida','Comparte una pieza nueva o tu proceso con los contactos de tu audiencia. El estado dura 24 horas.'),
            ('Facebook: presentar tu trabajo','Publica una pieza y su historia. Revisa la audiencia antes de compartir.'),
            ('Marketplace: consultas nuevas','Si tienes acceso, publica un artículo para que lo encuentren personas interesadas.'),
        ]
        for i,(title,body) in enumerate(sections):
            self.circle(42,y+15,13,PINK if i!=1 else BLUE)
            self.text(str(i+1),38,y+5,14,WHITE,True,18)
            end=self.text(title,65,y+1,19,INK,True,339)
            end=self.text(body,65,end+9,17.5,INK,False,339)
            y=max(y+111,end+28)
        if apps:
            note='Para vender artesanías, Business puede ayudarte. Puedes trasladar tu número actual; para usar ambas apps al mismo tiempo necesitas números distintos.'
            final='Empieza por una pieza: prepara tu perfil y después tu primer catálogo.'
        else:
            note='Prepara fotos y textos sin conexión. Para compartirlos, necesitas internet. El consumo de datos depende también de las fotos y los videos.'
            final='Puedes empezar por WhatsApp y utilizar Facebook cuando quieras llegar a más clientes.'
        end=self.text(note,28,y+3,16,BLUE,False,376)
        self.box(28,end+20,376,83,ROSE,radius=6)
        self.text(final,42,end+34,17,INK,True,348)
        if end+103>693:raise ValueError('Comparison overflow')

    def build(self):
        if 'comparison' in self.data:
            self.comparison()
        else:
            steps=self.data['steps']
            for offset in range(0,len(steps),2):
                y=self.page()
                for local,item in enumerate(steps[offset:offset+2]):
                    self.step(offset+local+1,item,y+local*266)
                last=offset+2>=len(steps)
                if last and len(steps)%2:
                    self.final(y+294)
                elif last:
                    self.line(28,676,404,676,LINE)
                    self.text('MI SIGUIENTE PASO',28,687,11,PINK,True)
                    end=self.text(self.data['final'],28,706,14.5,INK,False,376)
                    if end>H-66:raise ValueError('Summary overflow')
                else:
                    self.text('Prepara tus datos aquí; realiza la acción en la app.',28,H-88,12,BLUE,False,376)
        if self.number!=self.pages:raise ValueError('Incorrect page count')
        self.c.save()


def render_and_check(path, preview, guide):
    doc=pymupdf.open(path)
    images=[];texts=[]
    for index,page in enumerate(doc):
        text=page.get_text();texts.append(text)
        if len(text.strip())<150:raise ValueError('Missing selectable text')
        if page.get_images():raise ValueError('Raster screenshots are not allowed')
        spans=[]
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines',[]):
                for span in line.get('spans',[]):
                    x0,y0,x1,y1=span['bbox']
                    if x0<0 or x1>W+.5 or y0<0 or y1>H+.5:raise ValueError('Text outside page')
                    spans.append(span)
        for i,first in enumerate(spans):
            for second in spans[i+1:]:
                overlap=pymupdf.Rect(first['bbox']) & pymupdf.Rect(second['bbox'])
                if overlap.width>1.5 and overlap.height>1.5:
                    raise ValueError(f'Overlapping text: {first["text"]} / {second["text"]}')
        pixmap=page.get_pixmap(matrix=pymupdf.Matrix(2,2),alpha=False)
        image=Image.frombytes('RGB',(pixmap.width,pixmap.height),pixmap.samples)
        name=f"{guide['key']}-p{index+1:02d}.png"
        image.save(preview/name,optimize=True);images.append(image)
    if 'steps' in guide:
        all_text='\n'.join(texts)
        for title,*_ in guide['steps']:
            if title not in all_text:raise ValueError(f'Missing step: {title}')
        positions=[all_text.index(step[0]) for step in guide['steps']]
        if positions!=sorted(positions):raise ValueError('Steps are not in order')
    columns=2
    tw=346
    th=round(tw*H/W)
    board=Image.new('RGB',(columns*tw+48,((len(images)+1)//2)*(th+36)+32),'#F4F5F8')
    draw=ImageDraw.Draw(board);font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
    for i,image in enumerate(images):
        x=16+(i%columns)*(tw+16);y=16+(i//columns)*(th+36)
        board.paste(image.resize((tw,th),Image.Resampling.LANCZOS),(x,y))
        draw.text((x,y+th+6),f'Página {i+1}',font=font,fill=INK)
    board.save(preview/f"{guide['key']}-preview.png",optimize=True)
    return len(doc)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source',required=True)
    parser.add_argument('--output',default='output/pdf/module3-session1-v2')
    args=parser.parse_args()
    out=Path(args.output);preview=out/'preview';preview.mkdir(parents=True,exist_ok=True)
    pdfmetrics.registerFont(TTFont('WarmiV2','C:/Windows/Fonts/arial.ttf'))
    pdfmetrics.registerFont(TTFont('WarmiV2Bold','C:/Windows/Fonts/arialbd.ttf'))
    source_hash=hashlib.sha256(Path(args.source).read_bytes()).hexdigest()
    entries=[]
    for guide in GUIDES:
        pages=2 if 'comparison' in guide else (len(guide['steps'])+1)//2
        path=out/f"{guide['key']}-v2.pdf"
        Guide(path,guide,pages).build()
        count=render_and_check(path,preview,guide)
        data=path.read_bytes()
        entries.append({'key':guide['key'],'filename':path.name,'version':2,'status':'pending-design-approval','pages':count,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'sourcePages':guide['sourcePages'],'sourceSha256':source_hash,'mode':'original-vector-illustrations','sources':[SOURCES[guide['source']]],'illustrations':'ReportLab vector primitives; no Canva images or screenshots'})
    (out/'manifest.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    sections=[]
    for entry,guide in zip(entries,GUIDES):
        figures=''.join(f'<a href="preview/{guide["key"]}-p{i:02d}.png"><img loading="lazy" src="preview/{guide["key"]}-p{i:02d}.png" alt="{escape(guide["title"])}. Página {i}" width="864" height="1664"></a>' for i in range(1,entry['pages']+1))
        sections.append(f'<section id="{guide["key"]}"><h2>{escape(guide["title"])}</h2><a href="{entry["filename"]}">Abrir PDF</a><div class="pages">{figures}</div></section>')
    navigation=''.join(f'<a href="#{g["key"]}">{i+1}. {escape(g["title"])}</a>' for i,g in enumerate(GUIDES))
    html='<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guías Warmi - revisión v2</title><style>body{margin:0;font:16px Arial,sans-serif;color:#253444;background:#f4f5f8}header,main{max-width:1200px;margin:auto;padding:24px}h1{font-size:26px;color:#b5245b}h2{font-size:22px}nav{display:flex;flex-wrap:wrap;gap:16px}a{color:#275b87}section{border-top:1px solid #e6dae1;padding:24px 0}.pages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:20px;margin-top:20px}.pages img{display:block;width:100%;height:auto;background:white}</style><header><h1>Guías Warmi · versión 2</h1><nav>'+navigation+'</nav></header><main>'+''.join(sections)+'</main></html>'
    (out/'revision.html').write_text(html,encoding='utf-8')
    print(json.dumps({'guides':len(entries),'pages':sum(e['pages'] for e in entries),'bytes':sum(e['bytes'] for e in entries),'output':str(out)},ensure_ascii=False))


if __name__=='__main__':
    main()
