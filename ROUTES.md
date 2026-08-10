# Warmi Digital - Rutas

## Convenciones

Las rutas se organizan por experiencia y dominio. Los layouts de `ADMIN`, `FACILITADORA` y `ARTESANA` son independientes.

```txt
app/
  (public)/
  (auth)/
  (artisan)/
  (facilitator)/
  (admin)/
```

## Rutas publicas

| Ruta | Proposito |
| --- | --- |
| `/` | Landing cultural |
| `/marketplace` | Galeria cultural publica |
| `/marketplace/[productId]` | Detalle narrativo de pieza |
| `/communities` | Exploracion de comunidades |
| `/stories` | Historias culturales publicas |

## Rutas de autenticacion

| Ruta | Proposito |
| --- | --- |
| `/login` | Inicio de sesion con selector de rol |
| `/register` | Registro general |
| `/register/artisan` | Registro de artesana por pasos |
| `/onboarding` | Primer recorrido tras registro |

## Artesana

Grupo `app/(artisan)`.

Desde Fase 5, la experiencia funcional de artesana usa rutas canonicas en espanol bajo `/artesana`. Las rutas `/artisan` quedan como alias estructural hacia `/artesana/dashboard`.

| Ruta | Feature | Proposito |
| --- | --- | --- |
| `/artesana/dashboard` | dashboard | Dashboard propio de artesana |
| `/artesana/aprender` | learning | Ruta de aprendizaje |
| `/artesana/aprender/[courseId]` | learning | Curso actual |
| `/artesana/aprender/[courseId]/lecciones/[lessonId]` | learning | Leccion |
| `/artesana/logros` | learning | Ruta reservada para logros |
| `/artesana/talleres` | learning | Talleres de la artesana |
| `/artesana/mi-comunidad` | community | Ruta reservada para red de saberes |
| `/artesana/mi-historia` | stories | Mi Historia |
| `/artesana/mi-vitrina` | products | Mis piezas culturales |
| `/artesana/mis-pedidos` | orders | Ruta reservada para pedidos |
| `/artesana/convocatorias` | notifications | Oportunidades y convocatorias |
| `/artesana/mensajes` | notifications | Ruta reservada para mensajes |
| `/artesana/perfil` | profile | Perfil |
| `/artesana/ayuda` | settings | Ayuda |
| `/artisan` | dashboard | Dashboard propio de artesana |
| `/artisan/learning` | learning | Ruta de aprendizaje |
| `/artisan/learning/courses/[courseId]` | learning | Curso actual |
| `/artisan/learning/lessons/[lessonId]` | learning | Leccion |
| `/artisan/achievements` | learning | Logros, badges y certificados |
| `/artisan/workshops` | learning | Talleres disponibles |
| `/artisan/community` | community | Red de saberes |
| `/artisan/community/posts/[postId]` | community | Detalle de publicacion |
| `/artisan/story` | stories | Mi Historia |
| `/artisan/products` | products | Mis piezas culturales |
| `/artisan/products/new` | products | Crear pieza |
| `/artisan/orders` | orders | Pedidos |
| `/artisan/finances` | payments | Resumen financiero |
| `/artisan/finances/movements` | payments | Historial de movimientos |
| `/artisan/payment-methods` | payments | Metodos de pago |
| `/artisan/messages` | notifications | Centro de mensajes |
| `/artisan/profile` | profile | Perfil |
| `/artisan/settings` | settings | Configuracion |

## Facilitadora

Grupo `app/(facilitator)`.

| Ruta | Feature | Proposito |
| --- | --- | --- |
| `/facilitator` | facilitator | Dashboard de seguimiento |
| `/facilitator/artisans` | facilitator | Grupo asignado |
| `/facilitator/artisans/[artisanId]` | facilitator | Seguimiento individual |
| `/facilitator/workshops` | facilitator | Gestion de talleres |
| `/facilitator/workshops/new` | facilitator | Programar taller |
| `/facilitator/resources` | courses | Repositorio de recursos |
| `/facilitator/messages` | notifications | Mensajeria y soporte |
| `/facilitator/reports` | reports | Reportes del grupo |
| `/facilitator/settings` | settings | Configuracion |

## Admin

Grupo `app/(admin)`.

| Ruta | Feature | Proposito |
| --- | --- | --- |
| `/admin` | admin | Dashboard de impacto nacional |
| `/admin/communities` | admin | Gestion de comunidades |
| `/admin/artisans` | admin | Directorio y supervision |
| `/admin/courses` | courses | Gestion de cursos |
| `/admin/courses/new` | courses | Creador de cursos |
| `/admin/courses/[courseId]/builder` | courses | Constructor de modulos |
| `/admin/reports` | reports | Reportes institucionales |
| `/admin/orders` | orders | Supervision de pedidos |
| `/admin/settings` | settings | Configuracion institucional |

## Navegacion detectada

Desktop:

- Navbar superior publico: Patrimonio, Comunidades, Academia, Impacto.
- Sidebar artesana: Panel, Mi Camino, Pedidos, Mi Historia, Comunidad, Configuracion, Soporte.
- Sidebar facilitadora/admin: Dashboard, Artesanas, Seguimiento, Reportes, Logout.

Mobile:

- Bottom navigation artesana: Inicio, Aprendizaje, Comunidad, Mensajes, Perfil.
- Bottom navigation facilitadora: Dashboard, Artesanas, Seguimiento, Reportes.
