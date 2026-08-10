# Warmi Digital - Experiencia de Facilitadora

## Fase 6

La facilitadora acompana procesos de aprendizaje y autonomia digital. No administra el ecosistema completo ni usa el sistema para controlar a las artesanas.

## Permisos y alcance

`FacilitatorAssignment` vincula de forma explicita una facilitadora con cada artesana. Todas las consultas de detalle, seguimiento y apertura de mensajes comprueban esa asignacion activa. Una cuenta `ARTESANA` no puede acceder a rutas `/facilitadora`.

## Rutas

- `/facilitadora/dashboard`
- `/facilitadora/artesanas`
- `/facilitadora/artesanas/[artisanId]`
- `/facilitadora/artesanas/[artisanId]/seguimiento`
- `/facilitadora/cursos`, `/nuevo`, `/[courseId]/editar`
- `/facilitadora/talleres`, `/nuevo`, `/[workshopId]`, `/[workshopId]/asistencia`
- `/facilitadora/convocatorias`
- `/facilitadora/mensajes`
- `/facilitadora/reportes`

## Reglas de seguimiento

- Mas de 14 dias sin actividad: `INACTIVA`.
- Entre 8 y 14 dias sin actividad, progreso menor a 25% o asistencia menor a 50%: `NECESITA_APOYO`.
- Progreso mayor o igual a 80% y asistencia mayor o igual a 75%: `DESTACADA`.
- En otros casos: `AL_DIA`.

Son reglas deterministas para orientar una conversacion humana; no emiten juicios sobre la persona.

## Arquitectura

Las rutas usan servicios (`FacilitatorDashboardService`, `ArtisanMonitoringService`, `FollowUpService`, `MessagingService`, `FacilitatorReportService`) y repositorios. Las mutaciones pasan por Server Actions con Auth, RBAC y Zod.

## Datos de prueba

`facilitadora@warmi.test` / `Warmi123!` queda asignada a `artesana@warmi.test` / `Warmi123!`.
