# Offline del Modulo 3

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
- Cache Storage: cache `warmi-learning-module-<moduleId>-<UUID>` para imagenes, PDF y MP4. Las caches antiguas `warmi-module3-*` siguen siendo compatibles. La cache `warmi-offline-shell-v4` contiene solo la interfaz publica, sin HTML autenticado ni respuestas RSC privadas.
- PostgreSQL conserva los registros `File` y `LessonFile`; los binarios permanecen en Cloudinary y en el dispositivo tras descargarlos. No requiere migracion ni dependencias nuevas.
- Descarga por streaming, progreso por bytes y tamano aproximado a partir de `File.size`. El registro local se confirma al terminar todos los archivos. Un fallo elimina esa generacion y conserva la descarga anterior. Web Locks coordina operaciones entre pestanas cuando esta disponible.

El endpoint `GET /api/learning/offline/[courseId]/files/[fileId]` exige rol ARTESANA e inscripcion al contenedor. Comprueba capacidad offline por ID, pertenencia del archivo al modulo o a una leccion publicada explicitamente referenciada, formato compatible y origen Cloudinary. Las referencias internas entre cursos permiten conservar las lecciones originales de WhatsApp como apoyo sin moverlas ni copiarlas. No permite solicitar archivos arbitrarios. El proxy evita depender de CORS para PDF/MP4 y no guarda respuestas autenticadas en el shell.

## Uso sin red

Al abrir `/`, `/artesana/dashboard`, Mi aprendizaje o sus URLs de curso/leccion sin red, el Service Worker responde con el shell. La barra de direcciones conserva la ruta solicitada. El shell carga la descarga completa desde IndexedDB, comprueba sus archivos y navega localmente entre las lecciones con las rutas existentes. No consulta PostgreSQL ni necesita una sesion online para leer los contenidos ya guardados.

Los archivos se sirven bajo `/__warmi_offline__/<generacion>/<fileId>`. PDF y MP4 admiten rangos de bytes con respuestas 206; el PDF tiene enlace para abrir el visor del navegador y el MP4 usa `<video controls playsInline>`. Los enlaces externos y YouTube requieren internet y muestran el aviso correspondiente sin red.

La conexion se observa mediante `navigator.onLine` y eventos `online`/`offline`. Los fallos de red durante una descarga se muestran como error. El shell ofrece `Volver con conexion` al recuperar la red. Desde las pantallas online, los enlaces de aprendizaje pasan a navegacion documental sin red para evitar depender de RSC no guardado.

La voz reutiliza `SpeechButton` y `useSpeech` de `shared/accessibility`. Sin red selecciona voces `localService` y avisa si el dispositivo no tiene ninguna instalada. No descarga voces ni agrega otro motor.

`Eliminar descarga` borra la ficha de IndexedDB y todas las caches de recursos del modulo, incluyendo generaciones incompletas. El shell publico permanece para mostrar el aviso de contenido no disponible. Cuando la app confirma una sesion online cerrada o una cuenta diferente, elimina la descarga anterior. Los datos descargados son accesibles a quien tenga acceso al perfil del navegador: en dispositivos compartidos debe eliminarse la descarga al terminar.

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
