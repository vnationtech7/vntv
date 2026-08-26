/**
 * VNTV Design Tokens
 * 
 * Centralized design system tokens that power the VNTV platform.
 * These tokens are also defined in Tailwind config and CSS variables.
 * 
 * Usage:
 * - Import tokens for runtime use in components
 * - Use Tailwind classes for styling (preferred)
 * - Reference CSS variables for dynamic theming
 */

export const colors = {
  // Brand
  vntv: {
    red: "#e0142c",
    redHover: "#c11026",
    redDim: "#8a0f1e",
    redLight: "rgba(224, 20, 44, 0.15)",
    redBg: "rgba(224, 20, 44, 0.08)",
  },

  // Categories
  category: {
    ghana: { hex: "#e31c23", name: "Ghana Red" },
    nigeria: { hex: "#f5a623", name: "Nigeria Gold" },
    africa: { hex: "#2fbf6f", name: "Africa Green" },
    world: { hex: "#4a90e2", name: "World Blue" },
    politics: { hex: "#9013fe", name: "Politics Purple" },
    business: { hex: "#f08bb4", name: "Business Pink" },
    entertainment: { hex: "#e0142c", name: "Entertainment Red" },
    sports: { hex: "#5856d6", name: "Sports Indigo" },
  },

  // Semantic
  semantic: {
    success: { hex: "#2fbf6f", light: "#d4f4e2", dark: "#1a7f4a" },
    error: { hex: "#e0142c", light: "#fce8ec", dark: "#b00f23" },
    warning: { hex: "#f5a623", light: "#fef3e6", dark: "#d18a1a" },
    info: { hex: "#4a90e2", light: "#e8f3fc", dark: "#3472b8" },
  },

  // Theme Colors (CSS Variables)
  theme: {
    light: {
      background: "#ffffff",
      backgroundPanel: "#f8f8f9",
      backgroundPanel2: "#f0f0f2",
      border: "#e1e1e6",
      foreground: "#0d0d0f",
      foregroundMuted: "#52525a",
      foregroundMuted2: "#737380",
    },
    dark: {
      background: "#0b0b0d",
      backgroundPanel: "#141417",
      backgroundPanel2: "#1b1b1f",
      border: "#2a2a2f",
      foreground: "#f2f2f3",
      foregroundMuted: "#9a9aa2",
      foregroundMuted2: "#6f6f78",
    },
  },
} as const;

export const typography = {
  // Font families
  fontFamily: {
    sans: '"Helvetica Neue", Arial, sans-serif',
  },

  // Font sizes (with line height and weight)
  fontSize: {
    hero: { size: "34px", lineHeight: "1.2", fontWeight: "800", letterSpacing: "0" },
    display: { size: "26px", lineHeight: "1.25", fontWeight: "800", letterSpacing: "0.5px" },
    
    h1: { size: "24px", lineHeight: "1.25", fontWeight: "800", letterSpacing: "0" },
    h2: { size: "20px", lineHeight: "1.3", fontWeight: "700", letterSpacing: "0" },
    h3: { size: "16px", lineHeight: "1.35", fontWeight: "700", letterSpacing: "0" },
    h4: { size: "15px", lineHeight: "1.35", fontWeight: "700", letterSpacing: "0" },
    h5: { size: "14px", lineHeight: "1.4", fontWeight: "700", letterSpacing: "0" },
    h6: { size: "13px", lineHeight: "1.4", fontWeight: "700", letterSpacing: "0" },
    
    body: { size: "14px", lineHeight: "1.5" },
    bodySm: { size: "13px", lineHeight: "1.5" },
    caption: { size: "12px", lineHeight: "1.4" },
    captionSm: { size: "11px", lineHeight: "1.4" },
    tiny: { size: "10px", lineHeight: "1.4" },
    micro: { size: "9px", lineHeight: "1.4", letterSpacing: "2px" },
    
    label: { size: "12px", lineHeight: "1.4", fontWeight: "700", letterSpacing: "0.5px" },
    labelSm: { size: "11px", lineHeight: "1.4", fontWeight: "800", letterSpacing: "1px" },
    labelXs: { size: "10px", lineHeight: "1.4", fontWeight: "800", letterSpacing: "1px" },
  },

  // Font weights
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
} as const;

export const spacing = {
  xs: "8px",
  sm: "16px",
  md: "24px",
  lg: "32px",
  xl: "48px",
  "2xl": "64px",
  "3xl": "96px",
} as const;

export const borderRadius = {
  xs: "4px",
  sm: "6px",
  base: "8px",
  md: "10px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  "3xl": "24px",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  none: "none",
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

export const motion = {
  // Durations
  duration: {
    fast: "150ms",
    base: "200ms",
    slow: "300ms",
    slower: "400ms",
  },

  // Easing functions
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    easeOutSmooth: "cubic-bezier(0.16, 1, 0.3, 1)",
    easeInSmooth: "cubic-bezier(0.7, 0, 0.84, 0)",
  },

  // Spring configs (for Framer Motion)
  spring: {
    default: { type: "spring", duration: 0.5, bounce: 0 },
    bouncy: { type: "spring", duration: 0.5, bounce: 0.2 },
    gentle: { type: "spring", duration: 0.6, bounce: 0.1 },
    snappy: { type: "spring", duration: 0.3, bounce: 0 },
  },
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/**
 * Category badge colors
 * Maps category slugs to their display colors
 */
export const categoryColors: Record<string, string> = {
  ghana: colors.category.ghana.hex,
  nigeria: colors.category.nigeria.hex,
  africa: colors.category.africa.hex,
  world: colors.category.world.hex,
  politics: colors.category.politics.hex,
  business: colors.category.business.hex,
  entertainment: colors.category.entertainment.hex,
  sports: colors.category.sports.hex,
};

/**
 * Get category color by slug
 */
export function getCategoryColor(slug: string): string {
  return categoryColors[slug.toLowerCase()] || colors.vntv.red;
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
