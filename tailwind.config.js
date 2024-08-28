/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        spotify: "#1DB954",
        "spotify-active": "#1ed760;",

        "default-dark": "#1c1b22",
      },
    },
  },
  plugins: [],
};
