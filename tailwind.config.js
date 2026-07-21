/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 宣纸系
        paper: {
          50: "#FAF7F0",
          100: "#F5F1E8",
          200: "#EDE6D3",
          300: "#DDD2B5",
        },
        // 墨色
        ink: {
          50: "#3A3A3A",
          900: "#0A0A0A",
          950: "#050505",
        },
        // 朱砂
        cinnabar: {
          DEFAULT: "#C8392B",
          dark: "#9E2A20",
          light: "#E15D4F",
        },
        // 竹青
        bamboo: "#5A7A6B",
        // 淡金
        gold: "#B89968",
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Songti SC"', '"STSong"', '"SimSun"', "serif"],
        kai: ['"LXGW WenKai"', '"Kaiti SC"', '"STKaiti"', "serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        ink: "0 4px 24px -4px rgba(10,10,10,0.35)",
        seal: "0 2px 8px rgba(200,57,43,0.45)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 20% 30%, rgba(184,153,104,0.06) 0, transparent 50%), radial-gradient(circle at 80% 70%, rgba(200,57,43,0.04) 0, transparent 55%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "drop-ink": "dropInk 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        "brush-in": "brushIn 0.9s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        dropInk: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "0.95" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        brushIn: {
          "0%": { clipPath: "inset(0 100% 0 0)" },
          "100%": { clipPath: "inset(0 0 0 0)" },
        },
      },
    },
  },
  plugins: [],
};
