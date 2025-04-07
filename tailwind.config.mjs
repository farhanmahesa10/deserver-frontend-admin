/** @type {import('tailwindcss').Config} */
import { Config } from "tailwindcss";
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "16px",
    },
    extend: {
      colors: {
        primary50: "#008ADA",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    fontFamily: {
      nunito: "Nunito",
      ubuntu: "Ubuntu",
    },
    dropShadow: {
      soft: "0px 4px 8px rgba(0, 0, 0, 0.05)",
      medium: "0px 4px 16px rgba(0, 0, 0, 0.16)",
      hard: "0px 4px 24px rgba(0, 0, 0, 0.24)",
    },
    colors: {
      "dark-primary": {
        50: "#FBFBFD",
        100: "#EDF0F9",
        200: "#D7DEF1",
        300: "#B8C3E7",
        400: "#90A2D9",
        500: "#5F79C8",
        600: "#3752A2",
        700: "#21305F",
        800: "#16203F",
        900: "#0F162C",
      },
      primary: {
        50: "#E6F7FF",
        100: "#BAE7FF",
        200: "#91D5FF",
        300: "#69C0FF",
        400: "#40A9FF",
        500: "#1890FF",
        600: "#096DD9",
        700: "#0050B3",
        800: "#003A8C",
        900: "#002766",
      },
      secondary: {
        50: "#FFFDFC",
        100: "#FEF7F1",
        200: "#FCECE0",
        300: "#F9DDC8",
        400: "#F6CAA8",
        500: "#F2B382",
        600: "#ED9755",
        700: "#E87721",
        800: "#84410E",
        900: "#442107",
      },
      red: colors.red,
      green: colors.green,
      yellow: colors.yellow,
      blue: colors.blue,
      slate: colors.slate,
      gray: colors.gray,
      neutral: colors.neutral,
      black: colors.black,
      white: colors.white,
    },
  },
  plugins: [],
};
