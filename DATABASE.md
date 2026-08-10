# Warmi Digital - Base de Datos

## Estado de Fase 2

La base de datos queda definida con Prisma ORM y PostgreSQL, usando UUIDs, relaciones explicitas, enums, indices, timestamps y soft delete donde el historial del dominio debe preservarse.

La arquitectura respeta el principio central de Warmi Digital: la comercializacion es consecuencia del aprendizaje, la comunidad y la preservacion cultural. Por eso el modelo separa identidad, formacion, patrimonio, comunidad, marketplace cultural, finanzas, talleres, mensajeria, archivos y auditoria.

## Criterios de diseno

- IDs publicos con `uuid()`.
- PostgreSQL como datasource unico.
- Entidades principales con `createdAt` y `updatedAt`.
- `deletedAt` en entidades donde se requiere soft delete: usuarios, perfiles, comunidades, cursos, productos, historias y metodos de pago.
- Relaciones many-to-many mediante tablas intermedias explicitas.
- Archivos centralizados en `File`.
- Ledger financiero auditable mediante `LedgerEntry`.
- Roles separados en tabla `Role` y asignados por `UserRoleAssignment`.
- Restricciones `Cascade`, `Restrict` y `SetNull` aplicadas segun criticidad historica.

## Entidades por dominio

### Identidad y acceso

- `User`: cuenta base del sistema.
- `Role`: catalogo de roles `ADMIN`, `FACILITADORA`, `ARTESANA`.
- `UserRoleAssignment`: relacion many-to-many entre usuarios y roles.
- `Profile`: identidad publica, comunidad, bio, avatar y datos culturales.
- `Account`, `Session`, `PasswordResetToken`: soporte estructural para Auth.js.

### Comunidades y tecnicas

- `Community`: comunidad cultural o geografica.
- `CraftType`: tecnica artesanal normalizada.
- `ProfileCraftType`: especialidades de una artesana.

### Aprendizaje

- `Course`: trayecto formativo.
- `Module`: bloque ordenado del curso.
- `Lesson`: unidad de aprendizaje.
- `Enrollment`: inscripcion de una artesana.
- `LessonProgress`: avance granular por leccion.
- `CourseProgress`: resumen calculable por curso.
- `Badge`: logro institucional o cultural.
- `UserBadge`: emision de badges.
- `Certificate`: certificacion emitida y asociada opcionalmente a archivo.

### Patrimonio e historias

- `Story`: historia cultural documentada.
- `StoryFile`: archivos asociados a historias.

### Marketplace cultural

- `Category`: categoria curada.
- `Product`: pieza cultural con tecnica, comunidad, historia, frase cultural, tiempo de elaboracion y precio interno.
- `ProductImage`: imagenes normalizadas mediante `File`.
- `Order`: pedido.
- `OrderItem`: productos dentro del pedido.

Regla de producto: `price` existe para operaciones de detalle, orden y pago, pero no debe exponerse en cards de marketplace.

### Finanzas

- `Wallet`: saldo por usuaria.
- `PaymentMethod`: Yape, Plin, cuenta bancaria u otro metodo.
- `Payment`: pago asociado a orden.
- `LedgerEntry`: registro auditable de ventas, retiros, comisiones, reembolsos y ajustes.
- `Payout`: retiro hacia metodo de pago.

### Talleres y asistencia

- `Workshop`: sesion formativa presencial, virtual o hibrida.
- `WorkshopRegistration`: registro de artesanas a talleres.
- `Attendance`: asistencia validada.

### Comunicaciones

- `Announcement`: comunicado o convocatoria.
- `Conversation`: hilo de mensajeria.
- `Participant`: participantes del hilo.
- `Message`: mensaje de texto, audio, archivo, imagen o video.
- `MessageFile`: archivos adjuntos.
- `Notification`: notificacion accionable por usuario.

### Archivos y auditoria

- `File`: archivo subido, proveedor, tipo, mime, tamano y owner.
- `LessonFile`: recursos de lecciones.
- `AuditLog`: eventos criticos del sistema.

## Enums implementados

```txt
UserRole = ADMIN | FACILITADORA | ARTESANA
CourseLevel = BEGINNER | INTERMEDIATE | ADVANCED
CourseStatus = DRAFT | PUBLISHED | ARCHIVED
LessonType = TEXT | VIDEO | AUDIO | PDF | QUIZ | ASSIGNMENT
EnrollmentStatus = ACTIVE | COMPLETED | PAUSED | CANCELLED
ProductStatus = DRAFT | REVIEW | PUBLISHED | ARCHIVED
OrderStatus = PENDING | CONFIRMED | IN_PROGRESS | SHIPPED | COMPLETED | CANCELLED
PaymentStatus = PENDING | PAID | FAILED | REFUNDED
WorkshopStatus = DRAFT | SCHEDULED | ONGOING | COMPLETED | CANCELLED
WorkshopMode = IN_PERSON | VIRTUAL | HYBRID
WorkshopRegistrationStatus = REGISTERED | CONFIRMED | CANCELLED
NotificationType = SYSTEM | LEARNING | COMMUNITY | ORDER | PAYMENT | SUPPORT
FileType = IMAGE | VIDEO | AUDIO | DOCUMENT | CERTIFICATE | OTHER
MessageType = TEXT | IMAGE | FILE | AUDIO | VIDEO
BadgeType = LEARNING | CULTURE | IMPACT | PROGRESS
CraftTypeEnum = TEJIDO | BORDADO | CERAMICA | JOYERIA | TEXTIL
PaymentMethodType = YAPE | PLIN | BANK_ACCOUNT | OTHER
PaymentMethodStatus = PENDING | ACTIVE | DISABLED | REJECTED
LedgerEntryType = SALE | PAYOUT | PLATFORM_FEE | REFUND | ADJUSTMENT
LedgerEntryStatus = PENDING | POSTED | REVERSED
PayoutStatus = REQUESTED | PROCESSING | PAID | FAILED | CANCELLED
AuditAction = CREATE | UPDATE | DELETE | LOGIN | LOGOUT | RESET_PASSWORD
```

Nota: Prisma no permite un modelo y un enum con el mismo nombre. Por eso el modelo requerido se mantiene como `CraftType` y el enum tecnico se denomina `CraftTypeEnum`.

## Indices principales

- `User.email` unico.
- `Role.name` unico.
- `Community.name` y `Community.slug` unicos.
- `Course.slug`, `Course.status`, `Course.level`.
- `Lesson.slug`, `Lesson.moduleId`.
- `Enrollment.userId + courseId` unico.
- `Product.slug`, `Product.status`, `Product.communityId`, `Product.craftTypeId`.
- `Order.buyerId`, `Order.status`.
- `Payment.orderId`, `Payment.status`.
- `PaymentMethod.userId`, `PaymentMethod.walletId`, `PaymentMethod.type`, `PaymentMethod.status`.
- `LedgerEntry.userId`, `LedgerEntry.walletId`, `LedgerEntry.type`, `LedgerEntry.status`.
- `Workshop.facilitatorId`, `Workshop.status`, `Workshop.startsAt`.
- `Conversation.createdById`, `Participant.userId`.
- `Message.conversationId`, `Message.senderId`.
- `Notification.userId`, `Notification.type`.
- `File.ownerId`, `File.type`.
- `AuditLog.actorId`, `AuditLog.entity + entityId`.

## Seed inicial

`prisma/seed.ts` crea:

- Roles: `ADMIN`, `FACILITADORA`, `ARTESANA`.
- Administrador principal `admin@warmidigital.org`.
- Comunidades de ejemplo.
- Categorias culturales.
- Tipos de artesania.
- Cursos iniciales.
- Badges iniciales.

El seed se ejecuta con:

```bash
pnpm prisma:seed
```

## Migracion inicial

La primera migracion esta en:

```txt
prisma/migrations/20260810120000_initial_database_architecture/migration.sql
```

Contiene la creacion completa de enums, tablas, claves primarias, claves foraneas, indices y restricciones generadas desde el schema Prisma.

## Mejoras futuras

## Fase 5 - Ajustes de Experiencia Artesana

Para soportar progreso real de lecciones se agregaron campos a `LessonProgress`:

- `startedAt`
- `lastAccessedAt`

Para que `Story` represente una ficha de patrimonio cultural vivo, separada de datos personales de `Profile`, se agregaron campos opcionales:

- `publicName`
- `personalStory`
- `artisanJourney`
- `knowledgeOrigin`
- `learnedFrom`
- `techniques`
- `culturalMeaning`

La migracion aplicada es:

```txt
prisma/migrations/20260810170000_phase5_artisan_experience/migration.sql
```

El seed crea la cuenta `artesana@warmi.test` con curso, progreso, taller, historia, convocatoria, producto, pedido, notificaciones e insignia inicial.

- Agregar tablas de comunidad social mas detalladas (`CommunityPost`, `CommunityComment`, `Reaction`, `Topic`) cuando se implemente la feature de red de saberes.
- Agregar versionado de historias y productos culturales para auditoria editorial.
- Agregar tablas de evaluaciones si los quizzes requieren preguntas/respuestas persistentes.
- Agregar multitenancy institucional si Warmi se expande por regiones u organizaciones aliadas.
- Agregar `directUrl` para entornos serverless cuando se configure Vercel/PostgreSQL administrado.
