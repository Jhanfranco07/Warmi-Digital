# AGENTS.md

Guia operativa para agentes que trabajen en Warmi Digital.

## Regla de contexto

Antes de actuar, identifica el tipo de tarea y consulta solo los documentos y archivos relacionados. No leas todo el repositorio por defecto. Amplia el contexto unicamente si aparece una dependencia real, una contradiccion o un riesgo tecnico.

Warmi Digital no es un ecommerce tradicional. La venta es consecuencia del aprendizaje, la autonomia digital, la comunidad y la preservacion cultural.

## Stack validado

- Next.js 15 App Router, React 19, TypeScript estricto y pnpm.
- Prisma 6 con PostgreSQL, Auth.js / NextAuth, Zod, React Hook Form y TanStack Query.
- Tailwind CSS, shadcn/Radix UI, Framer Motion, Lucide React y Sonner.
- UploadThing, Cloudinary, date-fns y Recharts.

Scripts disponibles:

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm format:check`
- `pnpm format`
- `pnpm prisma:generate`
- `pnpm prisma:migrate`
- `pnpm prisma:seed`

## Mapa de documentacion

| Tarea                       | Consultar primero                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| Arquitectura general        | `ARCHITECTURE.md`, `README.md`                                                                    |
| Alcance funcional           | `FEATURES.md`, `IMPLEMENTATION_PLAN.md`                                                           |
| Rutas y navegacion          | `ROUTES.md`, `app/**`                                                                             |
| Diseno visual y componentes | `DESIGN_SYSTEM.md`, `COMPONENTS.md`, `shared/components/**`                                       |
| Referencia Stitch           | `design/README.md`, `design/SCREEN_CORRESPONDENCE.md`, `design/stitch-export/**`                  |
| Autenticacion y permisos    | `AUTHENTICATION.md`, `middleware.ts`, `shared/server/auth/**`                                     |
| Base de datos               | `DATABASE.md`, `ERD.md`, `prisma/schema.prisma`                                                   |
| Experiencia artesana        | `ARTISAN_EXPERIENCE.md`, `FUNCTIONAL_ACTIONS_AUDIT.md`, `app/(artisan)/**`, `features/artisan/**` |
| Experiencia facilitadora    | `FACILITATOR_EXPERIENCE.md`, `app/(facilitator)/**`, `features/facilitator/**`                    |
| Assets estaticos o demo     | `STATIC_CONTENT_AUDIT.md`, `public/images/**`                                                     |

## Mapa de codigo

- `app/`: rutas, layouts y composicion de paginas. Evita poner logica de dominio aqui.
- `features/`: componentes y flujos por dominio o rol.
- `shared/actions/`: Server Actions para mutaciones y operaciones invocadas desde UI.
- `shared/services/`: reglas de aplicacion y orquestacion.
- `shared/repositories/`: acceso a datos con Prisma.
- `shared/validations/`: esquemas Zod.
- `shared/components/`: UI base, layout, navegacion, feedback, media y componentes de dominio.
- `shared/server/auth/`: helpers, permisos y utilidades server-side de autenticacion.
- `shared/lib/`: utilidades transversales, incluyendo singleton de Prisma.
- `prisma/`: schema, migraciones y seed.
- `public/images/`: imagenes reales o placeholders organizados por modulo.
- `design/stitch-export/`: referencia visual. No importar como codigo de la app.

## Reglas de implementacion

- Respeta la mision social: aprendizaje, comunidad, acompanamiento, patrimonio y autonomia digital primero.
- Usa Server Components por defecto. Usa Client Components solo para estado, eventos, formularios, animacion o hooks del navegador.
- Las mutaciones deben pasar por Server Actions o rutas API justificadas.
- Mantén el flujo `UI -> action/service -> repository -> Prisma` cuando toque datos persistentes.
- Reutiliza componentes existentes antes de crear nuevos.
- Usa alias de importacion (`@/features`, `@/shared`, `@/components`, etc.).
- No introduzcas mocks nuevos si ya existe fuente real en PostgreSQL.
- No hagas refactors o cambios de estructura fuera del alcance solicitado.
- No toques `.env`, credenciales ni archivos locales no relacionados.

## Reglas de base de datos

- Antes de cambiar datos o modelos, revisa `prisma/schema.prisma`, `DATABASE.md` y `ERD.md`.
- No generes migraciones si la tarea no cambia el schema.
- Sigue los patrones existentes de UUID, enums, relaciones explicitas, indices, timestamps y soft delete cuando aplique.
- Actualiza `prisma/seed.ts` solo cuando el cambio requiera datos iniciales.
- Para validar Prisma usa `pnpm exec prisma validate`; para regenerar cliente usa `pnpm prisma:generate`.

## Reglas UI

- La referencia visual viene de Stitch y del sistema Heritage Pulse, pero el codigo fuente de la UI esta en la app.
- Mantén paleta cultural, tipografia editorial, espaciado amplio en desktop y navegacion compacta en mobile.
- En vistas autenticadas, conserva la diferenciacion por rol: Artesana, Facilitadora y Admin.
- El mercado/vitrina debe mostrar primero identidad, historia y comunidad; el producto viene despues.
- Evita textos explicativos innecesarios dentro de la interfaz si el patron visual ya comunica la accion.

## Validacion antes de entregar

- Cambios TS/TSX: `pnpm lint` y `pnpm typecheck`.
- Cambios de rutas, auth, server o build: `pnpm build`.
- Cambios Prisma: `pnpm exec prisma validate` y `pnpm prisma:generate`; migrar solo si corresponde.
- Cambios de formato o Markdown: `pnpm format:check` o `pnpm exec prettier --check <archivo>`.
- Si no se pudo ejecutar una validacion, dilo en la respuesta final.

## Checklist final

- Revisar `git status --short`.
- Confirmar que no se incluyan `.env`, `.obsidian`, `.next`, `node_modules` ni artefactos locales.
- Mencionar archivos modificados y validaciones ejecutadas.
- Indicar cualquier documento desactualizado o contradictorio detectado, sin modificarlo salvo que el usuario lo pida.
