/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./src/components/ui/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bua-red": "#E30613",
        "bua-dark-blue": "#000020",
        ring: "#E30613",
      },
    },
  },
  plugins: [],
};
