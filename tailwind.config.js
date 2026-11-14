/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E0E10",
        paper: "#F6F5F1",
        card: "#FFFFFF",
        lime: { DEFAULT: "#D6FF3F", dark: "#B8E01F" },
        muted: "#6B6B73",
        line: "#E6E4DD",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(14,14,16,.04), 0 8px 24px -8px rgba(14,14,16,.10)",
        lift: "0 2px 4px rgba(14,14,16,.05), 0 20px 40px -12px rgba(14,14,16,.18)",
      },
    },
  },
  plugins: [],
};
