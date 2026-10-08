import {
  MODULE3_SESSION1_ID,
  MODULE3_SESSION2_ID
} from "@/shared/learning/module3-session1";

export const MODULE3_ID = "6c96bcdf-0b41-48d2-bdcd-394d06acd9d2";
export const MODULE3_SESSIONS = [
  { id: MODULE3_SESSION1_ID, order: 1, title: "Publica tu arte en redes" },
  { id: MODULE3_SESSION2_ID, order: 2, title: "Conociendo tiendas virtuales que venden" },
  {
    id: "15d03f59-f6d2-4e13-b562-f7c6799e75d9",
    order: 3,
    title: "Aprende a cobrar desde el celular"
  },
  {
    id: "090d982d-00b6-4784-bec8-69c3eac2e564",
    order: 4,
    title: "Simulación de primera venta en línea"
  }
] as const;
export const MODULE3_QUESTIONS = [
  "¿Me piden RUC o basta mi DNI?",
  "¿Cobran comisión por cada venta?",
  "¿Quién envía el producto?",
  "¿Quién paga el envío?",
  "¿Cuándo recibo mi dinero?"
] as const;
export const MODULE3_PLATFORMS = [
  {
    name: "Artesanías del Perú",
    description: "Una vitrina orientada a productos artesanales.",
    purpose:
      "Dar a conocer tu artesanía y encontrar referencias de otros emprendimientos.",
    consideration:
      "Revisa cómo participar y las condiciones vigentes en el portal oficial.",
    cta: "Conocer Artesanías del Perú",
    url: "https://www.artesaniasdelperu.gob.pe/"
  },
  {
    name: "Ruraq Maki",
    description: "Iniciativa vinculada a artesanía tradicional y convocatorias.",
    purpose: "Conocer espacios de promoción y tiendas de arte tradicional.",
    consideration:
      "Consulta sus canales oficiales: la participación depende de cada actividad.",
    cta: "Conocer Ruraq Maki",
    url: "https://ruraqmaki.pe/"
  },
  {
    name: "Facebook Marketplace",
    description: "Permite publicar productos y contactar compradores desde Facebook.",
    purpose: "Presentar una pieza y conversar con personas interesadas.",
    consideration:
      "Comprueba si tu cuenta tiene acceso y revisa las reglas antes de publicar.",
    cta: "Aprender a vender en Marketplace",
    url: "https://www.facebook.com/marketplace/"
  },
  {
    name: "Mercado Libre Perú",
    description:
      "Marketplace de gran alcance que puede aplicar cargos según la publicación o venta.",
    purpose: "Ofrecer productos y conocer sus opciones de venta y envío.",
    consideration:
      "Usa el simulador oficial para revisar costos y condiciones antes de publicar.",
    cta: "Conocer Mercado Libre",
    url: "https://vendedores.mercadolibre.com.pe/"
  }
] as const;
export const MODULE3_START_SMALL =
  "No necesitas estar en todas las tiendas. Empieza por una, aprende cómo funciona y después puedes probar otra.";
export const MODULE3_PAYMENT_RULE =
  "La captura no confirma el pago. Confirma el dinero dentro de tu propia aplicación.";
export const MODULE3_PAYMENT_CHECKLIST = [
  "Abro yo misma Yape o Plin.",
  "Reviso mis movimientos.",
  "Confirmo el monto.",
  "Recién entrego el producto."
] as const;
export const MODULE3_PAYMENT_ALERTS = [
  "Me apuran para entregar.",
  "La captura llega desde otro número.",
  "El monto o la hora no coinciden.",
  "Dicen que el dinero aparecerá después.",
  "Me piden devolver dinero antes de verificar."
] as const;
export const MODULE3_DELIVERY_STEPS = [
  {
    title: "Acuerdo la entrega",
    items: [
      "Acuerdo dónde y cuándo se entregará el producto.",
      "Confirmo el costo de envío y quién lo paga.",
      "Dejo el acuerdo escrito en el chat."
    ],
    example:
      "Ejemplo de práctica: acordamos entregar el bolso el viernes. Escribo el punto de entrega y el costo acordado en el chat."
  },
  {
    title: "Empaqueto con cuidado",
    items: [
      "Uso una bolsa o empaque limpio.",
      "Protejo el producto para que no se golpee ni se deforme.",
      "Lo protejo frente a humedad o lluvia.",
      "Añado nombre y teléfono cuando corresponda."
    ],
    example:
      "Antes de cerrar el paquete reviso que la pieza esté limpia, protegida y correctamente identificada."
  },
  {
    title: "Envío y guardo la prueba",
    items: [
      "Fotografío el paquete preparado.",
      "Guardo el comprobante de envío.",
      "Conservo los datos de la agencia.",
      "Uso el comprobante como respaldo del envío."
    ],
    example:
      "Guardo la foto y el comprobante juntos para encontrarlos si mi clienta pregunta por el envío."
  },
  {
    title: "Aviso y hago seguimiento",
    items: [
      "Comparto el seguimiento cuando exista.",
      "Aviso cuándo debería llegar según la información del envío.",
      "Consulto si llegó correctamente.",
      "Confirmo que mi clienta está satisfecha."
    ],
    example:
      "Ejemplo de mensaje: «Ya envié tu pieza. Te comparto el comprobante. Avísame cuando llegue para saber que todo está bien»."
  }
] as const;
export const MODULE3_OUTCOMES = [
  {
    title: "Publico en mis estados",
    description: "Subo la foto de mi producto con información clara."
  },
  {
    title: "Publico en Facebook",
    description: "Puedo presentar mi producto y atender consultas."
  },
  {
    title: "Cobro con seguridad",
    description: "Uso Yape o Plin y verifico el pago dentro de mi propia aplicación."
  },
  {
    title: "Entrego y hago seguimiento",
    description:
      "Acuerdo la entrega, guardo comprobantes y verifico que mi clienta recibió el producto."
  }
] as const;
export const MODULE3_CLOSING_MESSAGE =
  "Si algo todavía no me sale, puedo practicarlo nuevamente con mi facilitadora.";
export const MODULE3_GUIDES = [
  {
    order: 2,
    key: "elegir-donde-vender",
    title: "Guía para elegir dónde vender por internet"
  },
  {
    order: 3,
    key: "cobros-seguros-yape-plin",
    title: "Guía de cobros seguros con Yape y Plin"
  },
  {
    order: 4,
    key: "entregar-venta-en-linea",
    title: "Checklist para entregar una venta en línea"
  }
] as const;
export const MODULE3_NEW_VIDEOS = [
  { publicId: "M3-S3-02_-_Crear_cuenta_Yape", title: "Crear cuenta Yape", position: 10 },
  { publicId: "M3-S3-01_-_Crear_y_usar_Plin", title: "Crear y usar Plin", position: 20 }
] as const;
export function module3GuidePublicId(order: number, key: string) {
  return `Warmi/MODULO_3/SESION_${order}/GUIAS/${key}-v1.pdf`;
}
export function module3SessionText(order: number) {
  if (order === 2)
    return [
      MODULE3_SESSIONS[1].title,
      ...MODULE3_QUESTIONS,
      MODULE3_START_SMALL,
      ...MODULE3_PLATFORMS.map(
        (p) => `${p.name}\n${p.description}\n${p.purpose}\n${p.consideration}\n${p.url}`
      )
    ].join("\n\n");
  if (order === 3)
    return [
      MODULE3_SESSIONS[2].title,
      "Elige cómo cobrar: Yape o Plin.",
      MODULE3_PAYMENT_RULE,
      ...MODULE3_PAYMENT_CHECKLIST,
      "Señales de alerta",
      ...MODULE3_PAYMENT_ALERTS
    ].join("\n\n");
  return MODULE3_DELIVERY_STEPS.map((s) =>
    [s.title, ...s.items, s.example].join("\n")
  ).join("\n\n");
}
export function module3Progress(completedIds: readonly string[]) {
  return Math.round(
    (MODULE3_SESSIONS.filter((s) => completedIds.includes(s.id)).length /
      MODULE3_SESSIONS.length) *
      100
  );
}
