/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        spotify: "#1DB954",
        "spotify-active": "#1ed760;",
      },
    },
  },
  plugins: [],
};
