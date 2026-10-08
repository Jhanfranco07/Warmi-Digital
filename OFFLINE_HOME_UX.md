# Offline Home y navegación del aprendizaje

## Estado vigente

HEAD inicial de esta mejora: `b318374f80ddc077eba7f1341b6814c5c9755f6d`, sincronizado con `origin/main` y sin cambios locales. Esta tarea modifica presentación, recursos institucionales del shell y pruebas. No modifica PostgreSQL, Auth, roles, Prisma, Cloudinary ni contenido pedagógico.

| Módulo | Nuevas descargas / actualización offline |
| ------ | ---------------------------------------- |
| M1     | No                                       |
| M2     | No                                       |
| M3     | Sí                                       |
| M4     | No                                       |

Una descarga histórica de M4 sigue siendo legible y eliminable. No se actualiza, vuelve a descargar ni se elimina automáticamente. Su renderer, cuatro sesiones, nueve File, once LessonFile, imágenes, textos, cierre y progreso permanecen intactos. Las comprobaciones por identidad estable en catálogo, servicio, autorización de archivos y cliente no cambian.

## Inicio institucional completo

Home sigue siendo la primera vista tras abrir la PWA sin conexión, incluso desde la URL guardada de una lección. Incluye hero, isotipo, WARMI DIGITAL, lema, cuatro accesos, bienvenida con fotografía y cita, Programa (objetivo, misión, visión y pilares), Descubre (cuatro fotografías y áreas), Identidad/Riqsichiq Warmi y footer institucional. Los contenidos provienen del landing y sus páginas existentes.

Se extraen únicamente sus bloques de presentación para compartirlos:

- `WarmiPublicHeader`: hero y cuatro accesos.
- `WarmiWelcomeContent`: bienvenida, fotografía y cita de `/`.
- `WarmiProgrammeContent`: contenido completo de `/programa`, incluido `WarmiLogo`.
- `WarmiDiscoveryContent`: contenido de `/descubre`.
- `WarmiIdentityContent`: contenido de `/identidad`.
- `Footer`: mismo cierre institucional del layout público.

Las páginas públicas siguen componiendo estos bloques con su header habitual. Offline Home los compone en una sola página con anclas a Programa, Descubre e Identidad. Las áreas de Descubre que requieren red se presentan como información; Aprender y Elegir mi camino abren el aprendizaje local. No se simula mercado o talleres sin red.

El cuarto acceso mantiene **UNETE A WARMI → /login** en el landing público. Solo en Offline Home pasa a **CONTINUAR MI APRENDIZAJE → /artesana/aprender**, con énfasis rosa, nombre accesible y altura mínima de 48 px. Su destino contiene las descargas verificadas del dispositivo, incluyendo copias históricas válidas; Home no habilita otros módulos.

El aviso compacto conserva “Sin conexión · Contenido descargado disponible”. La navegación inferior mantiene Inicio Warmi y Mi aprendizaje, safe area y padding inferior. Las anclas y los enlaces de aprendizaje offline usan el router local existente, sin peticiones RSC. Las anclas conservan la marca Home del historial incluso al abrir en frío una URL de aprendizaje, y atrás/adelante restaura la sección. La bienvenida permite envolver su encabezado largo en móvil sin recortarlo.

## Imágenes y shell

`shared/offline/landing-assets.ts` centraliza la correspondencia entre los PNG institucionales existentes y nueve WebP en `public/images/offline/`. Se conservan todos los originales. Las copias se generan con Sharp instalado por Next, calidad 80 y ancho máximo 1440 px (560 para marcas), sin ampliar.

| Copia cacheada              |      Bytes |
| --------------------------- | ---------: |
| warmi-hero.webp             |      96734 |
| warmi-isotipo.webp          |      87880 |
| warmi-logo-transparent.webp |      94470 |
| bienvenida-warmi.webp       |      66528 |
| programa-warmi.webp         |     130374 |
| aprende.webp                |      33312 |
| emprende.webp               |      26406 |
| taller.webp                 |      20624 |
| recursos.webp               |      49266 |
| **Total adicional**         | **605594** |

El shell público pasa de **v5 a v6** para distribuir la nueva presentación y precachear estas imágenes. Se mantienen recursos de voz, favicon, JS, CSS y fuentes. Los componentes usan imágenes sin transformación remota en contexto offline. Los iconos Lucide forman parte del JavaScript cacheado. No se guarda HTML autenticado ni RSC.

No cambia el manifest de instalación ni el manifiesto/versionado de M3. Tampoco IndexedDB v1, store `downloads`, claves `module:<id>`/legacy `module3`, caches de medios por generación, rutas locales, rangos MP4/PDF, descarga atómica, rollback o eliminación. La activación del worker elimina únicamente shells públicos anteriores; conserva todas las generaciones de aprendizaje, incluidas M4 históricas.

Una instalación que ya está offline debe conectarse para recibir el nuevo shell. No necesita reinstalar la PWA ni descargar otra vez sus medios.

## Sesión 1: un tema activo

`Module3Session1Content` comparte la nueva presentación online y offline. Solo monta un tema principal: orientación “Tema X de 7”, grupo, título, descripción, pasos, SpeechButton, videos existentes, guía PDF y navegación. No monta los otros seis temas como acordeones.

“Ver todos los temas” abre el Sheet inferior existente con los siete nombres reales. Seleccionar cambia el tema, cierra el Sheet, enfoca el nuevo h2 y lo desplaza bajo el aviso superior. Escape/cierre conserva el retorno de foco de Radix. El selector admite teclado y marca el tema actual con `aria-current=step`.

Tema 1 ofrece Siguiente tema; temas intermedios, Anterior/Siguiente; tema 7, Anterior/Continuar a siguiente sesión si esa sesión está disponible. La navegación es estado React transitorio: no escribe progreso, IndexedDB, localStorage ni BD. La finalización online sigue siendo la acción explícita existente.

Hay un SpeechButton principal por tema. El texto original, su narración opcional y las dos lecciones de apoyo permanecen bajo Material adicional, cerrado por defecto. No se eliminan textos ni recursos. La lista de sesiones sigue como acceso secundario compacto; se evita duplicar Siguiente sesión fuera del tema activo de S1. S2–S4 conservan su navegación propia.

Las guías mantienen apertura en visor y descarga nativa desde los bytes locales del worker. Los controles muestran Abrir guía/Descargar PDF en paralelo desde 390 px y se apilan en 360 px, sin reducir objetivos táctiles. Sus nombres accesibles identifican la guía. Los ocho MP4, diez PDF, IDs, URLs, posiciones y versiones no cambian.

## Medición de scroll a 390 px

La referencia anterior se capturó antes de editar el componente en `b318374`. Usa un contenedor de 390×844 px, header compartido, registros reales de S1 y siete estados de tema activo. `tests/fixtures/offline-scroll-before.json` conserva las alturas anteriores. La prueba repite exactamente ese contenedor con la nueva presentación.

Altura media anterior: **2209 px**; nueva: **1264 px**; reducción aproximada: **945 px (43%)**. Tema 1: 2274→1309 px. Tema 7: 1953→1082 px. Los siete estados anteriores/nuevos se guardan en `scroll-comparison.json`.

Se compara altura de contenido, no tiempo ni número de gestos. Los videos, pasos y guías todavía requieren scroll para leerlos; se elimina la necesidad de buscar manualmente otro acordeón. Anterior/Siguiente y selector enfocan el nuevo tema automáticamente.

## Pruebas y evidencias

**55/55 tests unitarios aprobados**, incluidos CTA contextual, landing completo, presupuesto/correspondencia de imágenes, capacidades y preservación de caches. **Pruebas de navegador aislada y real aprobadas** sobre build de producción. **Typecheck, lint, build, Prisma validate, formato de archivos modificados y git diff --check correctos.**

El recorrido real verificó las cinco anchuras, los siete temas con sus descripciones/pasos/guías intactos y un solo tema principal, foco del selector, Anterior/Siguiente, materiales originales colapsados, PDF abierto/exportado y llamada real a speechSynthesis con voz española local disponible. Reprodujo los ocho MP4 únicos (diez reproducciones incluidas las repetidas) y entregó los dieciocho recursos locales con rangos. Verificó M4 histórico legible/eliminable sin controles de nueva descarga, M3 legacy sin versión/progreso, actualización fallida con rollback, reintento y eliminación. **PostgreSQL idéntico antes/después.** Las ocho capturas a 390 px se inspeccionaron visualmente.

La prueba real `tests/offline-home-real.browser.mjs` usa una cuenta inscrita existente: login, descarga real de M3, cierre completo de Edge, reapertura offline, Home, Programa/Descubre/Identidad, aprendizaje, S1, Anterior/Siguiente, salto Tema 2→6, video, PDF, API de voz, siguiente sesión, regreso al inicio, reconexión, actualización fallida/rollback, reintento y eliminación. Comprueba recursos, MIME/tamaño, SHA-256 cuando hay metadata, rangos 206, progreso de descarga y anchuras 360/390/430/768/1365.

Para verificar M4 histórico, siembra únicamente en el perfil temporal una copia basada en los registros/imágenes existentes, abre su renderer sin red y elimina esa copia conservando M3. No llama al servicio de descarga M4 ni habilita nuevas descargas. La prueba aislada también intenta actualizar/repetir la descarga histórica y exige rechazo sin alterar su cache.

La comparación online de S1 monta los mismos componentes con datos reales sobre la página del curso. Se bloquea la precarga/GET de lecciones online porque `markLessonStarted` escribiría progreso. Se compara un snapshot completo del curso, módulos, Lesson/File/LessonFile e inscripciones antes/después. Las suites históricas que crean cuentas o completan lecciones no se ejecutan contra la BD para esta tarea; sus selectores afectados se adaptan al nuevo Sheet.

Capturas obligatorias a 390 px, generadas en `%TEMP%/warmi-offline-home-ux` y entregadas fuera de Git en `../entrega-offline-landing/`:

1. `01-home-hero-390.png`
2. `02-home-four-accesses-390.png`
3. `03-programme-offline-390.png`
4. `04-identity-offline-390.png`
5. `05-session-topic-390.png`
6. `06-topic-selector-390.png`
7. `07-topic-video-390.png`
8. `08-topic-pdf-390.png`

También se conserva `scroll-comparison.json`, `result.json`, capturas de cinco anchuras y referencia online. Edge real con viewports móviles verifica la presentación; no sustituye una prueba en un Android físico. SpeechButton/useSpeech se reutilizan: voz offline requiere una voz española local instalada; invocar speechSynthesis no certifica audibilidad o calidad del altavoz.

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

Los navegadores reciben `WARMI_PLAYWRIGHT_PATH`, canal opcional `WARMI_BROWSER_CHANNEL=msedge` y URL local. La prueba real requiere `WARMI_TEST_EMAIL` y `WARMI_TEST_PASSWORD` configuradas en el proceso, nunca publicadas en documentación. La prueba aislada puede recibir `WARMI_TEST_MP4` como archivo local de un MP4 existente para evitar depender del encoder del equipo.

Los apartados históricos de OFFLINE_MODULE3 y las validaciones previas de `ce7c877` describen fases anteriores (incluida la habilitación errónea de M4). Este documento y la restricción de `b318374` reflejan el estado vigente.
