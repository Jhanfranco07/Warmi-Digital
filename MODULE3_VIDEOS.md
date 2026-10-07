# Videos reales del Modulo 3

Modulo: `6c96bcdf-0b41-48d2-bdcd-394d06acd9d2`, titulo exacto `Módulo 3: Herramienta digitales para crecer`.
Contenedor actual: `Aprender para crecer`, Course ID `93dc7355-d746-4acd-87df-29f71d16a955`. La reestructuracion conserva los seis File y LessonFile de esta tabla, sin cambiar public_id, URL ni position.
Cuenta Cloudinary local verificada: `szhwzy4q`. No se modificaron credenciales, schema, migraciones, editor general, lecciones ni recursos existentes.

## Correccion autorizada de referencias (7 de octubre de 2026)

Las seis URLs de la tabla historica siguiente devolvian 404. Con autorizacion expresa se reutilizaron los assets actuales en `Warmi/MODULO 3`, sin uploads, movimientos ni renombrados. Se mantienen los seis File.id, LessonFile.id, titulos, posiciones, bytes, lecciones y textos. Los public_id y secure_url actuales sustituyen las referencias historicas, no los registros.

| Video   | public_id actual                                          | secure_url actual                                                                                                          |
| ------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| video02 | M3-S1-02_-_Diferencias_WhatsApp_y_WhatsApp_Business       | https://res.cloudinary.com/szhwzy4q/video/upload/v1791387045/M3-S1-02_-_Diferencias_WhatsApp_y_WhatsApp_Business.mp4       |
| video03 | M3-S1-04_-_Configurar_WhatsApp_Business_tutorial_completo | https://res.cloudinary.com/szhwzy4q/video/upload/v1791387045/M3-S1-04_-_Configurar_WhatsApp_Business_tutorial_completo.mp4 |
| video04 | M3-S1-05_-_Crear_catalogo_en_WhatsApp_Business            | https://res.cloudinary.com/szhwzy4q/video/upload/v1791387045/M3-S1-05_-_Crear_catalogo_en_WhatsApp_Business.mp4            |
| video08 | M3-S1-06_-_Publicar_estados_de_WhatsApp                   | https://res.cloudinary.com/szhwzy4q/video/upload/v1791387043/M3-S1-06_-_Publicar_estados_de_WhatsApp.mp4                   |
| video07 | M3-S2-01_-_Facebook_Marketplace_y_Facebook_Shops          | https://res.cloudinary.com/szhwzy4q/video/upload/v1791387064/M3-S2-01_-_Facebook_Marketplace_y_Facebook_Shops.mp4          |
| video09 | M3-S2-02_-_Crear_publicacion_de_producto_en_Marketplace   | https://res.cloudinary.com/szhwzy4q/video/upload/v1791387063/M3-S2-02_-_Crear_publicacion_de_producto_en_Marketplace.mp4   |

Operacion actual: `pnpm exec tsx scripts/repair-module3-video-references.ts` es dry-run; `--apply` actualiza solo las referencias. Exige cuenta, carpeta, IDs, MIME, bytes, dimensiones y duraciones coincidentes; rechaza otros File con public_id/URL iguales. La transaccion serializable verifica que lecciones, modulo, posiciones, demas recursos y cantidades de registros no cambien.

Campos actualizados: File.publicId/url/metadata.assetId y LessonFile.externalId/originalUrl; sus timestamps de actualizacion cambian. Los asset_id actuales difieren de los historicos, sin afirmar que Cloudinary conserve esa identidad. Primera ejecucion: 12 filas actualizadas, cero creadas. Repeticion: **writes: 0**. Los caches offline usan los mismos File IDs, sin modificar Service Worker, IndexedDB ni Cache Storage. Los seis MP4 siguen sumando **104293181 bytes**.

Regresion real tras la correccion: seis reproducciones online y seis offline despues de cierre/reapertura completa sin red, materiales de apoyo, voz, bloqueo de enlaces externos, reconexion y eliminacion: PASS. Payload de este build: **108926595 bytes** (104293181 MP4 + 12104 metadatos JSON + 4621310 shell), sin overhead interno del navegador. Validaciones de tipos, lint, build, Prisma y 25 pruebas unitarias: PASS. No se modifican las reglas de VIDEO_UPLOAD del editor general.

## Origen y relacion historicos (URLs anteriores, no usar para nuevas descargas)

Todos conservan `resource_type = video`, `format = mp4`, MIME `video/mp4`, provider `cloudinary` y el public_id original. Las URLs siguientes son los secure_url originales, sin transformaciones.

| public_id              | Titulo                          | Sesion / position |    Bytes | Duracion (s) | secure_url                                                                                  |
| ---------------------- | ------------------------------- | ----------------- | -------: | -----------: | ------------------------------------------------------------------------------------------- |
| WARMI - VIDEOS/video02 | WhatsApp o WhatsApp Business    | 1 / 2             | 16939672 |    54.741333 | https://res.cloudinary.com/szhwzy4q/video/upload/v1791223252/WARMI%20-%20VIDEOS/video02.mp4 |
| WARMI - VIDEOS/video03 | Configura WhatsApp Business     | 1 / 3             | 28948336 |   592.503583 | https://res.cloudinary.com/szhwzy4q/video/upload/v1791223252/WARMI%20-%20VIDEOS/video03.mp4 |
| WARMI - VIDEOS/video04 | Crea tu catálogo de productos   | 1 / 4             | 23365002 |      275.574 | https://res.cloudinary.com/szhwzy4q/video/upload/v1791223251/WARMI%20-%20VIDEOS/video04.mp4 |
| WARMI - VIDEOS/video08 | Estados de WhatsApp             | 1 / 5             |  5138447 |   232.919365 | https://res.cloudinary.com/szhwzy4q/video/upload/v1791223249/WARMI%20-%20VIDEOS/video08.mp4 |
| WARMI - VIDEOS/video07 | Facebook para tu negocio        | 2 / 2             | 20830290 |   529.368526 | https://res.cloudinary.com/szhwzy4q/video/upload/v1791223249/WARMI%20-%20VIDEOS/video07.mp4 |
| WARMI - VIDEOS/video09 | Marketplace / tiendas virtuales | 2 / 3             |  9071434 |       76.602 | https://res.cloudinary.com/szhwzy4q/video/upload/v1791223249/WARMI%20-%20VIDEOS/video09.mp4 |

Sesion 1: `8a8e449b-76a6-4a6d-9693-6238f75092bc`. Sesion 2: `9bd401d6-5c80-4099-aa7b-e1b90b62d9b7`.
Los recursos EXTERNAL_LINK existentes permanecen en posiciones 0/1. No se usan video01, video05 ni video06.

## Registros

Primera ejecucion: seis File y seis LessonFile creados. Segunda ejecucion: seis File y seis LessonFile reutilizados, cero registros nuevos. La transaccion verifico que todas las filas Lesson y los LessonFile previos del curso permanecieron intactos, incluyendo timestamps.

| Video   | File.id                              | LessonFile.id                        |
| ------- | ------------------------------------ | ------------------------------------ |
| video02 | ec24466c-9be8-4705-b42c-1243b6c75a4e | af430a8c-97fc-4557-a191-5706b5ebef2d |
| video03 | b66accc4-ec68-419e-8a9a-3e86cc1b4ca2 | af15d63f-32b3-449e-92a5-5179e678d487 |
| video04 | 47979adf-99ef-4f97-adec-47b011ce6250 | 0ac3afdd-5a77-4bca-9cb9-425d44b47bd8 |
| video08 | eaddda21-2adc-4169-a452-55f0556a65d5 | dfa3fa09-435f-45f0-9af2-399285e875a8 |
| video07 | 9882194e-8dad-4b45-b8ba-c6936375e08e | ecb96475-8fdd-4e3c-9899-c5e2bc0cc0b6 |
| video09 | bbacb861-cfc6-4c6c-b830-e55b68a747f6 | 4171b83c-da65-4d47-8bee-3bd71d48fbe3 |

## Operacion reproducible

`pnpm exec tsx scripts/link-module3-videos.ts` inspecciona en solo lectura: exige la cuenta local correcta, obtiene metadatos multimedia y verifica HEAD de cada secure_url (MIME y Content-Length). `--apply` vincula tras verificar el destino. Conserva File existente solo si coincide con provider, publicId, URL, tipo, MIME y bytes; rechaza duplicados o conflictos. Nunca llama a uploader.

Arquitectura: script -> Module3VideosService -> Module3VideosRepository -> Prisma. Se mantiene la prohibicion de VIDEO_UPLOAD en editor y Server Actions generales.

El constructor offline existente recoge los seis File y descarga sus bytes via endpoint autenticado a Cache Storage, con textos/metadatos en IndexedDB. No necesita una nueva ruta o menu. Las descargas hechas antes de vincular estos videos deben eliminarse y descargarse nuevamente con conexion.

## Peso y validacion

Los seis MP4 suman **104293181 bytes**: **104.293181 MB** decimales o **99.461728 MiB**. Los textos/metadatos y el shell publico se contabilizan aparte; el espacio interno ocupado por indices del navegador puede diferir de los bytes del contenido.

Prueba real: ejecutar `tests/module3-real.browser.mjs` con `WARMI_REAL_MP4=1`, `WARMI_BROWSER_CHANNEL=msedge`, `WARMI_TEST_EMAIL`/`WARMI_TEST_PASSWORD` para una cuenta inscrita y Playwright disponible. No incluye credenciales por defecto. Mide cuerpos de Cache Storage y JSON de la ficha IndexedDB, verifica seis reproducciones online, seis offline tras reiniciar completamente el navegador, reconexion y borrado de ficha/caches. No completa lecciones.

Resultado: **6/6 online y 6/6 offline PASS**, tras cierre/reapertura completa sin red. Descarga, materiales de apoyo, API de voz, bloqueo de enlaces externos, reconexion, eliminacion de IndexedDB y caches de recursos PASS. Se verifico ausencia de desbordamiento horizontal y se inspeccionaron capturas del viewport movil. El primer intento excedio la espera de interfaz de 30 s tras reabrir el navegador; la repeticion con 90 s paso sin cambios en la infraestructura offline. Debe validarse en celulares fisicos y con las voces instaladas de cada dispositivo.

Peso del contenido local medido en un perfil nuevo:

- MP4 en Cache Storage: **104293181 bytes**.
- Textos y metadatos (JSON UTF-8 de la ficha IndexedDB): **11948 bytes**.
- Shell publico y sus assets en Cache Storage: **4617607 bytes**.
- Total de payload: **108922736 bytes = 108.922736 MB = 103.876816 MiB**. No incluye overhead interno de Cache Storage/IndexedDB, que varia por navegador; el shell puede cambiar entre builds.

`pnpm typecheck`, `pnpm lint`, `pnpm build`, `git diff --check` y las ocho pruebas de contenido/Service Worker pasaron. Prettier verifico los archivos de esta entrega. No se hizo commit ni push.

Archivos creados: `shared/services/module3-videos.service.ts`, `shared/repositories/module3-videos.repository.ts`, `scripts/link-module3-videos.ts`, este documento. Modificados: `tests/module3-real.browser.mjs` y `OFFLINE_MODULE3.md`.
