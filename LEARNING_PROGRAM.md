# Aprender para crecer

Course ID: `93dc7355-d746-4acd-87df-29f71d16a955`. Contenedor publicado dentro de Mi aprendizaje, sin nuevas entradas de navegacion.

El Modulo 3 se llama `Módulo 3: Herramientas digitales para vender`, conservando ID, contenido y videos. La portada del curso es una imagen generada para representar aprendizaje digital entre artesanas, no una fotografia de participantes reales. Copia optimizada: `public/images/courses/aprender-para-crecer.webp` (1200 x 800, 167598 bytes). Origen online: Cloudinary `warmi/courses/aprender-para-crecer-cover-v1`, enlazado mediante `Course.imageUrl`.

`pnpm exec tsx scripts/update-learning-presentation.ts` inspecciona los datos sin escribir. Con `--apply` reutiliza/sube esa portada en la cuenta `szhwzy4q` y actualiza solamente el titulo del modulo y la imagen del curso; verifica que las lecciones y sus File/LessonFile permanezcan intactos. No crea File ni LessonFile para la portada del curso.

## Contenido reutilizado

- Modulo 1, order 1: `7dd54036-26d9-4104-8008-9d559135b461`. Antes CONOCIENDO GMAIL. Las lecciones, recursos y progreso de Gmail se conservan como historial en PostgreSQL, pero no se muestran ni participan en el programa. La tarjeta muestra únicamente el título, la imagen y `Contenido en preparación.`.
- Modulo 2: tarjeta `Módulo 2: Oportunidades para mi negocio`, imagen y `Contenido en preparación.`. No se crean módulos persistentes ni lecciones artificiales.
- Modulo 3, order 3: `6c96bcdf-0b41-48d2-bdcd-394d06acd9d2`. Conserva las dos sesiones, sus textos, orden 1/2, seis MP4 y todos los recursos. Las dos lecciones introductorias de WhatsApp permanecen en su curso original y se resuelven como material de apoyo publicado.

- Modulo 4: tarjeta `Módulo 4: Estrategias de venta y autonomía digital`, imagen y `Contenido en preparación.`. No se crean módulos persistentes ni lecciones artificiales.

Los cursos antiguos no se eliminaron. El curso Gmail, ahora sin modulos propios, no se lista como curso vacio; sus enlaces de artesanas inscritas se redirigen al programa. WhatsApp mantiene Conoce WhatsApp Business y sus dos lecciones originales. Los enlaces antiguos a las sesiones trasladadas redirigen al programa tras comprobar inscripcion al destino.

## Disponibilidad, progreso e imágenes temporales

El catálogo `shared/learning/program.ts` define `status` e `image.src`/`image.alt` para cada tarjeta. La vista recorre las cuatro entradas en orden, independientemente de los registros históricos de PostgreSQL. Solo el ID estable del Módulo 3 tiene `status: available`; los otros tres tienen `status: preparing`. Para publicar contenido futuro hay que revisar su ID y cambiar ese estado después de preparar contenido real.

`availableLearningModules` y `learningProgress` excluyen las lecciones ocultas del porcentaje, duración y siguiente lección. Mi aprendizaje y el dashboard calculan el avance del programa desde sus lecciones disponibles, sin usar un porcentaje histórico guardado. `ProgressRepository` guarda el resumen con ese mismo criterio al completar una sesión. Los enlaces directos del programa a lecciones ocultas vuelven a su tarjeta de curso; la acción de completar rechaza esas lecciones. Los LessonProgress antiguos permanecen en PostgreSQL.

No se ejecutan migraciones, seed, importadores, borrados ni operaciones Cloudinary. El ID del Módulo 3, las sesiones, recursos, File, LessonFile y posiciones no se modifican. El Service Worker, IndexedDB, Cache Storage, la descarga y el reproductor conservan su implementación actual.

`3108 WARMI DIGITAL.pdf` no está en el árbol del repositorio revisado. El conector de Canva no pudo entregar el diseño: repitió una solicitud de autenticación. Se reutilizan imágenes **existentes**, revisadas visualmente, sin generar ni subir otras:

| Módulo | Imagen temporal | Contenido observado / motivo |
| --- | --- | --- |
| 1 | `/images/discover/recursos.png` | Artesanas usando celulares y computadora; herramientas digitales. |
| 2 | `/images/discover/aprende.png` | Capacitación grupal con celulares; oportunidades de formación. |
| 3 | `/images/discover/emprende.png` | Artesana fotografiando un tejido con su celular; presentación digital del producto. |
| 4 | `/images/discover/emprende.png` | Tejido presentado para una fotografía; referencia temporal de producto y autonomía digital. |

Los módulos 3 y 4 reutilizan temporalmente la misma fotografía. No es la imagen exacta del Canva ni representa específicamente WhatsApp Business, una feria o atención a clientes. Reemplazar `image.src` y `image.alt` en la entrada correspondiente cuando estén disponibles las imágenes exactas del PDF; no hace falta crear File/LessonFile ni tocar recursos offline.

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

Catalogo `shared/learning/program.ts`: capacidad por ID estable, independiente del nombre. Solo Modulo 3 tiene offline activo. Agregar un futuro modulo exige contenido real y habilitar su capacidad en este catalogo.

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
