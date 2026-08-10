---
name: Heritage Pulse
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#54433a'
  inverse-surface: '#2f312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#877369'
  outline-variant: '#dac2b6'
  surface-tint: '#934b19'
  primary: '#6c2f00'
  on-primary: '#ffffff'
  primary-container: '#8b4513'
  on-primary-container: '#ffc29f'
  inverse-primary: '#ffb68c'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#33470f'
  on-tertiary: '#ffffff'
  tertiary-container: '#4a5f25'
  on-tertiary-container: '#bed890'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc9'
  primary-fixed-dim: '#ffb68c'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#753401'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#d2eca2'
  tertiary-fixed-dim: '#b6d088'
  on-tertiary-fixed: '#131f00'
  on-tertiary-fixed-variant: '#394d14'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-ui:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  section-gap: 120px
  container-padding: 24px
  gutter: 24px
  column-count: '12'
---

## Brand & Style

The design system is a premium digital framework centered on the empowerment of women artisans and the preservation of global cultural heritage. It aims to evoke a sense of **profound dignity, warmth, and institutional trust**, blending the storytelling authority of *National Geographic* with the humanitarian elegance of *UNESCO*.

The visual direction follows a **Modern-Minimalist** approach with **Tactile/Editorial** influences. It prioritizes expansive white space to let high-quality photography and cultural narratives breathe. The aesthetic is "Warm Professional"—it is structured and reliable enough for commerce and governance, yet organic enough to feel human and handmade. 

Key visual principles:
- **Atmospheric Depth:** Use of soft gradients and background textures to mimic the feel of natural fibers and earth.
- **Editorial Focus:** Large, intentional margins and asymmetrical layouts that feel like a high-end physical journal.
- **Micro-interactions:** Transitions are slow and fluid (300-500ms), utilizing "soft fades" and "gentle drifts" to mirror a calm, respectful browsing experience.

## Colors

The palette is derived from natural pigments and raw materials. 

- **Primary (Wood Brown/Terracotta):** Used for primary actions, structural storytelling elements, and deep emphasis.
- **Secondary (Soft Gold):** Reserved for "Premium" moments—achievements, cultural highlights, and subtle borders. Never used for large blocks of text.
- **Tertiary (Olive Green):** Symbolizes growth, sustainability, and community health. Used for success states and environmental indicators.
- **Neutral (Warm White/Sand):** The canvas. This design system avoids pure white (#FFFFFF) in favor of a "Warm White" (#FDFCF8) to reduce digital strain and feel more like parchment or woven cotton.
- **Functional Grays:** Replaced with "Clay" (warm grays with a hint of red/brown) to maintain the earthy temperature across the UI.

## Typography

This system uses a tri-font strategy to balance heritage with modern utility:
- **Playfair Display:** The voice of culture. Used for storytelling headers, quotes, and section titles. It should be typeset with generous leading.
- **Inter:** The voice of clarity. Used for long-form body text and data descriptions to ensure maximum legibility and professional tone.
- **Plus Jakarta Sans:** (Subbing for Poppins for a more modern, sophisticated roundness) The voice of the interface. Used for buttons, navigation, and input labels. Its geometric nature provides a clean contrast to the serif headings.

## Layout & Spacing

The layout is a **Fixed Grid** on desktop (1280px max-width) and a **Fluid Grid** on mobile. 

- **The "Breathe" Principle:** Spacing between major sections should be aggressive (120px+). White space is treated as a design element that signifies luxury and respect.
- **Andean Alignment:** While the grid is standard, decorative "Andean-inspired" patterns may break the grid slightly as absolute-positioned background elements to create visual rhythm.
- **Mobile Reflow:** For mobile, margins tighten to 16px, and all display typography scales down to the `mobile` variants defined in tokens. Content should remain single-column to maintain the "journal" feel.

## Elevation & Depth

This system avoids heavy drop shadows. Depth is communicated through **Tonal Layering** and **Subtle Outlines**:

- **Surfaces:** Use slightly different shades of Warm White and Sand to indicate stacking. A card might sit on a `#FDFCF8` background with a `#F5F1E9` surface.
- **Borders:** Use 1px solid strokes in `accent_sand` or `secondary_color` (Gold) at low opacity (20%) to define containers.
- **Glassmorphism:** Reserved exclusively for navigation bars and immersive video overlays. Use a `20px` backdrop blur with a `10%` white tint to create a "frosted linen" effect.
- **Shadows:** When necessary for functional elevation (like modals), use a very diffused, low-opacity brown-tinted shadow: `0 12px 32px rgba(139, 69, 19, 0.08)`.

## Shapes

The shape language is **Soft (0.25rem / 4px)**. 

Extremely rounded "bubble" shapes are avoided to maintain a professional, institutional tone. The slight rounding on buttons and cards mimics the softened edges of hand-cut textile or clay. 

- **Decorative Elements:** Andean patterns should be geometric and sharp, contrasting with the soft-edged UI containers.
- **Images:** Use the `rounded-lg` (8px) setting for all cultural photography to give them a finished, "framed" appearance.

## Components

- **Cultural Cards:** Featuring a high-aspect-ratio image, a `label-ui` category, and a `headline-md` title. Use a "reveal" hover effect where a subtle textile pattern fades into the background.
- **Journey Steppers:** Horizontal or vertical lines using `secondary_color_hex` (Gold). Completed steps feature a small "weave" icon instead of a checkmark.
- **Interactive Maps:** Use a custom "Earth Tone" map style (Sand/Clay/Olive) with minimal detail, highlighting artisan clusters with `accent_clay` pulses.
- **Immersive Video Player:** Minimalist controls that auto-hide. Borders are 1px Gold, and the play button is a large, centered transparent circle with a blur effect.
- **Kanban for Orders:** Highly structured and clean. Each card uses a `body-md` font. Status tags use `tertiary_color_hex` (Green) for "In Progress" and `primary_color_hex` for "Archived."
- **Buttons:** Primary buttons are solid `primary_color_hex` with white `label-ui` text. Secondary buttons are `accent_sand` with brown text. All buttons have a 200ms transition on hover to a slightly darker shade.
- **Input Fields:** Bottom-border only ("Material style") to mimic a lined notebook, using `accent_sand` as the default border color.