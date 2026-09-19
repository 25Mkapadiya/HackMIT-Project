import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0a0d12",
          900: "#0f141b",
          850: "#131924",
          800: "#182130",
          700: "#223044",
          600: "#2b3a52",
        },
        ink: {
          100: "#eef2f7",
          300: "#b8c3d1",
          500: "#7d8ba0",
          700: "#4c5972",
        },
        accent: {
          power: "#f2b93b",
          water: "#3ba9f2",
          fiber: "#9b6ef2",
          env: "#3bf2a0",
          community: "#f2703b",
          existing: "#8fa3bf",
          proposed: "#ff5470",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset",
      },
      animation: {
        "fade-in": "fadeIn 0.18s ease-out",
        "slide-up": "slideUp 0.22s cubic-bezier(0.16,1,0.3,1)",
        "pulse-ring": "pulseRing 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "80%": { transform: "scale(1.8)", opacity: "0" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
