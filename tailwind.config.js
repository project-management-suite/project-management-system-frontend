/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: "#D35A5C",
        textStrong: "#111111",
        textSoft: "#333333",
        tileLight: "#ffffff",
        tileDark: "#161616",
        bgLight: "#f7f7f7",
        bgDark: "#0f0f0f",
      },
      boxShadow: {
        glass: "0 8px 36px -12px rgba(0,0,0,0.15)",
        tile: "6px 6px 14px rgba(0,0,0,0.10), -6px -6px 14px rgba(255,255,255,0.85)",
      },
      backdropBlur: {
        10: "10px",
        14: "14px",
        18: "18px",
      },
    },
  },
  plugins: [],
};
