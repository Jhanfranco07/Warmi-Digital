# Warmi Digital - Auditoria de acciones funcionales

Fecha: 2026-08-15

Esta auditoria clasifica botones, links y acciones visibles antes de convertirlos en operaciones reales. Criterio final de esta fase: cada accion visible debe ser funcional o retirarse de la interfaz.

| Modulo                       | Accion visible                    | Estado actual            | Accion requerida                                           |
| ---------------------------- | --------------------------------- | ------------------------ | ---------------------------------------------------------- |
| Auth - Login                 | Cambiar rol artesana/facilitadora | FUNCIONAL visual         | Mantener; no permitir autologin sin credenciales           |
| Auth - Login                 | Ingresar                          | FUNCIONAL                | Mantener validacion server action                          |
| Auth - Register              | Crear cuenta artesana             | FUNCIONAL parcial        | Mantener solo artesana; facilitadora debe crearla admin    |
| Artesana - Inicio            | Continuar mi aprendizaje          | FUNCIONAL parcial        | Enlazar al curso/leccion real activa                       |
| Artesana - Inicio            | Ver talleres                      | FUNCIONAL parcial        | Consumir talleres reales                                   |
| Artesana - Inicio            | Editar mi historia                | FUNCIONAL parcial        | Mantener link a formulario real                            |
| Artesana - Inicio            | Mi vitrina                        | FUNCIONAL parcial        | Mostrar productos reales, sin demo                         |
| Artesana - Inicio            | Convocatorias                     | FUNCIONAL parcial        | Mostrar convocatorias reales                               |
| Artesana - Mi aprendizaje    | Ver curso / Continuar             | FUNCIONAL parcial        | Usar enrollments reales y crear inscripcion si corresponde |
| Artesana - Mi aprendizaje    | Carrusel/flechas                  | SIN ACCION               | Convertir a paginacion real o eliminar                     |
| Artesana - Leccion           | Completar leccion                 | FUNCIONAL                | Revisar invalidacion/cache y feedback                      |
| Artesana - Leccion           | Descargar material                | FUNCIONAL si hay archivo | Validar permisos y URL real                                |
| Artesana - Leccion           | Escuchar audio                    | INCOMPLETO               | Crear AudioHelpButton y soporte opcional en Lesson/File    |
| Artesana - Talleres          | Ver detalles                      | FUNCIONAL parcial        | Enlazar a taller real                                      |
| Artesana - Talleres          | Inscribirme / participar          | INCOMPLETO               | Crear Server Action de registro                            |
| Artesana - Mi historia       | Editar / guardar historia         | FUNCIONAL parcial        | Completar imagen, galeria y campos culturales              |
| Artesana - Mi historia       | Agregar imagen                    | INCOMPLETO               | Usar ImageUpload/GalleryManager                            |
| Artesana - Mi vitrina        | Crear pieza                       | FUNCIONAL parcial        | Completar subida de imagen principal y galeria             |
| Artesana - Mi vitrina        | Favorito/corazon                  | PLACEHOLDER              | Implementar favoritos o retirar                            |
| Artesana - Mi vitrina        | Filtrar tecnica                   | PLACEHOLDER              | Implementar filtro real sobre productos                    |
| Artesana - Mis pedidos       | Filtros                           | PLACEHOLDER              | Implementar filtros de OrderRepository                     |
| Artesana - Mis pedidos       | Ver todos / historial             | INCOMPLETO               | Implementar detalle/historial                              |
| Artesana - Convocatorias     | Buscar / filtros                  | PLACEHOLDER              | Implementar query params o server filtering                |
| Artesana - Mensajes          | Nuevo mensaje / enviar            | INCOMPLETO               | Conectar MessageRepository y server action                 |
| Artesana - Perfil            | Editar datos                      | INCOMPLETO               | Crear forms de perfil y avatar                             |
| Artesana - Perfil            | Cerrar sesion                     | FUNCIONAL                | Mantener                                                   |
| Facilitadora - Inicio        | Ver todas artesanas               | FUNCIONAL parcial        | Mantener con datos reales                                  |
| Facilitadora - Inicio        | Contactar                         | FUNCIONAL parcial        | Abrir conversacion real                                    |
| Facilitadora - Inicio        | Ver calendario/reportes           | FUNCIONAL parcial        | Mantener rutas                                             |
| Facilitadora - Mis artesanas | Buscar / filtros                  | PLACEHOLDER              | Implementar filtros reales                                 |
| Facilitadora - Mis artesanas | Ver perfil                        | FUNCIONAL parcial        | Eliminar fallback demo                                     |
| Facilitadora - Seguimiento   | Registrar seguimiento             | FUNCIONAL parcial        | Validar ownership y persistencia                           |
| Facilitadora - Cursos        | Nuevo curso                       | FUNCIONAL parcial        | Completar portada, modulos, lecciones, materiales          |
| Facilitadora - Cursos        | Buscar / filtros                  | PLACEHOLDER              | Implementar filtros reales                                 |
| Facilitadora - Cursos        | Editar / Ver detalle              | FUNCIONAL parcial        | Completar detalle real                                     |
| Facilitadora - Talleres      | Nuevo taller                      | FUNCIONAL parcial        | Agregar imagen, materiales y participantes                 |
| Facilitadora - Talleres      | Registrar asistencia              | FUNCIONAL parcial        | Validar ownership y persistencia                           |
| Facilitadora - Convocatorias | Nueva convocatoria                | FUNCIONAL parcial        | Completar publicar/cerrar/archivar/documentos              |
| Facilitadora - Convocatorias | Editar / Publicar                 | PLACEHOLDER              | Conectar actions o retirar hasta implementar               |
| Facilitadora - Mensajes      | Nuevo mensaje / Enviar            | FUNCIONAL parcial        | Conectar conversaciones reales y adjuntos                  |
| Facilitadora - Reportes      | Exportar / Ver detalle            | PLACEHOLDER              | Implementar export o retirar                               |
| Facilitadora - Perfil        | Editar datos / cambiar contrasena | INCOMPLETO               | Crear forms y server actions                               |
| Facilitadora - Perfil        | Cerrar sesion                     | FUNCIONAL                | Mantener                                                   |
| Admin - Inicio               | Gestion global                    | INCOMPLETO               | Implementar modulos admin completos                        |

## Prioridad de funcionalizacion

1. Infraestructura de archivos: FileRepository, validaciones y componentes upload reutilizables.
2. Artesana: perfil, historia, vitrina/productos y cursos.
3. Facilitadora: seguimiento, cursos, talleres, convocatorias y mensajes.
4. Admin: usuarios, comunidades, mercado cultural, comunicaciones y reportes.
5. Limpieza final de fallbacks demo y pruebas E2E manuales.

## Actualizacion Tanda 2 - Artesana

Fecha: 2026-08-15

| Modulo                    | Accion visible                          | Estado actualizado                                                                                                  |
| ------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Artesana - Inicio         | Continuar mi aprendizaje                | FUNCIONAL: enlaza al curso real activo o a la ruta de aprendizaje.                                                  |
| Artesana - Inicio         | Ver talleres                            | FUNCIONAL: enlaza a `/artesana/talleres` con datos reales.                                                          |
| Artesana - Inicio         | Editar mi historia                      | FUNCIONAL: enlaza al formulario real de historia.                                                                   |
| Artesana - Inicio         | Convocatorias / Mi vitrina / Mis logros | FUNCIONAL: enlazan a rutas reales con datos de PostgreSQL o EmptyState.                                             |
| Artesana - Mi aprendizaje | Ver curso / Continuar                   | FUNCIONAL: usa inscripciones reales y rutas de curso.                                                               |
| Artesana - Mi aprendizaje | Carrusel/flechas                        | RETIRADO/DESHABILITADO: no se mantiene control decorativo sin accion real.                                          |
| Artesana - Leccion        | Descargar material                      | FUNCIONAL cuando existe `LessonFile`.                                                                               |
| Artesana - Leccion        | Escuchar audio                          | FUNCIONAL cuando existe archivo `AUDIO`; no aparece si no hay audio.                                                |
| Artesana - Talleres       | Ver detalles                            | FUNCIONAL hacia listado real; detalle individual queda deshabilitado cuando no existe ruta canonica en `ROUTES.md`. |
| Artesana - Mi historia    | Editar / guardar historia               | FUNCIONAL con React Hook Form, Zod y Server Action.                                                                 |
| Artesana - Mi historia    | Galeria                                 | FUNCIONAL: subir, eliminar y reordenar mediante `StoryGalleryManager`.                                              |
| Artesana - Mi vitrina     | Crear pieza / administrar pieza         | FUNCIONAL segun infraestructura previa de vitrina y productos.                                                      |
| Artesana - Mis pedidos    | Visualizar por estado                   | FUNCIONAL con datos reales; detalle individual queda pendiente si se aprueba la ruta.                               |
| Artesana - Convocatorias  | Abrir enlace / documento                | FUNCIONAL cuando existe URL oficial o archivo; boton deshabilitado si no existe recurso.                            |
| Artesana - Mi comunidad   | Editar historia desde comunidad         | FUNCIONAL: enlaza a `/artesana/mi-historia`; no se inventa red social sin modelo.                                   |
| Artesana - Mensajes       | Abrir conversacion / enviar mensaje     | FUNCIONAL con Server Action y revalidacion.                                                                         |
| Artesana - Perfil         | Editar perfil / avatar / contrasena     | FUNCIONAL con Server Actions y validacion Zod.                                                                      |
| Artesana - Perfil         | Cerrar sesion                           | FUNCIONAL.                                                                                                          |
| Artesana - Logros         | Consultar logros                        | FUNCIONAL con datos reales o EmptyState.                                                                            |
| Artesana - Ayuda          | Consultar soporte                       | FUNCIONAL como contenido institucional estatico.                                                                    |

Pendientes reales no cerrados en esta tanda: detalle individual de pedido, detalle individual de taller y administracion de Wallet/Yape/Plin si se aprueban rutas y reglas de negocio especificas.
