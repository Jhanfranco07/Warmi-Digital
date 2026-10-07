# Módulo 1: recorrido de aprendizaje

Publicado el 7 de octubre de 2026 en **Aprender para crecer**, sin crear otra entrada de navegación. Módulo histórico `7dd54036-26d9-4104-8008-9d559135b461`, `Module.order = 1`, disponible **solo online**. M2 y M4 siguen en preparación; M3 mantiene sus registros y su descarga offline.

## Cuatro sesiones

| Lesson.order | Sesión                                                                         | ID                                                   |
| ------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| 1            | Crear cuenta Gmail y enviar correos con adjuntos                               | `699a22ef-7d43-4133-8710-96b33284396a` (reutilizado) |
| 2            | Instituciones que acompañan a las artesanas y enlaces útiles para tu formación | `61c5ebc6-2c34-40cc-a2f0-6f98e3990648`               |
| 3            | Requisitos generales previos                                                   | `a4518c2f-9b42-438a-bfc4-a8a4725a00ee`               |
| 4            | Acceder a capacitaciones virtuales                                             | `c2c730e8-26d0-470f-93b2-81879469a677`               |

La cuarta sesión incluye Zoom, Google Meet y el cierre del módulo; no hay quinta sesión. Cada sesión tiene navegación 1–4, acciones explícitas, voz mediante el SpeechButton existente, pasos ordenados y botón para guardar avance y continuar. El contenido está limitado a un ancho de lectura y una columna móvil. Videos y material adicional se abren por acción de la usuaria; al cerrar un video se desmonta el reproductor.

Se conserva el PDF histórico `ad511256-a89a-4897-b644-5a649d17e9f3` y su LessonFile `6693350c-617e-4246-a9d9-fae65be7b690` en posición 0. Su origen anterior `dh1eq5ykw` no se copia ni se sustituye. La introducción “¿Qué es Gmail?” (`5a317a3f-dc5c-4000-b059-ddf8b5f9e149`) conserva texto, ID y recurso YouTube. Está en un módulo histórico de apoyo (`c83cf0be-a744-4e27-b241-eb31359f36dd`) del antiguo curso Gmail, y se enlaza desde Material adicional; no cuenta como una quinta sesión. No se eliminan cursos, lecciones ni progresos históricos.

## Cloudinary

Cuenta `szhwzy4q`, carpeta `Warmi/MODULO 1`. Se reutilizan siete assets ya subidos, sin realizar uploads, movimientos ni renombrados. Se crean siete File porque no existían registros de estos MP4 en PostgreSQL. Total de medios M1: **112320490 bytes** (112,32 MB decimales), sin incluir PDF ni imágenes. No constituye un paquete offline: M1 no tiene habilitada esa capacidad.

| Video    | Jerarquía                   | LessonFile.position | File ID                                |
| -------- | --------------------------- | ------------------- | -------------------------------------- |
| M1-S1-01 | Principal: Gmail            | 10                  | `824363bf-3443-481b-aa8d-ecd624910664` |
| M1-S1-02 | Principal: adjuntos         | 20                  | `ac9af4c7-bedb-43d8-a5aa-26e27d591f79` |
| M1-S1-03 | Material adicional          | 30                  | `c2596c16-e45d-48f5-9455-2c27cad97d09` |
| M1-S1-04 | Material adicional          | 40                  | `496236f1-cc7b-4536-ac17-e81e9d03c01a` |
| M1-S2-01 | Principal: convocatorias    | 10                  | `54e107f6-a0fe-40f0-b1bd-429ecb46edc2` |
| M1-S3-02 | Principal: RNA, requisito 1 | 10                  | `585d6cdd-c1b1-4695-ba1c-d8f1deaccde4` |
| M1-S3-01 | Principal: RUC, requisito 2 | 20                  | `39e1fb76-b370-4a48-9089-11462b378b76` |

Los public_id exactos están en `shared/learning/module1.ts`; el publicador obtiene secure_url, duración, tamaño y dimensiones de la API de Cloudinary y verifica MIME/tamaño del MP4 público con HEAD antes de escribir. Las URLs reales se conservan en File.url y LessonFile.originalUrl. Se excluye expresamente el asset `DUPLICADO_-_M1-S1-01_-_Crear_cuenta_Gmail_en_5_minutos`. No se habilita VIDEO_UPLOAD en el editor general.

## Tutoriales de apoyo

Recursos `sourceType: YOUTUBE`, `temporary: true`, configurados en `MODULE1_SUPPORT_VIDEOS`. Cambiar su URL actualiza el reproductor sin tocar File; repetir el publicador sincroniza el LessonFile existente. Son embeds 16:9 de youtube-nocookie.com, con título, controles, fullscreen y alternativa para abrir YouTube. Nunca se descargan ni se suben a Cloudinary.

| Uso                                 | Video y fuente                                                                                                                                                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registro en Artesanías del Perú     | [Tutorial del canal Artesanías del Perú](https://www.youtube.com/watch?v=JNCqeoHdlRM)                                                                                                                          |
| Apertura de cuenta desde el celular | [BBVA Perú: abrir una cuenta desde el celular](https://www.youtube.com/watch?v=QG87CErqx8s)                                                                                                                    |
| Zoom                                | [Profr. Santos Rivera: Zoom desde tu celular](https://www.youtube.com/watch?v=Q9dFIERrYYU)                                                                                                                     |
| Meet                                | [Universidad de San Carlos de Guatemala, DEDEV](https://radd.virtual.usac.edu.gt/como-crear-o-ingresar-a-una-reunion-en-meet-desde-tu-telefono-celular/), [video](https://www.youtube.com/watch?v=fw_4jGoM0yQ) |

El ejemplo bancario no obliga a elegir BBVA ni presenta comisiones históricas como condiciones actuales. Se indica consultar requisitos y condiciones vigentes en la entidad elegida. Referencia actual: [apertura desde App BBVA](https://www.bbva.pe/personas/productos/cuentas/ahorro/cuenta-digital/abrir-cuenta-app.html). La preparación para concursos depende de sus bases: no se afirma que todos exijan RUC ni que RUC sea obligatorio para RNA. Referencia: [registro RNA oficial](https://www.gob.pe/747-inscribirse-en-el-registro-nacional-del-artesano-rna).

## Instituciones y assets

- [MINCETUR](https://www.gob.pe/mincetur): logo obtenido del [sitio oficial COES MINCETUR](https://coes.mincetur.gob.pe/img/logo_mincetur_blanco.png).
- [DIRCETUR Cajamarca](https://dircetur.regioncajamarca.gob.pe): se utiliza el emblema del Gobierno Regional, indicando esa procedencia en el texto alternativo; no se inventa un logo de DIRCETUR.
- [Gobierno Regional de Cajamarca](https://www.regioncajamarca.gob.pe): emblema oficial reproducido por el [portal de la Municipalidad](https://www.muni-sanmiguel.gob.pe/images/banners/interes/logo_regionc.jpg).
- [Municipalidad Provincial de San Miguel](https://www.muni-sanmiguel.gob.pe): [logo de su portal oficial](https://www.muni-sanmiguel.gob.pe/images/mpsm-logo-26.png).
- [Artesanías del Perú](https://www.artesaniasdelperu.gob.pe/): [logo de su portal oficial](https://www.artesaniasdelperu.gob.pe/assets/imagenes/logo_rojo.png).

Copias locales en `public/images/learning/module1/`; no son diapositivas ni capturas de Canva. Los botones institucionales abren pestañas nuevas con noopener/noreferrer. Los portales de DIRCETUR y Gobierno Regional dieron timeout desde el equipo de validación; sus URLs se mantienen según la solicitud y las fuentes oficiales, pero su disponibilidad externa no depende de Warmi.

## Publicación y progreso

```powershell
pnpm exec tsx scripts/inspect-module1.ts
pnpm exec tsx scripts/publish-module1.ts --dry-run
pnpm exec tsx scripts/publish-module1.ts --apply
```

Sin `--apply` no hay escrituras. El flujo es script → servicio de publicación → repository → Prisma. La transacción serializable bloquea curso/módulo, verifica destino e identidades, rechaza duplicados previos y cancela si aparecen lecciones no inspeccionadas. Compara todos los módulos protegidos con sus LessonFile/File y sus LessonProgress antes/después. No modifica schema ni genera migraciones. Primera publicación: tres Lesson nuevos, siete File nuevos, diecisiete LessonFile nuevos y un Module histórico de apoyo. Una repetición con la misma configuración devuelve **writes: 0**.

`learningProgress` sigue siendo genérico: cuenta los módulos `available`. Ahora son cuatro sesiones M1 + dos sesiones M3 = seis; M2/M4 e introducciones de apoyo no cuentan. Completar M1 desde cero da 67% del programa, no 100%. Los resúmenes existentes se recalculan sin borrar progresos ni cambiar los LessonProgress del M3. La acción de completar sigue verificando rol e inscripción.

## Verificación

Pruebas unitarias: `pnpm exec tsx --test tests/learning-program.test.mjs tests/module1-content.test.ts tests/module3-content.test.ts tests/artisan-learning-catalog.test.ts tests/offline-worker.test.mjs`.

Prueba real con Playwright instalado externamente, sin dependencia nueva en package.json:

```powershell
$env:WARMI_PLAYWRIGHT_PATH = "<ruta del paquete playwright>"
$env:WARMI_TEST_URL = "http://localhost:3100"
$env:WARMI_BROWSER_CHANNEL = "msedge"
$env:WARMI_TEST_MODULE3 = "1"
pnpm exec tsx tests/module1-real.browser.mjs
```

Esta prueba crea una cuenta artesana temporal con contraseña aleatoria en memoria, se inscribe al programa, reproduce MP4, abre PDF y enlaces, verifica reproducción YouTube, completa las cuatro sesiones y comprueba 67% en PostgreSQL. Elimina cuenta/inscripción/progreso en finally, incluso ante errores. Capturas solo en TEMP, nunca en Git. También ejecuta la regresión M3: seis videos online/offline, descarga, cierre/reapertura del navegador sin red, lectura por voz, enlaces externos, reconexión y eliminación de la descarga.

La publicación M1 conserva intactos M2/M3/M4. En la regresión se detectó un problema anterior: las seis URLs M3 devolvían 404. Con autorización adicional se corrigieron únicamente sus referencias a los assets reales de `Warmi/MODULO 3`, conservando File/LessonFile IDs, posiciones, tamaños y textos; sin subir ni duplicar archivos. Detalle e instrucciones idempotentes en `MODULE3_VIDEOS.md`.

Resultados del 7 de octubre de 2026:

- `pnpm typecheck`, `pnpm lint` (sin warnings), `pnpm build`, `pnpm exec prisma validate`, `git diff --check` y Prettier de los archivos incluidos: PASS.
- 25/25 pruebas unitarias, incluyendo `tests/module3-references.test.ts`: PASS.
- Recorrido real M1: siete MP4, PDF, cuatro tutoriales YouTube con videoWidth > 0 y reproducción efectiva > 1 segundo, cuatro sesiones, progreso 67%, regreso al programa y layouts 320/390/1365 px sin desbordamiento: PASS.
- Regresión M3: seis MP4 online y seis offline tras cierre/reapertura completa, materiales de apoyo, API de voz, bloqueo de enlaces externos, reconexión y borrado de IndexedDB/cache de recursos: PASS. Payload medido 108926595 bytes (104293181 MP4 + 12104 JSON de metadatos + 4621310 shell). No incluye overhead interno del navegador.
- Ambos publicadores son idempotentes: repetición M1 y reparación M3 devuelven writes: 0. Cuenta temporal, inscripciones y progreso de prueba eliminados.

Archivos de la entrega: `shared/learning/module1.ts`, `shared/learning/program.ts`, `features/artisan/learning/module1-{lesson,video,completion}.tsx`, las dos páginas de curso/lección, `shared/services/learning.service.ts`, servicio/repository/publicador/inspector específicos M1, cuatro logos oficiales locales, pruebas de contenido/programa/navegador y documentación. Excepción autorizada M3: servicio/repository existentes, `scripts/repair-module3-video-references.ts`, prueba de referencias y documentación. No cambian autenticación, schema, editor global, Service Worker, IndexedDB ni Cache Storage.

Discrepancia previa conservada: la BD y `MODULE3_VIDEOS.md` denominan M3 “Herramienta digitales para crecer”, pero el catálogo actual de GitHub muestra “Herramientas digitales para vender”. No se renombra M3 en esta tarea.

El checklist de preparación es una ayuda visual de esta sesión; sus casillas no son una certificación de requisitos ni se guardan en PostgreSQL. La voz usa el sistema existente y depende de las voces del dispositivo. YouTube y los portales requieren internet. El Canva/PDF original no está en el repositorio: se interpreta la estructura pedagógica detallada adjunta, no un archivo que no se pudo revisar. Pendiente probar en Android/iOS físicos y sustituir los tutoriales temporales por videos propios cuando existan.
