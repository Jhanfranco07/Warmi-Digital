# Warmi Digital - Design System

## Fuente de verdad visual

El sistema visual se basa en `heritage_pulse/DESIGN.md` y en las pantallas exportadas. El estilo se define como Heritage Pulse: calido, editorial, institucional y orientado a patrimonio cultural.

La implementacion usara tokens, no valores sueltos.

## Personalidad visual

Warmi Digital debe sentirse como una plataforma de patrimonio cultural con confianza institucional. Referencias conceptuales: museo vivo, archivo cultural, plaza comunitaria y herramienta de autonomia economica.

No debe sentirse como:

- Marketplace masivo.
- LMS generico.
- Red social de consumo rapido.
- Dashboard corporativo frio.

## Colores

| Token | Valor | Uso |
| --- | --- | --- |
| `surface` | `#faf9f5` | Fondo principal calido |
| `surface-container-lowest` | `#ffffff` | Superficies elevadas muy limpias |
| `surface-container-low` | `#f4f4f0` | Bloques suaves |
| `surface-container` | `#efeeea` | Cards secundarias |
| `surface-container-high` | `#e9e8e4` | Hover/estado activo suave |
| `surface-container-highest` | `#e3e2df` | Separaciones tonales |
| `on-surface` | `#1b1c1a` | Texto principal |
| `on-surface-variant` | `#54433a` | Texto secundario |
| `outline` | `#877369` | Bordes funcionales |
| `outline-variant` | `#dac2b6` | Bordes suaves |
| `primary` | `#6c2f00` | Acciones principales y enfasis terracota |
| `primary-container` | `#8b4513` | Bloques destacados |
| `primary-fixed` | `#ffdbc9` | Fondo suave primario |
| `secondary` | `#735c00` | Oro sobrio |
| `secondary-container` | `#fed65b` | Logros y acentos especiales |
| `tertiary` | `#33470f` | Comunidad, crecimiento, exito |
| `tertiary-container` | `#4a5f25` | Estados positivos destacados |
| `error` | `#ba1a1a` | Errores |

Reglas:

- El oro no se usa para grandes bloques de texto.
- El terracota se usa para acciones y enfasis de identidad.
- El verde olivo se usa para crecimiento, comunidad y estados positivos.
- El fondo nunca debe ser blanco frio como tono dominante.

## Tipografia

| Token | Familia | Tamano | Peso | Uso |
| --- | --- | --- | --- | --- |
| `display-lg` | Playfair Display | 64px | 700 | Heroes editoriales |
| `headline-lg` | Playfair Display | 48px | 600 | Titulos de seccion |
| `headline-lg-mobile` | Playfair Display | 32px | 600 | Titulos moviles |
| `headline-md` | Playfair Display | 32px | 500 | Cards narrativas y encabezados |
| `body-lg` | Inter | 18px | 400 | Texto narrativo |
| `body-md` | Inter | 16px | 400 | Texto comun |
| `label-ui` | Plus Jakarta Sans | 14px | 600 | Botones, nav, labels |
| `caption` | Inter | 12px | 400 | Metadatos |

Reglas:

- Playfair Display comunica patrimonio y relato.
- Inter comunica claridad y lectura prolongada.
- Plus Jakarta Sans comunica interfaz.
- No escalar fuentes con viewport width.
- Letter spacing por defecto 0; solo `label-ui` puede usar espaciado leve.

## Espaciado y layout

Tokens:

- Base: `8px`.
- Gutter desktop: `24px`.
- Gutter mobile: `16px`.
- Max container: `1280px`.
- Section gap editorial: `120px`.
- Grid desktop: 12 columnas.
- Mobile: una columna.

Reglas:

- Las secciones publicas deben respirar.
- Las herramientas operativas deben ser densas pero ordenadas.
- Cards con radio maximo de 8px salvo elementos circulares como avatares.
- No colocar cards dentro de cards.

## Elevacion

La profundidad se comunica mediante capas tonales y bordes suaves.

- Borde recomendado: `1px solid outline-variant` con opacidad baja.
- Sombra funcional: `0 12px 32px rgba(139, 69, 19, 0.08)`.
- Glassmorphism solo para navbars publicas o overlays inmersivos.

## Componentes visuales clave

- `CulturalProductCard`: imagen protagonista, comunidad, tecnica, tiempo, frase cultural; sin precio.
- `JourneyStepper`: progreso cultural/educativo con lineas sobrias.
- `ImpactMetricCard`: metrica, contexto y tendencia.
- `CommunityPostCard`: tono de plaza comunitaria, no feed adictivo.
- `PaymentMethodCard`: seguridad, claridad, control.
- `MessageComposer`: soporte humano con audio, archivo y texto.

## Iconografia

El prototipo usa Material Symbols. La implementacion usara Lucide por consistencia con el stack. Mapeos iniciales:

| Material | Lucide sugerido |
| --- | --- |
| `dashboard` | `LayoutDashboard` |
| `auto_stories` | `BookOpen` |
| `inventory_2` | `Package` |
| `history_edu` | `ScrollText` |
| `group` / `groups` | `Users` |
| `storefront` | `Store` |
| `settings` | `Settings` |
| `notifications` | `Bell` |
| `person` | `User` |
| `analytics` | `ChartNoAxesCombined` |
| `calendar_month` | `CalendarDays` |
| `chat_bubble` | `MessageCircle` |
| `payments` | `WalletCards` |

## Inconsistencias a resolver

- Idioma mixto: se normalizara a espanol en producto inicial.
- Algunas pantallas se identifican como "Heritage Portal" y otras "Warmi Digital"; la marca final debe ser Warmi Digital.
- Variantes de dashboard artesana/facilitadora muestran diferencias de navegacion; se definira una experiencia canonica por rol.
- El prototipo tiene fotografias remotas en HTML. La implementacion debe usar assets propios, Cloudinary o placeholders controlados.

## Fase 4 - Tokens Implementados

La configuración visual queda reflejada en `tailwind.config.ts` y `app/globals.css`.

Tokens añadidos o consolidados:

- Colores semánticos: `success`, `warning`, `info`, `destructive`.
- Superficies Heritage Pulse: `surface`, `surface-low`, `surface-container`, `surface-high`.
- Tipografías: `font-serif`, `font-sans`, `font-ui`.
- Tamaños: `display-lg`, `headline-lg`, `headline-md`, `body-lg`, `body-md`, `label-ui`, `caption`.
- Espaciado: `base`, `gutter`, `section-gap`, `touch-target`.
- Radios: `sm`, `md`, `lg`, con cards limitadas a 8px.
- Sombras: `soft`, `raised`, `focus`.
- Animaciones: `fade-in`, `slide-up`, `accordion-down`, `accordion-up`.
- Estados de foco: `focus-visible` global con ring accesible.

Reglas operativas:

- Los componentes nuevos usan tokens Tailwind y variables CSS.
- Las cards de dominio componen sobre componentes base.
- El modo oscuro usa la misma identidad cálida con contraste ajustado.
- La navegación mobile usa `Sheet`; desktop usa sidebar permanente.
