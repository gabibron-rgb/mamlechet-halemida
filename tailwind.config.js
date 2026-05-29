/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Heebo"', '"Rubik"', 'system-ui', 'sans-serif'],
      },
      colors: {
        magic: {
          bg: '#1a1033',
          panel: '#2a1d4f',
          accent: '#ffd166',
          soft: '#b8a4ff',
        },
        rarity: {
          common: '#9ca3af',
          uncommon: '#22c55e',
          rare: '#3b82f6',
          epic: '#a855f7',
          legendary: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
}