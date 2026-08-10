# Warmi Digital - Plan de Implementacion

## Regla de trabajo

No se desarrollara toda la aplicacion de una vez. Cada fase comienza con objetivos, archivos, dependencias, riesgos y arquitectura. Al terminar cada fase se espera aprobacion antes de avanzar.

Antes de cada fase se debe validar que el alcance respete la vision del dominio: aprendizaje, acompanamiento, comunidad, autonomia y preservacion cultural primero; comercializacion despues. Ninguna fase debe convertir Warmi Digital en un ecommerce tradicional.

## Fase 0 - Documentacion y aprobacion

Estado: completada con estos documentos.

Entregables:

- `ARCHITECTURE.md`
- `FEATURES.md`
- `DATABASE.md`
- `ROUTES.md`
- `COMPONENTS.md`
- `DESIGN_SYSTEM.md`
- `IMPLEMENTATION_PLAN.md`

Riesgos:

- Capturas corruptas en cuatro pantallas.
- Idioma y nombres de producto inconsistentes.
- Duplicidad de variantes de dashboards.

Salida requerida: aprobacion del usuario para iniciar Fase 1.

## Fase 1 - Fundacion del proyecto

Objetivos:

- Inicializar Next.js 15 con TypeScript, TailwindCSS y pnpm.
- Configurar ESLint, Prettier y Husky.
- Instalar shadcn/ui, Lucide, Sonner, Date-fns, Framer Motion.
- Crear estructura base feature-based.
- Configurar tokens del design system en Tailwind.

Archivos esperados:

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.*`
- `app/layout.tsx`
- `app/globals.css`
- `shared/config/design-tokens.ts`
- `shared/components/ui/*`

Dependencias:

- pnpm.
- Next.js 15 y React 19.

Riesgos:

- Compatibilidad de versiones React 19 con librerias.
- Configuracion shadcn/ui sobre tokens propios.

No incluye:

- Rutas finales.
- Base de datos.
- Pantallas del prototipo.

## Fase 2 - Autenticacion, roles y layouts

Objetivos:

- Configurar Auth.js.
- Definir roles y proteccion de rutas.
- Crear layouts independientes: artesana, facilitadora, admin y publico.
- Implementar navegacion base por rol.

Archivos esperados:

- `features/auth/*`
- `shared/server/auth/*`
- `app/(auth)/*`
- `app/(artisan)/layout.tsx`
- `app/(facilitator)/layout.tsx`
- `app/(admin)/layout.tsx`
- `shared/components/navigation/*`

Riesgos:

- RBAC incompleto.
- Mezcla accidental de dashboards entre roles.

## Fase 3 - Prisma y modelo base

Objetivos:

- Configurar Prisma y PostgreSQL.
- Crear schema inicial normalizado.
- Implementar repositories base.
- Seeds minimos para roles, comunidades, tecnicas y usuario demo.

Archivos esperados:

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `shared/repositories/*`
- `shared/services/rbac/*`

Riesgos:

- Modelo demasiado acoplado a pantallas.
- Falta de auditoria financiera o progreso granular.

## Fase 4 - Experiencia artesana

Objetivos:

- Dashboard de artesana.
- Ruta de aprendizaje.
- Comunidad.
- Mi Historia.
- Finanzas y metodos de pago.
- Indicadores personales de autonomia digital.

Features:

- `learning`
- `community`
- `stories`
- `payments`
- `profile`

Riesgos:

- Que el marketplace eclipse el aprendizaje.
- Que los logros se vuelvan decorativos sin datos reales.
- Que finanzas y productos aparezcan antes de que la experiencia comunique proceso formativo.

## Fase 5 - Facilitadora

Objetivos:

- Dashboard de seguimiento.
- Lista de artesanas.
- Perfil de seguimiento individual.
- Talleres.
- Mensajeria.

Features:

- `facilitator`
- `courses`
- `notifications`
- `reports`

Riesgos:

- Reutilizar experiencia admin por conveniencia.
- Mensajeria sin contexto de aprendizaje.

## Fase 6 - Marketplace cultural y productos

Objetivos:

- Galeria cultural.
- Filtros por comunidad y tecnica.
- Detalle de pieza.
- Gestion de productos por artesana.
- Publicacion de productos como resultado del aprendizaje y la documentacion cultural.

Features:

- `marketplace`
- `products`
- `orders`

Regla critica:

- Las cards no muestran precio. El precio vive solo en detalle/adquisicion.
- El marketplace comunica cultura, tecnica, historia, comunidad y tiempo de elaboracion antes que compra.

## Fase 7 - Admin e impacto

Objetivos:

- Dashboard nacional.
- Gestion de cursos.
- Reportes.
- Comunidades.
- Supervision institucional.
- Medicion de transformacion social, no solo actividad comercial.

Features:

- `admin`
- `reports`
- `courses`

Riesgos:

- Metricas sin definicion.
- Reportes sin trazabilidad.
- Medir exito solo por ventas y no por capacitacion, historias, talleres, comunidades y autonomia digital.

## Fase 8 - Produccion

Objetivos:

- Tests criticos.
- Accesibilidad.
- Performance.
- Seguridad.
- UploadThing/Cloudinary.
- Preparacion Vercel.

Incluye:

- Validaciones Zod completas.
- Optimistic updates donde aplique.
- Manejo de errores.
- Loading, empty y error states.
- Revision responsive.

## Criterios de aprobacion por fase

Cada fase debe cerrar con:

- Resumen de cambios.
- Archivos tocados.
- Decisiones tomadas.
- Riesgos pendientes.
- Pruebas ejecutadas.
- Solicitud de aprobacion para continuar.
