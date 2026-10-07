# Aprender para crecer: currículo publicado

Course ID: `93dc7355-d746-4acd-87df-29f71d16a955`.

Fuente revisada: el PDF adjunto `3108 WARMI DIGITAL.pdf`, 65 páginas, SHA-256
`31744df4404ad0d302f57d99fb059f31f031cec8c6d98789fddf80460bad7262`.
El nombre largo solicitado no está disponible: se utiliza el archivo adjunto por el usuario.
Se inspeccionaron todas sus páginas y los nueve videos existentes, sin subir medios a Cloudinary.

| Módulo                                             | Sesiones publicadas, en orden                                                                                                        | Páginas     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| 1. Mi celular como herramienta de acceso al Estado | Gmail y adjuntos; instituciones y enlaces; requisitos previos; Zoom y Meet                                                           | 8–17, 59–60 |
| 2. Oportunidades para mi negocio                   | Conociendo oportunidades; requisitos y documentos; documentos y formularios; simulación de postulación                               | 18–30       |
| 3. Herramientas digitales para vender              | Publica tu arte en redes; llega a nuevos clientes / tiendas virtuales; cobrar desde el celular; simulación de primera venta en línea | 31–47       |
| 4. Estrategias de venta y autonomía digital        | Mi producto, mi historia, mi cultura; cómo presentar mi producto; valor de la artesanía; simulación de venta sin ayuda               | 48–54       |

Se incluye también la cuarta sesión de M3 presente en el PDF: entrega y logros.
Las páginas 55–58 y 61–65 describen talleres paralelos, acompañamiento e indicadores;
no agregan sesiones al programa. Se reutilizan 59–60 como práctica de Gmail.
`shared/learning/curriculum.json` conserva páginas, texto, guías, publicación e IDs.
Diagramas y conversaciones se transcriben en orden de lectura; las imágenes preservan el original.
`publication.json` contiene solo IDs, asociación al módulo, estado y presencia de contenido;
los textos completos quedan en componentes de servidor y no se incluyen en el JavaScript del
visor offline. Así la descarga M3 no incorpora contenido de los otros tres módulos.
Hay 49 guías WebP a doble resolución y cuatro portadas del PDF en
`public/images/learning/modules/` (9 699 850 bytes). Cada sesión ofrece texto web,
guías ampliables, anclas y SpeechButton. No se presenta el PDF como una sola imagen.

## Publicación y datos reutilizados

`pnpm exec tsx scripts/align-warmi-curriculum.ts` comprueba assets e inspecciona sin escribir.
Con `--apply` guarda respaldo fuera del repositorio y publica con transacción Serializable
más bloqueo asesor. No usa seed, migraciones, borrados ni uploader.

Reutiliza los módulos 1/3 y tres sesiones: Gmail `699a22ef-7d43-4133-8710-96b33284396a`
y las dos originales de M3. Crea dos módulos y trece sesiones.
La introducción histórica de Gmail y su video se enlazan como apoyo, sin una quinta sesión;
el PDF histórico conserva File/LessonFile. Los apoyos WhatsApp siguen en su curso original.
Las sesiones reutilizadas mantienen IDs, slugs y duraciones. Todos los File/LessonFile previos,
posiciones y timestamps se comparan antes/después: si cambian, se cancela la transacción.
LessonProgress y otros cursos no se modifican. La segunda publicación debe crear cero registros.

## Los nueve videos revisados

| Video            | Destino                    | Contenido observado                                  |
| ---------------- | -------------------------- | ---------------------------------------------------- |
| video01          | M1 S1                      | Adjuntos Gmail                                       |
| video05          | M2 S3                      | Galería, imprimir y guardar PDF                      |
| video06          | M2 S3                      | Fotografiar productos                                |
| video02/03/04/08 | M3 S1, relaciones intactas | WhatsApp/Business, configuración, catálogo y estados |
| video07/09       | M3 S2, relaciones intactas | Marketplace y tiendas virtuales                      |

Los seis File originales se reutilizan. video01/05/06 existen en Cloudinary pero no tenían File:
se registran sus URLs originales una vez sin subir medios. El manifiesto de metadatos es
`shared/learning/curriculum-videos.json`. No se inventan URLs para Zoom, Meet, RNA, RUC,
Yape o Plin: las láminas no contienen hipervínculos extraíbles. Se conservan sus guías.
video07 trata Marketplace aunque su título histórico dice Facebook, que se conserva.
La lámina de configuración indica 4:34; video03 dura 9:52. El ejemplo de venta muestra
S/80 en la foto y S/85 en el chat: se conservan ambos, el teléfono de ejemplo y las condiciones
sin modificar la fuente. Los montos y convocatorias son ejemplos del PDF, no anuncios vigentes.

## Progreso

`availableLearningModules` filtra por publicación, contenido, guías y asociación al módulo
en el manifiesto. Cuenta 16 sesiones de los cuatro módulos y excluye apoyos históricos.
Dashboard, Mi aprendizaje, curso, siguiente lección y completar usan el mismo criterio.
La publicación recalcula CourseProgress sin completar sesiones ni cambiar Enrollment o
LessonProgress. Conserva avances existentes de sesiones reutilizadas. Otros cursos no cambian.

## Impacto offline documentado antes de aplicar

Solo M3 sigue descargable. Mantiene Module ID, los dos Lesson IDs existentes, las seis
relaciones MP4, File IDs, public_id, secure_url y posiciones. Se agregan sesiones 3/4 y
17 guías al final de los recursos. Paquetes nuevos: cuatro sesiones, seis MP4 y 17 WebP.
Paquetes antiguos: siguen válidas sus dos sesiones y seis MP4; no requieren red ni reciben
sesiones inexistentes en su snapshot. No cambia la versión IndexedDB, claves legacy,
formato de snapshot, Cache Storage, Service Worker o soporte Range.

Las guías locales pasan por la ruta offline existente tras autenticación, inscripción y
comprobación del File autorizado. El lector solo acepta assets del manifiesto con proveedor/MIME
correctos, sin convertir URLs arbitrarias en rutas. No se permite descargar otros módulos.
`next.config.ts` incluye explícitamente las 17 guías M3 en el paquete del endpoint serverless,
con [outputFileTracingIncludes](https://nextjs.org/docs/app/api-reference/config/next-config-js/output),
para conservar la lectura de archivos también en producción.

## Archivos nuevos de esta alineación

- `features/artisan/curriculum-lesson.tsx`: lección nativa con texto, voz, anclas y guías ampliables.
- `scripts/extract-warmi-curriculum.py` y `scripts/align-warmi-curriculum.ts`: extracción y publicación revisadas.
- `shared/learning/curriculum.json`, `curriculum.ts`, `curriculum-videos.json` y `publication.json`: fuente, assets y publicación.
- `shared/repositories/warmi-curriculum.repository.ts`: transacción, reutilización y comprobación de invariantes.
- `shared/server/learning/local-curriculum-file.ts`: lectura autorizada de guías locales.
- `tests/learning-program.service.test.ts` y `tests/fixtures/module3-legacy.json`: progreso y contenido histórico de compatibilidad.
- 53 WebP en `public/images/learning/modules/`: 49 guías y cuatro portadas.

## Verificación de la alineación (2026-10-07)

Typecheck, lint, build de producción, Prisma validate, Prettier de archivos cambiados y
`git diff --check`: correctos. Sin cambios de schema ni migraciones.

19 pruebas unitarias correctas: learning-program (5), offline-worker (3), module3-content (8)
y learning-program.service (3). Los servicios de curso, Mi aprendizaje y dashboard coinciden
para 0 %, 50 % y 100 %; se verifica también la siguiente sesión y la exclusión del historial.
La tarjeta de curso del dashboard móvil usa su porcentaje propio, separado del avance general.

Prueba aislada de navegador correcta: descarga, rollback, imagen, PDF, MP4, reinicio offline,
voz nativa, protección de enlaces externos, reconexión y eliminación.
Prueba real actual y legacy correctas con Edge: login, 16 sesiones online, 49 guías decodificadas,
responsive móvil/desktop y reproducción de los nueve MP4 online. Tras cerrar y reiniciar el
navegador en modo offline, ambos paquetes reproducen los seis MP4 originales y los apoyos.
El actual incluye pagos/entrega; el legacy usa textos originales, dos sesiones, seis archivos,
clave `module3`, courseId anterior y caché `warmi-module3-*`. No se simulan sesiones nuevas en él.

Paquete actual medido: 23 assets, 107 135 297 bytes de recursos, 24 784 bytes de metadatos,
4 624 840 bytes de shell, 111 784 921 bytes de payload total (sin sobrecarga del navegador).
Se verifica que el endpoint rechaza guías de M1 y permite las de M3, y que sus 17 guías están
en el trace serverless. El Service Worker y el formato IndexedDB/Cache Storage no cambian.
La voz se comprueba mediante la API nativa del navegador; la desconexión es del contexto del navegador.

Publicación inicial: 2 módulos, 13 sesiones, 52 File y 53 LessonFile nuevos.
Segunda publicación: cero registros nuevos. Todos los recursos originales se conservan;
una comparación adicional confirmó 14 recursos anteriores y los otros dos cursos revisados intactos.
Respaldos previos guardados en el directorio temporal local, fuera de Git.
No se subieron videos o imágenes a Cloudinary ni se completaron lecciones en las pruebas reales.

## Antecedentes de la versión anterior

Los apuntes siguientes describen la versión previa con tarjetas en preparación.
Se conservan como historial y no definen el currículo publicado actual.

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

| Módulo | Imagen temporal                 | Contenido observado / motivo                                                                |
| ------ | ------------------------------- | ------------------------------------------------------------------------------------------- |
| 1      | `/images/discover/recursos.png` | Artesanas usando celulares y computadora; herramientas digitales.                           |
| 2      | `/images/discover/aprende.png`  | Capacitación grupal con celulares; oportunidades de formación.                              |
| 3      | `/images/discover/emprende.png` | Artesana fotografiando un tejido con su celular; presentación digital del producto.         |
| 4      | `/images/discover/emprende.png` | Tejido presentado para una fotografía; referencia temporal de producto y autonomía digital. |

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
