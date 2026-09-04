import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Base colors
        background: {
          DEFAULT: "var(--color-background)",
          panel: "var(--color-background-panel)",
          "panel-2": "var(--color-background-panel-2)",
        },
        border: "var(--color-border)",
        
        // Text colors (map to foreground variables)
        text: {
          primary: "var(--color-foreground)",
          secondary: "var(--color-foreground-muted)",
          tertiary: "var(--color-foreground-muted-2)",
        },
        
        // VNTV brand
        "vntv-red": {
          DEFAULT: "var(--color-vntv-red)",
          hover: "var(--color-vntv-red-hover)",
          dim: "var(--color-vntv-red-dim)",
          light: "var(--color-vntv-red-light)",
          bg: "var(--color-vntv-red-bg)",
        },
        
        // Category colors
        category: {
          ghana: "var(--color-category-ghana)",
          nigeria: "var(--color-category-nigeria)",
          africa: "var(--color-category-africa)",
          world: "var(--color-category-world)",
          politics: "var(--color-category-politics)",
          business: "var(--color-category-business)",
          entertainment: "var(--color-category-entertainment)",
          sports: "var(--color-category-sports)",
        },
        
        // Semantic colors
        success: {
          DEFAULT: "var(--color-success)",
          light: "var(--color-success-light)",
          dark: "var(--color-success-dark)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          light: "var(--color-error-light)",
          dark: "var(--color-error-dark)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          light: "var(--color-warning-light)",
          dark: "var(--color-warning-dark)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          light: "var(--color-info-light)",
          dark: "var(--color-info-dark)",
        },
      },
      fontFamily: {
        sans: ["var(--font-family-sans)"],
      },
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
        "5xl": "var(--font-size-5xl)",
      },
      spacing: {
        0: "var(--spacing-0)",
        1: "var(--spacing-1)",
        2: "var(--spacing-2)",
        3: "var(--spacing-3)",
        4: "var(--spacing-4)",
        5: "var(--spacing-5)",
        6: "var(--spacing-6)",
        7: "var(--spacing-7)",
        8: "var(--spacing-8)",
        10: "var(--spacing-10)",
        12: "var(--spacing-12)",
        14: "var(--spacing-14)",
        16: "var(--spacing-16)",
        18: "var(--spacing-18)",
        20: "var(--spacing-20)",
        22: "var(--spacing-22)",
        24: "var(--spacing-24)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
