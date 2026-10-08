# Módulo 3: sesiones 2, 3, 4 y cierre

## Estado reconstruido

HEAD local inicial: `aba05c2`. Se hizo fetch y fast-forward seguro a `ffabdfa5c6d03f88fb4dd5e64977dd4e8d9a4381`, origin/main actual, con working tree limpio. Se revisaron AGENTS.md completo, README.md, LEARNING_PROGRAM.md, MODULE1_LEARNING.md, MODULE2_LEARNING.md, MODULE3_SESSION1_GUIDES.md, MODULE3_VIDEOS.md, OFFLINE_MODULE3.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, COMPONENTS.md, DATABASE.md y ERD.md, además de Prisma, rutas, services/repositories/actions, componentes guiados, SW, IndexedDB, Cache Storage y tests.

README todavía describe una fase de infraestructura antigua. Los documentos offline/video contienen títulos históricos; el catálogo tiene el título actual «Herramientas digitales para vender» y la BD conserva «Herramienta digitales para crecer». No se renombra el registro protegido ni se rehace S1. La BD confirma M1/M2 con cuatro sesiones cada uno y M4 en preparación.

## Recorrido final

| Sesión | Lesson ID                              | Experiencia                                                                                                                                                                                                                                        |
| ------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | `8a8e449b-76a6-4a6d-9693-6238f75092bc` | Publica tu arte en redes. Sin cambios en componentes, texto persistido, recursos o posiciones.                                                                                                                                                     |
| 2      | `9bd401d6-5c80-4099-aa7b-e1b90b62d9b7` | Conociendo tiendas virtuales que venden: cinco preguntas → cuatro opciones, una explicación seleccionada → video Marketplace y ejemplo alternativo. Conserva ID, slug, order y cuatro recursos previos. Actualiza título/contenido de esta sesión. |
| 3      | `15d03f59-f6d2-4e13-b562-f7c6799e75d9` | Aprende a cobrar desde el celular: selector Yape/Plin y un solo video → regla de pago seguro → acordeón de alertas.                                                                                                                                |
| 4      | `090d982d-00b6-4784-bec8-69c3eac2e564` | Simulación de primera venta en línea: acuerdo → empaque → envío/prueba → aviso/seguimiento. Un paso a la vez; no envía pedidos ni mensajes.                                                                                                        |

Los controles reutilizan SpeechButton, checklists y acordeones existentes. Cambiar de paso o de video desmonta el reproductor anterior. Botones de al menos 48 px, navegación por teclado y foco al cambiar de paso. El CTA queda por encima de la navegación inferior; los PDF son un recurso secundario desplegable.

## Cierre y progreso

No se crea otra Lesson ni una Sesión 5. «Finalizar práctica» en S4 usa completeLessonAction existente, con rol e inscripción, y después muestra cuatro logros y el mensaje de acompañamiento. «Finalizar Módulo 3» vuelve al programa. El porcentaje de M3 cuenta sus cuatro LessonProgress reales: solo alcanza 100% cuando las cuatro sesiones están completas. Completar S4 de manera aislada no fabrica el avance de las anteriores.

El programa ahora cuenta 12 sesiones: cuatro M1 + cuatro M2 + cuatro M3. M3 completo desde cero equivale a 33% del programa. No cambia la lógica de progreso de M1/M2; se recalcula CourseProgress sin cambiar sus LessonProgress ni Enrollment.status durante la publicación.

Sin conexión se puede terminar la práctica y abrir el cierre, pero se avisa que hay que volver con conexión para guardar el avance. Se mantiene el contrato offline existente: no autenticación ni sincronización de progreso sin red, y no se presenta un porcentaje del servidor falso. No hay una segunda BD de progreso.

## Recursos

Se reutilizan los dos videos de Marketplace en S2, posiciones 2/3:

- `M3-S2-01_-_Facebook_Marketplace_y_Facebook_Shops`: File `9882194e-8dad-4b45-b8ba-c6936375e08e`, LessonFile `ecb96475-8fdd-4e3c-9899-c5e2bc0cc0b6`.
- `M3-S2-02_-_Crear_publicacion_de_producto_en_Marketplace`: File `bbacb861-cfc6-4c6c-b830-e55b68a747f6`, LessonFile `4171b83c-da65-4d47-8bee-3bd71d48fbe3`.

No se sube ningún video. Se vinculan dos assets Yape/Plin ya existentes; las tres guías nuevas son PDF de texto/vector/checklist, sin capturas inventadas ni slides. Son 8 páginas en total, revisadas renderizadas; tamaño total 12062 bytes. Fuentes oficiales verificadas el 07/10/2026: [Artesanías del Perú](https://www.artesaniasdelperu.gob.pe/busqueda), [Ruraq Maki](https://ruraqmaki.pe/), [Mercado Libre](https://vendedores.mercadolibre.com.pe/nota/como-usar-el-simulador-de-costos-de-mercado-libre?guideKeyId=GE53), [Yape](https://www.yape.com.pe/seguridad/estafas) y [Plin](https://plin.pe/). Facebook Help redirigió a login; se conserva una descripción general y enlace oficial sin inventar requisitos/cargos. No se afirman comisiones, fechas ni convocatorias vigentes.

| Recurso | File.id                                | LessonFile.id                          | position | public_id                                                       | Bytes   |
| ------- | -------------------------------------- | -------------------------------------- | -------- | --------------------------------------------------------------- | ------- |
| Yape    | `749e9521-7964-499f-950b-6b1d98811248` | `3ba1f453-ef4f-44d3-861a-efff54279fcb` | 10       | `M3-S3-02_-_Crear_cuenta_Yape`                                  | 4274392 |
| Plin    | `a9bb92d8-ca09-4f5a-9528-e37f57f839c3` | `e4df3549-a6cc-4eca-a9aa-0861316443d5` | 20       | `M3-S3-01_-_Crear_y_usar_Plin`                                  | 4974296 |
| Guía S2 | `fc2530c8-6871-4675-86b3-d5e1d766880d` | `b964defa-1c42-4c05-8f5b-99287a0d85b8` | 10       | `Warmi/MODULO_3/SESION_2/GUIAS/elegir-donde-vender-v1.pdf`      | 4504    |
| Guía S3 | `2d8243ad-9700-47fa-9cff-5a70becc7ca9` | `42aeaec8-ff12-40c6-81da-a3b5043ea444` | 30       | `Warmi/MODULO_3/SESION_3/GUIAS/cobros-seguros-yape-plin-v1.pdf` | 3443    |
| Guía S4 | `0acff2a3-2aba-4d1b-9590-17a90435b575` | `358d9562-9bb2-488c-8ce5-02b65381bb5f` | 10       | `Warmi/MODULO_3/SESION_4/GUIAS/entregar-venta-en-linea-v1.pdf`  | 4115    |

URLs de entrega originales:

- https://res.cloudinary.com/szhwzy4q/video/upload/v1791387042/M3-S3-02_-_Crear_cuenta_Yape.mp4
- https://res.cloudinary.com/szhwzy4q/video/upload/v1791387043/M3-S3-01_-_Crear_y_usar_Plin.mp4
- https://res.cloudinary.com/szhwzy4q/raw/upload/v1791417899/Warmi/MODULO_3/SESION_2/GUIAS/elegir-donde-vender-v1.pdf
- https://res.cloudinary.com/szhwzy4q/raw/upload/v1791417900/Warmi/MODULO_3/SESION_3/GUIAS/cobros-seguros-yape-plin-v1.pdf
- https://res.cloudinary.com/szhwzy4q/raw/upload/v1791417902/Warmi/MODULO_3/SESION_4/GUIAS/entregar-venta-en-linea-v1.pdf

## Publicación reproducible y protección

```powershell
pnpm exec tsx scripts/publish-module3-journey.ts --dry-run
pnpm exec tsx scripts/publish-module3-journey.ts --apply
```

Dry-run inspecciona Cloudinary y BD sin escrituras. Apply crea backup en TEMP, verifica los PDF locales/hash y busca cada public_id antes de subir; usa integración firmada, overwrite false y tres nombres estables. Reutiliza los assets que coinciden, no elimina ni sobrescribe recursos. Service → repository → Prisma, transacción serializable bloqueando el curso, identidades y posiciones verificadas.

Primera publicación: dos Lesson, cinco File y cinco LessonFile nuevos; 14 escrituras incluyendo título/contenido S2 y resumen del programa. Repetición: cero Lesson/File/LessonFile nuevos y cero escrituras. Ningún seed, migración, cambio de roles/auth/editor o M4. VIDEO_UPLOAD continúa deshabilitado en el editor general.

La comparación del respaldo previo/posterior confirma S1 completa idéntica, sus siete File/LessonFile PDF en 10–16, los seis MP4 con mismos IDs/public_id/secure_url/position/timestamps, los 17 recursos previos de M3 íntegros, M1/M2 idénticos y LessonProgress existentes sin cambios durante la publicación. No hay duplicados por File public_id/URL ni por relación/posición.

## Offline y versiones

Se extienden OfflineModule y el renderer del shell actual. Mismo Service Worker v4, IndexedDB v1/store downloads, Cache Storage por generaciones y endpoint autenticado con byte ranges. No se cambia el formato de claves/cache ni se invalida automáticamente una descarga legacy.

Se añade contentVersion opcional `m3-four-sessions-2026-10-v1`. La pantalla online compara revisión/contenido/recursos con el manifiesto actual: si faltan sesiones/guías, muestra «Actualizar descarga». La copia anterior se conserva durante la actualización; una descarga fallida no sustituye su ficha ni su caché. El shell nuevo avisa que una copia sin versión es anterior y la deja abrir. Los lectores legacy siguen siendo compatibles.

Paquete nuevo: 18 archivos únicos, ocho MP4 + diez PDF, incluyendo las siete guías S1 intactas. Recursos binarios: 115785651 bytes. Medición real del build final en Edge: shell 4669045 bytes, JSON 18499 bytes y total 120473195 bytes (120.47 MB decimales; 114.89 MiB). El shell puede variar por build; estos valores no son constantes de la implementación. Los PDF offline se leen mediante el SW y se exportan como Blob para el visor/descarga nativos; no se crea otra caché. Los enlaces externos requieren conexión.

## Validación

- `corepack pnpm exec tsx --test tests/*.test.ts tests/*.test.mjs`: 40/40, incluidas 35 existentes y cinco nuevas. Progreso real/denominador de M1/M2, tres PDF/hash, versiones legacy y versión del snapshot en el módulo.
- `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm build`, `corepack pnpm exec prisma validate`: PASS. Build de producción con 47 páginas, sin cambios de schema.
- Prettier de todos los archivos TS/TSX/MJS/MD/JSON modificados y `git diff --check`: PASS. Revisión de `git diff --stat`, `git diff` y `git status`; sin S1, schema, auth, editor, env o archivos personales en el cambio.
- `tests/offline-learning.browser.mjs` en Edge real: PASS de descarga, rollback, reinicio offline, rutas, imagen/PDF/MP4, byte ranges mediante SW, API de voz, enlaces externos, reconexión y eliminación.
- `tests/module3-journey-real.browser.mjs` en Edge real: PASS de login/inscripción con cuenta efímera, S1 original, recorrido S2/S3/S4, cierre honesto de 25% si solo S4 y 100% al completar las cuatro, resumen global 33% de 12, ocho MP4 online/offline, diez PDF verificados por hash y tres exportaciones nativas offline. Cierre/reapertura completa del navegador sin red; descarga legacy utilizable con aviso, actualización fallida que mantiene la copia anterior, actualización nueva y eliminación completa de IndexedDB/caché.
- Responsive 360/390/430/768/1365 px sin overflow. Botones de plataformas y CTA principal comprobados con hit test real, altura mínima de 48 px y sin quedar cubiertos. Revisión visual de capturas móviles/desktop y ocho páginas PDF. CTA en el flujo con espacio inferior, sin tapar explicaciones.
- Publicación repetida: cero escrituras; dry-run final reutiliza cinco assets. Auditoría final: S1, sus siete guías, los seis videos, los 17 recursos previos y M1/M2 idénticos; identidades, avances por sesión y finalizaciones existentes preservados. Abrir S2 con la cuenta local para revisar la vista registró sus timestamps de visita mediante el `markLessonStarted` existente; no se completó ninguna sesión de esa cuenta. Las cuentas efímeras se eliminan al finalizar.

Las guías S1 y MODULE3_SESSION1_GUIDES.md no se regeneran ni modifican. Pendiente únicamente validación manual Android/iOS y disponibilidad/calidad de voces locales; la automatización de la API no evalúa la percepción del audio en esos dispositivos. El avance offline no se sincroniza: se guarda con la acción existente cuando vuelve la conexión.
