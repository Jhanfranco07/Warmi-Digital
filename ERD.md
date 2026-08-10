# Warmi Digital - ERD

## Diagrama textual

```txt
User 1--1 Profile
User n--m Role via UserRoleAssignment
Profile n--1 Community
Profile n--m CraftType via ProfileCraftType

Course 1--n Module
Module 1--n Lesson
User 1--n Enrollment
Course 1--n Enrollment
Enrollment 1--1 CourseProgress
Enrollment 1--n LessonProgress
Lesson 1--n LessonProgress
User n--m Badge via UserBadge
User 1--n Certificate
Course 1--n Certificate

User 1--n Story
Community 1--n Story
CraftType 1--n Story
Story n--m File via StoryFile

Category 1--n Product
Community 1--n Product
CraftType 1--n Product
User(ARTESANA) 1--n Product
Product 1--n ProductImage
ProductImage n--1 File

User 1--n Order
Order 1--n OrderItem
Product 1--n OrderItem
Order 1--1 Payment
User 1--1 Wallet
Wallet 1--n Payment
User 1--n PaymentMethod
Wallet 1--n PaymentMethod
Wallet 1--n LedgerEntry
Wallet 1--n Payout
Payment 1--n LedgerEntry
Payout 1--n LedgerEntry

User(FACILITADORA) 1--n Workshop
Course 1--n Workshop
Module 1--n Workshop
Workshop 1--n WorkshopRegistration
User 1--n WorkshopRegistration
Workshop 1--n Attendance
User 1--n Attendance

User 1--n Conversation
Conversation 1--n Participant
User 1--n Participant
Conversation 1--n Message
User 1--n Message
Message n--m File via MessageFile

User 1--n Notification
User 1--n File
Lesson n--m File via LessonFile
User 1--n AuditLog
```

## Entidades y responsabilidades

| Entidad                | Responsabilidad                                         |
| ---------------------- | ------------------------------------------------------- |
| `User`                 | Cuenta autenticable y actor principal del sistema       |
| `Role`                 | Catalogo de roles operativos                            |
| `UserRoleAssignment`   | Asignacion many-to-many de roles                        |
| `Profile`              | Identidad cultural y datos publicos del usuario         |
| `Community`            | Comunidad cultural/geografica                           |
| `CraftType`            | Tecnica artesanal normalizada                           |
| `Course`               | Trayecto formativo                                      |
| `Module`               | Agrupador ordenado de lecciones                         |
| `Lesson`               | Unidad granular de aprendizaje                          |
| `Enrollment`           | Inscripcion de artesana en curso                        |
| `LessonProgress`       | Progreso por leccion                                    |
| `CourseProgress`       | Resumen del progreso del curso                          |
| `Badge`                | Logro o reconocimiento                                  |
| `Certificate`          | Certificacion emitida                                   |
| `Story`                | Narrativa cultural documentada                          |
| `Category`             | Categoria curada para productos/cursos                  |
| `Product`              | Pieza cultural comercializable con contexto patrimonial |
| `ProductImage`         | Imagen normalizada de producto                          |
| `Order`                | Pedido                                                  |
| `OrderItem`            | Detalle de pedido                                       |
| `Payment`              | Pago asociado a pedido                                  |
| `Wallet`               | Saldo financiero de la usuaria                          |
| `PaymentMethod`        | Metodo de cobro o retiro                                |
| `LedgerEntry`          | Movimiento financiero auditable                         |
| `Payout`               | Retiro desde wallet                                     |
| `Workshop`             | Taller formativo                                        |
| `WorkshopRegistration` | Registro de participante a taller                       |
| `Attendance`           | Asistencia a taller                                     |
| `Announcement`         | Comunicado o convocatoria                               |
| `Conversation`         | Hilo de mensajeria                                      |
| `Participant`          | Usuario dentro de una conversacion                      |
| `Message`              | Mensaje enviado                                         |
| `Notification`         | Notificacion por usuario                                |
| `File`                 | Archivo centralizado                                    |
| `AuditLog`             | Trazabilidad de eventos criticos                        |

## Cardinalidades clave

- Un `User` tiene un solo `Profile`; un `Profile` pertenece a un solo `User`.
- Un `User` puede tener varios `Role` mediante `UserRoleAssignment`.
- Una `Community` puede agrupar muchos perfiles, productos e historias.
- Una artesana puede tener varias tecnicas mediante `ProfileCraftType`.
- Un `Course` contiene muchos `Module`; un `Module` contiene muchas `Lesson`.
- Una inscripcion (`Enrollment`) une usuario y curso con restriccion unica.
- `LessonProgress` evita duplicidad con `@@unique([enrollmentId, lessonId])`.
- Un `Product` pertenece a una artesana, una comunidad, una categoria y una tecnica.
- Un `Order` puede contener multiples `OrderItem` y tiene como maximo un `Payment`.
- `Wallet`, `PaymentMethod`, `LedgerEntry` y `Payout` separan saldo, medios de cobro, movimientos y retiros.
- `WorkshopRegistration` evita inscripciones duplicadas con `@@unique([workshopId, userId])`.
- `Attendance` evita doble asistencia con `@@unique([workshopId, userId])`.
- `Conversation` se relaciona con usuarios por `Participant`, permitiendo hilos de dos o mas personas.
- `File` se reutiliza mediante tablas puente para lecciones, mensajes e historias.

## Reglas de integridad

- Eliminacion de `User` elimina perfil, sesiones, archivos propios dependientes, notificaciones y asignaciones de rol donde corresponde.
- Productos, ordenes, pagos, certificados y movimientos financieros usan `Restrict` o `SetNull` para preservar historial.
- Comunidad y tecnica se referencian por FK; no se duplican como texto libre en productos.
- El precio existe en `Product`, pero la capa de UI no debe usarlo en cards de marketplace.
- El ledger financiero es la fuente de auditoria; balances pueden derivarse o reconciliarse desde `LedgerEntry`.

## Migracion

La migracion inicial `20260810120000_initial_database_architecture` crea:

- 22 enums.
- Tablas de identidad, aprendizaje, patrimonio, productos, pedidos, pagos, talleres, mensajeria, archivos y auditoria.
- Indices para correo, roles, productos, pedidos, cursos, comunidades, mensajes y notificaciones.
- Foreign keys con `Cascade`, `Restrict` y `SetNull`.
