# Warmi Digital - Authentication & Authorization

## Estado de Fase 3

La autenticacion y autorizacion quedan configuradas como base transversal del proyecto. Esta fase no implementa funcionalidades de negocio: solo identidad, sesion, roles, proteccion de rutas, server actions de auth y pantallas de acceso.

## Arquitectura

La autenticacion se organiza en capas:

```txt
app/
  (auth)/
  access-denied/
  session-expired/
  api/auth/[...nextauth]/
features/auth/
shared/actions/auth/
shared/hooks/auth/
shared/lib/auth.ts
shared/lib/auth-schemas.ts
shared/server/auth/
types/next-auth.d.ts
middleware.ts
```

Responsabilidades:

- `shared/lib/auth.ts`: configuracion Node de Auth.js con Prisma Adapter y Credentials Provider.
- `shared/server/auth/auth.ts`: exporta `auth`, `handlers`, `signIn` y `signOut`.
- `shared/server/auth/middleware-auth.ts`: configuracion edge-safe para middleware, sin Prisma ni bcrypt.
- `shared/server/auth/rbac.ts`: permisos, roles, rutas privadas y helpers puros de RBAC.
- `shared/server/auth/helpers.ts`: helpers server-side para RSC y layouts.
- `shared/actions/auth/*`: server actions autorizadas y validadas.
- `shared/lib/auth-schemas.ts`: validaciones Zod.
- `features/auth/*`: formularios de login, registro y recuperacion.

## Flujo de autenticacion

1. El usuario entra a `/login`.
2. `LoginForm` envia `FormData` a `login()`.
3. `login()` valida con Zod.
4. Auth.js ejecuta Credentials Provider.
5. El provider busca el usuario con Prisma.
6. bcrypt compara la contrasena.
7. Auth.js emite sesion JWT.
8. El action calcula la ruta destino por rol.
9. El cliente redirige a `/admin`, `/facilitator` o `/artisan`.

## Registro

Solo se implementa registro de artesanas.

`register()`:

- Valida entrada con `registerSchema`.
- Normaliza correo.
- Verifica unicidad.
- Hashea contrasena con bcrypt.
- Crea `User`, `Profile` y asignacion de rol `ARTESANA`.
- Usa transaccion Prisma.

El registro de `ADMIN` y `FACILITADORA` queda reservado para una fase administrativa posterior.

## Recuperacion de contrasena

`requestPasswordReset()`:

- Valida correo.
- Responde con mensaje generico para evitar enumeracion de usuarios.
- Crea token temporal de 1 hora si el usuario existe.
- Deja correo pendiente de integracion.
- En desarrollo puede devolver el token para pruebas locales.

`resetPassword()`:

- Valida token y nueva contrasena.
- Verifica expiracion y uso previo.
- Hashea la nueva contrasena.
- Marca el token como usado dentro de una transaccion.

## RBAC

Roles:

- `ADMIN`
- `FACILITADORA`
- `ARTESANA`

Permisos:

```txt
ADMIN        -> ACCESS_ADMIN, ACCESS_FACILITATOR, ACCESS_ARTISAN, MANAGE_USERS, MANAGE_AUTH
FACILITADORA -> ACCESS_FACILITATOR, ACCESS_ARTISAN
ARTESANA     -> ACCESS_ARTISAN
```

Rutas protegidas:

```txt
/admin                 -> ADMIN
/facilitator           -> ADMIN, FACILITADORA
/facilitadora          -> ADMIN, FACILITADORA
/artisan               -> ADMIN, FACILITADORA, ARTESANA
/artesana              -> ADMIN, FACILITADORA, ARTESANA
```

Las rutas canonicas siguen `ROUTES.md`: `/admin`, `/facilitator`, `/artisan`. Las rutas en espanol funcionan como alias estructurales.

## Middleware

`middleware.ts` protege rutas privadas automaticamente.

Comportamiento:

- Usuario sin sesion en ruta privada: redireccion a `/login?callbackUrl=...`.
- Usuario autenticado sin rol requerido: redireccion a `/access-denied`.
- Usuario autenticado que visita login/registro: redireccion a su ruta por rol.
- Rutas publicas de auth y landing quedan accesibles.

El middleware usa `shared/server/auth/middleware-auth.ts`, que evita cargar Prisma o bcrypt en Edge Runtime.

## Helpers

Disponibles en `shared/server/auth/helpers.ts`:

- `auth()`
- `currentUser()`
- `currentRole()`
- `hasRole()`
- `hasPermission()`
- `requireAuth()`
- `requireRole()`
- `requirePermission()`

## Hooks

Disponibles en `shared/hooks/auth/`:

- `useCurrentUser()`
- `useCurrentRole()`
- `useSession()`

Son wrappers client-side sobre `next-auth/react`.

## Server Actions

Actions implementadas:

- `login()`
- `logout()`
- `register()`
- `requestPasswordReset()`
- `resetPassword()`

Todas validan entradas con Zod. Las actions no implementan marketplace, cursos, productos, pedidos, pagos, comunidad ni dashboards.

## Seguridad

Medidas aplicadas:

- Hash de contrasenas con bcrypt y costo 12.
- Sesion JWT administrada por Auth.js.
- Cookies `httpOnly`, `sameSite=lax`, `secure` en produccion.
- Validacion Zod en provider y server actions.
- Mensaje generico en recuperacion de contrasena para evitar enumeracion.
- Tokens temporales de reset con expiracion y `usedAt`.
- Middleware global de rutas privadas.
- Proteccion server-side adicional en layouts mediante `requireAuth` y `requirePermission`.
- Prisma Adapter para persistencia de identidad.

## Pendientes futuros

- Integrar proveedor de correo para reset password.
- Crear gestion administrativa de usuarios `ADMIN` y `FACILITADORA`.
- Agregar auditoria de eventos auth en `AuditLog`.
- Agregar rate limiting para intentos de login y reset.
- Evaluar 2FA para roles administrativos.
