/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      keyframes: {
        "slide-down": {
          "0%": { transform: "translateX(-50%) translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateX(-50%) translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-down": "slide-down 0.3s ease-out",
      },
    },
  },
  plugins: [],
}
