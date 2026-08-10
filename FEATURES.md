# Warmi Digital - Features

## Recorrido rector

Toda feature debe respetar el recorrido:

Descubrir -> Aprender -> Practicar -> Crear -> Compartir -> Comercializar -> Preservar

La experiencia no se organizara por pantallas exportadas, sino por dominios.

## Criterio funcional rector

Warmi Digital no es un ecommerce tradicional. La artesana es la protagonista y el sistema debe acompanarla en un proceso de transformacion: primero aprende y fortalece capacidades, luego documenta su historia y crea confianza cultural, despues comparte con su comunidad y finalmente puede comercializar.

Las features comerciales solo son validas si ayudan a:

- Reforzar autonomia economica.
- Preservar el valor cultural de cada producto.
- Dar transparencia a pedidos y pagos.
- Evitar que la experiencia se reduzca a precio, stock y compra rapida.

Las features de aprendizaje, comunidad, facilitacion, historia y talleres tienen prioridad de producto sobre las features transaccionales.

## Feature map

| Feature | Rol principal | Proposito | Pantallas de referencia |
| --- | --- | --- | --- |
| `auth` | Todos | Login, seleccion de rol, registro inicial | Login, registro desktop/movil, splash |
| `dashboard` | Todos | Entrada personalizada por rol | Dashboards de artesana, facilitadora, admin |
| `learning` | Artesana | Ruta de aprendizaje, progreso, logros, talleres asociados | Panel de aprendizaje movil, dashboards de artesana |
| `courses` | Admin, Facilitadora | Creacion de cursos, modulos, lecciones, recursos y evaluaciones | Creador de cursos, gestion de talleres |
| `community` | Artesana, Facilitadora | Red de saberes, publicaciones, comentarios, apoyo comunitario | Red de saberes desktop/movil |
| `stories` | Artesana | Perfil cultural, historia, identidad, tecnicas y legado | Mi Historia, landing cultural |
| `marketplace` | Publico, Artesana | Galeria cultural curada orientada a patrimonio | Mercado Digital |
| `products` | Artesana, Publico | Fichas culturales, proceso, detalle y adquisicion | Detalle de producto |
| `orders` | Artesana, Admin | Pedidos y movimientos asociados a piezas culturales | Finanzas, historial, dashboards |
| `payments` | Artesana | Metodos de pago, billeteras, cuentas y seguridad | Metodos de pago, mis finanzas |
| `notifications` | Todos | Avisos, hitos, mensajes pendientes y alertas | Dashboards, mensajeria, comunidad |
| `reports` | Admin, Facilitadora | Impacto, seguimiento, progreso, ventas culturales | Dashboard admin, seguimiento facilitadora |
| `profile` | Todos | Perfil de usuario, comunidad, especialidad, archivos | Mi Historia, seguimiento individual |
| `facilitator` | Facilitadora | Grupo asignado, seguimiento, talleres, mensajes | Panel facilitadora, detalle seguimiento |
| `admin` | Admin | Impacto nacional, gestion institucional, cursos | Dashboard admin, creador de cursos |
| `settings` | Todos | Preferencias, seguridad, soporte, configuraciones | Sidebars, pagos, soporte |

## Dominios funcionales

## Fase 5 - Experiencia de Artesana

Se implemento la primera experiencia funcional para `ARTESANA` con dashboard, aprendizaje, detalle de curso, leccion, progreso real, talleres, historia cultural, perfil, convocatorias, vitrina inicial y notificaciones.

La prioridad visual y funcional es aprendizaje, acompanamiento e identidad cultural. La vitrina existe como acceso inicial y no como marketplace completo.

Rutas funcionales principales:

- `/artesana/dashboard`
- `/artesana/aprender`
- `/artesana/aprender/[courseId]`
- `/artesana/aprender/[courseId]/lecciones/[lessonId]`
- `/artesana/talleres`
- `/artesana/mi-historia`
- `/artesana/perfil`
- `/artesana/convocatorias`
- `/artesana/mi-vitrina`

Las mutaciones de aprendizaje e historia usan Server Actions, Zod, servicios y repositorios. No hay consultas Prisma directas desde componentes UI.

### Publico y acceso

Incluye landing, login, registro de artesana y splash movil. Su funcion es introducir Warmi como plataforma de patrimonio, no como tienda.

Componentes dominantes:

- Hero editorial con fotografia cultural.
- Selector de rol.
- Formularios de login y registro.
- Stepper de comunidad/especialidad.
- CTA sobrio orientado a pertenencia.

### Aprendizaje y cursos

Incluye ruta de aprendizaje, curso actual, modulos, progreso, talleres en vivo, logros y constructor institucional de cursos.

Capacidades:

- Trayectos formativos por meses o modulos.
- Progreso por leccion/modulo/curso.
- Recursos descargables.
- Video/audio/material PDF.
- Quizzes y evaluaciones.
- Certificados y badges.
- Gestion de talleres vinculados a cursos.

### Comunidad y saberes

La red comunitaria debe funcionar como plaza digital para compartir avances, dudas tecnicas, historias y celebraciones.

Capacidades:

- Publicaciones con texto, imagen y archivos.
- Comentarios y reacciones.
- Temas o categorias de conversacion.
- Moderacion por facilitadora/admin.
- Notificaciones de apoyo y respuesta.

### Marketplace cultural

El marketplace representa cultura. Las cards muestran fotografia, nombre, comunidad, tecnica, tiempo de elaboracion y frase cultural. El precio solo aparece en detalle.

Capacidades:

- Galeria curada.
- Filtros por comunidad y tecnica.
- Detalle narrativo de producto.
- Historia de la pieza.
- Proceso de elaboracion.
- Perfil de artesana.
- Flujo de adquisicion respetuoso.

No debe incluir patrones de ecommerce masivo como urgencia artificial, ranking por precio, descuentos como protagonista, cards dominadas por costo o copia centrada en compra inmediata.

### Finanzas y pagos

Debe reforzar autonomia economica, transparencia y confianza.

Capacidades:

- Saldo disponible.
- Pagos pendientes.
- Ingresos mensuales.
- Movimientos.
- Exportacion de reporte.
- Vinculacion de Yape, Plin y cuentas bancarias.
- Estados de transaccion.

### Facilitadora

La facilitadora acompana crecimiento, no administra de forma impersonal.

Capacidades:

- Grupo de artesanas asignado.
- Progreso por artesana.
- Alertas de bajo avance o mensajes pendientes.
- Retroalimentacion individual.
- Mensajeria con audio/archivos.
- Talleres, asistencia y recursos.

### Administracion

La administracion observa impacto nacional e institucional.

Capacidades:

- Metricas agregadas de artesanas, comunidades, ventas culturales y alfabetizacion digital.
- Mapa/densidad de participacion.
- Hitos recientes.
- Gestion de cursos.
- Reportes e indicadores.

Indicadores de exito:

- Cursos completados.
- Artesanas activas y capacitadas.
- Comunidades incorporadas.
- Historias culturales documentadas.
- Productos publicados con narrativa patrimonial.
- Talleres realizados y asistencia.
- Participacion en red de saberes.
- Nivel de autonomia digital.
- Ventas culturales como indicador secundario de sostenibilidad.
