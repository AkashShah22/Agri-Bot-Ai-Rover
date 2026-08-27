/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        darkBg:"#0B0F17",
        darkCard:"#131B2A",
        cardBorder:"#1E293B"
      }
    },
  },
  plugins: [],
}

