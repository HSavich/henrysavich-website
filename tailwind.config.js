/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "theme-blue": "#3399ee",
        "theme-brown": "#44332a",
        "theme-lightgray": "#e9e9e9",
        "theme-mediumgray": "#bbbbbb",
      },
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
        ptSerif: ["PT Serif", "sans-serif"],
      },
    },
  },
  plugins: [],
};
