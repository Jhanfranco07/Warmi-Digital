# Auditoría de recursos audiovisuales

Fecha de revisión: 12 de octubre de 2026.

Esta auditoría revisa el programa `Aprender para crecer` sin cambiar los objetivos
pedagógicos, los recursos propios ni la regla de descargas. Los enlaces de YouTube
se reproducen solo con conexión mediante `LearningVideo`, que usa
`youtube-nocookie.com`, mantiene el enlace alternativo a YouTube y abre un solo
reproductor bajo demanda.

## Resultado

No se agregaron enlaces nuevos. Los cuatro casos inicialmente señalados del Módulo 1
ya cuentan con recursos externos pertinentes; las demostraciones necesarias del
Módulo 2 ya son videos propios. Añadir otro video a las actividades de decisión,
checklist y simulación no mejora el recorrido guiado. El Módulo 3 conserva sus
recursos propios y offline; el Módulo 4 conserva imágenes, ejemplos y prácticas.

## Matriz por módulo y sesión

| Módulo | Sesión | Tema                               | Recurso actual                                                                  | Evaluación y acción                                                                                  |
| ------ | ------ | ---------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| M1     | 1      | Gmail y adjuntos                   | Dos MP4 propios, más alternativas y PDF                                         | Adecuado; no requiere YouTube.                                                                       |
| M1     | 2      | Instituciones y oportunidades      | MP4 propio sobre convocatorias y tutorial de Artesanías del Perú                | Adecuado. El tutorial externo cubre el registro en la plataforma.                                    |
| M1     | 3      | RNA, RUC y cuenta bancaria         | MP4 propios para RNA/RUC y YouTube de BBVA Perú para abrir cuenta desde celular | Adecuado. Se mantiene la nota para consultar condiciones vigentes en cada entidad.                   |
| M1     | 4      | Zoom y Google Meet                 | Tutoriales YouTube para móvil                                                   | Adecuado. Son demostraciones concretas y se mantiene la advertencia de que la interfaz puede variar. |
| M2     | 1      | Ferias, concursos y capacitaciones | Explicación, ejemplos y elección guiada                                         | No falta una demostración; es una actividad de comprensión.                                          |
| M2     | 2      | Leer convocatoria y requisitos     | MP4 propio de Somos Artesanía y preguntas guiadas                               | Adecuado; la convocatoria se presenta como ejemplo histórico, no como inscripción abierta.           |
| M2     | 3      | Documentos, fotos y formularios    | MP4 propios para foto a PDF y fotografía de producto                            | Adecuado; el formulario se practica dentro de la sesión.                                             |
| M2     | 4      | Simulación de postulación          | Checklist y simulación paso a paso                                              | No requiere video: la práctica necesita decisiones de la artesana, no una reproducción pasiva.       |
| M3     | 1      | Publicar arte en redes             | Videos propios existentes                                                       | Se conservan sin cambios.                                                                            |
| M3     | 2      | Tiendas virtuales                  | Videos propios de Marketplace y guía                                            | Se conservan sin cambios.                                                                            |
| M3     | 3      | Cobros desde el celular            | Videos propios de Yape/Plin y guía                                              | Se conservan sin cambios.                                                                            |
| M3     | 4      | Primera venta y entrega            | Videos propios y checklist/guía                                                 | Se conservan sin cambios.                                                                            |
| M4     | 1      | Historia, producto y cultura       | Fotografías y práctica guiada                                                   | Suficiente sin video.                                                                                |
| M4     | 2      | Presentación del producto          | Imágenes, ejemplo y práctica de atención                                        | Suficiente sin video.                                                                                |
| M4     | 3      | Valor de la artesanía              | Imágenes, explicación cultural y práctica                                       | Suficiente sin video.                                                                                |
| M4     | 4      | Venta autónoma                     | Simulación guiada de conversación, pago y entrega                               | No requiere video: la simulación es el recurso pedagógico principal.                                 |

## Enlaces externos vigentes en M1

| Uso                             | Video                                                                 | Canal o fuente                                                            | URL                                           | Motivo                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Registro en Artesanías del Perú | Tutorial de registro                                                  | Artesanías del Perú                                                       | `https://www.youtube.com/watch?v=JNCqeoHdlRM` | Complementa el paso de registro en una plataforma sectorial peruana.                                                |
| Cuenta bancaria                 | Abre una Cuenta BBVA desde donde estés                                | BBVA Perú                                                                 | `https://www.youtube.com/watch?v=QG87CErqx8s` | Demuestra la apertura desde celular; la sesión aclara que se puede elegir otra entidad y verificar sus condiciones. |
| Zoom                            | Cómo usar ZOOM desde tu CELULAR                                       | Profr. Santos Rivera                                                      | `https://www.youtube.com/watch?v=Q9dFIERrYYU` | Tutorial claro para unirse y usar controles básicos desde móvil.                                                    |
| Google Meet                     | Cómo crear o ingresar a una reunión en Meet desde tu teléfono celular | División de Educación a Distancia, Universidad de San Carlos de Guatemala | `https://www.youtube.com/watch?v=fw_4jGoM0yQ` | Recurso educativo en español para ingreso desde celular.                                                            |

Las búsquedas del 12 de octubre de 2026 confirmaron la disponibilidad pública de los
videos de BBVA y Zoom. El video de Meet está publicado e integrado por el repositorio
educativo de la Universidad de San Carlos de Guatemala. YouTube no permitió una
lectura directa automatizada de todos sus reproductores; por eso los enlaces se
mantienen como recursos externos configurables y no como archivos del proyecto.

## Disponibilidad y límites

- M1, M2 y M4 siguen siendo solo online.
- M3 sigue siendo el único módulo descargable. No se modificaron sus MP4, PDF,
  relaciones, posiciones, URL ni caché offline.
- Ningún video de YouTube se descarga, se sube a Cloudinary ni se añade al Service
  Worker o al paquete offline.
- Antes de una sesión presencial se recomienda comprobar los enlaces externos, pues
  YouTube, bancos y plataformas pueden cambiar su interfaz o disponibilidad.

## Validación realizada

- Revisión de `LearningVideo`: iframe `youtube-nocookie.com`, proporción 16:9,
  controles, `allowFullScreen`, enlace alternativo y apertura bajo demanda.
- Revisión de las cuatro sesiones de cada módulo y de las configuraciones de M1/M2/M3/M4.
- Revisión de la capacidad offline: solo M3 está marcado como descargable.
- Verificación web de fuentes públicas de BBVA Perú, Google Meet, Universidad de San
  Carlos de Guatemala y de los videos existentes de YouTube cuando el acceso
  automatizado estuvo disponible.
