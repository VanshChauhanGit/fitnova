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
        bgDark: '#0B0E14',
        cardDark: '#151B26',
        cardDarkSecondary: '#1C2E24',
        cardBorder: 'rgba(255, 255, 255, 0.08)',
        accentGreen: '#10B981',
        accentGreenBright: '#00E676',
        accentCyan: '#06B6D4',
        accentOrange: '#F97316',
        textMuted: '#94A3B8',
        textSecondary: '#CBD5E1',
      },
    },
  },
  plugins: [],
};
