# Módulo 2 y recorrido guiado M1/M2

Entrega del 7 de octubre de 2026. Programa `Aprender para crecer` (`93dc7355-d746-4acd-87df-29f71d16a955`), dentro de Mi aprendizaje. No se crean menús, cursos nuevos, migraciones, seeds globales ni capacidades offline adicionales.

## Experiencia compartida

`LearningSession` muestra encabezado compacto, sesión X de 4, navegación entre sesiones y un solo paso principal a la vez. Hay avance, paso anterior, foco en el nuevo encabezado, logros al final y acción existente de completar/continuar. Cambiar de paso desmonta reproductores y contenido secundario; no quedan videos escondidos reproduciéndose. `LearningDisclosure` tiene aria-expanded/aria-controls y recursos colapsados; `LearningVideo` se carga bajo demanda y usa un grupo nativo de details para que no haya dos reproductores abiertos en el mismo paso. Los CTAs tienen al menos 48 px y los videos relación 16:9 responsive.

Componentes compartidos: `learning-session.tsx`, `learning-video.tsx`, `learning-session-complete.tsx`, `learning-content.tsx`. `learning-choice.tsx` es la práctica simple de selección de oportunidades M2. El contenido principal se compone en Server Components; solo navegación, decisiones, desplegables, reproducción y mutación requieren cliente. La voz sigue usando SpeechButton y shared/accessibility; no se crea otro TTS.

M1 conserva exactamente los mismos Module/Lesson/File/LessonFile IDs, textos persistidos, URLs, posiciones y recursos. Solo cambia su presentación: Gmail → adjuntos; instituciones → convocatorias → Artesanías del Perú; preparación → RNA → RUC → banco; Zoom → Meet → logros. Los siete MP4, cuatro YouTube configurables, PDF e introducción histórica continúan accesibles. Los textos extensos y alternativas se despliegan cuando se necesitan.

## Módulo 2 publicado

ID `c156c5d5-8c81-48f8-85d4-234ecb21ec0e`, Module.order = 2, título `Módulo 2: Oportunidades para mi negocio`, status available, offline false. No había módulo M2 ni File para estos assets en BD; los cursos antiguos de PDF y productos culturales estaban vacíos y se conservaron, sin inventar contenido reutilizable.

| Lesson.order | Sesión                                           | ID                                   | Pasos                                                             |
| ------------ | ------------------------------------------------ | ------------------------------------ | ----------------------------------------------------------------- |
| 1            | Conociendo las oportunidades                     | 358c973f-9f8c-43af-a29e-8d7f9eaf7bdb | Oportunidades → ferias → concursos → capacitaciones → cuál elegir |
| 2            | Aprendiendo a postular: requisitos y documentos  | 73b088f0-f3c1-4d86-82e3-09318464cb1f | Cinco preguntas → checklist → Somos Artesanía                     |
| 3            | Preparando los documentos y llenando formularios | fb6ba221-ad24-4319-8aa2-1fceb9156fb1 | Foto a PDF → fotografía → formulario → ficha de María             |
| 4            | Simulación de postulación                        | 953e1983-d2ce-46aa-ad94-d15cd69a7afe | Bases/fecha → requisitos → ficha → revisión → envío/comprobante   |

Hay 17 pasos pedagógicos, no 17 lecciones. El cierre está dentro de sesión 4, sin quinta sesión. La simulación es un ejemplo educativo: no envía postulaciones reales, no pide DNI ni guarda documentos personales. Los checklists son ayudas visuales, no requisitos universales ni certificaciones; sus marcas no se persisten. El precio S/ 180 y los demás datos del chal de María son ejemplos del material, no recomendaciones de precio.

## Videos reales reutilizados

Cuenta Cloudinary `szhwzy4q`, carpeta `Warmi/MODULO 2`, video/upload/mp4. Sin uploads ni cambios en Cloudinary. Las cuatro referencias únicas suman **49351962 bytes** (49,35 MB decimales), incluyendo una alternativa. No es un paquete offline.

| Video    | Jerarquía                                     | LessonFile.position | File ID                              | LessonFile ID                        |
| -------- | --------------------------------------------- | ------------------- | ------------------------------------ | ------------------------------------ |
| M2-S2-01 | Principal: Somos Artesanía                    | 10                  | 7f417a39-e65a-461a-a9f8-035d47fe86f1 | 647a3e64-9086-476e-8b26-0a6fa55389c5 |
| M2-S3-02 | Principal: foto a PDF desde celular           | 10                  | c928d94c-7185-4579-927a-efe155cabf5d | dc57ecda-5c2c-4889-860d-13c23356f43d |
| M2-S3-03 | Principal: fotografía                         | 20                  | dae598fe-8d09-48e1-bb6d-4fed7be274e3 | f558ce15-4ca3-44e4-bd95-022b2f5c7dd9 |
| M2-S3-01 | Material adicional: JPG a PDF desde navegador | 30                  | 34472d1f-8c0a-4333-97d6-675cc97105f2 | 926274a3-32e0-4b4c-895f-926d5cd3108e |

public_id completos en `shared/learning/module2.ts`; secure_url obtenidos mediante API y conservados en File.url/LessonFile.originalUrl:

- https://res.cloudinary.com/szhwzy4q/video/upload/v1791387051/M2-S2-01_-_Somos_Artesania_2026_requisitos_y_registro_virtual.mp4
- https://res.cloudinary.com/szhwzy4q/video/upload/v1791387049/M2-S3-02_-_Convertir_foto_a_PDF_desde_celular.mp4
- https://res.cloudinary.com/szhwzy4q/video/upload/v1791387047/M2-S3-03_-_Tomar_buenas_fotos_de_productos.mp4
- https://res.cloudinary.com/szhwzy4q/video/upload/v1791387049/M2-S3-01_-_Convertir_imagen_JPG_a_PDF.mp4

Se inspeccionaron fotogramas de los dos tutoriales PDF: S3-02 muestra un celular; S3-01 muestra navegador de escritorio/iLovePDF. Por eso S3-02 es principal. La ayuda explica que algunos dispositivos usan Compartir/Imprimir → Guardar como PDF y advierte no subir documentos privados a páginas desconocidas. No se incluyó M2-S2-01B (copia alternativa, duración casi igual y sin aporte distinto confirmado). No se agregó YouTube para rellenar bloques. VIDEO_UPLOAD sigue deshabilitado en el editor general.

## Fuentes y precisión pedagógica

- [Somos Artesanía 2026, MINCETUR](https://www.gob.pe/institucion/mincetur/campa%C3%B1as/140677-somos-artesania-2026): ejemplo histórico, no inscripción abierta. Se invita a revisar bases y fechas vigentes.
- [Ampliación oficial del plazo 2026](https://www.gob.pe/institucion/mincetur/noticias/1389881-mincetur-amplia-el-plazo-de-postulacion-al-concurso-somos-artesania-que-otorgara-mas-de-s-5-7-millones-en-subvenciones): no se presenta la fecha inicial del video como plazo actual.
- [Ruraq Maki, Ministerio de Cultura](https://www.gob.pe/institucion/cultura/campa%C3%B1as/120609-convocatoria-ruraq-maki-hecho-a-mano-edicion-nacional-julio-2026) y [portal de exposición-venta](https://www.ruraqmaki.pe/expoventa): se ubica correctamente junto a ferias/exposiciones, no como concurso de premios.
- [Premio Nacional Amautas 2026](https://www.gob.pe/institucion/mincetur/campa%C3%B1as/141549-premio-nacional-amautas-de-la-artesania-peruana-2026).
- [De Nuestras Manos 2026](https://www.gob.pe/institucion/mincetur/campa%C3%B1as/140905-feria-nacional-de-artesania-de-nuestras-manos-2026), [eventos comerciales de Artesanías del Perú](https://www.artesaniasdelperu.gob.pe/eventoscomerciales).

El Canva/PDF original no está en el repositorio; se utiliza el contenido pedagógico detallado adjunto, no se afirma haber revisado diapositivas inexistentes.

## Publicación segura y progreso

```powershell
pnpm exec tsx scripts/publish-module2.ts --dry-run
pnpm exec tsx scripts/publish-module2.ts --apply
```

Sin --apply solo inspecciona API/HEAD/BD y muestra el plan. Script → servicio → repository → Prisma. La transacción serializable bloquea el curso, rechaza módulo/IDs/recursos inesperados o duplicados y crea/reutiliza solo M2. Compara M1/M3/M4 con sus LessonFile/File y LessonProgress antes/después. Primera publicación: un módulo, cuatro Lesson, cuatro File y cuatro LessonFile; repetición **writes: 0**. Respeta Module.order, Lesson.order y LessonFile.position; no usa LessonFile.order ni cambia schema.

`learningProgress` no cambió: filtra módulos available por catálogo. Ahora cuenta M1(4) + M2(4) + M3(2) = 10; M4 preparing no cuenta. Completar solo M1 o M2 da 40%, ambos 80%. Se recalculan CourseProgress existentes sin borrar LessonProgress; las inscripciones que ya no alcanzan 100% vuelven a ACTIVE. M3 conserva sus seis File/LessonFile/posiciones y offline; Service Worker, IndexedDB, Cache Storage y compatibilidad legacy no se modifican.

## Validación reproducible

`tests/module2-content.test.ts` cubre estructura, selección única, alternativo, ejemplos y disponibilidad/progreso. `tests/module2-real.browser.mjs` crea y elimina una cuenta temporal, recorre los 17 pasos, reproduce cuatro MP4, abre ayudas, decide una oportunidad, marca checklists, revisa ficha, valida layouts 320/390/1365, CTAs libres de navegación inferior, voz y progreso. Con WARMI_TEST_MODULE3=1 ejecuta regresión real M3 y compatibilidad de descarga legacy tras reinicio completo sin red. No guarda credenciales ni capturas en Git.

Resultados en build de producción local, usando Edge/Playwright y PostgreSQL real:

- Typecheck, lint, build, Prisma validate, formato de archivos afectados y git diff --check: correctos.
- 33 pruebas unitarias: correctas, incluyendo contenido M2, catálogo/progreso, offline y selección de voz existente.
- M1: cuatro sesiones, siete MP4 y cuatro apoyos YouTube reproducidos, PDF accesible, narración por API existente y progreso 40% (4/10). IDs y recursos persistidos sin cambios.
- M2: cuatro sesiones y 17 pasos recorridos, cuatro MP4 reproducidos con avance real de tiempo, ayudas/decisiones/checklists/ficha y progreso 40% (4/10). Un paso principal por pantalla y finalización solo al terminar el recorrido.
- Responsive: 320, 390 y 1365 px, sin desbordamiento horizontal. Controles de al menos 44 px; margen de desplazamiento reservado sobre la barra inferior, sin modificar navegación general. Capturas temporales fuera de Git.
- M3: seis MP4 reproducidos online y offline, descarga completa, cierre y reapertura sin red, paquete legacy con courseId anterior, voz, aviso para enlaces externos, reconexión y eliminación: correctos. Recursos: 104293181 bytes; metadatos: 12104; shell: 4621851; payload total observado: 108927136 bytes. El shell puede variar entre builds.
- Publicación repetida: cero escrituras. Las cuentas y progresos temporales de las pruebas se eliminaron.

Pendiente verificación en Android/iOS físicos. Los enlaces externos requieren internet y su disponibilidad no depende de Warmi; DIRCETUR/Gobierno Regional ya daban timeout en la entrega M1 anterior. El título previo M3 difiere entre BD y catálogo; se conserva sin renombrarlo en esta entrega.
