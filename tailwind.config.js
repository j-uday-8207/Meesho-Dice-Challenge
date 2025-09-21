/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'meesho': {
          'purple': '#580A46',
          'orange': '#FF9C00',
          'purple-light': '#7A1B69',
          'purple-dark': '#3D0731',
          'orange-light': '#FFAB33',
          'orange-dark': '#E68A00',
        }
      },
    },
  },
  plugins: [],
};
