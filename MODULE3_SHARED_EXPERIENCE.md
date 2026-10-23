# Módulo 3: una experiencia para online y offline

## Alcance

Las cuatro sesiones y los logros usan componentes compartidos en
`features/artisan/learning/`. No se mantiene una segunda versión resumida online.
Los antiguos `module3-session2/3/4-offline` y `module3-visuals` pasan a esa carpeta
con nombres de contenido compartido; las rutas, IDs y registros no cambian.

- Sesión 1 conserva sus siete temas, tutoriales, omisión de Facebook y guías.
- Sesión 2 usa los mismos cuatro temas en ambos modos.
- Sesión 3 conserva tres pasos, selección real Yape/Plin y cinco alertas.
- Sesión 4 conserva cuatro pasos, casillas temporales, ejemplos y cierre.
- Los logros siguen siendo una vista de repaso, no una quinta lección.

La cabecera compartida permite abrir cualquiera de las cuatro sesiones y elegir
tema o paso. El contenedor online ya no añade otra cabecera a la Sesión 1.
Se conserva el botón existente de completar esa lección.

## Diferencias funcionales necesarias

La propiedad `offline` modifica disponibilidad y acciones, no el contenido
pedagógico. Solo online se muestra el progreso real y se invoca la Server Action
existente para guardar una sesión. La acción de cierre indica explícitamente
«Completar sesión» antes de guardar. Fallos de guardado no muestran éxito ni abren
los logros; volver a unos logros ya guardados no completa por segunda vez.
Offline no se sincroniza progreso y las casillas siguen siendo temporales.

Los enlaces externos mantienen su aviso offline; los PDF usan el visor integrado
y las mismas acciones de retorno/exportación. El modo online conserva las URLs
autorizadas existentes; el paquete offline conserva sus URLs locales de caché.
No se modifica autenticación, Prisma, Cloudinary, File, LessonFile ni posiciones.
Los módulos 1, 2 y 4 no se alteran y solo el Módulo 3 permite nuevas descargas.

`data-mode-detail` identifica exclusivamente disponibilidad, guardado y controles
de finalización que difieren legítimamente. Las pruebas lo omiten al comparar el
resto del árbol educativo: textos, clases, imágenes, ejemplos, recursos y casillas.

## Imágenes propias por contexto

Se crearon seis imágenes con la herramienta integrada `image_gen`, guardadas en
`public/images/learning/module3/examples/` y optimizadas como WebP de 960 × 640.
Peso combinado: 523 172 bytes. Cada contexto usa su propio archivo:

| Contexto               | Imagen                                                    |
| ---------------------- | --------------------------------------------------------- |
| Catálogo               | Bolso tejido completo sobre fondo claro                   |
| Estado                 | Chal extendido, con diseño y flecos visibles              |
| Marketplace            | Jarrón completo junto a una cinta de medir                |
| Verificación del cobro | Artesana revisando su celular sin entregar la pieza       |
| Empaque                | Manos protegiendo una prenda con papel dentro de una caja |
| Dudas y acompañamiento | Artesana y facilitadora consultando el celular            |

Son ilustraciones educativas ficticias; no son productos en venta, usuarias
identificadas ni capturas oficiales de aplicaciones. Las pantallas no inventan
pagos, comisiones, sellos verificados, precios ni datos personales. Las fotos
originales de Warmi se conservan para vitrina, perfil y acompañamiento/cierre,
con escenas diferentes y sin repetirlas en esos ejemplos.

Los prompts completos, procedencia, tamaño y SHA-256 están en el manifiesto local;
`scripts/module3-illustration-prompts.json` conserva el conjunto exacto de prompts.
`scripts/prepare-module3-illustrations.mjs` reproduce la optimización de los PNG.
No es necesario ejecutar generación de imágenes para construir o desplegar.

El shell v12 precarga las seis imágenes y mantiene el visor PDF local del shell v9.
No cambia IndexedDB ni las generaciones de medios. Instalar la actualización
requiere conexión; una vez preparada, ninguna imagen nueva depende de internet.

## Validación

`tests/module3-mode-parity.browser.mjs` compara las vistas de ambos modos en
360/390/430/1024 px, incluyendo selectores, casillas, Yape/Plin y logros. Simula
únicamente la respuesta de completar sesión para no escribir en la base real;
comprueba guardado explícito online, error/reintento y cero guardados offline.
Las pruebas anteriores de sesión comparan ahora ambos modos actuales, en lugar
de exigir que online permanezca igual a un commit histórico.

`tests/module3-illustrations.test.ts` valida seis archivos distintos, hashes,
textos alternativos, procedencia, tamaño y presencia en el Service Worker.
Las pruebas de medios y PDF existentes verifican los recursos reales en caché.
La emulación móvil no sustituye la validación final en un Android físico.

Resultados de esta entrega:

- PASS: typecheck, lint, build, Prisma y 67 pruebas unitarias.
- PASS: 72 comparaciones online/offline y logros en cuatro anchos de pantalla.
- PASS: pruebas de las cuatro sesiones sin conexión, imágenes locales,
  selectores, retorno, PDF, eliminación y reconexión.
- PASS: los seis MP4 y siete PDF de la Sesión 1 después de cerrar/reabrir;
  relaciones, URLs y posiciones sin cambios. Medios: 106 524 901 bytes,
  sin contar shell ni ilustraciones.
- PASS: siete PDF y 22 páginas renderizadas dentro de Warmi tras reiniciar
  completamente el navegador offline; anterior/siguiente, zoom, ajuste y retorno.
- Las pruebas Edge usan renderizado por software para evitar bloqueos del
  compositor en este entorno Windows. La prueba física queda pendiente.

La restricción «solo cambiar visualmente offline» de la auditoría Stitch anterior
corresponde a aquella entrega; esta unificación online fue solicitada después.

## Continuidad y recuperación

- Al vencer la sesión se conserva la descarga y se muestra un aviso. Leerla no
  concede autenticación ni permite guardar progreso en el servidor.
- El cierre voluntario usa `LogoutForm`: limpia medios, descargas parciales y
  marcadores antes de invocar la misma Server Action de logout. Si falla la
  limpieza, muestra error y permite reintentar. Una cuenta distinta también borra
  el material anterior. No cambian permisos ni validación de sesión.
- Los temas de S1/S2, pasos de S3/S4 y página de cada PDF se restauran localmente.
  Los marcadores numéricos tienen formato versionado, toleran almacenamiento
  bloqueado y no representan lecciones completadas. Las casillas siguen siendo
  temporales; no hay sincronización offline de progreso.
- Una descarga interrumpida conserva archivos completos en Cache Storage.
  El reintento verifica propietaria, curso, módulo, versión y firma de archivos.
  Un archivo cortado a la mitad se vuelve a descargar completo; no hay HTTP Range
  para continuar su transferencia. No se anuncia disponibilidad hasta guardar
  el paquete completo en IndexedDB.
- Las actualizaciones reutilizan archivos de una descarga anterior solo si
  coinciden ID, MIME, tamaño y revisión `File.updatedAt`. Los paquetes antiguos
  sin revisión siguen abriendo, pero necesitan una descarga inicial actualizada
  antes de aprovechar esa reutilización. No se cambia ningún File en BD.
- El tamaño mostrado corresponde a los recursos, no al almacenamiento total
  de la aplicación. El shell, PDF.js e imágenes compartidas se conservan al
  eliminar un módulo. Las descargas parciales sí se eliminan.
- Antes de desconectarse se avisa si no hay voz local española. No se instala
  una voz desde Warmi ni se garantiza Google español en todos los dispositivos.

`pnpm test` ejecuta las pruebas unitarias sin PostgreSQL ni Cloudinary.
`.github/workflows/checks.yml` añade typecheck, lint, pruebas, validación Prisma
y build en CI con configuración ficticia, sin secretos de producción. Su primera
ejecución en GitHub queda pendiente de publicar los cambios.
`tests/offline-resilience.browser.mjs` comprueba los escenarios de recuperación
con sesión y medios aislados, sin mutar cuentas ni recursos reales.

Validación de continuidad: PASS en 70 pruebas unitarias, typecheck, lint, build,
Prisma, formato de los archivos de esta entrega y `git diff --check`.
PASS en recuperación de descarga, actualización de un solo archivo, rollback,
limpieza de descargas completas/incompletas por cuenta, cierre voluntario,
restauración de lectura y detección de voz local. Las 72 comparaciones entre modos
también pasan. La regresión de los seis MP4 y siete PDF reales y las 22 páginas
tras reiniciar completamente el navegador sin conexión vuelve a pasar.
La comprobación física en Android/iOS, audibilidad real y actualización de una
PWA instalada por la cliente sigue pendiente; no se reemplaza por emulación.

## Continuar la lectura y estados de descarga

Mi aprendizaje muestra «Continuar donde me quedé» cuando existe una visita local
al Módulo 3. En online solo ofrece sesiones del programa inscrito que sigan
disponibles; en offline solo ofrece las sesiones incluidas en la descarga. El
acceso también aparece en el inicio offline y en el resumen del módulo. Abre la
última sesión visitada, cuyos temas/pasos conservan los marcadores existentes.
No sustituye el progreso del servidor ni completa sesiones. Se oculta si el
marcador es inválido, la sesión no está disponible o pertenece a otra cuenta.
Cerrar sesión, cambiar de cuenta o eliminar el módulo limpia ese acceso.

La descarga diferencia «No descargado», «Descargando...», «Descarga pausada»,
«Descarga incompleta», «Disponible sin conexión», actualización y error.
«Pausar descarga» conserva los archivos terminados y la intención de pausa en el
checkpoint. Si se cierra la página durante una transferencia, se muestra como
incompleta. Ambos estados se restauran al reabrir y ofrecen «Continuar descarga»
con progreso de archivos completos, no de bytes parciales descartados. No indican
que un paquete incompleto esté disponible sin internet. Durante una actualización
fallida sigue existiendo acceso explícito a la descarga anterior completa.

`tests/module3-continuation.browser.mjs` comprueba pausa/reapertura/reanudación,
interrupción, reutilización de archivos, actualización fallida y lectura de la
sesión/paso recordados con el navegador sin red, en cuatro anchos de pantalla.
Usa medios y cuenta de prueba aislados, sin cambios en PostgreSQL ni Cloudinary.
