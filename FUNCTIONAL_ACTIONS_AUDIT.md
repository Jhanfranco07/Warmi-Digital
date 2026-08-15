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
