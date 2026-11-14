/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#F4F4F2",
        card: "#FFFFFF",
        lime: { DEFAULT: "#D6FF3F", dark: "#B8E01F" },
        sale: "#E4002B",
        muted: "#6E6E73",
        line: "#E5E5E2",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Archivo", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17,17,17,.04), 0 8px 24px -8px rgba(17,17,17,.10)",
        lift: "0 2px 4px rgba(17,17,17,.05), 0 24px 48px -12px rgba(17,17,17,.22)",
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        rise: { "0%": { opacity: 0, transform: "translateY(14px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
      animation: { marquee: "marquee 28s linear infinite", rise: "rise .7s cubic-bezier(.2,.7,.2,1) both" },
    },
  },
  plugins: [],
};
