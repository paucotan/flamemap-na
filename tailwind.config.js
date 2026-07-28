/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flamap: {
          dark: '#0f1115',
          panel: 'rgba(18, 22, 28, 0.85)',
          border: 'rgba(255, 255, 255, 0.1)',
          orange: '#ff5722',
          yellow: '#ffc107',
          red: '#f44336',
          purple: '#9c27b0',
        }
      }
    },
  },
  plugins: [],
}
