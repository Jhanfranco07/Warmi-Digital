export const MODULE3_SESSION1_ID = "8a8e449b-76a6-4a6d-9693-6238f75092bc";
export const MODULE3_SESSION2_ID = "9bd401d6-5c80-4099-aa7b-e1b90b62d9b7";
export const MODULE3_GUIDES_FOLDER = "Warmi/MODULO_3/SESION_1/GUIAS";

export const MODULE3_SESSION1_TOPICS = [
  {
    key: "whatsapp-o-business",
    group: "Empieza aquí",
    title: "¿WhatsApp o WhatsApp Business?",
    description:
      "WhatsApp sirve para conversar. Business añade herramientas para presentar tu negocio y tus productos.",
    steps: [
      "Si ya tienes WhatsApp, no borres tus conversaciones.",
      "Para vender, conoce el perfil de negocio y el catálogo de Business.",
      "Prepara tu número y pide apoyo antes de cambiar de aplicación."
    ],
    videoIds: ["af430a8c-97fc-4557-a191-5706b5ebef2d"],
    guideTitle: "Guía PDF: ¿WhatsApp o WhatsApp Business?",
    sourcePages: [31],
    mode: "recreated"
  },
  {
    key: "configurar-whatsapp-business",
    group: "WhatsApp Business",
    title: "Configurar WhatsApp Business",
    description:
      "Presenta quién eres, qué elaboras y cuándo puedes atender a tus clientes.",
    steps: [
      "Instala la aplicación oficial y verifica tu número con conexión.",
      "Completa nombre, foto y categoría de tu emprendimiento.",
      "Revisa descripción y horario de atención antes de guardar."
    ],
    videoIds: ["af15d63f-32b3-449e-92a5-5179e678d487"],
    guideTitle: "Guía PDF: Configurar WhatsApp Business",
    sourcePages: [32],
    mode: "recreated"
  },
  {
    key: "crear-catalogo-basico",
    group: "WhatsApp Business",
    title: "Crear un catálogo básico",
    description:
      "Empieza con una pieza: foto clara, nombre y una descripción fiel a tu trabajo.",
    steps: [
      "Abre Catálogo en las herramientas del negocio.",
      "Añade fotos, nombre, precio y descripción de tu pieza.",
      "Guarda, revisa y actualiza su disponibilidad."
    ],
    videoIds: ["0ac3afdd-5a77-4bca-9cb9-425d44b47bd8"],
    guideTitle: "Guía PDF: Crear catálogo básico",
    sourcePages: [33, 34],
    mode: "recreated-with-extracts"
  },
  {
    key: "publicar-estados-whatsapp",
    group: "WhatsApp Business",
    title: "Publicar en Estados de WhatsApp",
    description:
      "Comparte una foto y una frase breve con la audiencia que elijas. Tu estado dura 24 horas.",
    steps: [
      "Entra a Actualizaciones o Novedades y busca Mi estado.",
      "Elige tu foto y escribe cómo pueden consultarte.",
      "Revisa la audiencia y publica cuando tengas internet."
    ],
    videoIds: ["dfa3fa09-435f-45f0-9af2-399285e875a8"],
    guideTitle: "Guía PDF: Publicar en estados de WhatsApp",
    sourcePages: [35, 36],
    mode: "recreated-with-extracts"
  },
  {
    key: "crear-cuenta-facebook",
    group: "Facebook",
    title: "Crear mi cuenta en Facebook",
    description:
      "Si ya tienes una cuenta, úsala. Si todavía no tienes, prepara tu celular y un número o correo al que puedas acceder.",
    steps: [
      "Busca la aplicación oficial y la opción Crear cuenta nueva.",
      "Completa tus datos reales y confirma tu número o correo.",
      "Protege tu contraseña y nunca compartas códigos de verificación."
    ],
    videoIds: [],
    guideTitle: "Guía PDF: Crear cuenta en Facebook",
    sourcePages: [37, 38],
    mode: "extracted"
  },
  {
    key: "vender-facebook-marketplace",
    group: "Facebook",
    title: "Vender en Facebook Marketplace",
    description:
      "Prepara una publicación con fotos propias y datos claros. Marketplace puede no estar disponible para todas las cuentas.",
    steps: [
      "Busca Marketplace y la opción para crear una publicación.",
      "Añade fotos, título, precio, categoría y descripción.",
      "Revisa antes de publicar y acuerda la entrega con cuidado."
    ],
    videoIds: [
      "4171b83c-da65-4d47-8bee-3bd71d48fbe3",
      "ecb96475-8fdd-4e3c-9899-c5e2bc0cc0b6"
    ],
    guideTitle: "Guía PDF: Vender en Facebook Marketplace",
    sourcePages: [39, 40, 41],
    mode: "recreated-with-extracts"
  },
  {
    key: "estados-o-facebook",
    group: "Para terminar",
    title: "¿Estados o Facebook?",
    description:
      "Elige según a quién quieres llegar. No necesitas publicar en todos los espacios al mismo tiempo.",
    steps: [
      "Estados: muestra novedades a tus contactos según tu privacidad.",
      "Facebook: llega a nuevas personas según la audiencia de tu publicación.",
      "Prepara fotos y textos sin internet; comparte cuando tengas conexión."
    ],
    videoIds: [],
    guideTitle: "Guía PDF: ¿Estados o Facebook?",
    sourcePages: [42],
    mode: "recreated"
  }
] as const;

export function module3GuidePublicId(key: string) {
  return `${MODULE3_GUIDES_FOLDER}/${key}-v1.pdf`;
}

export type Session1Resource = {
  id: string;
  title: string;
  description: string | null;
  fileId?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  downloadUrl?: string;
  internalHref?: string;
};
