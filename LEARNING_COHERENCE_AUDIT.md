# Auditoría de coherencia del aprendizaje

Fecha: 8 de octubre de 2026. HEAD inicial y `origin/main`: `535400f6b59e4ee5d700ef6090ce5e81ca73599e`. Rama `main`, árbol limpio antes de editar; fetch y últimos veinte commits revisados. Alcance: presentación y cálculos existentes, sin rediseño ni cambios pedagógicos.

## Contexto y fuentes

Se consultaron AGENTS, README, LEARNING_PROGRAM, MODULE1_LEARNING, MODULE2_LEARNING, MODULE3_SESSION1_GUIDES, MODULE3_SESSIONS_2_4, MODULE4_LEARNING, MODULE4_AUDIT, OFFLINE_MODULE3, OFFLINE_HOME_UX, ARCHITECTURE, DATABASE, ERD, DESIGN_SYSTEM y COMPONENTS. Se contrastaron con Prisma, PostgreSQL, catálogo, servicios/repositorios, dashboard, Mi aprendizaje, tarjetas, recorridos de sesión, cierres, IndexedDB, Cache Storage y Service Worker.

README conserva la descripción de infraestructura inicial. Los documentos históricos M1/M2/M3 y offline contienen estados, denominadores, títulos y versiones de entregas anteriores. No se reescribieron sus validaciones históricas: el código, PostgreSQL y esta auditoría describen el estado comprobado ahora.

## Hallazgos y correcciones

**12 hallazgos: 0 críticos, 10 medios y 2 visuales.** Se clasificaron por causa antes de corregir. Los casos latentes se distinguen de los errores visibles con los datos actuales; no significan corrupción encontrada en producción.

| ID  | Severidad      | Causa / evidencia                                                                                                                                                                  | Corrección                                                                                                                          |
| --- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| H01 | Medio          | `Lesson.durationMin = null` en M3 S3/S4 se convertía en `0` en las tarjetas y en el renderer genérico.                                                                             | Helper compartido: duración finita y positiva o indicador oculto.                                                                   |
| H02 | Medio, latente | Las sumas convertían hijos desconocidos en cero; podían presentar un subtotal como duración completa. La consulta de resumen tampoco seleccionaba la duración explícita del curso. | Priorizar estimación explícita válida; sumar únicamente un conjunto completo y no vacío de estimaciones válidas.                    |
| H03 | Medio          | Mi aprendizaje suponía cinco módulos y aproximaba módulos terminados mediante `round(porcentaje × 5)`.                                                                             | Contar módulos reales; terminado solo con todas sus sesiones completadas.                                                           |
| H04 | Medio          | Próximo objetivo fijo «Cuenta tu historia», sin relación con el siguiente módulo pendiente.                                                                                        | Usar el primer módulo real incompleto en orden; repaso cuando todos terminaron.                                                     |
| H05 | Medio          | Badge desktop siempre «En progreso»; nombres de ruta cambiaban a «Colorista Digital» / «Guardiana de la Tradición» por umbrales, sin ser el nombre real del curso.                 | Estado desde las sesiones; nombre de la ruta desde el curso actual en aprendizaje y dashboard.                                      |
| H06 | Medio          | Abrir una sesión sin completarla mantenía 0%, y el curso podía seguir ofreciendo empezar; tarjetas móviles/dashboard ofrecían continuar incluso a usuarias nuevas.                 | Considerar `startedAt`, progreso parcial positivo o finalización para distinguir Comenzar / Continuar.                              |
| H07 | Medio          | M1/M2 completos conservaban CTA Continuar; una tarjeta offline completa también ofrecía Continuar.                                                                                 | Repasar para finalización real; misma convención en curso, módulos, móvil y dashboard. Offline usa la finalización del snapshot.    |
| H08 | Medio          | «4 sesiones» fijo en M1/M2 y encabezados M3/M4; metadatos y CTA de módulo ausentes en M3/M4; ordinal de tarjeta derivado del índice.                                               | Cantidades desde colecciones reales, cuatro tarjetas con el mismo criterio; número de sesión desde `Lesson.order`.                  |
| H09 | Medio          | Snapshot M3 usaba el título histórico de PostgreSQL aunque la presentación online usaba el catálogo vigente.                                                                       | Nuevos snapshots usan el título canónico. Copias históricas siguen mostrando el nombre canónico por ID. Registro protegido intacto. |
| H10 | Medio, latente | Redondear un porcentaje incompleto muy cercano a 100 podía producir 100 (reproducido con 500/501 sesiones). No ocurre con las 16 sesiones actuales.                                | Reservar 100 para todas las sesiones; máximo 99 mientras falta alguna. Tarjetas y servicio usan el mismo cálculo.                   |
| H11 | Visual         | Tarjetas repetían «Módulo N» en eyebrow y título consecutivos.                                                                                                                     | Mantener el ordinal en eyebrow y el título completo sin prefijo redundante. Narración y navegación conservan contexto.              |
| H12 | Visual         | Plurales fijos en metadatos/offline fallaban con una sesión; dashboard escribía «Continúar».                                                                                       | Singular/plural compartido, texto de snapshot con concordancia; CTA correcto sin tilde. Evitar «0 de 0» en datos vacíos.            |

## Datos y duración

`Course.durationMin`, `Module.durationMin` y `Lesson.durationMin` son `Int?` persistidos. En el programa consultado **no hay valores cero**: `Course.durationMin` es nulo y M3 S3/S4 tienen duración nula. El cero visible era un fallback de UI, no la ausencia de contenido.

| Módulo disponible                               | Orden | Sesiones reales | Estimación registrada / visible en tarjeta | Duraciones de sesiones registradas |
| ----------------------------------------------- | ----- | --------------- | ------------------------------------------ | ---------------------------------- |
| Mi celular como herramienta de acceso al Estado | 1     | 4               | 100 min                                    | 25, 20, 35, 20                     |
| Oportunidades para mi negocio                   | 2     | 4               | 90 min                                     | 20, 20, 30, 20                     |
| Herramientas digitales para vender              | 3     | 4               | 60 min                                     | 30, 30, desconocida, desconocida   |
| Estrategias de venta y autonomía digital        | 4     | 4               | 45 min                                     | 10, 10, 10, 15                     |

Se conservan las estimaciones explícitas de los módulos. No se inventaron minutos para M3 S3/S4 ni se alteraron Lesson/Module. El total derivable del curso es 295 minutos, por las cuatro estimaciones explícitas válidas; aparece donde la UI existente muestra duración y no fecha del último acceso. M3 conserva los 60 minutos registrados: **no es una medición de sus cuatro sesiones** ni una suma de video. Una eventual revisión pedagógica de esa estimación requiere definirla, no inferir tiempos de lectura/práctica a partir de los MP4.

Los MP4 sí tienen `File.metadata.durationSeconds`. Por ejemplo, los dos de M3 S3 registran 77,111333 y 107,994333 segundos. Esos 185,105666 segundos describen los videos, no toda la sesión con lectura, checklist y práctica. S4 no tiene videos y sí tiene contenido. Por eso no se presenta la suma de MP4 como duración estimada de una sesión o módulo: sería una magnitud distinta.

Si falta una estimación de módulo, solo se suma cuando todas sus sesiones tienen estimaciones válidas. Si falta alguna duración necesaria, se devuelve `null`. No se suman desconocidos como cero, ni se convierte un curso vacío en una duración de cero minutos.

## Progreso, estados y CTA

- Curso: 16 sesiones disponibles; IDs ajenos, de apoyo o duplicados no suman al denominador ni a las finalizaciones.
- Módulo: 0/4, 1/4, 2/4, 3/4 y 4/4 producen 0, 25, 50, 75 y 100%. Texto y barra comparten la fuente.
- Abrir una sesión sin completarla puede mostrar **0% y En progreso**: porcentaje mide finalización; estado mide inicio. Esto es coherente.
- Sin inicio: No iniciado / Comenzar. Con inicio: En progreso / Continuar. Todas completadas: Completado / Repasar.
- Siguiente sesión: primera pendiente en orden; para repasar, primera sesión del módulo. El cierre M3/M4 permanece dentro de S4, sin crear S5.
- Disponibilidad y avance son distintos: los cuatro módulos están disponibles aunque la usuaria aún no los haya iniciado.
- Estados administrativos de inscripción se conservan. El indicador general del dashboard sigue incluyendo aprendizaje y talleres, como antes; no se sustituye por el porcentaje específico del curso.

## Recursos, nombres y orden

PostgreSQL confirma `Module.order` 1–4 y `Lesson.order` 1–4 en cada módulo. Las consultas ordenan recursos mediante **LessonFile.position**, nunca `LessonFile.order`. No se encontraron posiciones negativas/colisionadas, títulos vacíos, File faltantes ni File huérfanos relevantes en las carpetas M3/M4 consultadas y relaciones históricas.

- M1: 18 LessonFile, 8 File únicos (7 MP4 y 1 PDF).
- M2: 4 LessonFile y 4 MP4.
- M3: 22 LessonFile, 18 File únicos: **8 MP4 y 10 PDF**; incluye apoyos/enlaces además de los archivos.
- M4: **11 LessonFile y 9 File únicos**, todos WebP. Reutilizar imágenes entre sesiones es intencional.
- Total: 55 referencias, 39 archivos únicos. Los 39 URL de File respondieron HTTP 200. Once enlaces externos/YouTube respondieron 200; YouTube se comprobó mediante oEmbed. Los tres enlaces internos apuntan a sesiones existentes en cursos publicados.

No se encontraron recursos con el mismo File repetido dentro de una sesión. «Material adicional» y «Material de apoyo» no son listas idénticas: explicación opcional, guías y sesiones históricas cumplen funciones distintas. No se borraron ni unificaron bloques de recursos distintos. Los tutoriales alternativos siguen en disclosures; los videos compartidos entre temas no se muestran todos simultáneamente.

M3 conserva en BD «Módulo 3: Herramienta digitales para crecer», ya documentado como histórico/protegido. La UI y nuevos snapshots muestran **«Módulo 3: Herramientas digitales para vender»** por ID estable. No se ejecutó el script de renombrado ni ninguna publicación de contenido.

## Offline y navegación

M1/M2/M4 no permiten nuevas descargas. M3 es el único módulo con controles de descargar/actualizar; servicio, API y cliente mantienen esa restricción. Una copia histórica M4 continúa legible y eliminable; no permite descarga ni actualización. Se probó su borrado sin afectar M3.

Progreso offline sigue siendo un snapshot de solo lectura, rotulado **«al descargar»**. Una copia antigua sin progreso no implica cero. No se añadió sincronización ni progreso local. Guías, recursos, IDs de sesiones y orden se mantienen entre online/offline; se comparó también el DOM del contenido compartido S1.

El Service Worker cambia únicamente el nombre del shell público a **v7**, para distribuir esta presentación. La activación elimina shells anteriores y preserva todas las generaciones de medios M3/M4. IndexedDB continúa en v1, con las mismas claves y esquemas. Actualizar/descargar M3 prepara el shell actual; una instalación que ya está sin conexión conserva su versión hasta volver a conectarse y recibir la actualización.

Inicio offline conserva las secciones institucionales y «Continuar mi aprendizaje»; no ofrece «Únete a Warmi» dentro de ese flujo. Selector de siete temas, anterior/siguiente, navegación a S2, historial, retorno al inicio y reapertura sin red funcionan con las implementaciones existentes.

## Verificación reproducible

La cuenta de prueba existente se configura mediante `WARMI_TEST_EMAIL` / `WARMI_TEST_PASSWORD` en el proceso. No se guardaron credenciales. Los GET online de lecciones se abortan porque el comportamiento existente registra inicio; para auditar sesiones y estados se montan **los componentes reales** con datos leídos de PostgreSQL y progreso en memoria. La acción de completar se sustituye por un error en esas pruebas, nunca por una escritura. No se ejecutaron suites antiguas que crean cuentas o completan sesiones contra esta BD.

```text
pnpm exec tsx --test tests/*.test.ts tests/*.test.mjs
pnpm exec tsx tests/learning-coherence-data.mjs
pnpm exec tsx tests/learning-coherence.browser.mjs
pnpm exec tsx tests/offline-home-real.browser.mjs
pnpm typecheck
pnpm lint
pnpm build
pnpm exec prisma validate
git diff --check
```

- **64 pruebas unitarias**, incluidas nueve nuevas de coherencia: catálogo real sanitizado, órdenes, sesiones/cierres, M3 único descargable, duración, progreso acotado, estados/CTA, plurales, posiciones y duplicados.
- Auditoría de datos y recursos: consultas/HTTP de solo lectura. El fixture conserva IDs/órdenes/recursos del catálogo auditado, sin usuarias ni progreso; el script separado verifica el estado vivo de PostgreSQL.
- Navegador Edge/Chromium: **120 comprobaciones de ancho**, a 360, 390, 430, 768 y 1365 px. Vistas reales de dashboard, aprendizaje y curso; cuatro overviews; una sesión de cada módulo; cierres M3/M4; fixtures de usuaria nueva, iniciada con 0%, avance parcial, M3 terminado y curso terminado. Sin overflow horizontal ni errores de ejecución. CTA de módulos probado mediante hit testing con la navegación real presente.
- Capturas a 390 px. Recortes de overviews ocultan el chrome fijo solo durante la captura, después de comprobar que el botón real se puede tocar. Las capturas de sesión provienen de los renderers reales montados de forma aislada; no simulan una lectura de la ruta que escribe inicio.
- Offline real: login y descarga M3, cierre/reapertura sin red, Home, enlaces institucionales, temas, PDF abierto/exportado, respuestas completas/rangos y hashes, **8 MP4 únicos reproducidos** (10 reproducciones), copia histórica M4, actualización fallida con rollback, reintento correcto y eliminación aislada.
- Comparaciones estrictas antes/después de Course, Module, Lesson, File, LessonFile, Enrollment, CourseProgress y LessonProgress: **sin cambios**.
- Typecheck, lint, build de producción, Prisma validate, formato de archivos cambiados y diff check correctos. Los resultados y capturas se entregan fuera del repositorio, en `../auditoria-coherencia`.

## Límites y elementos intactos

No se modificaron contenido pedagógico, videos, PDF, imágenes M4, Cloudinary, datos persistidos, schema, seed, migraciones, Auth, roles, acciones de progreso, claves de descarga ni sincronización. La comprobación HTTP de enlaces externos verifica disponibilidad en esta ejecución; no certifica toda su funcionalidad autenticada ni reproduce los cuatro YouTube externos. No se certificó un teléfono Android físico.

No hay decisión humana pendiente que impida estas correcciones. Opcionalmente, la responsable pedagógica puede revisar los 60 minutos registrados de M3 y definir estimaciones de S3/S4. Se conservó el título histórico protegido en BD, sin necesitar una decisión de renombrado para presentar el nombre correcto.

## Archivos cambiados

Presentación: `app/(artisan)/artesana/aprender/page.tsx`, `app/(artisan)/artesana/aprender/[courseId]/page.tsx`, `app/(artisan)/artesana/aprender/[courseId]/lecciones/[lessonId]/page.tsx`, `app/(artisan)/artesana/dashboard/page.tsx`, `features/artisan/mobile-learning-tabs.tsx`, `features/artisan/learning/module3-journey-content.tsx`, `features/artisan/learning/module4-content.tsx`, `features/artisan/offline/offline-home.tsx`, `features/artisan/offline/offline-learning.tsx`.

Datos/cálculos: `shared/learning/presentation.ts`, `shared/learning/program.ts`, `shared/repositories/course.repository.ts`, `shared/services/learning.service.ts`, `shared/services/artisan-dashboard.service.ts`, `shared/services/offline-learning.service.ts`, `public/warmi-sw.js`.

Pruebas/documentación: `tests/learning-coherence.test.ts`, `tests/learning-coherence-data.mjs`, `tests/learning-coherence.browser.mjs`, `tests/fixtures/learning-coherence.json`, `tests/artisan-learning-catalog.test.ts`, `tests/offline-home-real.browser.mjs`, `tests/offline-worker.test.mjs`, `LEARNING_COHERENCE_AUDIT.md`.
