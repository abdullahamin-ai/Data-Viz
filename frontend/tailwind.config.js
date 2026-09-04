export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["\"Fraunces\"", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: "#0B0D11",
        surface: "#14171D",
        surface2: "#1B1F27",
        hair: "rgba(255,255,255,.09)",
        brass: {
          DEFAULT: "#C9A24B",
          light: "#E4C67C",
          dark: "#9C7A34",
        },
        muted: "#8D93A0",
        faint: "#5C6270",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(201,162,75,.25), 0 24px 60px -24px rgba(201,162,75,.35)",
        card: "0 1px 0 rgba(255,255,255,.03) inset, 0 24px 48px -28px rgba(0,0,0,.65)",
        ring: "0 0 0 3px rgba(201,162,75,.18)",
      },
      keyframes: {
        ambient: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(3%, 4%) scale(1.06)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        rise: {
          "0%": { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        ambient: "ambient 24s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        rise: "rise .6s cubic-bezier(.16,1,.3,1) both",
      },
    },
  },
  plugins: [],
};
