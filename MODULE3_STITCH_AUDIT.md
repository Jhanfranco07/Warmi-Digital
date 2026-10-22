# Módulo 3 offline: auditoría de fidelidad Stitch

## Fuente y alcance

Referencia: `stitch_warmi_digital_offline_redesign/stitch_warmi_digital_offline_redesign`
en Descargas. Se inspeccionaron recursivamente 41 archivos: 20 HTML, 20
`screen.png` y `DESIGN.md`. La identificación se hizo por encabezados y contenido,
no por el orden de carpetas. `scripts/audit-module3-stitch.mjs` reproduce el
inventario y genera láminas de comparación en la carpeta temporal del sistema.

Ocho `screen.png` no son imágenes: contienen literalmente
`<FIFE Image failed to fetch>` (los siete temas de sesión 1 y la portada).
Los veinte HTML sí son legibles; las otras doce capturas son válidas.

Base anterior: `dfc8b4d`. Solo cambia la presentación offline del Módulo 3.
No hay cambios de Prisma, Cloudinary, archivos multimedia ni progreso educativo.

## Matriz previa a la implementación

| Elemento     | Implementación anterior                                | Stitch                                               | Acción                                                                                                    |
| ------------ | ------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Encabezado   | Cabecera Warmi, dos avisos de red y cabecera de sesión | Cabecera compacta con selector                       | Quitar cabecera redundante solo en lecciones modernas M3; conservar aviso global, retorno y posición real |
| Audio        | Botón de voz existente, suelto                         | Banda de audio integrada                             | Reutilizar `SpeechButton` en banda; no inventar audios ni duración                                        |
| S1 temas 1–2 | Texto y listas                                         | Comparación y perfil de negocio                      | Comparación personal/Business y perfil artesanal de ejemplo sin sello verificado                          |
| S1 temas 3–4 | Listas, MP4 y PDF                                      | Catálogo y estado ilustrados                         | Ficha de pieza y estado con foto original, marcados como ejemplos, no interfaces oficiales                |
| S1 temas 5–7 | Tutoriales, omisión de Facebook y enlaces              | Cuenta, Marketplace, comparación de canales          | Conservar tutorial/omisión; añadir preparación segura, ficha y comparación                                |
| S2 tema 1    | Icono de tienda y listado de plataformas               | Vitrina y beneficios                                 | Vitrina artesanal y cuatro beneficios, sin promesas comerciales                                           |
| S2 temas 2–3 | Preguntas y tarjetas uniformes                         | Preguntas ilustradas, plataformas diferenciadas      | Iconos por pregunta y encabezados de color por plataforma; conservar condiciones prudentes                |
| S2 tema 4    | Lista numerada                                         | Ruta conectada y acompañamiento                      | Secuencia de tres decisiones y fotografía contextual                                                      |
| S3 paso 1    | Selector Yape/Plin y video nativo                      | Opciones destacadas y reproductor integrado          | Mantener selección real y MP4; diferenciar opciones sin inventar requisitos                               |
| S3 paso 2    | Lista numerada                                         | Regla destacada y verificación ilustrada             | Mensaje magenta, secuencia con iconos y fotografía de revisión del celular                                |
| S3 paso 3    | Acordeones con explicaciones repetidas                 | Alertas contextualizadas y apoyo                     | Explicaciones específicas de seguridad y panel de acompañamiento                                          |
| S4 paso 1    | Checklist y texto de ejemplo                           | Chat de acuerdo                                      | Chat educativo no interactivo con texto actual                                                            |
| S4 paso 2    | Checklist                                              | Foto y secuencia de embalaje                         | Fotografía Warmi, cuatro acciones visuales y checklist existente                                          |
| S4 paso 3    | Checklist y texto                                      | Respaldo del envío y comprobante                     | Esquema de comprobante sin validez ni datos personales, secuencia y checklist                             |
| S4 paso 4    | Checklist y texto                                      | Chat y seguimiento                                   | Chat de práctica, ruta de seguimiento y recordatorio destacado                                            |
| Logros       | Cuatro tarjetas básicas                                | Tarjetas con iconos, descripciones y cierre cultural | Iconos y jerarquía por aprendizaje, acompañamiento; sin aprobación automática                             |
| PDF y MP4    | Recursos reales con abrir/exportar/volver              | Tarjetas multimedia                                  | Conservar callbacks, visor interno, reproducción y fuentes locales                                        |

## Contenido y recursos

Los ejemplos complementarios son representaciones de las acciones ya enseñadas:
perfil, catálogo, estados, vitrina, acuerdo, comprobante y seguimiento. No sustituyen
los tutoriales ni modifican los objetivos formativos. Están identificados como
ejemplos educativos; no envían mensajes, publicaciones, pagos ni pedidos.

Se descartan porcentajes, certificados, duración de audios, verificaciones de cuentas,
publicación sin internet, contraseñas débiles, comisiones o requisitos universales,
sellos de agencia y supuestas sincronizaciones. Ninguna ampliación sustancial del
currículo se publica sin revisión de la clienta.

Las imágenes remotas de Stitch se evaluaron por propósito: producto, embalaje,
artesana con celular y acompañamiento. La exportación no incluye licencia ni
procedencia verificable de esas imágenes. Se priorizan fotografías del material
original de Warmi y composiciones React/CSS con iconos Lucide. Las composiciones
no pretenden ser capturas actuales de WhatsApp o Facebook.

Fotografías reutilizadas: `learning/module4/tejidos.webp` (42 914 bytes),
`learning/module4/entrega.webp` (54 876 bytes), `learning/module4/bolso.webp`
(4 582 bytes). Su procedencia está en `public/images/learning/module4/manifest.json`:
material original de la clienta. Reutilizar estas imágenes no habilita ni modifica
el Módulo 4. Total adicional del shell: 102 372 bytes (aprox. 100 KiB).
Las fotografías institucionales `images/offline/taller.webp` ya estaban precargadas.

El Service Worker actualiza exclusivamente su shell para precargar esas tres
imágenes públicas. IndexedDB y las generaciones de Cache Storage de PDF/MP4 no
cambian. No se almacena HTML autenticado ni se añaden dependencias externas.

## Validación

La comparación utiliza capturas anteriores, las doce capturas fuente válidas y
capturas nuevas a 360, 390 y 430 px. En los temas sin PNG fuente, la comparación
se hace con su HTML. Las pruebas comparan también el render online anterior y
actual para detectar cambios involuntarios.

### Resultados ejecutados

- `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm exec prisma validate` y
  `git diff --check`: PASS. Prettier de los archivos modificados: PASS.
- Las 65 pruebas unitarias existentes (incluida la nueva comprobación de fotos del
  shell) pasan. M1/M2/M4 siguen solo online; el contrato histórico se conserva.
- Los cuatro `module3-session*-offline-design.browser.mjs` pasan: 19 vistas,
  selector, navegación, PDF/retorno, imágenes locales, casillas, acordeones,
  logros, API de voz, salida al módulo, eliminación y reconexión. Anchos
  360/390/430/1024; render online sin diferencias.
- `module3-session1-media.browser.mjs`: seis MP4 reales y siete PDF responden HTTP
  200; los seis MP4 avanzan su reproducción y los siete PDF abren desde Cache
  Storage sin red después de cerrar/reabrir la página. File/LessonFile, posiciones
  10–16 de guías, public IDs y URLs no cambian. Medios comprobados: 106 524 901 bytes
  (no es el tamaño del paquete completo de las cuatro sesiones).
- S3 comprueba además MP4 reales de Yape y Plin, selección efectiva del video y
  PDF real. S4 comprueba su PDF real y que logros no completan la sesión.
- `offline-learning.browser.mjs`: PASS al ejecutarse por separado, incluido cierre
  completo y reapertura del navegador sin red, rollback de descarga fallida,
  imagen/PDF/MP4, API nativa de voz, reconexión y eliminación. El primer intento
  concurrente agotó el tiempo de espera de estabilidad de un enlace; la repetición
  secuencial pasó sin cambiar código funcional ni debilitar la prueba.

Se generaron 19 láminas fuente/antes/después en la carpeta temporal
`warmi-stitch-comparison`, sin añadir capturas generadas al repositorio. Se revisan
cabeceras, comparaciones, catálogo/estado, tarjetas de preguntas/plataformas,
secuencias de cobro y entrega, checklist, chat, comprobante y logros.
Las siete láminas de S1 dejan vacía explícitamente la columna del PNG fuente
inválido: para esos temas la referencia es el HTML, no una captura inventada.
Los scripts de auditoría y comparación permiten regenerar las láminas.

Diferencias intencionales: se mantienen la fuente local de Warmi, controles de
voz reales, visores PDF reales, botones con acciones, radio de tarjeta de 8 px,
tipos completos sin truncar y fotografías originales. No se copian el sello de
verificado, el contador de visitantes ni la apariencia de una tienda operativa.
El esquema de comprobante no incluye sellos, códigos de seguimiento ficticios ni
datos personales. No hay ampliaciones sustanciales de currículo pendientes de
publicación; cualquier cambio posterior de objetivos o procedimientos requiere
revisión de la clienta.

### Pendiente manual

Las pruebas se ejecutaron en Microsoft Edge de escritorio con viewports móviles,
no en un Android físico. Falta comprobar tacto, audibilidad de la voz local,
exportación nativa de PDF y cuotas de almacenamiento en los celulares destinatarios.
La voz depende del sistema y de sus voces instaladas; una prueba con síntesis
simulada verifica el control, no su audibilidad. El visor PDF también depende de
las capacidades del navegador, como en la versión anterior.
