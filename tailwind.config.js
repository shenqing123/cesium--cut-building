/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    // spacing: Array.from({ length: 1000 }).reduce((map, _, index) => {
    //   map[index] = `${index}px`;
    //   return map;
    // }, {}),
    container: {
      center: true,
      padding: '10rem'
    },
    extend: {
      colors: {
        'main-blue': '#00668A',
        'dark-blue': '#004e71'
      },

    },
  },
  plugins: [],
}

