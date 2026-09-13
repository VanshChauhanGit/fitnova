/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './navigation/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bgDark: '#EBF7F4',
        cardDark: '#FFFFFF',
        cardDarkSecondary: '#D8F3EB',
        cardBorder: 'rgba(1, 115, 116, 0.18)',
        accentTeal: '#017374',
        accentMint: '#C2ECE2',
        accentGreen: '#017374',
        accentGreenBright: '#015B5C',
        accentCyan: '#017374',
        accentOrange: '#F97316',
        textMuted: '#3A7574',
        textSecondary: '#025C5D',
      },
    },
  },
  plugins: [],
};
