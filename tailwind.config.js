/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        mint: "#C7F9CC",
        cyan: "#38BDF8",
        grape: "#6D5DF6"
      },
      boxShadow: {
        panel: "0 18px 60px rgba(16, 24, 32, 0.12)"
      }
    }
  },
  plugins: []
};
