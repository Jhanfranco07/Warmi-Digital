import { parseYouTubeVideoId } from "@/shared/lib/youtube";

export const MODULE1_ID = "7dd54036-26d9-4104-8008-9d559135b461";
export const MODULE1_SUMMARY =
  "Aprende a usar tu correo, consultar información oficial, preparar tus requisitos y participar en capacitaciones virtuales.";
export const MODULE1_GMAIL_SUPPORT_ID = "5a317a3f-dc5c-4000-b059-ddf8b5f9e149";

export const MODULE1_SESSIONS = [
  {
    id: "699a22ef-7d43-4133-8710-96b33284396a",
    order: 1,
    slug: "como-crear-tu-cuenta-de-gmail-1787009925915",
    title: "Crear cuenta Gmail y enviar correos con adjuntos",
    intro:
      "Primero crearemos tu correo. Esta cuenta te servirá para registrarte en plataformas, recibir información y enviar documentos.",
    outcomes: [
      "Crear tu correo Gmail",
      "Iniciar sesión desde tu celular",
      "Enviar un correo",
      "Adjuntar documentos"
    ],
    durationMin: 25
  },
  {
    id: "61c5ebc6-2c34-40cc-a2f0-6f98e3990648",
    order: 2,
    slug: "m1-s2-instituciones-y-enlaces-oficiales",
    title:
      "Instituciones que acompañan a las artesanas y enlaces útiles para tu formación",
    intro:
      "Estas instituciones publican ferias, concursos, capacitaciones y oportunidades para artesanas.",
    outcomes: [
      "Consultar información oficial",
      "Buscar ferias, concursos y capacitaciones",
      "Conocer Artesanías del Perú"
    ],
    durationMin: 20
  },
  {
    id: "a4518c2f-9b42-438a-bfc4-a8a4725a00ee",
    order: 3,
    slug: "m1-s3-requisitos-generales-previos",
    title: "Requisitos generales previos",
    intro:
      "Estar preparada te permitirá acceder más rápido a ferias, concursos y otras oportunidades.",
    outcomes: [
      "Conocer el RNA",
      "Conocer el RUC y la Clave SOL",
      "Identificar tu cuenta bancaria y CCI",
      "Preparar documentos y fotografías"
    ],
    durationMin: 35
  },
  {
    id: "c2c730e8-26d0-470f-93b2-81879469a677",
    order: 4,
    slug: "m1-s4-capacitaciones-zoom-meet",
    title: "Acceder a capacitaciones virtuales",
    intro:
      "Zoom y Google Meet. Abre el enlace de tu capacitación, permite el micrófono y la cámara cuando los necesites y silencia tu audio mientras escuchas.",
    outcomes: [
      "Abrir el enlace de una reunión",
      "Entrar por Zoom o Google Meet",
      "Activar o silenciar el micrófono",
      "Activar o desactivar la cámara"
    ],
    durationMin: 20
  }
] as const;

export const MODULE1_VIDEOS = [
  {
    key: "M1-S1-01",
    session: 1,
    position: 10,
    sourceType: "CLOUDINARY",
    role: "main",
    publicId: "M1-S1-01_-_Crear_cuenta_Gmail_en_5_minutos",
    title: "Crear mi cuenta de Gmail",
    action: "Ver cómo crear mi Gmail"
  },
  {
    key: "M1-S1-02",
    session: 1,
    position: 20,
    sourceType: "CLOUDINARY",
    role: "main",
    publicId: "M1-S1-02_-_Adjuntar_y_enviar_archivos_por_Gmail",
    title: "Enviar un documento adjunto",
    action: "Aprender a enviar un archivo"
  },
  {
    key: "M1-S1-03",
    session: 1,
    position: 30,
    sourceType: "CLOUDINARY",
    role: "additional",
    publicId: "M1-S1-03_-_Enviar_documentos_adjuntos_desde_Gmail_en_celular",
    title: "Enviar adjuntos desde Gmail en el celular",
    action: "Ver otra forma de enviar adjuntos"
  },
  {
    key: "M1-S1-04",
    session: 1,
    position: 40,
    sourceType: "CLOUDINARY",
    role: "additional",
    publicId: "M1-S1-04_-_Crear_cuenta_Google_y_Gmail_desde_navegador",
    title: "Crear Gmail desde el navegador",
    action: "Ver otra forma de crear mi Gmail"
  },
  {
    key: "M1-S2-01",
    session: 2,
    position: 10,
    sourceType: "CLOUDINARY",
    role: "main",
    publicId: "M1-S2-01_-_Convocatorias_a_un_clic_y_enlaces_oficiales",
    title: "Cómo encontrar convocatorias y oportunidades",
    action: "Ver cómo buscar oportunidades"
  },
  {
    key: "M1-S3-02",
    session: 3,
    position: 10,
    sourceType: "CLOUDINARY",
    role: "main",
    publicId: "M1-S3-02_-_Registro_Nacional_del_Artesano_RNA_paso_a_paso",
    title: "Cómo inscribirme o renovar mi RNA",
    action: "Aprender sobre mi RNA"
  },
  {
    key: "M1-S3-01",
    session: 3,
    position: 20,
    sourceType: "CLOUDINARY",
    role: "main",
    publicId: "M1-S3-01_-_Inscribirse_al_RUC_y_obtener_Clave_SOL",
    title: "Cómo obtener mi RUC y Clave SOL",
    action: "Aprender a obtener mi RUC"
  }
] as const;

// Temporary external tutorials: replace only the URL here. Never copy them to Cloudinary.
export const MODULE1_SUPPORT_VIDEOS = {
  artesanias: {
    session: 2,
    position: 20,
    sourceType: "YOUTUBE",
    temporary: true,
    title: "Cómo registrarse en Artesanías del Perú",
    action: "Ver cómo registrarme",
    url: "https://www.youtube.com/watch?v=JNCqeoHdlRM",
    author: "Artesanías del Perú",
    sourceUrl: "https://www.youtube.com/@artesaniasdelperuoficial"
  },
  bank: {
    session: 3,
    position: 30,
    sourceType: "YOUTUBE",
    temporary: true,
    title: "Cómo abrir una cuenta bancaria",
    action: "Ver cómo abrir una cuenta",
    url: "https://www.youtube.com/watch?v=QG87CErqx8s",
    author: "BBVA Perú",
    sourceUrl:
      "https://www.bbva.pe/personas/productos/cuentas/ahorro/cuenta-digital/abrir-cuenta-app.html"
  },
  zoom: {
    session: 4,
    position: 10,
    sourceType: "YOUTUBE",
    temporary: true,
    title: "¿Cómo ingresar a una reunión por Zoom?",
    action: "Aprender a entrar por Zoom",
    url: "https://www.youtube.com/watch?v=Q9dFIERrYYU",
    author: "Profr. Santos Rivera",
    sourceUrl: "https://www.youtube.com/@Profr.SantosRivera"
  },
  meet: {
    session: 4,
    position: 20,
    sourceType: "YOUTUBE",
    temporary: true,
    title: "¿Cómo ingresar a una reunión por Google Meet?",
    action: "Aprender a entrar por Google Meet",
    url: "https://www.youtube.com/watch?v=fw_4jGoM0yQ",
    author: "DEDEV · Universidad de San Carlos de Guatemala",
    sourceUrl:
      "https://radd.virtual.usac.edu.gt/como-crear-o-ingresar-a-una-reunion-en-meet-desde-tu-telefono-celular/"
  }
} as const;

export function module1YouTubeEmbed(url: string) {
  const id = parseYouTubeVideoId(url);
  if (!id) throw new Error("El video de apoyo necesita una URL de YouTube válida.");
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
}

export const MODULE1_INSTITUTIONS = [
  {
    key: "mincetur",
    name: "MINCETUR",
    description: "Convocatorias, programas y oportunidades nacionales para artesanas.",
    opportunity: "Oportunidades nacionales",
    action: "Visitar MINCETUR",
    url: "https://www.gob.pe/mincetur",
    logo: "/images/learning/module1/mincetur.png"
  },
  {
    key: "dircetur",
    name: "DIRCETUR Cajamarca",
    description: "Capacitaciones y oportunidades regionales para artesanas.",
    opportunity: "Capacitaciones regionales",
    action: "Visitar DIRCETUR",
    url: "https://dircetur.regioncajamarca.gob.pe",
    logo: "/images/learning/module1/gore.jpg"
  },
  {
    key: "gore",
    name: "Gobierno Regional de Cajamarca",
    description: "Programas y capacitaciones disponibles en la región.",
    opportunity: "Programas regionales",
    action: "Visitar Gobierno Regional",
    url: "https://www.regioncajamarca.gob.pe",
    logo: "/images/learning/module1/gore.jpg"
  },
  {
    key: "municipalidad",
    name: "Municipalidad Provincial de San Miguel",
    description: "Ferias, asistencia técnica y actividades locales.",
    opportunity: "Ferias y acompañamiento local",
    action: "Visitar Municipalidad",
    url: "https://www.muni-sanmiguel.gob.pe",
    logo: "/images/learning/module1/municipalidad.png"
  }
] as const;

export const MODULE1_CHECKLIST = [
  "RUC y Clave SOL",
  "Registro Nacional del Artesano (RNA)",
  "Cuenta bancaria y CCI",
  "Documentos digitalizados en PDF",
  "Fotografías de mis productos",
  "Descripción de mis productos"
] as const;
export const MODULE1_OUTCOMES = [
  "Crear una cuenta de Gmail",
  "Conozco los enlaces oficiales de las entidades públicas",
  "Conozco los requisitos generales y reviso las bases de cada convocatoria",
  "Acceder a capacitaciones o reuniones por Zoom o Google Meet"
] as const;

export function module1SessionText(order: number) {
  const session = MODULE1_SESSIONS.find((item) => item.order === order);
  if (!session) throw new Error("Sesión del Módulo 1 inexistente.");
  const steps = [
    ...MODULE1_VIDEOS.filter(
      (video) => video.session === order && video.role === "main"
    ).map((video) => video.title),
    ...Object.values(MODULE1_SUPPORT_VIDEOS)
      .filter((video) => video.session === order)
      .map((video) => video.title)
  ];
  return [
    session.title,
    session.intro,
    ...steps,
    ...(order === 2
      ? MODULE1_INSTITUTIONS.map((item) => `${item.name}. ${item.description}`)
      : []),
    ...(order === 3
      ? [
          ...MODULE1_CHECKLIST,
          "Los requisitos dependen de las bases de cada convocatoria. Consulta las condiciones vigentes en la institución y el banco que elijas."
        ]
      : []),
    "Al terminar esta sesión podrás:",
    ...session.outcomes,
    ...(order === 4 ? ["Al terminar el Módulo 1, yo puedo:", ...MODULE1_OUTCOMES] : [])
  ].join("\n\n");
}
