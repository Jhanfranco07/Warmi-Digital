# Imágenes institucionales del inicio offline

Copias WebP de los PNG ya existentes en `public/images`. Se conservan los originales y sus contenidos. No incluyen recursos de aprendizaje ni imágenes de M4.

- `hero/warmi-hero.png` → `warmi-hero.webp`
- `brand/warmi-isotipo.png` → `warmi-isotipo.webp`
- `brand/warmi-logo-transparent.png` → `warmi-logo-transparent.webp`
- `home/bienvenida-warmi.png` → `bienvenida-warmi.webp`
- `programa/programa-warmi.png` → `programa-warmi.webp`
- `discover/{aprende,emprende,taller,recursos}.png` → los cuatro WebP homónimos

Conversión con Sharp ya instalado por Next: ancho máximo 1440 px para fotos y 560 px para marcas, sin ampliar, WebP calidad 80. Total: 605.594 bytes. La correspondencia está en `shared/offline/landing-assets.ts`; el service worker precachea las nueve copias en el shell público v6. El test verifica archivos, correspondencia y presupuesto inferior a 700 KB.
