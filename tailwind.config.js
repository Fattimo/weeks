/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Complex site-specific column configuration
        'goal-grid': 'min-content repeat(7, 1fr)',
      },
    },
  },
  plugins: [],
}
