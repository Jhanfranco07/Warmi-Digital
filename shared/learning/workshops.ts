export const WORKSHOPS_PRESENTATION = {
  location:
    "Se desarrollarán en locales comunales o talleres artesanales de cada asociación.",
  duration: "2 horas por sesión, durante 4 meses.",
  methodology:
    "Explicación breve oral: 20 minutos. Práctica guiada en la plataforma o en el celular: 60 minutos. Ejercicios individuales: 40 minutos.",
  accompaniment:
    "Acompañamiento constante de la facilitadora, quien orientará el proceso.",
  promoters:
    "Las promotoras son artesanas líderes seleccionadas por cada organización: aprende una, enseña a cinco."
} as const;

/**
 * Ruta temática referencial del programa de cuatro meses.
 * "Mes" indica la secuencia pedagógica, no una fecha o inscripción confirmada.
 * Las fechas reales se obtienen exclusivamente de WorkshopService.
 */
export const WORKSHOP_MONTHS = [
  {
    month: 1,
    title: "Mi celular como herramienta de negocio",
    topics: [
      "Crear una cuenta Gmail y enviar correos con adjuntos",
      "Explorar convocatorias oficiales y portales de capacitación del Estado",
      "Revisar requisitos generales antes de postular",
      "Aprender a usar Zoom y Google Meet para participar en reuniones y capacitaciones virtuales"
    ]
  },
  {
    month: 2,
    title: "Oportunidades para mi negocio",
    topics: [
      "Conocer las oportunidades disponibles",
      "Aprender a postular: requisitos y documentos",
      "Preparar documentos y llenar formularios",
      "Simulación de postulación"
    ]
  },
  {
    month: 3,
    title: "Herramientas digitales para vender",
    topics: [
      "Publicar tu arte en redes sociales",
      "Conocer tiendas que venden en línea",
      "Aprender a cobrar desde el celular",
      "Simulación de una primera venta en línea"
    ]
  },
  {
    month: 4,
    title: "Estrategias de venta y autonomía digital",
    topics: [
      "Mi producto, mi historia y mi cultura",
      "Cómo presentar mi producto",
      "El valor de la artesanía",
      "Simulación de venta sin ayuda"
    ]
  }
] as const;
