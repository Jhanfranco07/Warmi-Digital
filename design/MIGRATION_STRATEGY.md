# Migration Strategy for Stitch Export Screens

## Objetivo

Reconstruir cada pantalla exportada desde Stitch como parte de la aplicación oficial sin convertir HTML automáticamente. Se trabajará con:

- Layouts
- Features
- Componentes reutilizables
- Design System

## Principios

- El export de Stitch es documentación visual, no código funcional.
- Cada pantalla debe mapearse a una feature y a rutas de la aplicación.
- La implementación se hará con React, TypeScript y TailwindCSS.
- El diseño visual se seguirá, pero la estructura de la aplicación se mantiene limpia.

## Estrategia

1. Identificar el dominio funcional de cada pantalla.
2. Crear o reutilizar el layout de la experiencia correspondiente (`ARTESANA`, `FACILITADORA`, `ADMIN`, `PUBLICO`).
3. Mapear la pantalla a una feature dentro de `features/`.
4. Extraer los patrones visuales a componentes en `shared/components/`.
5. Usar el Design System global para colores, tipografía, espaciado, tokens y estados.
6. Implementar la pantalla como una combinación de components + data hooks + routes.
7. Validar con el diseño de Stitch, sin importar el HTML exportado.

## No hacer

- No copiar y pegar HTML directamente en TSX.
- No usar el export como import de rutas.
- No basar la navegación en la estructura de carpetas de Stitch.
- No tratar las carpetas exportadas como fuentes de verdad.

## Resultado esperado

La aplicación oficial debe ser:

- modular
- mantenible
- escalable
- alineada con la arquitectura feature-based
- independiente de los recursos de Stitch
