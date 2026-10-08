# Auditoría de M4 y corrección de capacidad offline

Fecha: 7 de octubre de 2026. Auditoría de código local, Git, PostgreSQL, entrega real de imágenes y renderer existente. No se implementa contenido adicional de M4.

## Git y documentos

- HEAD inicial y origin/main tras fetch: `ce7c877da11f0567be6118194014fd22db0cd260`.
- Rama `main`; remoto `https://github.com/Jhanfranco07/Warmi-Digital.git`; árbol inicialmente limpio, sin cambios locales que preservar ni divergencia.
- Commits relevantes: `b8608bf` construyó las cuatro sesiones M4 y habilitó offline; `ce7c877` mejoró Home/presentación offline; `8828843` publicó el recorrido M3; `ffabdfa` confirmó guías S1; `2f481c5` publicó M2; `0e33765` publicó M1.
- Se enumeraron todos los Markdown y se leyeron AGENTS, README, LEARNING_PROGRAM, MODULE1_LEARNING, MODULE2_LEARNING, MODULE3_SESSION1_GUIDES, MODULE3_SESSIONS_2_4, MODULE3_VIDEOS, OFFLINE_MODULE3, OFFLINE_HOME_UX y **MODULE4_LEARNING.md, que sí existe**. Se revisaron además apartados relacionados de ARCHITECTURE, COMPONENTS, ARTISAN_EXPERIENCE, ROUTES, FEATURES, FUNCTIONAL_ACTIONS_AUDIT, STATIC_CONTENT_AUDIT, IMPLEMENTATION_PLAN, DATABASE y ERD.
- README sigue describiendo infraestructura inicial; ARTISAN_EXPERIENCE mantiene offline pendiente y documentos M1/M2/M3 mantienen denominadores y estados de entregas anteriores. No representan el estado actual de M4. Se conservan como historia; las declaraciones vigentes de capacidad en LEARNING_PROGRAM/MODULE4_LEARNING se aclaran sin reescribir sus pruebas anteriores.

## Estado real general

Curso publicado `Aprender para crecer`, `93dc7355-d746-4acd-87df-29f71d16a955`, sin soft delete. M4: `2853b850-4032-5e82-b861-8eaaa84913f8`, order 4, duración orientativa 45 minutos. Existe en PostgreSQL y catálogo como disponible. Hay exactamente cuatro Lesson TEXT, nueve File IMAGE/image/webp y once LessonFile IMAGE. No hay PDF ni video propios de M4. Los cuatro textos persistidos coinciden exactamente con `module4LessonText`.

La ruta de lección selecciona `Module4Lesson` por ID; este adapta File/LessonFile a `Module4Content`, con contenido propio, no una pantalla genérica de texto. Reutiliza SpeechButton, LearningDisclosure, LearningChecklist y completeLessonAction. El progreso global sigue incluyendo las 16 sesiones disponibles; restringir offline no oculta M4 ni cambia el denominador.

| Sesión | Lesson.id                              | Título real                          | Contenido y práctica ya implementados                                                                                                                              | Visuales / relaciones                                                                                 | Estado                                       |
| ------ | -------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1      | `e5d67e39-87e6-5d9e-92c3-0b5c830970fe` | Mi producto, mi historia, mi cultura | 3 pasos: historia/testimonio; tres preguntas y descripción de ejemplo; práctica con checklist y ayuda desplegable. 10 min.                                         | artesana, paisaje, manos, muñecas y tejidos: 5 File / 5 LessonFile.                                   | Funcional; recorrido previsto implementado.  |
| 2      | `a129768b-0b93-5174-97cd-7539c431b949` | Cómo presentar mi producto           | 2 pasos: cuatro momentos de la clienta y aviso sobre atención/entrega; dos cards que comparan valor cultural con producto/precio. 10 min.                          | artesana y bolso: 2 File / 2 LessonFile; artesana reutilizada de S1.                                  | Funcional; recorrido previsto implementado.  |
| 3      | `ea5fa9dc-710d-5782-aa07-7fe81f3ffc91` | El valor de la artesanía             | 2 pasos: patrimonio/qallwa con documento desplegable y botón a fuente oficial; comunicar técnica, materiales, tiempo y origen mediante checklist/ejemplo. 10 min.  | qallwa y resolución: 2 File / 2 LessonFile. La resolución es una imagen, no un PDF descargable de M4. | Funcional; recorrido previsto implementado.  |
| 4      | `53020031-7b46-5001-bc0c-db41fa536a58` | Simulación de venta sin ayuda        | 4 pasos: presentar, responder, informar precio/características y cerrar; conversación predefinida y checklist por paso. Finalizar práctica abre el cierre. 15 min. | bolso y entrega: 2 File / 2 LessonFile; bolso reutilizado de S2.                                      | Funcional; recorrido y cierre implementados. |

No hay una sesión vacía o en preparación en BD. “Funcional” describe la implementación encontrada, no una aprobación pedagógica definitiva ni una certificación de uso en Android físico. Las duraciones son orientativas, no temporizadores.

## Cierre y progreso

El cierre es un estado visual `closing` dentro de S4, con seis logros, foto de entrega, mensaje de confianza y enlace “Finalizar Módulo 4”. No es otra Lesson y no existe Sesión 5. No crea certificados/badges. La simulación no envía mensajes, pedidos ni pagos.

Al finalizar online se llama a la acción existente solo si S4 no está guardada, validando rol/inscripción. Se completa S4, no las tres anteriores automáticamente. `module4Progress` solo cuenta los cuatro IDs reales: S4 sola equivale a 25% del módulo; las cuatro completas a 100%, y a 25% del programa de 16 sesiones. Abrir una lección registra inicio mediante el servicio existente; por eso esta auditoría no navega las rutas online de lección ni ejecuta finalizaciones.

La consulta real encontró una inscripción con inicio registrado en cada sesión de M4 y **cero finalizaciones** para cada una. Es estado de uso de la BD, no contenido faltante. No se modificó ese progreso durante la auditoría.

Los checklists son locales a la pantalla y no guardan historias/respuestas de práctica. La conversación es un ejemplo guiado, sin evaluación automática ni chat interactivo. No se añaden estas capacidades porque no están autorizadas en esta tarea.

## Recursos reales y diseño

Nueve WebP únicos, **283202 bytes**, en `public/images/learning/module4/` y Cloudinary `Warmi/MODULO_4/IMAGENES/<clave>-v1`. Las nueve URLs reales responden HTTP 200, image/webp, tamaño y SHA256 coincidentes con File.metadata y con el manifiesto local. Sin nuevas subidas ni cambios Cloudinary.

Fuente: PDF local de 65 páginas, SHA256 `31744df4404ad0d302f57d99fb059f31f031cec8c6d98789fddf80460bad7262`, confirmado contra el archivo recibido. El manifiesto y extractor identifican objetos/recortes de páginas 48, 49, 51, 52 y 54. No se usan diapositivas completas como páginas de aprendizaje.

| Imagen     | Dimensiones | Página | Uso                   |
| ---------- | ----------- | ------ | --------------------- |
| artesana   | 245 × 362   | 48     | S1/S2                 |
| paisaje    | 149 × 160   | 48     | S1                    |
| manos      | 148 × 160   | 48     | S1                    |
| muñecas    | 131 × 99    | 49     | S1                    |
| bolso      | 131 × 114   | 51     | S2/S4                 |
| tejidos    | 400 × 267   | 51     | S1                    |
| qallwa     | 640 × 427   | 52     | S3 y portada          |
| resolución | 440 × 657   | 52     | S3, apoyo desplegable |
| entrega    | 400 × 512   | 54     | Cierre S4             |

Se usan imágenes de apariencia fotográfica del material; no está acreditado que todas representen participantes reales o que todas sean fotografías sin generación previa. La imagen de qallwa conserva marcas de la Municipalidad presentes en el objeto fuente. No se afirma autenticidad independiente de cada retrato.

La UI es mobile-first, con ancho máximo de lectura, stepper de sesiones 1–4, indicador de paso y controles adelante/atrás. Hay 11 pasos, cards/comparaciones, checklist, acordeones y voz. El contenido se divide por pasos; no es una diapositiva larga o un bloque masivo. Imágenes con `w-full h-auto`, límites de ancho y sin contenedores de alto fijo; no se detecta deformación o recorte adicional por CSS. Los recortes de origen son explícitos. Muñecas/bolso tienen poca resolución y pueden perder nitidez al ampliarse; el documento de resolución es rasterizado. Son puntos para revisión con la cliente, no cambios aplicados.

## File y LessonFile encontrados

Todos existen realmente en PostgreSQL. Artesana y bolso reutilizan File; hay once vínculos y nueve archivos únicos. Identidades/posiciones:

| Sesión | Clave      | position | File.id                                | LessonFile.id                          |
| ------ | ---------- | -------- | -------------------------------------- | -------------------------------------- |
| S1     | artesana   | 10       | `1a9dbb07-4f03-439c-8e86-074900eb3f46` | `69172bc9-6d6f-440d-85c9-3f4d4604f750` |
| S1     | paisaje    | 20       | `fb670a6b-b3fd-416d-8d83-bef84650eaf9` | `df0a60f4-e799-450a-8c77-cfbe4d5f37d7` |
| S1     | manos      | 30       | `c9eacf7c-5b5b-41ed-98ed-f6a2d130d443` | `2382dff9-6a61-4963-94a9-2dc26095c3c5` |
| S1     | munecas    | 40       | `8a5d5858-5aaa-4a05-a454-f81e10d8ddc3` | `e35671e8-97ab-48d0-84df-eb98e3a31a6e` |
| S1     | tejidos    | 50       | `57a1de94-6d57-4c6a-872d-98917ea3778a` | `c70c73d0-ce76-4ae0-805b-29036268d297` |
| S2     | artesana   | 10       | `1a9dbb07-4f03-439c-8e86-074900eb3f46` | `23cde152-6ecc-45da-a395-4f37c869cd75` |
| S2     | bolso      | 20       | `d3020a5a-d1fd-40c0-9795-1d70bc450bc7` | `b532d369-2b9d-482b-9ff5-e1361e28acb7` |
| S3     | qallwa     | 10       | `dfa879ca-2a49-453c-be3b-92e3068f6d9e` | `7751a759-4456-4ed3-b358-bb94a2251007` |
| S3     | resolucion | 20       | `39816b53-df1d-49c8-8c10-2a745c1ce43c` | `317a7cea-c6eb-4e02-bc2d-8c8de2dafcd6` |
| S4     | bolso      | 10       | `d3020a5a-d1fd-40c0-9795-1d70bc450bc7` | `c1ef173d-8d83-407b-933a-865fbb24409c` |
| S4     | entrega    | 20       | `4ce40858-5cbf-4eac-bb39-6c899606e0f1` | `8c6cfc00-e704-4985-9db9-46a6a12db893` |

## Scripts y publicación existentes

- `scripts/extract-module4-images.py`: extracción fiel y manifiesto local; valida hash/edición/xref. No ejecutado, para no regenerar imágenes.
- `scripts/publish-module4.ts`: dry-run por defecto; con `--apply` respalda, verifica/reutiliza assets, publica M4 y recalcula resumen mediante servicio/repository. No ejecutado con apply.
- `shared/services/module4-publishing.service.ts`: valida nueve imágenes locales/remotas; solo sube con apply y si faltan; no sobrescribe.
- `shared/repositories/module4-publishing.repository.ts`: transacción serializable, bloqueo del curso, identidades/posiciones y protección de otros módulos/progreso.

## Causa de la descarga incorrecta

El commit **b8608bf** cambió M4 de `offline: false` a **true** en `shared/learning/program.ts`, además de declarar su versión/renderer. Esto contradice la regla actual solicitada.

Cadena real: catálogo → `isOfflineModule` → filtro `offlineSnapshots` del curso → `getModuleSnapshot` → `ModuleDownload`. El botón es un componente genérico, pero se insertaba solo para módulos habilitados: no se estaba mostrando indiscriminadamente a M1/M2. La misma capacidad autorizaba sus archivos por `/api/learning/offline/[courseId]/files/[fileId]`.

El cliente descargaba las nueve imágenes únicas, guardaba textos y once relaciones en IndexedDB `downloads`, clave `module:<M4-id>`, y binarios en `warmi-learning-module-<M4-id>-<UUID>`. El renderer/SW existentes servían esos bytes. No era solo UI: el paquete real fue comprobado en la entrega anterior y su construcción/autorización se verificó en código y BD en esta auditoría.

El manifest PWA `app/manifest.ts` contiene nombre, icono, scope y start_url; **nunca listó módulos**. El manifiesto de contenido era la ficha OfflineModule de M4. Son conceptos distintos.

## Corrección acotada

**Actualmente el único módulo descargable para uso offline es Módulo 3.** Catálogo: M1 false, M2 false, M3 true, M4 false, por IDs estables. No hay comparación de títulos.

- El filtro ya existente del curso deja de generar manifiesto/botón para M4.
- El servicio rechaza explícitamente construir manifiestos para módulos deshabilitados.
- La API ya usa esa capacidad para autorizar archivos; ahora rechaza recursos exclusivos de M1/M2/M4.
- El cliente rechaza iniciar descargas deshabilitadas antes de locks, shell, requests o escritura local.
- No se cambia disponibilidad online, progreso, componentes pedagógicos, recursos, esquema, auth, SW, manifest PWA o formato/versión de almacenamiento.
- Se mantienen lectores y eliminación para paquetes históricos realmente guardados, incluido M4: no se borran automáticamente ni se pueden actualizar/descargar de nuevo. Con un perfil nuevo solo se guarda M3 y Home solo lo muestra a él.

## Validación de esta corrección

- 52/52 pruebas unitarias aprobadas: 48 existentes ajustadas a la regla vigente y cuatro pruebas nuevas de capacidad, rechazo de manifiestos, autorización de archivos y rechazo del cliente antes de tocar el navegador.
- Typecheck, lint, build de producción (47 páginas), Prisma validate, formato de archivos modificados y git diff --check: aprobados.
- Prueba real `offline-home-real.browser.mjs`: login con cuenta existente, controles de descarga solo M3, ausencia de controles M1/M2/M4, API 404 para sus archivos exclusivos y una única ficha descargada M3. Landing público, entrada online y manifest PWA conservados. Reinicio completo offline desde entrada/deep link, Home/CTA/atrás/adelante, cuatro sesiones, siete acordeones S1, ocho MP4, diez PDF, visor/exportación nativos, tamaños/MIME/rangos 206/hashes disponibles, cinco anchuras, copia anterior, rollback, actualización y eliminación aprobados.
- Prueba aislada `offline-learning.browser.mjs`: descarga/rollback/reinicio/offline/PDF/imagen/MP4/voz/reconexión/borrado aprobados. Comprueba rechazo de nueva descarga M4 y lectura/eliminación de una ficha M4 histórica sin afectar M3. Primer intento con video sintetizado por MediaRecorder falló con NotSupportedError; se repitió con un MP4 real existente de M3 indicado por WARMI_TEST_MP4 y pasó, sin cambiar el reproductor ni los recursos publicados.
- Auditoría visual readonly: mismo Module4Content montado con los File/LessonFile reales en un contenedor de verificación. Se recorrieron sus once pasos, nueve imágenes remotas, apoyos y cierre existente, a 360/390/430/768/1365 px; sin overflow ni deformación. El cierre se inspeccionó por su rama histórica offline para no ejecutar completeLessonAction. No se afirma una nueva prueba de guardado online: se verificaron integración/cálculos existentes y no se ejecutó `module4-real.browser.mjs`, que crea una cuenta y completa sesiones en PostgreSQL.
- Consulta final comparada con el snapshot inicial: Course, Module, Lesson, File/LessonFile asociados, Enrollment, LessonProgress y CourseProgress exactamente iguales. No se ejecutaron publicadores con apply, migraciones, seed, uploads o cambios de progreso.
- Evidencia local fuera de Git: `%TEMP%/warmi-module4-audit/` contiene state.json, resultados de imágenes/BD/unitarios y capturas de los once pasos más cierre a 390 px; `%TEMP%/warmi-offline-home-ux/result.json` registra la regresión real. Capturas copiadas a `../auditoria-module4/` para revisión.
- Pendiente revisión pedagógica/UX y audibilidad en Android físico. Edge a anchuras móviles no equivale a certificación en dispositivos reales.

Archivos de esta corrección: `shared/learning/program.ts`, `shared/services/offline-learning.service.ts`, `shared/offline/module3-storage.ts`; tests `offline-capability.test.ts` (nuevo), `learning-program.test.mjs`, `module4.test.ts`, `module4-real.browser.mjs`, `offline-learning.browser.mjs`, `offline-home-real.browser.mjs`; documentación `OFFLINE_MODULE3.md`, `OFFLINE_HOME_UX.md`, `LEARNING_PROGRAM.md`, `MODULE4_LEARNING.md` y este informe. No cambian componentes de M4, datos pedagógicos, imágenes, SW o manifest PWA.

## Qué está terminado, qué falta y siguiente trabajo

Las cuatro sesiones, sus 11 pasos, nueve imágenes/once relaciones, integración online, acción de progreso y cierre de seis logros están implementados. No se encontró una sesión técnica pendiente de construir ni una quinta lección accidental. No se desarrolló contenido adicional en esta corrección.

Siguiente trabajo recomendado: **revisión pedagógica y UX de las cuatro sesiones existentes con la cliente en Android**, empezando por S1 (historia/producto), S2 (comparación de presentación), S3 (legibilidad del apoyo rasterizado) y S4 (si la simulación guiada cumple la autonomía esperada). Decidir allí si hace falta práctica con respuestas, imágenes de mayor resolución o ajustes de contenido. No crear nuevas Lessons ni declarar M4 pendiente antes de esa revisión.
