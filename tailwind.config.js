/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e2e1ff',
          200: '#c9c7fe',
          300: '#a9a5fd',
          400: '#8782fa',
          500: '#6b5ff5',
          600: '#5a45ea',
          700: '#4c34d0',
          800: '#3f2baa',
          900: '#352887',
          950: '#1f1752',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
