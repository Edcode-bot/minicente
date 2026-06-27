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
        // ── User / light design tokens ─────────────────────────
        bg: "#ffffff",
        soft: "#f6f8f6",
        card: "#ffffff",
        ink: "#0e1512",
        ink2: "#4b554f",
        ink3: "#8a948d",
        line: "#e7eae7",
        primary: "#0f7a43",
        primaryPress: "#0c5f34",
        accent: "#1fb866",
        gold: "#b07d11",
        danger: "#c0392b",
        info: "#1d4ed8",

        // ── Investor / dark design tokens (inv- prefix) ─────────
        "inv-bg": "#0c0e0b",
        "inv-bg2": "#141610",
        "inv-bg3": "#1c1f18",
        "inv-bg4": "#252820",
        "inv-card": "#1a1d16",
        "inv-card2": "#20231b",
        "inv-ink": "#f0f2ec",
        "inv-ink2": "#a8b09f",
        "inv-ink3": "#6a7362",
        "inv-lime": "#c8f045",
        "inv-lime2": "#a8d032",
        "inv-amber": "#f0a830",
        "inv-red": "#e85540",
        "inv-blue": "#4a9eff",
        "inv-teal": "#2dd4a0",
        "inv-purple": "#a78bfa",
        "inv-line": "rgba(255,255,255,0.07)",
        "inv-line2": "rgba(255,255,255,0.12)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        // User tokens
        card: "20px",
        button: "16px",
        big: "28px",
        // Backwards-compat aliases (investor pages)
        xl2: "20px",
        xl3: "28px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        elevated: "0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)",
        subtle: "0 1px 2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
