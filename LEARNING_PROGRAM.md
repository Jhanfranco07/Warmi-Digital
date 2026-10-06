# Aprender para crecer

Course ID: `93dc7355-d746-4acd-87df-29f71d16a955`. Contenedor publicado dentro de Mi aprendizaje, sin nuevas entradas de navegacion.

## Contenido reutilizado

- Modulo 1, order 1: `7dd54036-26d9-4104-8008-9d559135b461`. Antes CONOCIENDO GMAIL. Conserva las dos lecciones, sus ordenes originales 0/1, el video YouTube y el PDF original. Es contenido inicial online; falta preparar acceso al Estado y uso basico del celular.
- Modulo 2: pendiente de contenido. Gestion de productos culturales no tiene modulos/lecciones; el curso de conversion PDF tambien esta vacio y en borrador. La interfaz muestra el bloque pendiente, pero no se crearon registros vacios ni lecciones artificiales.
- Modulo 3, order 3: `6c96bcdf-0b41-48d2-bdcd-394d06acd9d2`. Conserva las dos sesiones, sus textos, orden 1/2, seis MP4 y todos los recursos. Las dos lecciones introductorias de WhatsApp permanecen en su curso original y se resuelven como material de apoyo publicado.

Los cursos antiguos no se eliminaron. El curso Gmail, ahora sin modulos propios, no se lista como curso vacio; sus enlaces de artesanas inscritas se redirigen al programa. WhatsApp mantiene Conoce WhatsApp Business y sus dos lecciones originales. Los enlaces antiguos a las sesiones trasladadas redirigen al programa tras comprobar inscripcion al destino.

## Migracion de datos

`pnpm exec tsx scripts/restructure-learning-program.ts --apply`

Operacion transaccional con bloqueo asesor PostgreSQL. Verifica los IDs originales y las seis relaciones MP4 antes de escribir; compara todos los textos, LessonFile y File antes/despues. No modifica el schema, no crea File ni LessonFile, ni realiza operaciones Cloudinary.

Inscripciones originales se conservan. Se crea/reutiliza la inscripcion al programa para sus usuarias y se trasladan los LessonProgress de las lecciones movidas conservando sus IDs, fechas y avance. Se recalculan CourseProgress de origen/destino. Un conflicto de progreso existente en destino cancela la transaccion para revision; no sobrescribe datos. Repetir la migracion no duplica contenido.

## Offline reutilizable

Catalogo `shared/learning/program.ts`: capacidad por ID estable, independiente del nombre. Solo Modulo 3 tiene offline activo. Agregar un futuro modulo exige contenido real y habilitar su capacidad en este catalogo.

IndexedDB almacena una ficha por `module:<id>` y Cache Storage una generacion por modulo. Descargar/eliminar un modulo conserva los demas; cierre de sesion confirmado elimina todas las descargas. El shell puede listar varias fichas descargadas. Se conserva lectura de `module3`, las caches antiguas y los antiguos courseId del Modulo 3. Actualizar una descarga confirma ficha nueva y reemplazo de clave antigua en una sola transaccion.

Service Worker v2 actualiza el shell publico sin eliminar MP4/PDF descargados. Una PWA previamente instalada debe conectarse al menos una vez para recibir esta version; estando ya offline puede continuar con su shell anterior. No se implemento descarga completa del programa.

## Validacion

Validado en Edge/Chromium con build de produccion local: typecheck, lint, build, prisma validate y diff --check correctos. Seis pruebas unitarias de contenido y tres de Service Worker correctas. Las pruebas de navegador aisladas, reales y de compatibilidad antigua terminaron correctamente, incluyendo los seis videos reproducidos online/offline y borrado de todas sus fichas/caches.

Payload medido del paquete actual: MP4 `104293181` bytes, metadatos `11965` bytes, shell `4621739` bytes; total `108926885` bytes (108,93 MB decimales). No incluye overhead interno de IndexedDB/Cache Storage; el tamano del shell cambia entre builds. Capturas mobile 390x844 y desktop 1365x900 sin desbordamiento horizontal.

- Migracion repetida: mismo contenedor, mismos IDs y cero File/LessonFile nuevos.
- `tests/module3-content.test.ts`: capacidad por identidad, apoyo sin mutaciones y limites de autorizacion.
- `tests/offline-learning.browser.mjs`: PDF/imagen/MP4, rollback, aislamiento entre dos descargas, cierre/reapertura y borrado.
- `tests/module3-real.browser.mjs`: seis MP4 Cloudinary online/offline, ambas sesiones, apoyo original, voz, reconexion y borrado. `WARMI_LEGACY_DOWNLOAD=1` verifica ademas el formato de ficha anterior a la migracion.

No se habilita VIDEO_UPLOAD en el editor general. Sin red no se autentica ni se sincroniza progreso; la voz necesita una voz local instalada.
