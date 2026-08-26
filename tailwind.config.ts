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
        // VNTV Brand Colors - Dark Theme
        "vn-bg": "#0b0b0d",
        "vn-panel": "#141417",
        "vn-panel-2": "#1b1b1f",
        "vn-border": "#2a2a2f",
        "vn-red": "#e0142c",
        "vn-red-dim": "#8a0f1e",
        "vn-text": "#f2f2f3",
        "vn-muted": "#9a9aa2",
        "vn-muted-2": "#6f6f78",
        
        // VNTV Brand Colors - Light Theme (to be refined)
        "vn-bg-light": "#ffffff",
        "vn-panel-light": "#f8f8f9",
        "vn-panel-2-light": "#f0f0f2",
        "vn-border-light": "#e1e1e6",
        "vn-text-light": "#0d0d0f",
        "vn-muted-light": "#52525a",
        "vn-muted-2-light": "#737380",
        
        // Category Colors
        "cat-ghana": "#e0142c",
        "cat-nigeria": "#f2a900",
        "cat-africa": "#2fbf6f",
        "cat-world": "#2ba8e0",
        "cat-politics": "#8a6ff2",
        "cat-business": "#f24f6f",
        "cat-entertainment": "#e04fbf",
        "cat-sports": "#5c6bf2",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      borderRadius: {
        "vn": "10px",
        "vn-sm": "6px",
        "vn-xs": "4px",
      },
      spacing: {
        "vn-xs": "8px",
        "vn-sm": "16px",
        "vn-md": "24px",
        "vn-lg": "32px",
        "vn-xl": "48px",
      },
    },
  },
  plugins: [],
};

export default config;
