import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}", "./shared/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "1.5rem"
      },
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          container: "hsl(var(--primary-container))",
          "container-foreground": "hsl(var(--primary-container-foreground))",
          fixed: "hsl(var(--primary-fixed))",
          "fixed-dim": "hsl(var(--primary-fixed-dim))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          container: "hsl(var(--secondary-container))",
          "container-foreground": "hsl(var(--secondary-container-foreground))"
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
          container: "hsl(var(--tertiary-container))",
          "container-foreground": "hsl(var(--tertiary-container-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          dim: "hsl(var(--surface-dim))",
          bright: "hsl(var(--surface-bright))",
          variant: "hsl(var(--surface-variant))",
          lowest: "hsl(var(--surface-container-lowest))",
          low: "hsl(var(--surface-container-low))",
          container: "hsl(var(--surface-container))",
          high: "hsl(var(--surface-container-high))",
          highest: "hsl(var(--surface-container-highest))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))"
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))"
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)"
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        ui: ["var(--font-plus-jakarta)", "Inter", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["4rem", { lineHeight: "4.5rem", fontWeight: "700" }],
        "headline-lg": ["3rem", { lineHeight: "3.5rem", fontWeight: "600" }],
        "headline-md": ["2rem", { lineHeight: "2.5rem", fontWeight: "500" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75rem", fontWeight: "400" }],
        "body-md": ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "label-ui": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "600" }],
        caption: ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }]
      },
      spacing: {
        base: "0.5rem",
        "section-gap": "7.5rem",
        gutter: "1.5rem",
        "touch-target": "2.75rem"
      },
      boxShadow: {
        soft: "0 12px 32px rgba(139, 69, 19, 0.08)",
        raised: "0 18px 48px rgba(75, 43, 23, 0.12)",
        focus: "0 0 0 3px hsla(var(--ring), 0.18)"
      },
      transitionDuration: {
        gentle: "300ms",
        drift: "500ms"
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "fade-in": "fade-in 300ms ease-out",
        "slide-up": "slide-up 300ms ease-out",
        "accordion-down": "accordion-down 200ms ease-out",
        "accordion-up": "accordion-up 200ms ease-out"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
