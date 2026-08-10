# Warmi Digital

Warmi Digital es un ecosistema digital para aprendizaje, acompanamiento, comunidad, autonomia economica y preservacion cultural de mujeres artesanas.

Esta fase contiene solo la infraestructura base del proyecto. No incluye dashboards funcionales, marketplace, cursos, CRUDs ni logica de negocio.

## Stack

- Next.js 15 con App Router
- React 19
- TypeScript estricto
- Tailwind CSS con tokens Heritage Pulse
- shadcn/ui como convencion de componentes
- Prisma con PostgreSQL
- Auth.js
- Zod
- React Hook Form
- TanStack Query
- Framer Motion
- Lucide React
- Sonner
- UploadThing
- Cloudinary
- Date-fns
- ESLint, Prettier, Husky y lint-staged

## Instalacion

```bash
pnpm install
```

Crear variables de entorno:

```bash
cp .env.example .env
```

Configurar al menos:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/warmi_digital?schema=public"
AUTH_SECRET="replace-with-a-secure-secret"
AUTH_URL="http://localhost:3000"
```

Generar Prisma Client:

```bash
pnpm prisma:generate
```

Ejecutar desarrollo:

```bash
pnpm dev
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format
pnpm format:check
pnpm prisma:generate
pnpm prisma:migrate
```

## Estructura

```txt
app/
  (public)/
  (auth)/
  (dashboard)/
  (artisan)/
  (facilitator)/
  (admin)/
  api/
features/
  auth/
  dashboard/
  learning/
  courses/
  community/
  stories/
  marketplace/
  products/
  orders/
  payments/
  notifications/
  reports/
  profile/
  facilitator/
  admin/
  settings/
shared/
  actions/
  components/
  config/
  hooks/
  lib/
  providers/
  repositories/
  server/
  services/
  types/
prisma/
public/
design/
  stitch-export/  # referencia visual exportada desde Stitch
```

```

> Nota: `design/stitch-export/` contiene pantallas exportadas de Stitch que son referencia visual únicamente. No deben importarse ni usarse como código fuente en la aplicación.
```
