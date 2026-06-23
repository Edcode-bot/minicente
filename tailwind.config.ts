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
        bg: "#0c0e0b",
        bg2: "#141610",
        bg3: "#1c1f18",
        bg4: "#252820",
        card: "#1a1d16",
        card2: "#20231b",
        ink: "#f0f2ec",
        ink2: "#a8b09f",
        ink3: "#6a7362",
        lime: "#c8f045",
        lime2: "#a8d032",
        amber: "#f0a830",
        red: "#e85540",
        blue: "#4a9eff",
        teal: "#2dd4a0",
        purple: "#a78bfa",
        line: "rgba(255,255,255,0.07)",
        line2: "rgba(255,255,255,0.12)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl2: "20px",
        xl3: "28px",
      },
    },
  },
  plugins: [],
};

export default config;
