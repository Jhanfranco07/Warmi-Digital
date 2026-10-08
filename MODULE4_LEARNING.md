# Módulo 4: Estrategias de venta y autonomía digital

**Regla vigente (7 de octubre de 2026): M4 está disponible solo online. Actualmente el único módulo descargable para uso offline es Módulo 3.** La habilitación offline y las pruebas M4 descritas más abajo corresponden a la entrega histórica `b8608bf`, y fueron corregidas sin modificar sesiones, imágenes o progreso. Auditoría real actual: [MODULE4_AUDIT.md](MODULE4_AUDIT.md).

Entrega sobre `main` en `8828843a3e594c8e3f25cf38ecd6f08a8e4081a3`. M1, M2 y M3 conservan sus lecciones, recursos, posiciones y progreso individual. No hay cambios de schema, seed, autenticación ni credenciales.

## Recorrido

Duraciones orientativas: 10, 10, 10 y 15 minutos, incluyendo práctica; 45 minutos para el módulo. Cada sesión presenta un paso principal a la vez, controles de voz, botones grandes y prácticas simples. Se reutilizan SpeechButton, LearningDisclosure, LearningChecklist y la acción existente de completar lecciones.

1. **Mi producto, mi historia, mi cultura**: collage de tres fotografías; tres preguntas para describir el producto; ejemplo breve y práctica con fotografías de tejidos y muñecas.
2. **Cómo presentar mi producto**: cuatro momentos de atención a la clienta y aviso sobre respuestas/entrega; comparación entre historia cultural y nombre, características y precio.
3. **El valor de la artesanía**: fotografía del tejido en qallwa, explicación breve del patrimonio y práctica para comunicar su valor. La resolución es apoyo desplegable, con acceso a la fuente oficial cuando hay conexión.
4. **Simulación de venta sin ayuda**: cuatro pasos con conversación de ejemplo, práctica autónoma y cierre con seis logros. La práctica no envía mensajes, cobra pagos ni crea pedidos.

La resolución RVM 211-2019-VMPCIC-MC reconoce conocimientos, técnicas y prácticas del tejido en qallwa de San Miguel, Cajamarca. No certifica cada producto. Fuente: https://www.gob.pe/institucion/cultura/normas-legales/355932-211-2019-vmpcic-mc

El bolso tiene un precio **de práctica** consistente de S/ 80; el material fuente muestra dos precios contradictorios. Se explican condiciones de pago y entrega acordadas, sin prometer tarifas o plazos de empresas externas.

## Fuente y extracción

Fuente local: `3108 WARMI DIGITAL.pdf`, edición de 65 páginas, SHA256 `31744df4404ad0d302f57d99fb059f31f031cec8c6d98789fddf80460bad7262`. Se revisaron las páginas 48–54. Se extraen objetos de imagen y recortes fieles, sin imágenes nuevas generadas ni diapositivas completas. La procedencia de las personas retratadas no se afirma como verificada.

`scripts/extract-module4-images.py --source "ruta/3108 WARMI DIGITAL.pdf"` verifica edición y pertenencia del objeto a la página, conserva resolución y genera nueve WebP más un manifiesto con SHA256. Requiere PyMuPDF y Pillow. Las imágenes pequeñas se muestran con límites de ancho para evitar ampliaciones innecesarias.

| Imagen     | Página / objeto | Recorte (izquierda, arriba, derecha, abajo) | Dimensiones | Bytes |
| ---------- | --------------- | ------------------------------------------- | ----------- | ----- |
| artesana   | 48 / 1199       | [16, 14, 261, 376]                          | 245 × 362   | 25344 |
| paisaje    | 48 / 1199       | [270, 214, 419, 374]                        | 149 × 160   | 9126  |
| manos      | 48 / 1199       | [434, 215, 582, 375]                        | 148 × 160   | 7186  |
| munecas    | 49 / 1222       | Objeto completo                             | 131 × 99    | 5036  |
| bolso      | 51 / 1279       | Objeto completo                             | 131 × 114   | 4582  |
| tejidos    | 51 / 1282       | Objeto completo                             | 400 × 267   | 42914 |
| qallwa     | 52 / 1306       | Objeto completo                             | 640 × 427   | 65106 |
| resolucion | 52 / 1304       | Objeto completo                             | 440 × 657   | 69032 |
| entrega    | 54 / 1363       | [0, 0, 400, 512]                            | 400 × 512   | 54876 |

Total: **283202 bytes**, nueve imágenes únicas. No se inventaron PDF ni videos. `manifest.json` conserva los hashes individuales.

## Persistencia y publicación

Curso: `93dc7355-d746-4acd-87df-29f71d16a955`. Módulo (order 4): `2853b850-4032-5e82-b861-8eaaa84913f8`.

| Sesión / order | Lesson ID                            |
| -------------- | ------------------------------------ |
| 1              | e5d67e39-87e6-5d9e-92c3-0b5c830970fe |
| 2              | a129768b-0b93-5174-97cd-7539c431b949 |
| 3              | ea5fa9dc-710d-5782-aa07-7fe81f3ffc91 |
| 4              | 53020031-7b46-5001-bc0c-db41fa536a58 |

Publicación:

```powershell
corepack pnpm exec tsx scripts/publish-module4.ts
corepack pnpm exec tsx scripts/publish-module4.ts --apply
```

Sin `--apply` inspecciona imágenes locales y Cloudinary sin escribir. Con `--apply` guarda respaldo fuera del repositorio, verifica los hashes locales/remotos, reutiliza Cloudinary y publica con transacción serializable y bloqueo del curso. Rechaza conflictos de IDs, orden, archivos y posiciones. Compara antes/después módulos anteriores, LessonProgress e inscripciones.

Primera ejecución: **1 Module, 4 Lesson, 9 File, 11 LessonFile** nuevos; 26 escrituras incluyendo un resumen CourseProgress recalculado. Segunda ejecución: **cero registros nuevos y cero escrituras**. Después se ajustaron cinco metadatos M4 para incluir las duraciones orientativas; la ejecución final confirmó nuevamente cero escrituras. No sobrescribe recursos previos. Artesana y bolso se reutilizan entre sesiones. Los publicId siguen `Warmi/MODULO_4/IMAGENES/<clave>-v1` y los archivos son IMAGE / image/webp.

| Imagen     | Lesson ID                            | Posición | File ID                              | LessonFile ID                        |
| ---------- | ------------------------------------ | -------- | ------------------------------------ | ------------------------------------ |
| artesana   | e5d67e39-87e6-5d9e-92c3-0b5c830970fe | 10       | 1a9dbb07-4f03-439c-8e86-074900eb3f46 | 69172bc9-6d6f-440d-85c9-3f4d4604f750 |
| paisaje    | e5d67e39-87e6-5d9e-92c3-0b5c830970fe | 20       | fb670a6b-b3fd-416d-8d83-bef84650eaf9 | df0a60f4-e799-450a-8c77-cfbe4d5f37d7 |
| manos      | e5d67e39-87e6-5d9e-92c3-0b5c830970fe | 30       | c9eacf7c-5b5b-41ed-98ed-f6a2d130d443 | 2382dff9-6a61-4963-94a9-2dc26095c3c5 |
| munecas    | e5d67e39-87e6-5d9e-92c3-0b5c830970fe | 40       | 8a5d5858-5aaa-4a05-a454-f81e10d8ddc3 | e35671e8-97ab-48d0-84df-eb98e3a31a6e |
| tejidos    | e5d67e39-87e6-5d9e-92c3-0b5c830970fe | 50       | 57a1de94-6d57-4c6a-872d-98917ea3778a | c70c73d0-ce76-4ae0-805b-29036268d297 |
| artesana   | a129768b-0b93-5174-97cd-7539c431b949 | 10       | 1a9dbb07-4f03-439c-8e86-074900eb3f46 | 23cde152-6ecc-45da-a395-4f37c869cd75 |
| bolso      | a129768b-0b93-5174-97cd-7539c431b949 | 20       | d3020a5a-d1fd-40c0-9795-1d70bc450bc7 | b532d369-2b9d-482b-9ff5-e1361e28acb7 |
| qallwa     | ea5fa9dc-710d-5782-aa07-7fe81f3ffc91 | 10       | dfa879ca-2a49-453c-be3b-92e3068f6d9e | 7751a759-4456-4ed3-b358-bb94a2251007 |
| resolucion | ea5fa9dc-710d-5782-aa07-7fe81f3ffc91 | 20       | 39816b53-df1d-49c8-8c10-2a745c1ce43c | 317a7cea-c6eb-4e02-bc2d-8c8de2dafcd6 |
| bolso      | 53020031-7b46-5001-bc0c-db41fa536a58 | 10       | d3020a5a-d1fd-40c0-9795-1d70bc450bc7 | c1ef173d-8d83-407b-933a-865fbb24409c |
| entrega    | 53020031-7b46-5001-bc0c-db41fa536a58 | 20       | 4ce40858-5cbf-4eac-bb39-6c899606e0f1 | 8c6cfc00-e704-4985-9db9-46a6a12db893 |

## Progreso y offline

El catálogo declara M4 disponible y descargable. El programa cuenta **16 sesiones**. Completar las cuatro de M4 representa 100% del módulo y 25% del programa; se usa el progreso real persistido, sin completar sesiones por visitar una pantalla.

Versión de contenido: `m4-visual-2026-10-v1`. Se reutilizan IndexedDB, generaciones atómicas de Cache Storage, endpoints autenticados y Service Worker existentes. Los once recursos referencian nueve archivos descargados una sola vez. El renderer offline usa URLs locales servidas por el worker y las mismas pantallas pedagógicas.

M3 y M4 tienen fichas independientes: descargar/eliminar M4 conserva M3. El recorrido y los logros se pueden consultar offline; guardar progreso requiere conexión y se informa claramente. La fuente oficial externa se bloquea con una explicación sin red. La voz depende de una voz local disponible.

## Archivos y comprobaciones

Contenido y renderer: `shared/learning/module4.ts`, `features/artisan/learning/module4-content.tsx`, `module4-lesson.tsx`; publicación: servicio/repositorio M4 y scripts; imágenes: `public/images/learning/module4/`; pruebas: `tests/module4.test.ts` y `tests/module4-real.browser.mjs`.

Se integró M4 en catálogo, ruta de lección y servicio/renderer offline. No se modificó el Service Worker ni el almacenamiento. Las pruebas históricas ajustan disponibilidad de M4, denominador global de 12 a 16 y selección del botón de descarga dentro de M3 ante la nueva segunda descarga; el contenido de M1–M3 conserva sus expectativas.

Validación técnica: typecheck, lint, build de producción y Prisma validate aprobados. 43 pruebas unitarias aprobadas. Prueba real M4 aprobada en Edge con cuenta temporal eliminada al terminar: cuatro sesiones, nueve imágenes decodificadas, cierre parcial/final y avance 4/16; responsive a 360, 390, 430, 768 y 1365 px sin desbordes y con controles de al menos 48 px descubiertos, incluido el enlace final con margen de desplazamiento sobre la barra inferior. Reinicio completo offline aprobado, nueve SHA256 iguales, enlace externo controlado, cierre sin inventar progreso, convivencia con M3 y borrado independiente. M1–M3 y progreso previo idénticos antes/después.

Payload medido: recursos M4 283202 bytes, metadatos 8855 bytes y shell compartido 4681678 bytes; total 4973735 bytes (4,97 MB decimales). El shell cambia entre builds y se comparte con M3; no incluye overhead del almacenamiento.

Regresión real M3 aprobada con build de producción: cuatro sesiones, cierre y progreso 4/16, ocho videos online/offline, diez PDF con hashes idénticos, tres exportaciones PDF nativas, compatibilidad con descarga anterior, rollback ante fallo de actualización, actualización correcta, cinco anchos responsive, reconexión y borrado.

Formato de archivos modificados y `git diff --check` aprobados.

Los apartados históricos de README y documentos M1–M3 describen sus entregas anteriores. Para el estado actual de M4 y el nuevo denominador, consultar este documento y LEARNING_PROGRAM.md.
