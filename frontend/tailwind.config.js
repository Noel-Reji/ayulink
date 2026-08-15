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
          50: '#eef8f6',
          100: '#d4efe9',
          200: '#acded4',
          300: '#7bc5b9',
          400: '#4da99c',
          500: '#328d81',
          600: '#257067',
          700: '#205a54',
          800: '#1d4843',
          900: '#1b3c38',
          950: '#0b2220',
        },
        clinical: {
          available: '#10b981',
          unavailable: '#ef4444',
          uncertain: '#f59e0b',
          pending: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
