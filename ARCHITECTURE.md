# Warmi Digital - Arquitectura

## Estado de Fase 0

Este documento consolida el analisis del prototipo exportado de Stitch y define la arquitectura objetivo antes de iniciar cualquier implementacion. El HTML exportado se considera referencia visual y semantica, no codigo base para convertir ni copiar.

Las carpetas de `design/stitch-export/` no forman parte de la aplicacion oficial. Son material de referencia visual para el equipo de producto y diseño.

Se revisaron 30 carpetas del export:

| Dominio | Pantallas detectadas |
| --- | --- |
| Publico y acceso | `warmi_digital_landing_page_cultural`, `inicio_de_sesi_n_integrado_warmi_digital`, `registro_de_artesana_inicio_de_tu_camino`, `registro_inicio_de_tu_camino_m_vil`, `a_warm_professional_mobile_app_splash_screen_for_warmi_digital._the_image_shows` |
| Artesana - aprendizaje | `panel_de_aprendizaje_m_vil`, `panel_de_la_artesana_celebraci_n_de_logros`, `panel_de_la_artesana_mi_aprendizaje_1`, `panel_de_la_artesana_mi_aprendizaje_2`, `convocatorias_y_becas_oportunidades_de_crecimiento` |
| Artesana - identidad cultural | `mi_historia_perfil_de_la_artesana`, `red_de_saberes_muro_comunitario`, `red_de_saberes_m_vil` |
| Marketplace cultural | `mercado_digital_galer_a_de_tradiciones`, `detalle_del_producto_exposici_n_cultural` |
| Finanzas y pagos | `mis_finanzas_resumen_de_impacto_econ_mico`, `historial_de_movimientos_transparencia_y_crecimiento`, `m_todos_de_pago_configuraci_n_y_autonom_a` |
| Facilitadora | `panel_de_la_facilitadora_seguimiento_de_impacto_1`, `panel_de_la_facilitadora_seguimiento_de_impacto_2`, `panel_de_la_facilitadora_seguimiento_m_vil`, `detalle_de_seguimiento_perfil_de_la_artesana`, `seguimiento_de_artesana_detalle_m_vil`, `centro_de_mensajer_a_v_nculo_y_soporte`, `centro_de_mensajes_m_vil`, `gesti_n_de_talleres_programaci_n_y_recursos`, `gesti_n_de_talleres_m_vil` |
| Administracion | `dashboard_administrativo_impacto_nacional`, `creador_de_cursos_gesti_n_institucional` |
| Sistema visual | `heritage_pulse/DESIGN.md` |

Hallazgo tecnico: las capturas de `detalle_de_seguimiento_perfil_de_la_artesana`, `mi_historia_perfil_de_la_artesana`, `panel_de_la_artesana_mi_aprendizaje_1` y `panel_de_la_facilitadora_seguimiento_de_impacto_1` estan corruptas o vacias (28 bytes). Para estas pantallas, el analisis se baso en el HTML de referencia y no en imagen.

## Principios arquitectonicos

Warmi Digital se construira como un ecosistema de patrimonio cultural, aprendizaje, comunidad y autonomia economica. La venta sera una capacidad derivada, no el centro de la experiencia.

## Vision del dominio

Warmi Digital es una plataforma de transformacion social orientada al empoderamiento de mujeres artesanas mediante tecnologia. Su objetivo principal es reducir la brecha digital, fortalecer capacidades, acompanar procesos de formacion y preservar el patrimonio cultural de las comunidades.

El problema que resuelve no es simplemente la falta de un canal de venta. El problema real es que muchas artesanas tienen dificultades para acceder a herramientas digitales, promocionar su trabajo con dignidad cultural, conectar con mercados, recibir acompanamiento continuo, participar en capacitaciones organizadas y documentar el valor cultural de lo que producen.

La solucion es un ecosistema integrado donde la artesana puede aprender, practicar, crear, compartir, comercializar y preservar. Por eso, las capacidades de marketplace, pedidos y pagos existen como resultado del proceso formativo y comunitario, no como nucleo del sistema.

Metricas de exito del producto:

- Cursos completados.
- Mujeres capacitadas.
- Comunidades participantes.
- Historias documentadas.
- Productos publicados con contexto cultural.
- Participacion comunitaria.
- Talleres realizados.
- Autonomia digital alcanzada.
- Ventas culturales generadas como consecuencia del proceso.

Decisiones base:

- Arquitectura feature-based para que cada dominio de negocio evolucione con independencia.
- App Router de Next.js 15 con layouts separados por rol.
- React Server Components por defecto, Client Components solo para interaccion real.
- Server Actions para mutaciones de producto, aprendizaje, comunidad y configuracion.
- Repository Pattern para aislar Prisma de la capa de aplicacion.
- Service Layer para reglas de negocio, permisos y orquestacion.
- DTOs y Zod para contratos de entrada/salida validados.
- RBAC estricto por `ADMIN`, `FACILITADORA` y `ARTESANA`.
- TanStack Query para estados de cliente, cache, refetch y optimistic updates en experiencias interactivas.
- shadcn/ui como base de componentes accesibles, adaptados al sistema Heritage Pulse.
- Las decisiones tecnicas priorizaran aprendizaje, acompanamiento, preservacion cultural y autonomia antes que conversion comercial.

## Estructura objetivo

```txt
app/
  (public)/
  (auth)/
  (artisan)/
  (facilitator)/
  (admin)/
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
  components/
  hooks/
  providers/
  config/
  server/
  repositories/
  services/
  actions/
  types/
prisma/
public/
```

`app/` solo define rutas, layouts y composicion. La logica de producto vive en `features/`. Las piezas transversales viven en `shared/`.

## Layouts por rol

Cada rol tendra layout, sidebar, dashboard y experiencia independiente:

- `ADMIN`: supervision nacional, gestion institucional, reportes, cursos, comunidades, impacto.
- `FACILITADORA`: seguimiento de artesanas, talleres, mensajeria, recursos, retroalimentacion.
- `ARTESANA`: aprendizaje, historia personal, comunidad, taller, finanzas, pagos y marketplace cultural.

No se reutilizaran dashboards entre roles. Si comparten piezas visuales, se abstraeran como componentes base, pero la composicion, copy, metricas y permisos seran especificos.

## Capas

| Capa | Responsabilidad |
| --- | --- |
| UI | Componentes visuales, formularios, estados, layouts por rol |
| Actions | Mutaciones seguras desde Next.js, validacion Zod, revalidacion |
| Services | Reglas de negocio, RBAC, calculos, flujos del dominio |
| Repositories | Acceso a datos con Prisma, queries normalizadas |
| DTO/Types | Contratos tipados entre capas |
| Providers | Auth, QueryClient, tema, toasts |

## Riesgos detectados

- El prototipo mezcla textos en espanol e ingles. La implementacion debe normalizar idioma por producto; la version inicial deberia priorizar espanol.
- Hay variantes duplicadas de dashboards de artesana y facilitadora. Deben consolidarse por dominio sin perder variaciones responsive.
- Algunas pantallas desktop incluyen sidebar colapsable; otras usan navbar superior. Se requiere regla clara por rol y contexto.
- Las pantallas moviles usan bottom navigation. Debe definirse como patron oficial solo para experiencia artesana/facilitadora movil.
- El marketplace debe evitar lenguaje visual de e-commerce masivo: sin precios en cards, sin urgencia comercial, sin layout tipo catalogo transaccional.
