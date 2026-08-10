# Warmi Digital - Experiencia de Artesana

## Estado de Fase 5

La experiencia principal de la artesana autenticada queda implementada con datos reales desde PostgreSQL mediante Prisma. La pantalla prioriza aprendizaje, acompanamiento, comunidad, identidad cultural y comercializacion como consecuencia del proceso.

## Cuenta de prueba

```txt
Correo: artesana@warmi.test
Contrasena: Warmi123!
Rol: ARTESANA
```

## Flujo implementado

La artesana puede ingresar a `/artesana/dashboard`, revisar su avance, continuar un curso, abrir una leccion, marcarla como completada, ver talleres, editar su historia cultural, revisar convocatorias, ver su vitrina inicial, consultar notificaciones y navegar por los modulos principales.

```txt
Aprender -> Practicar -> Crear -> Compartir -> Comercializar -> Preservar
```

## Rutas

| Ruta                                                 | Estado            | Proposito                               |
| ---------------------------------------------------- | ----------------- | --------------------------------------- |
| `/artesana/dashboard`                                | Funcional         | Inicio personalizado                    |
| `/artesana/aprender`                                 | Funcional         | Cursos inscritos y disponibles          |
| `/artesana/aprender/[courseId]`                      | Funcional         | Detalle de curso                        |
| `/artesana/aprender/[courseId]/lecciones/[lessonId]` | Funcional         | Leccion y completado real               |
| `/artesana/talleres`                                 | Funcional         | Talleres de la artesana                 |
| `/artesana/mi-historia`                              | Funcional         | Ficha cultural editable                 |
| `/artesana/perfil`                                   | Funcional         | Perfil separado por secciones           |
| `/artesana/convocatorias`                            | Funcional         | Oportunidades registradas               |
| `/artesana/mi-vitrina`                               | Funcional inicial | Productos existentes sin precio en card |
| `/artesana/mi-comunidad`                             | Proximamente      | Ruta reservada                          |
| `/artesana/mis-pedidos`                              | Proximamente      | Ruta reservada                          |
| `/artesana/mensajes`                                 | Proximamente      | Ruta reservada                          |
| `/artesana/logros`                                   | Proximamente      | Ruta reservada                          |
| `/artesana/ayuda`                                    | Proximamente      | Ruta reservada                          |

## Capa server

Repositories: `ArtisanRepository`, `CourseRepository`, `ProgressRepository`, `WorkshopRepository`, `StoryRepository`, `AnnouncementRepository`, `ProductRepository`, `OrderRepository`, `NotificationRepository`, `CommunityRepository`.

Services: `ArtisanDashboardService`, `LearningService`, `ProgressService`, `StoryService`, `WorkshopService`, `OpportunityService`, `ArtisanShowcaseService`.

Server Actions: `completeLessonAction`, `updateStoryAction`.

## Seguridad

Todas las rutas funcionales requieren rol `ARTESANA`. Las consultas usan `userId` de sesion y las mutaciones validan propiedad mediante inscripcion o historia asociada a la artesana.

## Base de datos

Migracion aplicada:

```txt
prisma/migrations/20260810170000_phase5_artisan_experience/migration.sql
```

Se agregaron timestamps de progreso de leccion y campos culturales opcionales en `Story`.

## Pendientes

Marketplace publico completo, gestion completa de pedidos, postulaciones complejas, chat en tiempo real, paneles funcionales de facilitadora/admin, reportes avanzados y PWA/offline.
