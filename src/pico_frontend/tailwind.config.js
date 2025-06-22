/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'lexend': ['Lexend Deca', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'sans': ['Lexend Deca', 'sans-serif'], // Override default sans font
      },
    },
  },
  plugins: [],
} 