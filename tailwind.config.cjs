/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        dmSans: ['DM Sans'],
      },
      colors: {
        purple: { 450: '#4B0DAF', 350: '#914EFB', 100: '#F7F1FF', 50: '#F4EDFE' },
        darkPurple: { 450: '#390D7F' },
        orange: { 450: '#C2410C', 350: '#FF900E', 50: '#FFF3E6' },
        gray: { 450: '#E5E7EB', 550: '#969EA1', 50: '#EEEEEE', 25: '#EEF1F4' },
        green: { 350: '#4BC0C0', 250: '#28b446', 100: '#28B44614', 50: '#EDF8F8' },
        red: { 500: '#EF4444', 450: '#FA5252', 350: '#E61B23' },
        blue: {
          500: '#001F4B',
          350: '#2938F7',
          250: '#0EA8FF',
          200: '#4EB2FB',
          100: '#F1F9FF',
          50: '#E9EBFE',
        },
        yellow: { 350: '#F6BE2C', 250: '#f6be2c14' },
      },
      screens: {
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
};
