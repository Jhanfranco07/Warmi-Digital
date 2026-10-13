# Guías PDF v2: propuesta para aprobación

## Estado

Siete PDF nuevos generados localmente. **Diseño pendiente de aprobación del usuario.** No se subió ningún asset ni se actualizó File/LessonFile, la UI o el paquete offline publicado. No se hizo commit ni push. Las versiones v1 siguen disponibles y sus registros no se modificaron.

Alcance: Módulo 3 `6c96bcdf-0b41-48d2-bdcd-394d06acd9d2`, sesión 1 `8a8e449b-76a6-4a6d-9693-6238f75092bc`. Los cambios locales previos de M1/M2 y `.obsidian/` están fuera de esta entrega.

## Entregables

Directorio: `output/pdf/module3-session1-v2/`. `revision.html` permite revisar todas las páginas; `preview/` contiene las 20 páginas PNG a 864 × 1664 px y siete láminas de revisión. El manifiesto v2 independiente registra tamaño, páginas, SHA-256 y estado `pending-design-approval`. No reemplaza el manifiesto v1 publicado.

| Guía                           | Páginas | Bytes |
| ------------------------------ | ------: | ----: |
| WhatsApp o WhatsApp Business   |       2 | 78861 |
| Configurar WhatsApp Business   |       3 | 82933 |
| Crear catálogo básico          |       3 | 83627 |
| Publicar estados de WhatsApp   |       3 | 83066 |
| Crear mi cuenta en Facebook    |       3 | 82764 |
| Vender en Facebook Marketplace |       4 | 85891 |
| Estados de WhatsApp o Facebook |       2 | 78683 |

Total: **20 páginas / 575825 bytes**, aproximadamente 576 KB decimales. No hay portadas adicionales ni páginas de relleno: dos pasos por página en los procedimientos y dos páginas por comparación. Cada paso tiene su propia ilustración.

## Ilustraciones y lectura

Todo el material gráfico se dibuja desde cero con primitivas vectoriales de ReportLab: celulares, campos, selección de opciones, bolso tejido, chal y detalle de trama, catálogo, verificación, perfil, audiencia y envío. No se usan capturas, recortes, slides completos, fotos de Canva ni imágenes generadas por IA. Los productos son ejemplos ilustrativos, no fotografías de piezas reales.

Texto nativo seleccionable y fuentes Arial incrustadas. Formato vertical de 432 × 832 puntos; cuerpo de 17,5 puntos, títulos de pasos de 19 y título de guía de 25. Guinda/rosado para jerarquía, azul para orientación, blanco para fondo y verde para confirmación/envío. Las representaciones se identifican como esquemas ilustrativos y no réplicas de una versión específica de Android o iOS.

La paleta de `DESIGN_SYSTEM.md` todavía describe terracota/oro. Estos PDF siguen la paleta guinda/rosado/azul solicitada explícitamente para esta entrega; no se modificó el diseño general de la aplicación ni aquel documento.

## Fuente y comprobaciones de contenido

Referencia local: `3108 WARMI DIGITAL (1).pdf`, páginas 31–42. SHA-256 `8b6748e32a93d1c98afc70659db3b00ba08a588b3331a7821653b22129aa1918`. Se revisaron los textos y las páginas visuales de catálogo y registro Facebook. Se conserva la secuencia formativa, sin adoptar afirmaciones absolutas del Canva sobre datos móviles, visibilidad pública o disponibilidad de Marketplace.

Comprobaciones oficiales consultadas:

- [WhatsApp Business](https://faq.whatsapp.com/641572844337957): permite trasladar el número; Messenger y Business no usan el mismo número simultáneamente.
- [Crear y mantener catálogo](https://faq.whatsapp.com/833697274483076/?cms_platform=iphone): herramientas, catálogo, nuevo artículo, medios y datos; incluye país de origen y revisión antes de mostrar artículos.
- [Crear y compartir Estados](https://faq.whatsapp.com/643144237275579/?cms_platform=iphone): foto, descripción, audiencia, envío y duración de 24 horas.
- [Formas de vender en Facebook](https://www.facebook.com/help/550954179351183/): Marketplace, grupos y páginas.
- [Seguridad en Marketplace](https://www.facebook.com/help/123884166448529/): referencia oficial para coordinación responsable.

Limitación explícita: las páginas específicas de Meta para alta de cuenta, requisitos de Marketplace y creación de publicaciones redirigieron al inicio de sesión o limitaron el acceso. No se pudo confirmar su interfaz exacta vigente ni se presenta una captura auténtica. Las guías Facebook usan acciones generales, no posiciones fijas ni nombres de botones supuestamente universales; el acceso se condiciona a la cuenta/región. No se promete que una cuenta nueva tenga Marketplace inmediatamente. La reproducción exacta de la interfaz no forma parte de esta propuesta.

## Revisión visual y QA

Se renderizaron todas las páginas con PyMuPDF, al no estar Poppler disponible en PATH. Se inspeccionaron visualmente las siete láminas que cubren las 20 páginas y páginas de detalle. Se corrigieron un resumen que excedía su fondo, el espacio de títulos y confirmaciones dentro de celulares, el paso de añadir un producto y la coherencia de las fotografías ilustradas con cada artesanía. Se regeneraron los PDF y las vistas previas tras las correcciones.

QA automático: siete PDF, 20 páginas, hashes/tamaños coincidentes con el manifiesto, todos los pasos presentes en orden, texto seleccionable, fuentes incrustadas, cero imágenes rasterizadas en los PDF, cero cajas de texto fuera de página y cero intersecciones significativas entre spans de texto. La galería conserva las proporciones originales. Estos resultados no sustituyen la aprobación del diseño en un celular físico.

La galería se abrió en Chrome con Playwright: siete secciones, 20 imágenes cargadas y proporciones correctas, sin desbordamiento horizontal a 390/1280 px. Se inspeccionó también su captura móvil. No es una prueba del paquete PWA ni de los botones PDF publicados.

Validaciones de esta fase: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm exec prisma validate`, `git diff --check` y las 35 pruebas unitarias existentes: correctas. La comprobación online/offline de v2 queda pendiente de aprobación y publicación; no se reutiliza el resultado de v1 como validación de v2.

La comprobación de BD fue de solo lectura: siete File/LessonFile originales v1 en posiciones 10–16, sin File duplicados, y los seis MP4 con IDs, relaciones, posiciones, public_id y URLs idénticos a las referencias publicadas. El código de sesión, los recursos v1 y la infraestructura offline no presentan nuevos cambios de esta tarea.

Generación reproducible, sin acceso a Cloudinary/BD:

```powershell
python scripts/generate-module3-guides-v2.py --source 'C:\Users\PC\Downloads\3108 WARMI DIGITAL (1).pdf'
```

Requiere `reportlab`, `pymupdf`, `Pillow` y las fuentes Arial de Windows. En esta máquina se reutilizaron las dependencias PDF ya disponibles en TEMP; no se modificó el gestor de paquetes del proyecto.

## Publicación después de aprobación

1. Publicar cada archivo como nuevo asset raw/upload en `szhwzy4q`, carpeta `Warmi/MODULO_3/SESION_1/GUIAS`, con public_id `<clave>-v2.pdf`. No sobrescribir ni eliminar v1.
2. Verificar los siete secure_url nuevos: HTTP 200, application/pdf, tamaño y SHA-256 del manifiesto aprobado.
3. Actualizar únicamente los siete File existentes y sus referencias coherentes en los mismos LessonFile. Mantener ambos conjuntos de IDs, asociaciones y posiciones 10–16; rechazar registros inesperados o duplicados. No ejecutar el publicador v1 para realizar esta actualización.
4. Los seis MP4 mantienen File/LessonFile, posiciones, public_id, secure_url y relaciones. No habrá nuevas lecciones, uploads de video, migraciones ni seeds.
5. Añadir una identificación opcional de revisión al snapshot offline y una acción de actualización dentro del control de descarga existente. Los paquetes legacy sin revisión continúan siendo válidos, pero no se identifican como v2. No basta con conservar el mismo File.id para asumir que el PDF cacheado ya está actualizado.
6. Reutilizar `downloadModule`: ya descarga con `cache: no-store` a una generación nueva, conserva la descarga anterior mientras se completa y sustituye su ficha IndexedDB solo al terminar. Después elimina su caché anterior. No crear un segundo almacenamiento ni borrar el paquete válido antes de tener el nuevo.
7. Comprobar botones, caché nueva, reapertura offline, reconexión y eliminación. La validación física del paquete publicado queda a cargo del usuario; un cierre de contexto Playwright se reportará como prueba inconclusa, no como diagnóstico automático del PDF.
8. Tras validar, commit `feat: redesign module 3 session 1 pdf guides` y push a main, excluyendo cambios anteriores y archivos locales.

**Todo este bloque está pendiente de aprobación y ejecución.** No hay URLs v2 finales ni registros actualizados ni un paquete offline v2 publicado en esta entrega de revisión.
