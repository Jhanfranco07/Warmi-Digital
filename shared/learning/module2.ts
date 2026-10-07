export const MODULE2_ID = "c156c5d5-8c81-48f8-85d4-234ecb21ec0e";
export const MODULE2_TITLE = "Módulo 2: Oportunidades para mi negocio";
export const MODULE2_SUMMARY =
  "Aprende a reconocer ferias y concursos, revisar convocatorias y preparar una postulación desde tu celular.";

export const MODULE2_SOURCES = {
  somos:
    "https://www.gob.pe/institucion/mincetur/campa%C3%B1as/140677-somos-artesania-2026",
  amautas:
    "https://www.gob.pe/institucion/mincetur/campa%C3%B1as/141549-premio-nacional-amautas-de-la-artesania-peruana-2026",
  ruraq: "https://www.ruraqmaki.pe/expoventa",
  feria:
    "https://www.gob.pe/institucion/mincetur/campa%C3%B1as/140905-feria-nacional-de-artesania-de-nuestras-manos-2026",
  artesanias: "https://www.artesaniasdelperu.gob.pe/eventoscomerciales"
} as const;
export const MODULE2_VIDEOS = [
  {
    key: "M2-S2-01",
    session: 2,
    position: 10,
    role: "main",
    publicId: "M2-S2-01_-_Somos_Artesania_2026_requisitos_y_registro_virtual",
    title: "Ejemplo: requisitos para participar en Somos Artesanía",
    action: "Ver ejemplo de postulación"
  },
  {
    key: "M2-S3-02",
    session: 3,
    position: 10,
    role: "main",
    publicId: "M2-S3-02_-_Convertir_foto_a_PDF_desde_celular",
    title: "Convertir una foto en PDF desde el celular",
    action: "Aprender a convertir una foto en PDF"
  },
  {
    key: "M2-S3-03",
    session: 3,
    position: 20,
    role: "main",
    publicId: "M2-S3-03_-_Tomar_buenas_fotos_de_productos",
    title: "Tomar buenas fotos de mis productos",
    action: "Aprender a fotografiar mi producto"
  },
  {
    key: "M2-S3-01",
    session: 3,
    position: 30,
    role: "additional",
    publicId: "M2-S3-01_-_Convertir_imagen_JPG_a_PDF",
    title: "Otra forma: convertir JPG en PDF desde navegador",
    action: "Ver otra forma de convertir una imagen en PDF"
  }
] as const;
export const MODULE2_EXCLUDED_VIDEO =
  "M2-S2-01B_-_Somos_Artesania_2026_copia_alternativa";

export type Module2Step = {
  title: string;
  text: string;
  kind?:
    | "opportunities"
    | "choice"
    | "questions"
    | "pdf"
    | "photos"
    | "form"
    | "product"
    | "checklist";
  bullets?: readonly string[];
  videoKey?: string;
  examples?: readonly { title: string; url?: string; note?: string }[];
};
export const MODULE2_QUESTIONS = [
  {
    title: "¿Quién convoca?",
    text: "Busca el nombre de la institución. Comprueba que la convocatoria esté en su página oficial."
  },
  {
    title: "¿Cuáles son los requisitos?",
    text: "Revisa quién puede participar y qué documentos debes presentar."
  },
  {
    title: "¿Cuál es la fecha límite?",
    text: "Busca siempre la fecha de cierre y anótala en tu celular. Revisa si hay cambios en el cronograma."
  },
  {
    title: "¿Dónde se postula?",
    text: "Busca el enlace o dirección oficial. No envíes documentos a contactos desconocidos."
  },
  {
    title: "¿Qué ofrece?",
    text: "Identifica el premio, capacitación o espacio de venta. Revisa también los compromisos que asumes."
  }
] as const;
export const MODULE2_PRODUCT = [
  {
    title: "Nombre del producto",
    value: "Chal de lana de oveja tejido en qallwa",
    help: "Escribe qué pieza es, el material principal y la técnica que utilizas."
  },
  {
    title: "Materiales",
    value: "Lana de oveja hilada a mano y teñida con tintes naturales.",
    help: "Nombra los materiales reales de tu pieza y cómo los preparas."
  },
  {
    title: "Medidas",
    value: "1.80 m × 0.60 m",
    help: "Mide largo y ancho. Indica si usas centímetros o metros."
  },
  {
    title: "Tiempo",
    value: "12 días",
    help: "Anota cuánto tiempo dedicas a elaborar la pieza."
  },
  {
    title: "Precio",
    value: "S/ 180",
    help: "Suma materiales y el valor de tus días de trabajo. Considera también otros costos, gastos y tu margen. Es un precio de ejemplo, no una recomendación."
  },
  {
    title: "Historia",
    value: "Técnica aprendida de su abuela en San Miguel, Cajamarca.",
    help: "Cuenta de quién aprendiste y qué significa esta técnica para ti y tu comunidad."
  }
] as const;
export const MODULE2_CHOICES = [
  {
    label: "Quiero vender directamente",
    answer: "Feria",
    text: "Puedes mostrar tus piezas, conversar con clientes y vender directamente."
  },
  {
    label: "Quiero competir por un premio",
    answer: "Concurso",
    text: "Revisa las bases, los criterios del jurado y la fecha de cierre."
  },
  {
    label: "Quiero aprender antes de participar",
    answer: "Capacitación",
    text: "Busca un tema que te ayude a preparar tus productos y documentos."
  }
] as const;
export const MODULE2_SESSIONS: readonly {
  id: string;
  order: number;
  slug: string;
  title: string;
  intro: string;
  durationMin: number;
  outcomes: readonly string[];
  steps: readonly Module2Step[];
}[] = [
  {
    id: "358c973f-9f8c-43af-a29e-8d7f9eaf7bdb",
    order: 1,
    slug: "m2-s1-conociendo-las-oportunidades",
    title: "Conociendo las oportunidades",
    intro: "En esta sesión aprenderás a distinguir ferias, concursos y capacitaciones.",
    durationMin: 20,
    outcomes: [
      "Reconocer una feria, un concurso y una capacitación",
      "Elegir la oportunidad que se ajusta a lo que necesito"
    ],
    steps: [
      {
        title: "¿Qué oportunidades existen?",
        text: "Hay oportunidades para vender, mostrar tu trabajo y seguir aprendiendo.",
        kind: "opportunities"
      },
      {
        title: "¿Qué es una feria?",
        text: "Exhibes tus productos, puedes vender directamente y conoces clientes y otros artesanos.",
        bullets: [
          "Más posibilidades de venta",
          "Nuevos clientes",
          "Dar a conocer tu marca",
          "Crear contactos"
        ],
        examples: [
          {
            title: "Feria Solidaria - Artesanías del Perú",
            url: MODULE2_SOURCES.artesanias
          },
          { title: "Feria Nacional De Nuestras Manos", url: MODULE2_SOURCES.feria },
          {
            title: "Ferias regionales y distritales",
            note: "Consulta las convocatorias de tu región o municipio."
          },
          {
            title: "Ruraq Maki, Hecho a Mano",
            url: MODULE2_SOURCES.ruraq,
            note: "Es una exposición-venta de arte tradicional, no un concurso de premios."
          }
        ]
      },
      {
        title: "¿Qué es un concurso?",
        text: "Presentas tu producto o proyecto. Un jurado evalúa las propuestas según las bases y puede otorgar premios o reconocimientos.",
        bullets: ["Reconocimiento", "Premios o apoyo", "Visibilidad"],
        examples: [
          {
            title: "Somos Artesanía 2026",
            url: MODULE2_SOURCES.somos,
            note: "Ejemplo histórico: revisa nuevas ediciones en la fuente oficial."
          },
          {
            title: "Premio Nacional Amautas de la Artesanía Peruana 2026",
            url: MODULE2_SOURCES.amautas,
            note: "Reconoce la trayectoria artesanal. Consulta las bases de cada edición."
          }
        ]
      },
      {
        title: "¿Por qué capacitarme?",
        text: "Aprender te ayuda a participar con más confianza.",
        bullets: [
          "Muchas son gratuitas: revisa las condiciones",
          "Suelen tener pocos requisitos",
          "Te preparan para ferias y concursos"
        ]
      },
      {
        title: "¿Cuál elegir?",
        text: "Elige lo que necesitas hoy. Puedes participar en distintas oportunidades en otro momento.",
        kind: "choice"
      }
    ]
  },
  {
    id: "73b088f0-f3c1-4d86-82e3-09318464cb1f",
    order: 2,
    slug: "m2-s2-requisitos-y-documentos",
    title: "Aprendiendo a postular: requisitos y documentos",
    intro: "En esta sesión aprenderás a leer una convocatoria antes de postular.",
    durationMin: 20,
    outcomes: [
      "Leer quién convoca, qué pide y cuándo cierra",
      "Revisar las bases y la fecha de cierre antes de postular"
    ],
    steps: [
      {
        title: "Aprende a leer una convocatoria",
        text: "Busca las respuestas a estas cinco preguntas.",
        kind: "questions"
      },
      {
        title: "¿Qué necesito revisar?",
        text: "Marca lo que ya revisaste. Los requisitos cambian según la convocatoria.",
        kind: "checklist",
        bullets: [
          "Cronograma",
          "Bases del concurso",
          "Requisitos",
          "Cómo y dónde postular"
        ]
      },
      {
        title: "Ejemplo real: Somos Artesanía 2026",
        text: "Este video es un ejemplo de una edición anterior. No es una inscripción abierta; consulta las bases y fechas vigentes en MINCETUR.",
        videoKey: "M2-S2-01",
        examples: [
          {
            title: "Consultar la convocatoria oficial de Somos Artesanía 2026",
            url: MODULE2_SOURCES.somos
          }
        ]
      }
    ]
  },
  {
    id: "fb6ba221-ad24-4319-8aa2-1fceb9156fb1",
    order: 3,
    slug: "m2-s3-documentos-formularios-y-ficha",
    title: "Preparando los documentos y llenando formularios",
    intro:
      "En esta sesión aprenderás a preparar PDF, fotos, formularios y tu ficha de producto.",
    durationMin: 30,
    outcomes: [
      "Convertir una foto en PDF",
      "Tomar buenas fotografías",
      "Revisar un formulario",
      "Completar una ficha de producto"
    ],
    steps: [
      {
        title: "Convertir una foto en PDF",
        text: "Muchas convocatorias solo aceptan documentos en PDF. Puedes hacerlo desde tu celular.",
        kind: "pdf",
        videoKey: "M2-S3-02",
        bullets: [
          "Abro la foto",
          "Toco los tres puntos o el menú",
          "Elijo Guardar como PDF",
          "Guardo con un nombre claro"
        ]
      },
      {
        title: "Tomar una buena foto de mi producto",
        text: "Muestra tu pieza con claridad, sin ocultar sus detalles.",
        kind: "photos",
        videoKey: "M2-S3-03",
        bullets: [
          "Luz natural: cerca de una ventana, sin sombras fuertes",
          "Fondo simple: sin objetos que distraigan",
          "Varias tomas: frente, detalle y otro ángulo",
          "Pulso firme: apoya tus manos o el celular"
        ]
      },
      {
        title: "¿Cómo llenar un formulario?",
        text: "Prepara tus datos y revisa todo antes de enviar.",
        kind: "form",
        bullets: [
          "Leo todo antes de escribir",
          "Junto mis documentos",
          "Escribo mis datos como aparecen en mi DNI",
          "Completo los campos obligatorios",
          "Reviso antes de enviar"
        ]
      },
      {
        title: "Cómo completar una ficha de producto",
        text: "Veamos el ejemplo de María. Usa los datos reales de tu pieza cuando prepares tu ficha.",
        kind: "product"
      }
    ]
  },
  {
    id: "953e1983-d2ce-46aa-ad94-d15cd69a7afe",
    order: 4,
    slug: "m2-s4-simulacion-de-postulacion",
    title: "Simulación de postulación",
    intro:
      "Vamos a acompañar a María desde que encuentra la convocatoria hasta que guarda su comprobante.",
    durationMin: 20,
    outcomes: [
      "Reconocer una oportunidad: distingo un concurso de una feria y sé cuál me conviene",
      "Leer una convocatoria: sé encontrar quién convoca, qué pide y cuándo cierra",
      "Preparar mis documentos: sé tomar buenas fotos y convertirlas en PDF",
      "Llenar mi postulación: sé completar un formulario y una ficha de producto"
    ],
    steps: [
      {
        title: "Leo las bases y anoto la fecha de cierre",
        text: "María revisa la fuente oficial y guarda la fecha en su celular.",
        kind: "checklist",
        bullets: ["Leí las bases", "Anoté la fecha de cierre"]
      },
      {
        title: "Reúno mis requisitos",
        text: "María prepara los documentos que piden las bases. Esta lista es un ejemplo, no una regla para todas las convocatorias.",
        kind: "checklist",
        bullets: ["DNI", "RNA", "Fotos", "PDF"]
      },
      {
        title: "Completo mi ficha del producto",
        text: "María revisa el nombre, materiales, medidas, tiempo, precio e historia de su chal.",
        kind: "product"
      },
      {
        title: "Reviso con otra persona",
        text: "María pide apoyo para revisar sus datos y comprobar que los archivos se abren.",
        kind: "checklist",
        bullets: [
          "Mis datos están completos",
          "Mis PDF y fotos se abren",
          "Alguien me ayudó a revisar"
        ]
      },
      {
        title: "Envío y guardo mi comprobante",
        text: "María envía su postulación en la plataforma oficial y guarda la confirmación.",
        kind: "checklist",
        bullets: [
          "Revisé antes de enviar",
          "Guardé el comprobante o una captura de confirmación"
        ]
      }
    ]
  }
];
export function module2SessionText(order: number) {
  const session = MODULE2_SESSIONS.find((item) => item.order === order);
  if (!session) throw new Error("Sesión M2 inexistente.");
  return [
    session.title,
    session.intro,
    ...session.steps.flatMap((step) => [
      step.title,
      step.text,
      ...(step.bullets ?? []),
      ...(step.examples ?? []).map((item) => `${item.title}. ${item.note ?? ""}`)
    ]),
    ...(order === 2 ? MODULE2_QUESTIONS.map((item) => `${item.title} ${item.text}`) : []),
    ...(order === 3 || order === 4
      ? MODULE2_PRODUCT.map((item) => `${item.title}. ${item.value}. ${item.help}`)
      : []),
    ...session.outcomes
  ].join("\n\n");
}
