/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        manar: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#B9DDFF',
          300: '#7CC2FF',
          400: '#38A0FF',
          500: '#007CE6',
          600: '#0062BD',
          700: '#0A3871', // Brand Primary Royal Blue
          800: '#002B5B', // Deep Engineering Navy
          900: '#001E3D',
        },
        cyanWater: {
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
        },
        egyptGold: '#D97706'
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif']
      }
    },
  },
  plugins: [],
}
