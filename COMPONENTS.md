# Warmi Digital - Componentes

## Criterio de abstraccion

Todo componente repetido se abstraera. La abstraccion se hara por responsabilidad, no por pantalla exportada. Los componentes visuales base viviran en `shared/components`; los componentes especificos de dominio viviran dentro de su feature.

## Componentes base

| Componente | Uso |
| --- | --- |
| `Button` | Acciones primarias, secundarias, ghost, icon-only |
| `Card` | Contenedores de informacion y listas |
| `Sidebar` | Navegacion desktop por rol |
| `Navbar` | Navegacion publica y headers internos |
| `BottomNavigation` | Navegacion movil por rol |
| `Modal/Dialog/Sheet` | Confirmaciones, formularios y detalle contextual |
| `Breadcrumb` | Navegacion jerarquica en admin/facilitadora |
| `Timeline` | Ruta de aprendizaje, proceso cultural, actividad reciente |
| `Progress` | Avance de curso, modulo, perfil |
| `Badge` | Estados, logros, tecnicas, comunidades |
| `Search` | Busqueda de artesanas, recursos, conversaciones |
| `Table` | Finanzas, pedidos, artesanas, cursos |
| `Chart` | Impacto, progreso, reportes |
| `Avatar` | Usuarios, artesanas, facilitadoras |
| `Pagination` | Listas extensas |
| `Calendar` | Talleres y programacion |
| `Tabs` | Secciones de perfil, pagos, detalle |
| `Accordion` | Preguntas, recursos, filtros |
| `Toast` | Confirmaciones con Sonner |
| `Skeleton` | Estados de carga |
| `Upload` | Fotos, recursos, PDFs, audio |

## Componentes de dominio

### Aprendizaje

- `LearningPath`
- `CourseProgressCard`
- `ModuleTimeline`
- `LessonPlayer`
- `AchievementGrid`
- `CertificateCard`
- `WorkshopCard`

### Comunidad

- `CommunityPostCard`
- `PostComposer`
- `CommentThread`
- `ReactionBar`
- `TopicList`
- `CommunityHighlight`

### Marketplace y productos

- `CulturalProductCard`
- `ProductGallery`
- `ProductStorySection`
- `CraftProcessTimeline`
- `ArtisanAttribution`
- `AcquisitionPanel`

Regla: `CulturalProductCard` nunca muestra precio.

### Finanzas

- `FinanceSummaryCard`
- `MovementTable`
- `PaymentMethodCard`
- `LedgerStatusBadge`
- `PayoutActionPanel`

### Facilitadora

- `ArtisanProgressRow`
- `ArtisanFollowUpCard`
- `FacilitatorAlertList`
- `FeedbackPanel`
- `ConversationPanel`
- `WorkshopScheduler`
- `ResourceRepository`

### Admin

- `ImpactMetricCard`
- `NationalImpactMap`
- `MilestoneFeed`
- `CourseBuilder`
- `ModuleBuilderItem`
- `ReportFilterBar`

## Patrones visuales repetidos detectados

- Cards con icono, titulo, valor y subtitulo.
- Listas de actividad reciente.
- Timelines verticales para aprendizaje/proceso.
- Sidebars con avatar/rol arriba y acciones abajo.
- Navbars translucidas en experiencias publicas.
- Bottom bars moviles con icono y label.
- Formularios por pasos.
- Filtros tipo select/chip.
- Tablas de seguimiento y movimientos.
- Mensajeria con lista lateral, conversacion central y panel de contexto.

## Reglas de implementacion

- No duplicar cards por feature si solo cambia contenido.
- Los dashboards por rol no se reutilizan como composicion, pero pueden usar componentes base compartidos.
- Iconografia se implementara con Lucide, mapeando los iconos Material del prototipo a equivalentes.
- shadcn/ui se usara para Dialog, Sheet, Dropdown, Tabs, Accordion, Table, Calendar, Tooltip, Form y Toast.
- Framer Motion se reserva para microinteracciones suaves, entrada de secciones y transiciones no intrusivas.

## Fase 4 - Libreria Visual Implementada

### Componentes UI base nuevos

| Componente | Proposito | Props principales | Variantes | Base utilizada |
| --- | --- | --- | --- | --- |
| `Textarea` | Entrada multilínea | props nativas textarea | disabled/focus | HTML + tokens |
| `Select` | Selección accesible | `value`, `onValueChange` | items/group | Radix Select |
| `Checkbox` | Selección binaria | `checked`, `onCheckedChange` | checked/disabled | Radix Checkbox |
| `RadioGroup` | Selección única | `value`, `onValueChange` | vertical por defecto | Radix RadioGroup |
| `Switch` | Toggle binario | `checked`, `onCheckedChange` | checked/unchecked | Radix Switch |
| `Tooltip` | Ayuda contextual | `children`, `sideOffset` | provider/content | Radix Tooltip |
| `Popover` | Contenido flotante | `align`, `sideOffset` | popper | Radix Popover |
| `DropdownMenu` | Menú contextual | items, checkbox, radio, submenus | item/label/separator | Radix Dropdown |
| `Tabs` | Vistas segmentadas | `value`, `defaultValue` | active/disabled | Radix Tabs |
| `Accordion` | Contenido expandible | `type`, `value` | single/multiple | Radix Accordion |
| `Table` | Datos tabulares | elementos semánticos table | header/body/footer | HTML semántico |
| `Progress` | Avance visual | `value` | default | Radix Progress |
| `Alert` | Mensajes del sistema | `variant` | default/destructive/success/warning | Card-like tokens |
| `Pagination` | Navegación paginada | `items`, `previousHref`, `nextHref` | active/disabled | Button + Link |
| `Search` | Campo de búsqueda | `value`, `onChange`, `onClear` | clearable | Input |
| `Calendar` | Selector de fecha base | props input date | default | Input |
| `Timeline` | Secuencia de hitos | `items` | complete/current/pending | HTML semántico |
| `LoadingSpinner` | Carga inline | `label` | default | Lucide |
| `ConfirmDialog` | Confirmación | `open`, `onConfirm` | confirm/cancel | Dialog |
| `FileUpload` | Selección de archivo | input file props | dashed drop area | HTML input |
| `ImageUpload` | Selección de imagen | input file props | image accept | FileUpload |
| `StatCard` | Métrica simple | `label`, `value`, `icon` | default/success/warning | Card |
| `MetricCard` | KPI con tendencia | `title`, `value`, `trend` | badge trend | Card + Badge |

### Componentes de dominio nuevos

Todos los componentes de dominio son estructurales, tipados y sin lógica de negocio. Componen sobre `Card`, `Badge`, `Avatar`, `Progress` o `Button`.

| Componente | Proposito | Props principales | Componente base |
| --- | --- | --- | --- |
| `CourseCard` | Curso visual | `title`, `description`, `level`, `progress` | `BaseDomainCard` + `Progress` |
| `LessonCard` | Lección visual | `title`, `description`, `duration` | `BaseDomainCard` |
| `WorkshopCard` | Taller visual | `title`, `date`, `mode` | `BaseDomainCard` |
| `ProductCard` | Pieza cultural | `name`, `artisanName`, `community`, `technique`, `makingTime`, `culturalPhrase`, `imageUrl` | `Card` |
| `StoryCard` | Historia cultural | `title`, `description`, `imageUrl` | `BaseDomainCard` |
| `CommunityCard` | Comunidad | `title`, `description`, `meta` | `BaseDomainCard` |
| `NotificationCard` | Notificación visual | `title`, `description`, `meta` | `BaseDomainCard` |
| `MessageCard` | Mensaje visual | `title`, `description`, `avatarUrl`, `senderInitials` | `BaseDomainCard` + `Avatar` |
| `OrderCard` | Pedido visual | `title`, `description`, `badge` | `BaseDomainCard` |
| `ArtisanCard` | Perfil de artesana | `title`, `description`, `imageUrl` | `BaseDomainCard` |
| `FacilitatorCard` | Perfil de facilitadora | `title`, `description`, `imageUrl` | `BaseDomainCard` |
| `OpportunityCard` | Convocatoria | `title`, `description`, `meta` | `BaseDomainCard` |
| `BadgeCard` | Logro visual | `title`, `description`, `badge` | `BaseDomainCard` |

Regla cultural: `ProductCard` no tiene prop de precio y no muestra precio.

### Navegación

La navegación vive en `shared/config/navigation.config.ts` y define menús por rol:

- `ARTESANA`: navegación simple, humana y educativa.
- `FACILITADORA`: navegación operativa para seguimiento.
- `ADMIN`: navegación ejecutiva para gestión.

`Sidebar` usa navegación permanente en desktop y `MobileNavigation` usa `Sheet` en mobile/tablet.

## Fase 5 - Componentes de Artesana

Se agregaron componentes especificos de experiencia:

- `features/artisan/lesson-completion-button.tsx`: completa lecciones mediante Server Action, muestra feedback con Sonner y animacion breve con Framer Motion.
- `features/artisan/story-form.tsx`: formulario de historia cultural con React Hook Form, Zod y Server Action.
- `features/artisan/coming-soon.tsx`: estado estructural para rutas existentes pero no implementadas en esta fase.

Se reutilizaron `CourseCard`, `ProductCard`, `EmptyState`, `PageHeader`, `Progress`, `Tabs`, `Card`, `Badge`, `Button`, `Select`, `Textarea` e `Input`.
