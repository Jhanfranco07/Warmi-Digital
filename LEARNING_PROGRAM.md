# Aprender para crecer

Course ID: `93dc7355-d746-4acd-87df-29f71d16a955`. Contenedor publicado dentro de Mi aprendizaje, sin nuevas entradas de navegacion.

El Modulo 3 se llama `Módulo 3: Herramientas digitales para vender`, conservando ID, contenido y videos. La portada del curso es una imagen generada para representar aprendizaje digital entre artesanas, no una fotografia de participantes reales. Copia optimizada: `public/images/courses/aprender-para-crecer.webp` (1200 x 800, 167598 bytes). Origen online: Cloudinary `warmi/courses/aprender-para-crecer-cover-v1`, enlazado mediante `Course.imageUrl`.

`pnpm exec tsx scripts/update-learning-presentation.ts` inspecciona los datos sin escribir. Con `--apply` reutiliza/sube esa portada en la cuenta `szhwzy4q` y actualiza solamente el titulo del modulo y la imagen del curso; verifica que las lecciones y sus File/LessonFile permanezcan intactos. No crea File ni LessonFile para la portada del curso.

## Contenido reutilizado

- Modulo 1, order 1: `7dd54036-26d9-4104-8008-9d559135b461`. Disponible online con exactamente cuatro sesiones: Gmail/adjuntos, instituciones, requisitos previos y Zoom/Meet. Reutiliza la lección histórica de creación de Gmail y su PDF. La introducción histórica se conserva como apoyo enlazado, fuera de las cuatro sesiones. Detalles, IDs y fuentes en [MODULE1_LEARNING.md](MODULE1_LEARNING.md).
- Modulo 2, order 2: `c156c5d5-8c81-48f8-85d4-234ecb21ec0e`. Disponible online con cuatro sesiones reales: oportunidades, lectura de convocatoria, documentos/formularios y simulación. Detalles e IDs en [MODULE2_LEARNING.md](MODULE2_LEARNING.md). M1 y M2 comparten recorrido guiado de un paso principal a la vez.
- Modulo 3, order 3: `6c96bcdf-0b41-48d2-bdcd-394d06acd9d2`. Tiene cuatro sesiones: S1 conservada, S2 tiendas virtuales, S3 cobros y S4 simulación de entrega. Conserva los seis MP4 originales y todos los recursos previos. Detalles en [MODULE3_SESSIONS_2_4.md](MODULE3_SESSIONS_2_4.md). Las dos lecciones introductorias de WhatsApp permanecen en su curso original y se resuelven como material de apoyo publicado.

- Modulo 4, order 4: `2853b850-4032-5e82-b861-8eaaa84913f8`. Disponible con cuatro sesiones visuales: historia del producto, presentación/experiencia de la clienta, valor cultural y simulación autónoma. Nueve imágenes extraídas del material fuente y soporte offline. IDs, posiciones, recortes y publicación en [MODULE4_LEARNING.md](MODULE4_LEARNING.md).

Los cursos antiguos no se eliminaron. El curso Gmail conserva un módulo histórico de apoyo y no se ofrece como curso independiente en el catálogo artesano; sus enlaces de artesanas inscritas se redirigen al programa. WhatsApp mantiene Conoce WhatsApp Business y sus dos lecciones originales. Los enlaces antiguos a las sesiones trasladadas redirigen al programa tras comprobar inscripcion al destino.

## Disponibilidad, progreso e imágenes temporales

El catálogo `shared/learning/program.ts` define `status` e `image.src`/`image.alt` para cada tarjeta. La vista recorre las cuatro entradas en orden. Los cuatro módulos tienen `status: available`: 16 sesiones, cuatro por módulo. M3 y M4 tienen `offline: true`; M1 y M2 conservan su recorrido online. M4 reutiliza la descarga existente sin cambiar el Service Worker.

`availableLearningModules` y `learningProgress` excluyen las lecciones ocultas del porcentaje, duración y siguiente lección. Mi aprendizaje y el dashboard calculan el avance del programa desde sus lecciones disponibles, sin usar un porcentaje histórico guardado. `ProgressRepository` guarda el resumen con ese mismo criterio al completar una sesión. Los enlaces directos del programa a lecciones ocultas vuelven a su tarjeta de curso; la acción de completar rechaza esas lecciones. Los LessonProgress antiguos permanecen en PostgreSQL.

La publicación específica de M1 se realiza con `scripts/publish-module1.ts`, transaccional, idempotente y con dry-run. No se ejecutan migraciones de schema, seed, borrados ni uploads Cloudinary. El ID del Módulo 3, sus sesiones, recursos, File, LessonFile y posiciones no se modifican. El Service Worker, IndexedDB, Cache Storage, la descarga y el reproductor offline conservan su implementación actual. Las verificaciones históricas siguientes corresponden a entregas anteriores; la validación de M1 está en MODULE1_LEARNING.md.

El PDF fuente permanece fuera del repositorio. Para M4 se recibió y revisó la edición de 65 páginas de `3108 WARMI DIGITAL.pdf`; se extrajeron nueve imágenes y se publicaron en Cloudinary con hashes verificados. M1–M3 conservan sus portadas anteriores:

| Módulo | Imagen temporal                        | Contenido observado / motivo                                                        |
| ------ | -------------------------------------- | ----------------------------------------------------------------------------------- |
| 1      | `/images/discover/recursos.png`        | Artesanas usando celulares y computadora; herramientas digitales.                   |
| 2      | `/images/discover/aprende.png`         | Capacitación grupal con celulares; oportunidades de formación.                      |
| 3      | `/images/discover/emprende.png`        | Artesana fotografiando un tejido con su celular; presentación digital del producto. |
| 4      | `/images/learning/module4/qallwa.webp` | Imagen de tejido extraída de la página 52 del PDF recibido para esta entrega.       |

M4 usa una fotografía del tejido en qallwa extraída del PDF recibido. Los detalles de procedencia, recortes y recursos File/LessonFile están en MODULE4_LEARNING.md. Las imágenes temporales de M1–M3 permanecen sin cambios.

## Verificación de esta limpieza

Base de código recuperada por el conector de GitHub: `main` en `cee8a371b455294344e211c7630f4a1b89a3cbf6`. La clonación Git falló porque el proxy HTTP del entorno no era accesible. La copia local contiene los fuentes y las imágenes temporales recuperadas; no es un clon completo con todos los binarios.

- Cinco pruebas de disponibilidad/progreso (`node tests/learning-program.test.mjs`) correctas en Node 24.
- Tres pruebas existentes del Service Worker (`node tests/offline-worker.test.mjs`) correctas: shell, rangos MP4/PDF y contenido ausente.
- Seis pruebas existentes de contenido del Módulo 3 correctas, ejecutadas con Node 24 y un adaptador temporal de imports que sustituye Prisma/Next por dobles de prueba. Además, comprobaciones aisladas del servicio verificaron el enlace oculto, siguiente sesión, resumen de progreso y una ficha de seis videos idéntica antes/después del filtro. Esto no equivale a una comprobación de PostgreSQL o del navegador real.
- `git diff --check` correcto.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` y `pnpm prisma validate`: bloqueados antes de ejecutar sus herramientas, porque no se pudieron instalar dependencias. El intento de instalación falló al consultar `registry.npmjs.org` por el proxy inaccesible. No son validaciones aprobadas.
- Pendientes: comprobación en PostgreSQL de los seis File/LessonFile, reproducción de los seis videos online/offline, descarga completa y revisión móvil en navegador con cuenta de prueba.

Las validaciones completas descritas más abajo pertenecen a la entrega anterior, no a esta limpieza. La publicación en main fue autorizada explícitamente por la usuaria tras informar estas limitaciones; los checks completos siguen pendientes por el bloqueo del entorno. Los documentos `OFFLINE_MODULE3.md` y `MODULE3_VIDEOS.md` aún contienen un título anterior del Módulo 3; el catálogo conserva el título actual correcto.

## Migracion de datos

`pnpm exec tsx scripts/restructure-learning-program.ts --apply`

Operacion transaccional con bloqueo asesor PostgreSQL. Verifica los IDs originales y las seis relaciones MP4 antes de escribir; compara todos los textos, LessonFile y File antes/despues. No modifica el schema, no crea File ni LessonFile, ni realiza operaciones Cloudinary.

Inscripciones originales se conservan. Se crea/reutiliza la inscripcion al programa para sus usuarias y se trasladan los LessonProgress de las lecciones movidas conservando sus IDs, fechas y avance. Se recalculan CourseProgress de origen/destino. Un conflicto de progreso existente en destino cancela la transaccion para revision; no sobrescribe datos. Repetir la migracion no duplica contenido.

## Offline reutilizable

Catalogo `shared/learning/program.ts`: capacidad por ID estable, independiente del nombre. Módulos 3 y 4 tienen offline activo. Cada uno conserva ficha, recursos y borrado independientes.

IndexedDB almacena una ficha por `module:<id>` y Cache Storage una generacion por modulo. Descargar/eliminar un modulo conserva los demas; cierre de sesion confirmado elimina todas las descargas. El shell puede listar varias fichas descargadas. Se conserva lectura de `module3`, las caches antiguas y los antiguos courseId del Modulo 3. Actualizar una descarga confirma ficha nueva y reemplazo de clave antigua en una sola transaccion.

Service Worker v4 actualiza el shell publico y el nombre visible del modulo sin eliminar MP4/PDF descargados. Una PWA previamente instalada debe conectarse al menos una vez para recibir esta version; estando ya offline puede continuar con su shell anterior. No se implemento descarga completa del programa.

## Validacion de la entrega anterior

Validado en Edge/Chromium con build de produccion local: typecheck, lint, build, prisma validate y diff --check correctos. Seis pruebas unitarias de contenido y tres de Service Worker correctas. Las pruebas de navegador aisladas, reales y de compatibilidad antigua terminaron correctamente, incluyendo los seis videos reproducidos online/offline y borrado de todas sus fichas/caches.

Payload medido del paquete actual: MP4 `104293181` bytes, metadatos `11965` bytes, shell `4621739` bytes; total `108926885` bytes (108,93 MB decimales). No incluye overhead interno de IndexedDB/Cache Storage; el tamano del shell cambia entre builds. Capturas mobile 390x844 y desktop 1365x900 sin desbordamiento horizontal.

- Migracion repetida: mismo contenedor, mismos IDs y cero File/LessonFile nuevos.
- `tests/module3-content.test.ts`: capacidad por identidad, apoyo sin mutaciones y limites de autorizacion.
- `tests/offline-learning.browser.mjs`: PDF/imagen/MP4, rollback, aislamiento entre dos descargas, cierre/reapertura y borrado.
- `tests/module3-real.browser.mjs`: seis MP4 Cloudinary online/offline, ambas sesiones, apoyo original, voz, reconexion y borrado. `WARMI_LEGACY_DOWNLOAD=1` verifica ademas el formato de ficha anterior a la migracion.

No se habilita VIDEO_UPLOAD en el editor general. Sin red no se autentica ni se sincroniza progreso; la voz necesita una voz local instalada.
