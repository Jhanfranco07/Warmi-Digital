export const designTokens = {
  colors: {
    surface: "#faf9f5",
    surfaceDim: "#dbdad6",
    surfaceBright: "#faf9f5",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#f4f4f0",
    surfaceContainer: "#efeeea",
    surfaceContainerHigh: "#e9e8e4",
    surfaceContainerHighest: "#e3e2df",
    onSurface: "#1b1c1a",
    onSurfaceVariant: "#54433a",
    outline: "#877369",
    outlineVariant: "#dac2b6",
    primary: "#6c2f00",
    primaryContainer: "#8b4513",
    primaryFixed: "#ffdbc9",
    secondary: "#735c00",
    secondaryContainer: "#fed65b",
    tertiary: "#33470f",
    tertiaryContainer: "#4a5f25",
    error: "#ba1a1a"
  },
  typography: {
    display: "Playfair Display",
    body: "Inter",
    ui: "Plus Jakarta Sans"
  },
  radius: {
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem"
  },
  spacing: {
    base: "8px",
    sectionGap: "120px",
    containerPadding: "24px",
    mobileGutter: "16px",
    desktopGutter: "24px"
  }
} as const;
