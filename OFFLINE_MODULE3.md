# Offline del Modulo 3

## Recuperacion del visor con archivos ya guardados

El shell v13 conserva las descargas anteriores y actualiza solamente la interfaz
publica y sus dependencias. El lector consulta Cache Storage directamente para
las URL locales `/__warmi_offline__/...`; las solicitudes online autenticadas y
los enlaces externos mantienen su entrega normal. Si el almacenamiento esta
bloqueado, conserva como alternativa la URL existente.

El motor sigue cargandose bajo demanda. Si falla su importacion por URL, intenta
importar los mismos bytes guardados mediante una URL Blob temporal. El worker
tambien arranca desde los bytes locales, con MIME JavaScript explicito, sin
necesitar la cache HTTP. No se agrega un segundo motor ni otra copia de los PDF.
Las fuentes, CMaps y decodificadores siguen precargados en el shell.

Pruebas: 79 casos unitarios; siete PDF reales y 22 paginas con pixeles no vacios,
cierre y reapertura offline, cache HTTP vaciada, entrega por URL deshabilitada
para el lector, worker Blob, anterior/siguiente, zoom, retorno y reconexion.
`tests/pdf-cache.test.ts` cubre lectura sin red/SW, aislamiento de URL online,
almacenamiento bloqueado y cancelacion. El test de navegador consulta la BD en
solo lectura y usa autenticacion simulada en su perfil aislado.

El error exacto de la captura no se reprodujo en Edge actualizado; esta entrega
refuerza la recuperacion local y no confirma una causa especifica del celular.
La validacion final en ese dispositivo sigue pendiente. Tras publicar, abrir
Warmi con internet para recibir el shell actualizado, cerrar y volver a abrir
antes de probar sin red. No borrar las descargas para actualizar el visor. Si el
navegador elimino archivos del sitio, esos bytes necesitan descargarse de nuevo
con conexion; no pueden reconstruirse offline.

## Diseño compartido online/offline

La presentación actual de las cuatro sesiones y sus logros es compartida con el
modo online. Consulta [MODULE3_SHARED_EXPERIENCE.md](MODULE3_SHARED_EXPERIENCE.md)
para componentes, imágenes propias, diferencias de conexión y pruebas de paridad.
La limitación visual exclusivamente offline de las secciones históricas siguientes
queda reemplazada por esta nueva solicitud. El shell v12 incluye las seis imágenes
de ejemplo sin duplicar PDF ni MP4 o modificar los registros existentes.

## Visor PDF integrado — octubre de 2026

Las guías de las cuatro sesiones usan `shared/components/media/pdf-viewer.tsx`
en lugar del visor nativo del navegador. PDF.js dibuja una página por vez en
canvas: anterior/siguiente, ampliar/reducir, ajustar al ancho y texto extraído
desplegable. El regreso y la exportación PDF conservan sus manejadores actuales.
No abre otra aplicación ni necesita el botón nativo «Abrir» de Android.

PDF.js se carga solamente al abrir una guía. Su motor, worker, fuentes, CMaps,
perfiles de color y decodificadores son archivos locales versionados, no un CDN.
`scripts/prepare-pdfjs.mjs` los copia desde la dependencia fijada antes de
`pnpm dev` y `pnpm build`. `public/pdfjs/` es generado e ignorado en Git; el
despliegue los reconstruye. Se conserva la licencia del paquete.

El Service Worker v9 precarga esos recursos antes de declarar listo el shell,
en grupos limitados de seis peticiones. Las cachés de medios e IndexedDB no cambian;
File, LessonFile, URLs y posiciones tampoco. Una instalación anterior necesita
abrir Warmi con conexión para instalar el nuevo shell y su visor; el visor no puede
aparecer en una descarga antigua que nunca recibió esta actualización. El motor
añade aproximadamente 5,4 MB al shell, no otra copia de los PDF.

Las pruebas del visor comprueban píxeles del documento en canvas, no solamente
HTTP 200: siete guías reales, navegación, ampliación, distintos anchos y cierre
completo/reapertura offline. `tests/pdf-viewer.browser.mjs` consulta PostgreSQL en
solo lectura y usa un perfil temporal. Las pruebas previas de sesiones ahora
también esperan el canvas renderizado. La prueba en Android físico sigue siendo
necesaria; una emulación de Android no sustituye esa revisión.

Validación ejecutada: 22 páginas de las siete guías renderizadas sin red tras
reiniciar el navegador completo; anterior/siguiente, zoom/ajuste al ancho,
360/390/430/1024 px sin desbordamiento, retorno/reapertura, reconexión y
error/reintento. Las cuatro pruebas de sesiones pasan con canvas no vacío;
las 66 pruebas unitarias, typecheck, lint, build y Prisma validate también pasan.
La sesión de la cuenta aislada se simula en la prueba de reconexión: no se crean
usuarios ni se escribe en PostgreSQL. No representa una validación de login real.
La prueba de medios conserva reproducción de los seis MP4 originales y las guías;
la prueba general de reinicio/rollback/eliminación también pasa usando un MP4 real
temporal. El MP4 generado con MediaRecorder en el primer intento no fue reproducible
en este entorno; no se modificó la lógica de video para ocultar ese fallo de fixture.
Se verificó además HTTP 200 y lectura CORS del PDF Cloudinary desde el navegador online.

Referencia de la biblioteca: [ejemplos oficiales de PDF.js](https://mozilla.github.io/pdf.js/examples/).

## Fidelidad integral Stitch — octubre de 2026

La implementación actual amplía los diseños históricos descritos abajo. La matriz,
el inventario de fuentes, las decisiones de contenido y la procedencia de imágenes
están en [MODULE3_STITCH_AUDIT.md](MODULE3_STITCH_AUDIT.md).

`module3-visuals.tsx` comparte cabecera compacta, banda de voz, consejos,
comparaciones, perfil, catálogo, estado, chat educativo, secuencias y esquema de
respaldo de envío. Las cuatro sesiones y sus logros los usan exclusivamente
offline. Los esquemas son ejemplos identificados, sin simular servicios operativos.
Los callbacks de PDF/MP4, Sheet, casillas temporales y progreso no cambian.

El shell público v8 precarga tres fotografías originales ya presentes en Warmi
(102 372 bytes adicionales), sin habilitar el Módulo 4. Se mantiene IndexedDB v1
y cada generación de medios: actualizar el shell no elimina los PDF ni MP4
descargados. La cabecera institucional redundante se omite solo en lecciones
modernas del Módulo 3; el aviso global de conexión y la navegación siguen activos.

Las pruebas visuales recorren 19 vistas (7 + 4 + 3 + 4 + logros), comprueban imágenes
locales y anchos 360/390/430/1024. La comparación online usa `dfc8b4d` para S2–S4
y la referencia anterior de S1. Los anteriores alcances de comparación offline
documentados abajo son históricos: ahora las cuatro sesiones offline se rediseñan.
`module3-session1-media.browser.mjs` verifica en solo lectura los seis MP4 reales,
los siete PDF de posiciones 10–16 y sus relaciones, descargándolos únicamente en
un contexto temporal de prueba. No crea usuarios, File ni LessonFile.

## Diseño offline de Sesión 4 y logros — octubre de 2026

`Module3Session4Offline` presenta los cuatro pasos de entrega y una vista separada
de repaso de logros. Se activa únicamente para Sesión 4 con `offline`. Conserva
`step` y `closing` del recorrido actual: abrir los logros solo cambia la vista, no
llama a completar la lección ni crea una quinta sesión. Online mantiene su render.

Reutiliza `LearningChecklist` (estado React temporal, contador y marcado),
`SpeechButton`, Sheet y los manejadores actuales del PDF. La primera lista divide
el acuerdo en las cinco preguntas solicitadas; las demás conservan sus elementos
del catálogo de contenidos. Al cambiar de paso o cerrar la pantalla, las casillas
se reinician; no representan avance sincronizado. Los ejemplos son simulaciones
de texto, sin cámara, recibos inventados, formularios ni envío de mensajes.

El cierre muestra cuatro tarjetas de aprendizajes para revisar con la facilitadora,
sin marcas de aprobación, certificados ni porcentajes inventados. Permite volver
al Paso 4, al módulo y a Mi aprendizaje. Solo el Módulo 3 continúa descargable.
No incorpora imágenes externas, fuentes/CDN ni nuevas dependencias. La voz depende
de las voces locales instaladas; no se promete audio bilingüe.

La guía conserva File `0acff2a3-2aba-4d1b-9590-17a90435b575`, LessonFile
`358d9562-9bb2-488c-8ce5-02b65381bb5f`, posición 10 y la URL Cloudinary existente.
La prueba `tests/module3-session4-offline-design.browser.mjs` la consulta en solo
lectura y descarga sus bytes para un contexto temporal del navegador. Verifica
entrada directa tras cerrar/reabrir sin red, selector, cuatro pasos, casillas,
visor/retorno PDF, API de voz, logros, navegación y ausencia de cambios de progreso.
Compara online S2/S3/S4 y offline S2/S3 con `6d55cab`; las pruebas de las otras
sesiones mantienen ese mismo alcance de regresión. No escribe en PostgreSQL.
La revisión en Android físico, audibilidad de las voces y exportación nativa del
PDF por dispositivo siguen siendo manuales.

## Diseño offline de Sesión 3 — octubre de 2026

`Module3Session3Offline` es la presentación de los tres pasos de cobro móvil,
activada únicamente para Sesión 3 con `offline`. Usa el estado y los manejadores
de `Module3JourneyContent`: selección Yape/Plin, recurso de video, navegación,
visor/exportación PDF y salida hacia Sesión 4. La vista online conserva su render.
La barra segmentada indica posición; no completa ni sincroniza progreso.

Reutiliza `SpeechButton`, Sheet, iconos locales y los textos de verificación y
alertas existentes. Las cinco alertas tienen botones React con `aria-expanded` y
paneles asociados. No se incorporan explicaciones ficticias del prototipo ni se
promete lectura en quechua. La voz offline depende de voces locales instaladas.
El reproductor nativo conserva sus controles; cambiar de método desmonta el video
anterior y muestra el MP4 correspondiente. La usuaria inicia su reproducción con
el control del navegador, sin simulaciones ni autoplay obligatorio.

Los archivos siguen siendo Yape (`749e9521-7964-499f-950b-6b1d98811248`, relación
`3ba1f453-ef4f-44d3-861a-efff54279fcb`, posición 10), Plin
(`a9bb92d8-ca09-4f5a-9528-e37f57f839c3`, relación
`e4df3549-a6cc-4eca-a9aa-0861316443d5`, posición 20) y la guía de cobros seguros
(`2d8243ad-9700-47fa-9cff-5a70becc7ca9`, relación
`42aeaec8-ff12-40c6-81da-a3b5043ea444`, posición 30). No hay cambios en BD,
Cloudinary, capacidad offline ni mecanismos de descarga y almacenamiento.

La prueba `tests/module3-session3-offline-design.browser.mjs` consulta File/LessonFile
en solo lectura, obtiene los tres archivos desde sus URL reales, prepara un paquete
en un contexto aislado y abre directamente S3 sin red tras cerrar la página.
Comprueba reproducción y cambio de ambos MP4 locales, tres pasos, cinco acordeones,
PDF y retorno, salida a S4, progreso preservado, eliminación y reconexión en
360/390/430/1024 px. Compara el render online S3 y online/offline S2/S4 con `8939d7d`
y verifica que las referencias de BD permanezcan idénticas. No realiza login ni
crea datos de prueba en PostgreSQL. Las pruebas en Android físico y la exportación
nativa del PDF en cada dispositivo siguen siendo revisión manual.

## Diseño offline de Sesión 2 — octubre de 2026

`Module3Session2Offline` presenta cuatro temas en orden educativo: concepto de
tienda virtual, preguntas previas, alternativas y elección gradual. Se usa solo
cuando `Module3JourneyContent` recibe `offline` para la Sesión 2. Online mantiene
sus tres pasos anteriores; las sesiones 1, 3 y 4 no cambian de diseño.

Reutiliza las descripciones de `MODULE3_PLATFORMS`, la guía de elección existente,
los dos MP4 de Marketplace presentes en el paquete, `SpeechButton`, Sheet y los
manejadores de PDF, enlaces externos y navegación del recorrido actual. Las cinco
preguntas anteriores se agrupan en cuatro tarjetas: envío y pago del envío quedan
juntos. No se agregan precios, comisiones garantizadas ni requisitos comerciales.
Las frases comerciales del adjunto difieren de las descripciones prudentes del
repositorio; estas últimas siguen siendo la fuente de verdad.

La vitrina es un ejemplo educativo con icono local, sin productos ficticios ni
imágenes remotas. La posición del tema no representa avance acreditado. El último
tema permite volver al módulo o pasar a Sesión 3 sin completar ni sincronizar el
progreso. PDF y videos siguen usando las URL locales del paquete guardado; no hay
cambios en File, LessonFile, Cloudinary, IndexedDB, Cache Storage o Service Worker.

`tests/module3-session2-offline-design.browser.mjs` compara el render online/offline S2,
online S3 y online/offline S4 con `8939d7d`, y recorre el selector y navegación de los cuatro
temas en 360/390/430/1024 px. Verifica apertura/retorno de un PDF existente como
Blob de prueba, guardia de enlaces y ausencia de llamadas a completar la lección.
Esta prueba de presentación no acredita exportación nativa ni entrega Cloudinary.
Además prepara un paquete aislado con los IDs de sesión actuales y el PDF existente,
cierra la página y abre directamente la Sesión 2 sin red mediante el shell real.
Comprueba la URL local del PDF y HTTP 200, retorno al módulo, eliminación y reconexión.
Los metadatos de prueba solo se guardan en el contexto temporal del navegador;
no se crean registros en PostgreSQL ni assets Cloudinary. La prueba aislada general
del módulo cubre también MP4 y reinicio completo del navegador. La validación de
Android físico sigue siendo manual.

## Diseño offline de Sesión 1 — octubre de 2026

Los siete temas conservan su contenido y recursos en `Module3Session1Content`.
La variante `offline` incorpora el diseño de referencia de Stitch: encabezado
compacto con retorno explícito al Módulo 3, selector de temas, indicador del tema
activo, pasos numerados en tarjetas y presentación de MP4/PDF locales. La variante
online conserva el mismo render anterior. El indicador representa la posición del
tema y no acredita avance educativo ni completa sesiones.

Se reutilizan `SpeechButton`, el selector Sheet, el visor PDF interno, la exportación
del PDF local y el salto de Facebook a Marketplace. No se incorporan CDN, fuentes,
imágenes externas ni los ejemplos ficticios del prototipo. Las fuentes y los iconos
siguen siendo los de la aplicación. La navegación queda en el flujo del documento
para evitar superposiciones con la barra inferior y el crecimiento del texto.

La prueba `tests/module3-session1-offline-design.browser.mjs` compara el HTML online
con el commit `a2c44fb` y recorre los siete temas offline en 360, 390, 430 y 1024 px;
comprueba selector, anterior, salto a Marketplace, guardia de enlaces externos,
apertura/cierre de un PDF local y el control de descarga. El visor de esta prueba
usa un PDF existente cargado como Blob de prueba; no verifica una exportación nativa
ni constituye una prueba de entrega desde Cloudinary. La prueba aislada existente
`tests/offline-learning.browser.mjs` cubre el paquete, Service Worker, reapertura,
recursos locales, reconexión y eliminación. Las pruebas automatizadas de escritorio
no sustituyen la revisión en un Android físico ni garantizan voces instaladas.

## Regla vigente — 7 de octubre de 2026

**Actualmente el único módulo descargable para uso offline es Módulo 3.** M1, M2 y M4 conservan acceso online, sin acción de descarga. La capacidad se centraliza por ID en `shared/learning/program.ts`; `isOfflineModule` gobierna los controles del curso, los manifiestos del servicio, la autorización de archivos y el inicio de descarga en el cliente.

Se corrige la habilitación de M4 introducida en `b8608bf`, documentada en [MODULE4_AUDIT.md](MODULE4_AUDIT.md). No cambia M3: ocho MP4, diez PDF, revisión de contenido, guías, compatibilidad legacy, IndexedDB, caches, worker, Offline Home, actualización y eliminación. El manifest PWA no es un listado de módulos y conserva su entrada a aprendizaje.

Las copias M4 ya guardadas antes de la corrección no se borran automáticamente: el lector conserva acceso únicamente a sus bytes realmente descargados y permite eliminarlas. No se pueden generar o actualizar paquetes M4. Esto es compatibilidad de lectura, no capacidad de nueva descarga.

## Historia de implementación

Estado actual de las cuatro sesiones, guías S2/S3/S4 y actualización compatible de descargas: [MODULE3_SESSIONS_2_4.md](MODULE3_SESSIONS_2_4.md). Las secciones siguientes conservan la historia de la implementación anterior.

Implementacion acotada a `Módulo 3: Herramienta digitales para crecer`, dentro de Mi aprendizaje. No agrega entradas al menu ni modifica rutas existentes. El cambio de nombre conserva el ID y los paquetes descargados; el shell muestra el titulo actual del catalogo por ID.

## Contenido real del curso

El modulo se creo inicialmente en WhatsApp Business y ahora pertenece al programa `Aprender para crecer`, Course ID `93dc7355-d746-4acd-87df-29f71d16a955`. Conserva su ID `6c96bcdf-0b41-48d2-bdcd-394d06acd9d2`, `Module.order = 3`, textos y todos sus File/LessonFile. Ver `LEARNING_PROGRAM.md`.

La capacidad offline se configura por ID estable de modulo en `shared/learning/program.ts`, no por titulo. Solo el Modulo 3 esta habilitado. Las etiquetas del programa respetan `Module.order`.

Se crearon dos lecciones TEXT, con guias, ejemplos y practicas:

- `Sesión 1: Publica tu arte en redes`: ID `8a8e449b-76a6-4a6d-9693-6238f75092bc`, `Lesson.order = 1`. Desarrolla catalogo y Estados de WhatsApp.
- `Sesión 2: Llega a nuevos clientes`: ID `9bd401d6-5c80-4099-aa7b-e1b90b62d9b7`, `Lesson.order = 2`. Desarrolla Facebook y Marketplace/tiendas virtuales.

Cuatro recursos EXTERNAL_LINK usan `LessonFile.position = 0/1` por sesion. Los dos de la primera sesion apuntan a las lecciones originales mediante `provider = warmi` y URL interna; los dos de la segunda apuntan a Facebook y Marketplace. Posteriormente se vincularon seis MP4 reales con File y VIDEO_UPLOAD exclusivamente en estas sesiones; ver `MODULE3_VIDEOS.md`.

Las lecciones originales `¿Qué es WhatsApp Business?` y `Configura tu perfil de negocio` conservan sus IDs, modulo, textos, recursos y timestamps. El paquete offline las lee como material de apoyo y mantiene sus IDs; no crea copias en PostgreSQL. Sus videos YouTube siguen necesitando internet.

La creacion es transaccional e idempotente mediante `pnpm exec tsx scripts/create-module3-content.ts`: bloquea la fila del curso durante la operacion, comprueba las lecciones originales, crea solo los registros nuevos y verifica que los originales no hayan cambiado. Repetirlo reutiliza el modulo existente sin modificarlo.

Las indicaciones sobre catalogos y espacios de venta se contrastaron con la documentacion oficial de [WhatsApp](https://faq.whatsapp.com/es/26000275/) y [Facebook](https://www.facebook.com/help/550954179351183/). Los ejemplos y ejercicios se redactaron para artesanas y priorizan identidad, comunidad y presentacion de las piezas.

## Arquitectura

- Service Worker nativo: `public/warmi-sw.js`, registrado al iniciar la primera descarga. Guarda el shell publico `/offline-learning`, sus JS, CSS, fuentes y las imagenes de la guia de voz.
- IndexedDB: base `warmi-learning-offline`, store `downloads`, clave `module:<moduleId>`. Mantiene lectura de la clave antigua `module3`. Guarda textos, titulos, orden de lecciones, metadatos, referencias locales e ID de propietaria. No guarda sesiones, contrasenas ni tokens.
- Cache Storage: cache `warmi-learning-module-<moduleId>-<UUID>` para imagenes, PDF y MP4. Las caches antiguas `warmi-module3-*` siguen siendo compatibles. La cache `warmi-offline-shell-v13` contiene solo la interfaz publica, sin HTML autenticado ni respuestas RSC privadas.
- PostgreSQL conserva los registros `File` y `LessonFile`; los binarios permanecen en Cloudinary y en el dispositivo tras descargarlos. No requiere migracion ni dependencias nuevas.
- Descarga por streaming, progreso por bytes y tamano aproximado a partir de `File.size`. El registro local se confirma al terminar todos los archivos. Un fallo elimina esa generacion y conserva la descarga anterior. Web Locks coordina operaciones entre pestanas cuando esta disponible.

El endpoint `GET /api/learning/offline/[courseId]/files/[fileId]` exige rol ARTESANA e inscripcion al contenedor. Comprueba capacidad offline por ID, pertenencia del archivo al modulo o a una leccion publicada explicitamente referenciada, formato compatible y origen Cloudinary. Las referencias internas entre cursos permiten conservar las lecciones originales de WhatsApp como apoyo sin moverlas ni copiarlas. No permite solicitar archivos arbitrarios. El proxy evita depender de CORS para PDF/MP4 y no guarda respuestas autenticadas en el shell.

## Uso sin red

Al abrir `/`, `/artesana/dashboard`, Mi aprendizaje o sus URLs de curso/leccion sin red, el Service Worker responde con el shell. La barra de direcciones conserva la ruta solicitada. Si la URL apunta a una leccion que ya fue descargada, el shell la abre directamente sin depender del historial del navegador; si no hay descarga, muestra una salida segura al inicio. El shell carga la descarga completa desde IndexedDB, comprueba sus archivos y navega localmente entre las lecciones con las rutas existentes. No consulta PostgreSQL ni necesita una sesion online para leer los contenidos ya guardados.

Los archivos se sirven bajo `/__warmi_offline__/<generacion>/<fileId>`. PDF y MP4 admiten rangos de bytes con respuestas 206; el PDF se abre en el visor interno y puede leerse directamente desde Cache Storage, y el MP4 usa `<video controls playsInline>`. Los enlaces externos y YouTube requieren internet y muestran el aviso correspondiente sin red.

La conexion se observa mediante `navigator.onLine` y eventos `online`/`offline`. Los fallos de red durante una descarga se muestran como error. El shell ofrece `Volver con conexion` al recuperar la red. Desde las pantallas online, los enlaces de aprendizaje pasan a navegacion documental sin red para evitar depender de RSC no guardado.

La voz reutiliza `SpeechButton` y `useSpeech` de `shared/accessibility`. Sin red selecciona voces `localService` y avisa si el dispositivo no tiene ninguna instalada. No descarga voces ni agrega otro motor.

`Eliminar descarga` borra la ficha de IndexedDB, los marcadores de lectura del Módulo 3 y todas las caches de recursos del modulo, incluyendo generaciones incompletas. El shell publico permanece para mostrar el aviso de contenido no disponible. Vencer la sesión no borra la descarga. El cierre voluntario y el acceso con otra cuenta sí limpian el material anterior. Los datos descargados son accesibles a quien tenga acceso al perfil del navegador: en dispositivos compartidos debe eliminarse la descarga al terminar.

## Incorporar los MP4 propios

El editor general y las Server Actions generales siguen rechazando `VIDEO_UPLOAD`. Para incorporar exclusivamente un MP4 de este modulo:

```powershell
pnpm exec tsx scripts/import-module3-video.ts <lessonId> "C:/videos/leccion.mp4" "Titulo del video"
```

El script verifica que la leccion ya exista dentro del modulo exacto, acepta archivos MP4 de hasta 100 MB, sube a Cloudinary con H.264/AAC y crea la relacion `LessonFile` con `File`. Rechaza titulos de video duplicados y elimina el archivo subido si falla la transaccion. No se ejecuto este importador: los seis videos existentes en `szhwzy4q/WARMI - VIDEOS` se vincularon sin subir, renombrar, mover, transformar ni eliminar archivos, mediante `scripts/link-module3-videos.ts --apply`.

## Verificacion

Usar una compilacion de produccion para probar el shell: `pnpm build` y `pnpm start --port 3100`. Se requiere HTTPS en produccion; localhost funciona para pruebas. La primera descarga debe completarse con internet.

```powershell
pnpm typecheck
pnpm lint
pnpm build
git diff --check
node --test tests/offline-worker.test.mjs
pnpm exec tsx --test tests/module3-content.test.ts
```

La prueba de navegador utiliza Playwright disponible en el entorno, sin agregarlo a las dependencias de la app:

```powershell
# Si Playwright no esta en node_modules, indicar la ruta de su paquete disponible.
$env:WARMI_PLAYWRIGHT_PATH = "<ruta del paquete playwright>"
$env:WARMI_TEST_URL = "http://localhost:3100"
# Opcional: navegador instalado, por ejemplo msedge.
$env:WARMI_BROWSER_CHANNEL = "msedge"
# Opcional: verificar un MP4 entregado por la cliente.
$env:WARMI_TEST_MP4 = "C:/videos/leccion.mp4"
node tests/offline-learning.browser.mjs
node tests/module3-real.browser.mjs
```

La prueba aislada crea un perfil temporal, intercepta las respuestas de prueba y nunca escribe en PostgreSQL. Cubre descarga fallida y limpieza, descarga completa, cierre y reapertura del navegador sin red, lecciones, imagen local, PDF, enlace externo, API de voz, retorno de conexion y eliminacion. Si el navegador puede generar un MP4 H.264 con MediaRecorder, lo usa para probar reproduccion local; en caso contrario admite un MP4 de prueba indicado por variable.

La prueba `module3-real.browser.mjs` usa el curso real y exige `WARMI_TEST_EMAIL`/`WARMI_TEST_PASSWORD` para una cuenta de prueba inscrita; no incluye credenciales por defecto. Verifica login, boton dentro del modulo, descarga, cierre completo del navegador, reapertura offline, ambas sesiones y los dos apoyos originales, API de voz, aviso de enlace externo, reconexion y eliminacion. Con `WARMI_REAL_MP4=1` verifica reproduccion online desde Cloudinary y offline de los seis MP4, y mide sus bytes y el shell local. Esta modalidad abre sesiones online y registra su inicio normal para la cuenta de prueba; no completa lecciones ni crea recursos multimedia. Falta probar en los celulares fisicos destinatarios. La audibilidad depende de las voces instaladas.

## Limites del MVP

- Una descarga de Modulo 3 por perfil de navegador; no sincroniza progreso ni mutaciones offline.
- Descarga una version fija de los contenidos. Para actualizarla, eliminar y volver a descargar con conexion.
- YouTube, audio, otros documentos y servicios externos no se guardan como binarios offline. PDF, imagenes y MP4 deben estar vinculados mediante `File` con MIME correcto.
- La cuota, persistencia, visor PDF, codecs MP4 y voces instaladas dependen del navegador/dispositivo. Se solicita almacenamiento persistente, pero el navegador puede rechazarlo o eliminar datos. El modo privado puede impedir guardar descargas.
- El shell es minimo y no replica sidebar, dashboard ni funciones de los otros modulos. El resto de Warmi sigue requiriendo conexion.
- `ARTISAN_EXPERIENCE.md` todavia menciona PWA/offline como pendiente; no se actualizo ese documento historico.

## Archivos

Modificados: `app/(artisan)/artesana/aprender/[courseId]/page.tsx`, `app/layout.tsx`, `shared/providers/app-providers.tsx`, `shared/accessibility/use-speech.ts`.

Creados: `app/manifest.ts`, `app/offline-learning/page.tsx`, `app/api/learning/offline/[courseId]/files/[fileId]/route.ts`, `features/artisan/offline/module-download.tsx`, `features/artisan/offline/offline-learning.tsx`, `shared/offline/module3-types.ts`, `shared/offline/module3-storage.ts`, `shared/offline/offline-runtime.tsx`, `shared/services/offline-learning.service.ts`, `public/warmi-sw.js`, `scripts/import-module3-video.ts`, `tests/offline-worker.test.mjs`, `tests/offline-learning.browser.mjs`, este documento.

Contenido real: se agregaron `shared/repositories/module3-content.repository.ts`, `shared/services/module3-content.service.ts`, `scripts/create-module3-content.ts`, `tests/module3-content.test.ts` y `tests/module3-real.browser.mjs`. Se ajustaron las paginas del curso y leccion, el titulo offline, el constructor del paquete, almacenamiento/estimacion, visor, importador y prueba de navegador para reconocer el nuevo titulo y resolver el material de apoyo.
