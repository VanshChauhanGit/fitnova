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
        primary: '#2D9CDB',
        accent: '#F2C94C',
        surface: '#121417',
        surfaceMuted: '#1F2328',
        surfaceCard: '#1A1D24',
        borderMuted: '#2D333B',
        textLight: '#E8EAED',
        textMuted: '#9AA0A6',

        // Theme compatibility tokens
        bgDark: '#121417',
        cardDark: '#1F2328',
        cardDarkSecondary: '#16191E',
        cardBorder: '#2D333B',
        accentTeal: '#2D9CDB',
        accentMint: '#F2C94C',
        accentGreen: '#2D9CDB',
        accentGreenBright: '#2D9CDB',
        accentCyan: '#2D9CDB',
        accentOrange: '#F2C94C',
        textSecondary: '#9AA0A6',
      },
    },
  },
  plugins: [],
};
