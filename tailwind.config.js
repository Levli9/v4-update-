/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          850: "#18202d"
        },
        cyber: {
          dark: "#07070f",
          card: "#0d0d1f",
          border: "#1a1a2e",
          cyan: "#00e6ff",
          purple: "#9d4edd",
          pink: "#f72585",
          green: "#00e676",
          red: "#f94144",
          yellow: "#ffb703"
        }
      }
    },
  },
  plugins: [],
}
