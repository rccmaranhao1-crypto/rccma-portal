import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rcc: {
          green: "#006036",
          green2: "#009049",
          dark: "#004058",
          yellow: "#fdc800",
          blue: "#b8d0dc",
          white: "#ffffff"
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
