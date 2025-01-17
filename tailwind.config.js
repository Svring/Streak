const {nextui} = require("@nextui-org/theme");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        backdrop0: "#000000",
        backdrop1: "#1c1917",
        backdrop2: "#282524",
        backdrop3: "#363231",
        fontColorWhite: "#ffffff",
        fontColorGray: "#a09c99",
        accentGold: "#f1e398",
        accentBlue: "#c2dce4",
        accentGray: "#9e9996",
        accentDark: "#191c1f",
        accentScarlet: "#df3562",
        accentGreen: "#a6e8c2"
      },
      fontFamily: {
        sans: ["proxima-nova", "sans-serif"],
        serif: ["Athelas", "serif"],
        baskervville: ["Baskervville", "serif"],
        spectral: ["Spectral", "serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
} 