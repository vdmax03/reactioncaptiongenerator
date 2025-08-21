/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1e40af',
        'brand-secondary': '#3b82f6',
        'dark-bg': '#111827',
        'dark-card': '#1f2937',
        'dark-text': '#d1d5db',
        'dark-border': '#374151',
      }
    },
  },
  plugins: [],
}
