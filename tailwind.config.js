/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5faec',
          100: '#e7f2d5',
          200: '#d1e8b1',
          300: '#b5da87',
          400: '#96c55d',
          500: '#79ab3e',
          600: '#5e862e',
          700: '#486825',
          800: '#3b5420',
          900: '#33461d',
          950: '#1a260d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
