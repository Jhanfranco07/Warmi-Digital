# Módulo 3 - Sesión 1: guías y presentación

Entrega del 7 de octubre de 2026. Integra las siete guías y su presentación en `8a8e449b-76a6-4a6d-9693-6238f75092bc`, dentro del módulo `6c96bcdf-0b41-48d2-bdcd-394d06acd9d2`. Los cambios locales de checklists M1/M2 corresponden a la solicitud anterior y se conservaron, sin nuevas modificaciones a esos módulos en esta tarea.

## Recorrido

Siete temas numerados, un contenido principal abierto, explicaciones breves, pasos cortos, voz existente y controles PDF independientes. El mismo componente `Module3Session1Content` se utiliza online y offline. El texto persistido original se conserva íntegro en Leer texto completo y los dos enlaces de apoyo siguen disponibles.

Orden: WhatsApp/Business → configurar Business → catálogo → Estados → cuenta Facebook → Marketplace → comparación Estados/Facebook. No hay nuevas rutas, módulos ni sesiones. Marketplace reutiliza visualmente los dos videos de sesión 2; sus File/LessonFile permanecen allí, sin duplicación ni movimiento. Los otros cuatro MP4 conservan sus vínculos de sesión 1. No se habilita VIDEO_UPLOAD en el editor.

## PDF fuente y extracción

Fuente local: `3108 WARMI DIGITAL (1).pdf`, 65 páginas; SHA-256 `8b6748e32a93d1c98afc70659db3b00ba08a588b3331a7821653b22129aa1918`. Se revisaron las páginas 31–42, sin adoptar como instrucciones los textos de las diapositivas. No se copiaron slides completos, banners, contactos ni pies de ayuda.

| Guía                  | Páginas fuente | PDF resultante | Tratamiento                                                                                             | Bytes   |
| --------------------- | -------------- | -------------- | ------------------------------------------------------------------------------------------------------- | ------- |
| WhatsApp o Business   | 31             | 1 página       | Recreada: la diapositiva solo tenía videos                                                              | 74936   |
| Configurar Business   | 32             | 2 páginas      | Recreada con el contenido y video existentes; no había guía incrustada                                  | 76481   |
| Crear catálogo básico | 33–34          | 4 páginas      | Recreada con tres recortes útiles; la captura borrosa de la ficha fue reemplazada por texto limpio      | 189435  |
| Publicar en Estados   | 35–36          | 3 páginas      | Pasos remaquetados y recortes de la interfaz                                                            | 501842  |
| Crear cuenta Facebook | 37–38          | 6 páginas      | Seis piezas extraídas de la guía original, sin franja decorativa; una pieza por página para legibilidad | 1073248 |
| Vender en Marketplace | 39–41          | 4 páginas      | Ocho pasos remaquetados con recortes de botones y formulario                                            | 239549  |
| Estados o Facebook    | 42             | 2 páginas      | Comparación recreada con texto seleccionable                                                            | 76229   |

Total: **2231720 bytes**, 2,23 MB decimales. Todos son PDF individuales; los seis recreados tienen texto nativo. Facebook conserva sus ilustraciones y texto rasterizados de la fuente. La disponibilidad de Marketplace y los nombres de menús pueden variar. No se promete que toda publicación Facebook sea pública ni que una aplicación consuma siempre menos datos que la otra.

Los siete PDF finales y el manifiesto están en `output/pdf/module3-session1/`. El manifiesto registra páginas, método, tamaño y SHA-256. Los renders y extracciones intermedias quedan en TEMP, fuera de Git.

## Cloudinary

Cuenta `szhwzy4q`, carpeta `Warmi/MODULO_3/SESION_1/GUIAS`, resource_type raw, delivery type upload. Se reutilizan siete assets existentes, con public_id estable `<carpeta>/<clave>-v1.pdf`, sin nuevas subidas, migraciones, cambios de resource_type ni overwrite. URLs reales:

- WhatsApp/Business: https://res.cloudinary.com/szhwzy4q/raw/upload/v1791396836/Warmi/MODULO_3/SESION_1/GUIAS/whatsapp-o-business-v1.pdf
- Configurar: https://res.cloudinary.com/szhwzy4q/raw/upload/v1791397419/Warmi/MODULO_3/SESION_1/GUIAS/configurar-whatsapp-business-v1.pdf
- Catálogo: https://res.cloudinary.com/szhwzy4q/raw/upload/v1791397420/Warmi/MODULO_3/SESION_1/GUIAS/crear-catalogo-basico-v1.pdf
- Estados: https://res.cloudinary.com/szhwzy4q/raw/upload/v1791397420/Warmi/MODULO_3/SESION_1/GUIAS/publicar-estados-whatsapp-v1.pdf
- Facebook: https://res.cloudinary.com/szhwzy4q/raw/upload/v1791397421/Warmi/MODULO_3/SESION_1/GUIAS/crear-cuenta-facebook-v1.pdf
- Marketplace: https://res.cloudinary.com/szhwzy4q/raw/upload/v1791397422/Warmi/MODULO_3/SESION_1/GUIAS/vender-facebook-marketplace-v1.pdf
- Comparación: https://res.cloudinary.com/szhwzy4q/raw/upload/v1791397423/Warmi/MODULO_3/SESION_1/GUIAS/estados-o-facebook-v1.pdf

**Entrega habilitada:** los siete secure_url originales responden HTTP 200, Content-Type application/pdf, tamaños y SHA-256 coincidentes con los PDF locales. Estados/Facebook también respondió 200 con cache-buster. La opción Allow delivery of PDF and ZIP files fue activada por la usuaria; no se cambiaron políticas ni credenciales desde el código. No hizo falta invalidar CDN, migrar a image, duplicar assets ni subir archivos nuevamente.

## Publicación segura

```powershell
pnpm exec tsx scripts/publish-module3-guides.ts --dry-run
pnpm exec tsx scripts/publish-module3-guides.ts --apply
```

El script solo inspecciona y reutiliza assets existentes: no contiene una operación de upload ni modifica Cloudinary. Sin --apply tampoco escribe en BD. --apply compara tamaño, identidad y SHA-256 descargado antes de publicar; un asset ausente o inaccesible cancela la operación. Para cambiar un PDF publicado debe aprobarse una versión explícita; no se sobrescribe silenciosamente.

La transacción bloquea solo la sesión 1; crea o reutiliza File DOCUMENT/application/pdf y LessonFile PDF, posiciones 10–16. Rechaza colisiones y duplicados; compara todos los módulos/lecciones del programa y todos los vínculos existentes antes/después. No cambia títulos, textos persistidos, Module.order, Lesson.order, recursos previos ni progreso. No se usa LessonFile.order.

**Publicación completada:** primera ejecución: 7 File y 7 LessonFile creados, 14 escrituras. Segunda ejecución: mismos IDs, 0 File/LessonFile nuevos y 0 escrituras. Todos son File DOCUMENT/application/pdf y LessonFile PDF de sesión 1. No se generaron duplicados. Los seis File/LessonFile MP4 originales siguen intactos.

Cada public_id es `Warmi/MODULO_3/SESION_1/GUIAS/<clave>-v1.pdf`; las secure_url exactas están en la sección Cloudinary anterior.

| Clave                        | File.id                              | LessonFile.id                        | position | Bytes   |
| ---------------------------- | ------------------------------------ | ------------------------------------ | -------- | ------- |
| whatsapp-o-business          | 5cf2de22-867a-4d53-ba24-71d1680ee7f9 | f43af1e5-cee8-4289-9246-f448a26f9958 | 10       | 74936   |
| configurar-whatsapp-business | 9632c029-355b-450f-aa66-c1d5163694b9 | 9060d8dc-ba59-41da-b64f-fec08ef76573 | 11       | 76481   |
| crear-catalogo-basico        | eaba4fd4-0855-4987-94ab-9559c7328279 | 0865cebb-e0c0-42b5-beb9-1cf0a912a4d3 | 12       | 189435  |
| publicar-estados-whatsapp    | ff3155c4-7b14-46f6-b5fc-0e4ede2779ba | ee0742b9-b801-481b-9345-4fff8e404455 | 13       | 501842  |
| crear-cuenta-facebook        | 4e64ccc8-6a3b-4e89-a95e-024aac7afd06 | 7de6a174-ae27-48e4-b813-84091061ed97 | 14       | 1073248 |
| vender-facebook-marketplace  | f0149fb3-3302-4afe-837b-7b8abee9e138 | 4279d7c6-5d28-42c6-8e0b-235b617abf28 | 15       | 239549  |
| estados-o-facebook           | e48f1235-fdd8-4abd-8e84-291a1c9ee543 | 4d350a95-807e-45a4-b2b1-4a5333ee5887 | 16       | 76229   |

Posiciones actuales de sesión 1: apoyos 0/1, MP4 2/3/4/5, PDF 10/11/12/13/14/15/16. Las posiciones 6–9 quedan libres; ninguna posición anterior cambió. En sesión 2, los dos MP4 mantienen 2/3. Module.order y Lesson.order no cambiaron.

## Offline y validación

Service Worker, IndexedDB, Cache Storage, formato de snapshot y API de descarga no se modificaron. El pipeline existente incorpora todos los application/pdf de LessonFile automáticamente. El paquete nuevo contiene 13 assets (seis MP4 + siete PDF) y 106524901 bytes de recursos, más shell/metadatos. Cada PDF aparece dentro de su tema, con Abrir guía paso a paso y Descargar PDF; no se muestran URLs raw.

Abrir guía paso a paso obtiene los bytes locales del Service Worker y crea un Blob application/pdf para el visor nativo, sin red. Su object URL se revoca al cerrar el visor. Descargar PDF exporta los mismos bytes como Blob y crea su enlace temporal dentro del shell, respetando el guard de navegación existente; se revoca su object URL después de 60 segundos. No crea otra caché ni una segunda lógica offline. Eliminar descarga borra el paquete en Cache Storage/IndexedDB, no copias PDF guardadas manualmente en Descargas del sistema. `.gitattributes` marca solo estos PDF como binarios para preservar sus bytes/SHA-256 en clones Windows. Estos controles requieren todavía cerrar la validación completa de navegador descrita abajo.

Los paquetes anteriores siguen abriendo videos y texto; una guía ausente muestra el aviso de contenido no disponible sin conexión. El sistema actual no tiene una versión de contenido ni un aviso automático de actualización (la versión de IndexedDB es de esquema, no del material formativo). Para incorporar las nuevas guías en un dispositivo con descarga antigua, reconectar, eliminar su descarga y volver a descargar el módulo. No se invalida la descarga anterior de forma automática.

`tests/module3-guides.test.ts` verifica temas, seis vínculos de video únicos, siete PDF/hash/manifiesto y compatibilidad MIME offline. `tests/module3-real.browser.mjs` comprueba también PDF con SHA-256 y descarga real del navegador cuando WARMI_REAL_GUIDES=1; WARMI_REAL_GUIDES=0 sirve para probar el paquete anterior sin las guías. El wrapper `tests/module3-guides-real.browser.mjs` crea y elimina una cuenta temporal, y protege por snapshot los datos del programa.

Typecheck, lint, build, Prisma validate, git diff --check y 35 pruebas unitarias correctos. Todas las páginas PDF se renderizaron y revisaron; se corrigió la captura borrosa de catálogo y se volvió a renderizar.

La prueba real de navegador con WARMI_REAL_GUIDES=0 pasó: reproducción online/offline de los seis MP4, siete temas en 320/390/1365 px sin desbordamiento horizontal, voz existente, lecciones de apoyo, reapertura del navegador sin red con paquete anterior, avisos de guías ausentes/enlaces externos, reconexión y eliminación de Cache Storage/IndexedDB. El snapshot confirmó que Course, Module, Lesson, File y LessonFile protegidos no cambiaron, y la cuenta temporal de prueba se eliminó. El paquete anterior observado contenía 104293181 bytes de recursos, 12104 de metadatos y 4635340 de shell, total 108940625 bytes; el shell puede variar entre builds.

Los siete enlaces públicos responden HTTP 200. La idempotencia en BD ya se verificó con una segunda ejecución sin escrituras. La prueba completa con Chrome y WARMI_REAL_GUIDES=1 confirmó apertura y descarga online de las siete guías, hashes correctos y reproducción online de los seis videos. La descarga real contiene 13 assets: 106524901 bytes de recursos, 15857 de metadatos y 4636414 de shell; total medido 111177172 bytes, sin incluir sobrecarga del almacenamiento del navegador.

**Validación automatizada offline completa inconclusa por cierre del contexto Playwright.** Después de cerrar completamente el navegador y reabrirlo sin red, el primer MP4 reprodujo y la respuesta local del primer PDF pasó status 200, MIME, tamaño y SHA-256. La exportación nativa de ese PDF falló en `download.failure()` con `Target page, context or browser has been closed`. También se intentó abrir primero el visor, sin lograr completar el recorrido de las siete guías. La prueba focalizada de un PDF sí pasó reapertura offline, visor y descarga, pero no reemplaza la validación del paquete completo. Ese error por sí solo no demuestra un fallo funcional del PDF offline; no se ha determinado su causa.

**Validación final offline manual pendiente, a cargo del usuario.** Debe completar apertura offline 7/7, reproducción offline 6/6, materiales de apoyo, reconexión, eliminación y compatibilidad legacy con el paquete nuevo en dispositivo/navegador físico. El recorrido completo del paquete anterior pasó por separado, como se indica arriba. Android/iOS físicos tampoco están validados. Por autorización expresa del usuario, la prueba automatizada inconclusa no bloquea el commit/push si las comprobaciones finales restantes pasan. No se volvió a ejecutar ese recorrido ni se hicieron nuevas modificaciones funcionales.

La comprobación final de solo lectura confirmó siete File y siete LessonFile de guías, posiciones 10–16, sin duplicados; los seis MP4 conservan IDs, relaciones, posiciones, public_id y secure_url comparados con las referencias previamente publicadas. El constructor offline incluye las siete guías y los seis videos, 13 recursos en total. No se modificó la BD ni Cloudinary durante esta comprobación.
