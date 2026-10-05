import { Module3ContentRepository } from "@/shared/repositories/module3-content.repository";
import { MODULE3_TITLE } from "@/shared/offline/module3-types";

export const WHATSAPP_COURSE_ID = "3889134e-620b-40db-98cf-8f6b2a0c43ec";
export const MODULE3_SUPPORT = [
  { id: "39cb8ba1-eff1-4580-8861-d2f000fe58dc", title: "¿Qué es WhatsApp Business?" },
  { id: "fb93bce7-6f75-4bc7-af45-f8da10d98665", title: "Configura tu perfil de negocio" }
];

export const MODULE3_SESSIONS = [
  {
    title: "Sesión 1: Publica tu arte en redes",
    slug: "warmi-modulo-3-sesion-1-publica-tu-arte-en-redes",
    order: 1,
    durationMin: 30,
    content: `Tu artesanía cuenta una historia. En esta sesión prepararás un catálogo y una publicación que muestren tu trabajo, tu técnica y tu comunidad.

WhatsApp o WhatsApp Business
Si necesitas repasar la diferencia entre las aplicaciones, abre el material de apoyo «¿Qué es WhatsApp Business?». Para revisar los datos de tu emprendimiento, abre «Configura tu perfil de negocio». Son las lecciones que ya conoces; puedes volver a ellas antes de practicar.

Crea tu catálogo de productos
1. Elige una pieza que quieras presentar. Anota su nombre, técnica, materiales, medidas y disponibilidad. Cuenta quién la elabora y de dónde viene. Comparte únicamente los significados culturales que tu comunidad permita difundir.
2. Toma una foto clara de la pieza completa y otra de sus detalles. Usa luz natural y un fondo sencillo. Muestra la pieza real, sin filtros que cambien sus colores.
3. Con conexión, abre WhatsApp Business y busca Catálogo en las herramientas del negocio. Elige la opción para añadir un artículo.
4. Añade las fotos, un nombre que distinga la pieza y su país de origen. Completa la descripción con materiales, medidas, técnica y tiempo de elaboración. Si está disponible el campo de precio, indica el monto y la moneda.
5. Guarda y revisa la información. Las imágenes pueden pasar por una revisión antes de estar visibles. Si la pieza se vende o cambia su disponibilidad, actualiza el catálogo.

Ejemplo de descripción
«Bolso tejido a mano por una artesana de nuestra comunidad. Elaborado con algodón y acabado artesanal. Medidas: 25 por 30 centímetros. Consulta los colores disponibles y el tiempo de preparación».
Usa este ejemplo como guía y reemplaza los datos por los de tu propia pieza.

Publica tus productos en Estados de WhatsApp
1. Elige una foto de la pieza o de su proceso. Añade una frase corta que explique qué haces y cómo pueden consultarte.
2. Antes de compartir, revisa la audiencia de tus estados para decidir quién podrá verlos.
3. Con conexión, abre la sección de estados o Novedades, crea una actualización con tu foto y texto, y publícala. Los estados tienen una duración de 24 horas.
4. Responde con calma las consultas que recibas. Confirma disponibilidad y tiempo de elaboración antes de acordar un pedido.

Práctica
Prepara una ficha de catálogo y un estado para una sola pieza. Puedes escribir el texto y elegir las fotos sin internet; publica cuando recuperes la conexión. Al terminar, revisa si tu publicación muestra claramente la pieza, su identidad y una forma de contactarte.`
  },
  {
    title: "Sesión 2: Llega a nuevos clientes",
    slug: "warmi-modulo-3-sesion-2-llega-a-nuevos-clientes",
    order: 2,
    durationMin: 30,
    content: `Ahora presentarás tu artesanía a personas que todavía no conocen tu trabajo. Empieza con una publicación sencilla y cuida la información de tu comunidad.

Promociona tu negocio en Facebook
1. Elige el espacio que ya utilizas para tu emprendimiento: tu página o un grupo que permita publicaciones de artesanías. Si necesitas ayuda para acceder, pide acompañamiento a tu facilitadora.
2. Selecciona una foto clara de la pieza y otra del proceso. Comparte imágenes de otras personas solamente con su permiso.
3. Escribe un texto breve: qué pieza presentas, quién la elabora, qué técnica utilizas y qué la hace especial. Añade medidas, disponibilidad y una forma de contacto de tu negocio.
4. Lee tu publicación antes de compartirla. Revisa que los datos sean correctos y que el texto sea fácil de entender. Publica con conexión y responde los comentarios o mensajes que recibas.
5. Conserva una copia del texto y de las fotos para preparar otras publicaciones. No necesitas pagar publicidad para hacer esta práctica.

Ejemplo de publicación
«Soy artesana y elaboro piezas tejidas a mano. Hoy comparto este bolso de algodón y un detalle de su tejido. Cada pieza lleva tiempo y cuidado. Escríbeme para conocer los colores disponibles y cómo coordinar tu pedido».
Adapta el mensaje a tu historia, sin atribuir técnicas o significados que no correspondan a tu trabajo.

Publica tu artesanía en Marketplace o una tienda virtual
1. Prepara la ficha de tu pieza: fotos propias, nombre, materiales, medidas, precio, disponibilidad y condiciones de entrega. Utiliza la misma información que revisaste en tu catálogo.
2. Con conexión, comprueba si tu cuenta tiene acceso a Marketplace. Si está disponible, busca la opción para crear una publicación de venta y completa la ficha solicitada. Si no aparece, pide ayuda a tu facilitadora; puedes seguir usando tu catálogo o tu página.
3. Antes de publicar, revisa las reglas y los campos que solicita ese espacio. No publiques tu dirección de casa ni datos personales que no sean necesarios para presentar la pieza.
4. Si ya utilizas una tienda virtual, prepara allí la ficha de la misma pieza y revisa su vista previa. Una tienda en Facebook u otra plataforma puede no estar disponible para todas las cuentas o regiones. No necesitas crear una tienda para completar esta sesión.
5. Cuando alguien consulte, confirma qué pieza desea y acuerda claramente disponibilidad, tiempo de elaboración y entrega. Si el artículo deja de estar disponible, actualiza la publicación.

Cuida tu cuenta
No compartas contraseñas ni códigos de verificación. Verifica la identidad de quien te contacta antes de entregar datos personales. Si un mensaje te genera dudas, guarda una captura y consulta a tu facilitadora.

Práctica
Prepara una publicación para Facebook y una ficha para Marketplace o tu tienda. Puedes guardar los textos y seleccionar tus fotos sin conexión. Al recuperar internet, elige un solo espacio para publicar y comprueba que la información sea clara, fiel a tu pieza y fácil de leer.`
  }
];

export class Module3ContentService {
  constructor(private readonly repository = new Module3ContentRepository()) {}

  provision() {
    return this.repository.provision({
      courseId: WHATSAPP_COURSE_ID,
      courseTitle: "Aprende a usar WhatsApp Business para tu negocio",
      title: MODULE3_TITLE,
      description:
        "Presenta tu artesanía con identidad y llega a nuevos clientes mediante tu catálogo, Estados de WhatsApp, Facebook y Marketplace o una tienda virtual.",
      order: 3,
      support: MODULE3_SUPPORT,
      lessons: MODULE3_SESSIONS.map((lesson, index) => ({
        ...lesson,
        resources:
          index === 0
            ? MODULE3_SUPPORT.map((support, position) => ({
                title: support.title,
                description: "Material de apoyo de Conoce WhatsApp Business.",
                position,
                provider: "warmi",
                originalUrl: `/artesana/aprender/${WHATSAPP_COURSE_ID}/lecciones/${support.id}`
              }))
            : [
                {
                  title: "Abrir Facebook",
                  description: "Publica cuando tengas conexión a internet.",
                  position: 0,
                  provider: "facebook",
                  originalUrl: "https://www.facebook.com/"
                },
                {
                  title: "Abrir Marketplace",
                  description:
                    "La disponibilidad depende de tu cuenta y ubicación; requiere conexión.",
                  position: 1,
                  provider: "facebook",
                  originalUrl: "https://www.facebook.com/marketplace/"
                }
              ]
      }))
    });
  }
}
