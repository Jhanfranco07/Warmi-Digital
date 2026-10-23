# Ejemplos visuales del Módulo 3

Seis imágenes propias creadas con la herramienta integrada `image_gen` para Warmi
Digital. Son ilustraciones educativas ficticias, no fotografías documentales de
usuarias reales, capturas oficiales ni productos disponibles para comprar.

| Archivo | Propósito |
| --- | --- |
| `catalogo-bolso.webp` | Fotografía clara de una pieza para el catálogo |
| `estado-chal.webp` | Mostrar una novedad artesanal en un estado |
| `marketplace-ceramica.webp` | Presentar una pieza distinta y sus medidas |
| `verificar-cobro.webp` | Revisar el propio celular antes de entregar |
| `proteger-empaque.webp` | Proteger la prenda dentro de un empaque limpio |
| `apoyo-promotora.webp` | Pedir acompañamiento ante una duda |

Los prompts completos, dimensiones, bytes y SHA-256 están en `manifest.json`;
la fuente de prompts está en `scripts/module3-illustration-prompts.json`.
Los PNG originales se conservan en la carpeta de imágenes generadas de Codex.
Las versiones finales para la aplicación se guardan aquí en WebP a 960 × 640.
Peso total: 523 172 bytes. No dependen de Cloudinary ni de una URL externa.

`scripts/prepare-module3-illustrations.mjs` reproduce la optimización recibiendo
seis rutas de PNG, en orden: catálogo, estado, Marketplace, cobro, empaque y apoyo.
No se ejecuta en cada build: las versiones WebP y su manifiesto son assets del repo.
El Service Worker las precarga para que ambos modos usen exactamente las mismas.

Las composiciones de perfil, catálogo, estado, chat y comprobante se mantienen
como componentes accesibles de React. No representan interfaces oficiales de
WhatsApp, Facebook o una entidad financiera. No generan mensajes, ventas o pagos.
