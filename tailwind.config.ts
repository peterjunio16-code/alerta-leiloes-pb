import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#1a1a2e",
          surface: "#16213e",
          card: "#0f3460",
          accent: "#e63946",
          "accent-hover": "#c1121f",
          text: "#e0e0e0",
          muted: "#a0a0a0",
        },
        gold: {
          DEFAULT: "#C4962A",
          light: "#E8C56A",
          dark: "#A07318",
          subtle: "rgba(196,150,42,0.12)",
        },
        night: {
          950: "#060B18",
          900: "#0A1020",
          800: "#0D1424",
          700: "#111D32",
          600: "#1A2740",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
