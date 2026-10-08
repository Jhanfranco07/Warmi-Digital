# Offline Home y presentación del aprendizaje

## Regla vigente de descarga

**Actualmente el único módulo descargable para uso offline es Módulo 3.** Offline Home no habilita otros módulos: muestra las fichas completas que realmente existen en el dispositivo. M1/M2/M4 no generan manifiestos descargables ni controles de descarga; los archivos exclusivos de esos módulos son rechazados por la API offline. El cliente también rechaza iniciarlos antes de tocar almacenamiento.

Se conserva la lectura/eliminación de copias M4 históricas para no borrar datos locales sin instrucción. Una copia previa no puede actualizarse ni descargarse otra vez. Los textos que describen M3/M4 conjuntamente más abajo registran la validación de `ce7c877`, anterior a esta corrección. Estado y auditoría actual: [MODULE4_AUDIT.md](MODULE4_AUDIT.md).

## Validación de la restricción vigente

52/52 tests unitarios y las dos pruebas de navegador aislada/real aprobados. En un perfil nuevo solo M3 ofrece control de descarga y genera ficha; la API rechaza archivos exclusivos de M1/M2/M4. Home, landing público, manifest, cuatro sesiones, ocho MP4/diez PDF, rangos, reinicio, legacy, actualización/rollback y borrado siguen funcionando. La prueba aislada conserva lectura/eliminación de un paquete M4 histórico sin habilitar nuevas descargas. PostgreSQL idéntico antes/después. Detalle y límites en MODULE4_AUDIT.md.

## Motivo y alcance

Una artesana que vuelve sin conexión debe reconocer Warmi antes de abrir sus contenidos. Se mejora el shell público existente, su presentación y navegación. No se crea otra infraestructura offline ni se modifican textos pedagógicos, Course/Module/Lesson, File/LessonFile, Cloudinary, esquema, seed o autenticación.

Antes: las rutas de entrada mostraban directamente el primer módulo descargado o la lección de la URL. El shell añadía un encabezado genérico al encabezado de cada recorrido y repetía dos enlaces de apoyo de S1. La barra de conexión ocupaba más espacio.

Ahora: **Inicio Warmi → Continuar mi aprendizaje → módulo descargado → sesión**. Cada arranque documental del shell presenta Home, incluso si la PWA conserva una URL de lección. La dirección original no se usa como prueba de una última sesión fiable. No se agrega persistencia para reanudar visitas.

## Landing público / online / offline

- Landing público online: conserva `WarmiPublicHeader`, Programa Warmi, Descubre, Identidad y Únete. No se modifica su código.
- Online autenticado: conserva sus rutas actuales, login y acceso a aprendizaje. El manifest mantiene `start_url: /artesana/aprender`; no obliga a visitar el landing.
- Sin conexión: el Service Worker responde con `/offline-learning`, como antes. Su primer render muestra identidad Warmi, estado normal sin red, frase institucional y CTA destacado. Los módulos se leen de `verifiedDownloads()`.
- No se usa una sesión almacenada para autenticar offline. Se consulta el contenido previamente descargado y se mantiene la comprobación online de propietaria/cierre de sesión existente.
- El botón “Volver con conexión” lleva a aprendizaje desde Home o recarga la vista actual desde aprendizaje. Las acciones de guardar progreso siguen necesitando conexión.

## Presentación compartida

`LearningLessonHeader` se utiliza en S1 online y offline. `Module3Session1Content` ya era compartido y se conserva: siete temas, explicación, numeración, aria-expanded, pasos, voz, videos, PDF y texto completo.

Los recursos se adaptan a los mismos componentes, cambiando únicamente sus URLs por las del cache local. S2/S3/S4 siguen usando `Module3JourneyContent`; M4 sigue usando su componente propio existente. Se evita un encabezado genérico duplicado alrededor de los recorridos que ya incluyen título y navegación.

Los dos bloques de apoyo correspondían a las mismas lecciones originales: sus `internalLessonId` coinciden con `supportLessons`. Se conservan ambos recursos y se muestra una única lista “Material de apoyo” en S1. Solo se muestran materiales adicionales al pie cuando sus IDs no están ya representados dentro de la sesión. No se borran recursos.

## Navegación

- Home: CTA principal “Continuar mi aprendizaje”, ancho completo y al menos 56 px; tarjetas por cada módulo descargado con número dinámico de sesiones.
- Curso: selección entre módulos mediante query `module=<id>` y lista de sus sesiones. La selección también se resuelve por ID de lección, incluyendo apoyos.
- S1: encabezado compartido, CTA “Siguiente sesión”, lista secundaria desplegable “Todas las sesiones”.
- S2/S3/S4 y M4: se conservan los controles del recorrido, sin repetir la misma lista global de sesiones al pie.
- Barra inferior: “Inicio Warmi” / “Mi aprendizaje”. Solo incluye destinos disponibles localmente.
- Los enlaces locales usan el router actual del shell, `history.pushState` y `popstate`. Atrás/adelante respetan Home/curso/sesión. Una recarga o reapertura vuelve a Home; navegar dentro del shell no lo hace.
- No se enlazan secciones institucionales no cacheadas ni se invita a registrarse desde Home.

## Progreso real, sin sincronización offline

Los nuevos manifiestos pueden incluir `progress: { completedLessonIds, capturedAt }`, copiado del progreso existente al descargar. Es una ampliación opcional de la misma ficha IndexedDB. Solo incluye IDs del módulo y se presenta como **“completadas al descargar”**. No cambia al recorrer pantallas offline ni se sincroniza posteriormente.

Las copias anteriores carecen de ese dato: se omite el porcentaje o contador, sin asumir cero. `isCurrentDownload` continúa comparando contenido/revisión/recursos y no invalida un paquete por cambios en la instantánea de progreso. No hay nuevo store, versión de IndexedDB, escritura en PostgreSQL ni persistencia de “última visita”.

## App shell y recursos

Se mantiene Service Worker, IndexedDB v1/store `downloads`, claves `module:<id>` y clave legacy `module3`, caches por generación y endpoints autenticados existentes. Los rangos MP4/PDF no cambian. La descarga sigue siendo atómica; un fallo conserva la generación anterior.

Solo la revisión pública del shell cambia de **v4 a v5**, para distribuir la nueva UI y su fotografía. Activación elimina shells anteriores, conservando todas las generaciones de contenido M3/M4/legacy.

Recursos reutilizados sin copias ni uploads:

- `/images/hero/warmi-hero.png`: fotografía del hero público, 2232981 bytes, añadida a la preparación del shell.
- `/icons/faviconWarmi.png`: logo ya cacheado, reutilizado para identidad y barra superior.
- JS, CSS, fuentes y las dos imágenes de voz: mismas reglas de preparación actuales.

No hay imágenes remotas requeridas por Home. El fondo conserva un color legible durante la carga. El número de recursos de cada módulo proviene de su manifiesto; no se codifican 18 archivos en la UI.

Una instalación ya offline necesita conectarse para recibir el nuevo worker/shell; sus descargas siguen disponibles con la interfaz anterior hasta entonces. No requiere reinstalar la PWA ni volver a descargar los medios para usar Home.

## Responsive y accesibilidad

Prioridad 360/390/430 px y revisión a 768/1365 px. Márgenes de lectura, títulos que envuelven líneas, controles de al menos 48 px, foco visible global y CTA antes de la navegación secundaria. La navegación inferior reserva `env(safe-area-inset-bottom)` y el contenido deja espacio equivalente; la barra compacta reserva `safe-area-inset-top`. `viewport-fit=cover` conserva zoom accesible.

SpeechButton/useSpeech/speechSynthesis no se sustituyen. La voz sin conexión sigue dependiendo de una voz local instalada; las pruebas de API no certifican audibilidad ni calidad en un teléfono físico.

## Validación histórica de ce7c877

Resultado validado sobre el build de producción local:

- Typecheck, lint, build, Prisma validate, formato de archivos modificados y `git diff --check`: correctos.
- 48/48 tests unitarios, incluidos Home/rutas, progreso opcional y activación del worker conservando caches de aprendizaje.
- Prueba aislada de navegador: descarga, rollback, reinicio offline, navegación, imágenes, PDF, MP4, voz, reconexión y eliminación correctos.
- Prueba real con cuenta existente: login y descarga de M3/M4; cierre completo de Edge y reapertura sin red desde la entrada del manifest y desde una URL de lección; Home primero en ambos casos.
- CTA, atrás/adelante, cambio de módulo, cuatro sesiones M3 y apertura de M4 correctos. S1 comparte estructura/clases/temas/texto con la presentación online. Siete acordeones y una sola lista de apoyo verificados.
- Ocho MP4 reproducidos; entrega local de los 18 recursos actuales de M3 (8 MP4 y 10 PDF), MIME/tamaño, rangos 206 y SHA-256 cuando existe en metadata. PDF abierto en visor y exportado con firma `%PDF-`.
- Cinco anchuras sin desbordamiento horizontal: 360, 390, 430, 768 y 1365 px. CTA visible y pulsable con altura mínima. Capturas Home/sesión en cada anchura y referencia online a 390 px.
- Compatibilidad con descarga anterior sin versión/progreso; actualización fallida conserva la generación; reintento exitoso; eliminar M3 conserva M4 y eliminar ambos deja cero descargas.
- Comparación completa del curso, módulos, lecciones, LessonFile/File y progreso de inscripciones: **PostgreSQL sin cambios**. Se bloquea la precarga online de rutas de lección durante la prueba para evitar `markLessonStarted`.

Las capturas y `result.json` se generan en `%TEMP%/warmi-offline-home-ux`; las capturas de entrega a 390 px también quedan en `../entrega-offline-ux/` fuera del repositorio. La prueba usa Edge real con tamaños de viewport móviles; no sustituye una revisión en un dispositivo Android físico o de audibilidad de su voz instalada.

```powershell
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
corepack pnpm exec prisma validate
corepack pnpm exec tsx --test tests/*.test.ts tests/*.test.mjs
node tests/offline-learning.browser.mjs
corepack pnpm exec tsx tests/offline-home-real.browser.mjs
git diff --check
```

Los navegadores usan Playwright disponible externamente mediante `WARMI_PLAYWRIGHT_PATH` y opcionalmente `WARMI_BROWSER_CHANNEL=msedge`. La prueba real requiere `WARMI_TEST_EMAIL` y `WARMI_TEST_PASSWORD` de una cuenta existente inscrita; no incluye credenciales. Hace login y descarga reales sin crear cuentas ni completar/visitar lecciones online. Para comparar S1 usa sus registros reales y monta los mismos componentes de presentación en un contenedor de prueba, evitando el `markLessonStarted` automático de la ruta online. Compara la BD completa del curso antes/después.

Las pruebas históricas M3/M4 que crean cuentas y completan sesiones mantienen su finalidad y se adaptan al paso inicial por Home. No se ejecutan contra PostgreSQL para esta entrega, porque la solicitud exige no modificar BD. La prueba real nueva cubre reproducción y entrega de sus recursos existentes con lecturas y operaciones del navegador.

README, ARCHITECTURE y apartados históricos de OFFLINE_MODULE3 describen fases anteriores; el estado UX actual se documenta aquí. No se reescriben sus contenidos históricos.
