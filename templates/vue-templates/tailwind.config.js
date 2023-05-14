/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./templates/**/*.html', './dirt_fe_vue/src/**/*.vue'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Rowdies', 'cursive'],
      },
    },
  },
  plugins: [],
};
