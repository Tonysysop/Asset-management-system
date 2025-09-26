/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bua-red": "#C41E3A",
        "bua-gold": "#FFD700",
        "bua-dark-red": "#A01729",
        "bua-light-red": "#E53E3E",
        "bua-dark-blue": "#000020",
        ring: "#C41E3A",
      },
    },
  },
  plugins: [],
};
