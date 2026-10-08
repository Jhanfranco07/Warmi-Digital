export const MODULE4_ID = "2853b850-4032-5e82-b861-8eaaa84913f8";
export const MODULE4_CONTENT_VERSION = "m4-visual-2026-10-v1";
export const MODULE4_SESSIONS = [
  {
    id: "e5d67e39-87e6-5d9e-92c3-0b5c830970fe",
    order: 1,
    title: "Mi producto, mi historia, mi cultura",
    images: ["artesana", "paisaje", "manos", "munecas", "tejidos"]
  },
  {
    id: "a129768b-0b93-5174-97cd-7539c431b949",
    order: 2,
    title: "Cómo presentar mi producto",
    images: ["artesana", "bolso"]
  },
  {
    id: "ea5fa9dc-710d-5782-aa07-7fe81f3ffc91",
    order: 3,
    title: "El valor de la artesanía",
    images: ["qallwa", "resolucion"]
  },
  {
    id: "53020031-7b46-5001-bc0c-db41fa536a58",
    order: 4,
    title: "Simulación de venta sin ayuda",
    images: ["bolso", "entrega"]
  }
] as const;
export const MODULE4_IMAGES = [
  { key: "artesana", alt: "Artesana bordando un tejido, recorte del material Warmi" },
  { key: "paisaje", alt: "Paisaje y comunidad del material Warmi" },
  { key: "manos", alt: "Manos trabajando un tejido de colores" },
  { key: "munecas", alt: "Muñecas artesanales con vestimenta tradicional" },
  { key: "bolso", alt: "Bolso artesanal con flores tejidas" },
  { key: "tejidos", alt: "Tejidos doblados que muestran fibras, texturas y acabados" },
  { key: "qallwa", alt: "Artesana trabajando un tejido en qallwa de colores" },
  {
    key: "resolucion",
    alt: "Imagen de apoyo de la Resolución Viceministerial 211-2019 del material fuente"
  },
  { key: "entrega", alt: "Artesana preparando un paquete mientras utiliza su celular" }
] as const;
export type Module4ImageKey = (typeof MODULE4_IMAGES)[number]["key"];
export const MODULE4_QUESTIONS = [
  "¿Qué es y de qué está hecho?",
  "¿Quién lo hizo y dónde?",
  "¿Cuánto tiempo demoró en elaborarse?"
];
export const MODULE4_DESCRIPTION =
  "Chalina tejida en qallwa. Elaborada a mano por Maribel Quispe con lana de oveja de San Miguel, Cajamarca. Tres días de trabajo dedicado. S/ 100.";
export const MODULE4_EXPERIENCE = [
  { title: "Me descubre", text: "La foto es lo primero que ve." },
  { title: "Me escribe", text: "Respondo el mismo día." },
  { title: "Paga y espera", text: "Le explico cuándo llegará su producto." },
  { title: "Abre el paquete", text: "La forma en que lo recibe ayuda a que vuelva." }
];
export const MODULE4_HERITAGE_URL =
  "https://www.gob.pe/institucion/cultura/normas-legales/355932-211-2019-vmpcic-mc";
export const MODULE4_HERITAGE =
  "Los conocimientos, técnicas y prácticas del tejido en qallwa de San Miguel, Cajamarca, fueron reconocidos como Patrimonio Cultural de la Nación en 2019. El reconocimiento protege una tradición y sus saberes; no certifica cada producto individual.";
export const MODULE4_SALE = [
  {
    title: "Presento mi producto",
    prompt: "Elige una foto clara y cuenta qué hace especial tu pieza.",
    artisan:
      "Hola, soy Rosa de San Miguel. Te presento este bolso artesanal tejido a mano con lana de alpaca y diseños inspirados en nuestra cultura.",
    customer: "¡Qué lindo! ¿De qué material es? ¿Tienes otros colores?"
  },
  {
    title: "Respondo consultas",
    prompt: "Contesta con amabilidad y explica lo que tu clienta necesita saber.",
    artisan:
      "Gracias por tu interés. Está hecho de lana de alpaca. Tengo rojo, azul y beige. Puedo enviarte más fotos.",
    customer: "Me gusta el rojo. ¿Cuánto cuesta y cómo lo recibiría?"
  },
  {
    title: "Informo precio y características",
    prompt: "Explica precio, forma de pago y condiciones de entrega antes de cerrar.",
    artisan:
      "En este ejemplo el bolso cuesta S/ 80. Puedo recibir Yape, Plin o efectivo. Antes de pagar acordamos el costo de envío y cuándo llegará.",
    customer: "De acuerdo. ¿Me compartes los datos para el pago?"
  },
  {
    title: "Cierro la venta",
    prompt: "Verifica el pago en tu propia aplicación y confirma cómo harás la entrega.",
    artisan:
      "Te comparto los datos acordados. Ya verifiqué el pago en mi aplicación. Al enviar tu bolso te compartiré el comprobante y el seguimiento. ¡Gracias por tu compra!",
    customer: "Gracias. Quedo pendiente del envío."
  }
] as const;
export const MODULE4_OUTCOMES = [
  "Describo mi producto y cuento brevemente su historia.",
  "Presento mi producto con fotos y una descripción clara.",
  "Comunico el valor cultural de mi artesanía.",
  "Respondo consultas de potenciales clientes.",
  "Informo precio, forma de pago y condiciones de entrega.",
  "Realizo una simulación de venta de manera autónoma."
];
export function module4Progress(ids: readonly string[]) {
  return Math.round(
    (MODULE4_SESSIONS.filter((s) => ids.includes(s.id)).length / 4) * 100
  );
}
export function module4ImagePublicId(key: Module4ImageKey) {
  return `Warmi/MODULO_4/IMAGENES/${key}-v1`;
}
export function module4ImageKey(
  value: string | null | undefined
): Module4ImageKey | undefined {
  return MODULE4_IMAGES.find((i) => value?.includes(`/IMAGENES/${i.key}-v1`))?.key;
}
export function module4LessonText(order: number) {
  if (order === 1)
    return [
      MODULE4_SESSIONS[0].title,
      "Mi producto también cuenta mi historia y mi cultura.",
      ...MODULE4_QUESTIONS,
      MODULE4_DESCRIPTION
    ].join("\n\n");
  if (order === 2)
    return [
      MODULE4_SESSIONS[1].title,
      ...MODULE4_EXPERIENCE.map((e) => `${e.title}: ${e.text}`),
      "Lo que más molesta es que no respondan o esperar sin saber cuándo llega.",
      "Puedo destacar el valor cultural o presentar nombre, características y precio."
    ].join("\n\n");
  if (order === 3)
    return [
      MODULE4_SESSIONS[2].title,
      MODULE4_HERITAGE,
      "Mi trabajo lleva historia, identidad y tradición. Explico la técnica, los materiales y el tiempo dedicado.",
      MODULE4_HERITAGE_URL
    ].join("\n\n");
  return [
    ...MODULE4_SALE.map(
      (s) => `${s.title}\n${s.prompt}\nArtesana: ${s.artisan}\nClienta: ${s.customer}`
    ),
    ...MODULE4_OUTCOMES
  ].join("\n\n");
}
