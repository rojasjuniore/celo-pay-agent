/**
 * Design tokens — Factory Base (~/.claude/DESIGN.md) + acento Celo.
 * Fuente única de verdad para color/espacio; reflejados en globals.css como
 * CSS variables. No usar colores sueltos en componentes: referir estos tokens.
 */
export const tokens = {
  color: {
    primary: "#0A0A0B",
    onPrimary: "#FFFFFF",
    secondary: "#52525B",
    tertiary: "#2563EB",
    neutral: "#71717A",
    surface: "#FFFFFF",
    surfaceMuted: "#F4F4F5",
    surfaceAccent: "#F0F5FF",
    border: "#E4E4E7",
    borderStrong: "#D4D4D8",
    error: "#DC2626",
    warning: "#D97706",
    success: "#16A34A",
    info: "#2563EB",
    /** Acento Celo: amarillo de marca, solo para identidad del agente. */
    celo: "#FCFF52",
  },
  radius: { sm: "4px", md: "8px", lg: "12px", xl: "16px", full: "9999px" },
  space: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px", "2xl": "48px" },
} as const;
