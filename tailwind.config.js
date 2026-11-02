/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFCF7',
          100: '#FFF8EE',
          200: '#FDEFD8',
          300: '#F9DFC0',
        },
        brand: {
          orange: '#FF7900',
          'orange-hover': '#E06900',
          'orange-light': '#FFF0E0',
          green: '#176B36',
          'green-hover': '#115228',
          'green-light': '#E8F5EC',
          charcoal: '#1E232A',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'elevated': '0 20px 40px -15px rgba(255, 121, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
