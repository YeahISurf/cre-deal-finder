/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          '50': '#eef6ff',
          '100': '#d9eaff',
          '200': '#bbd8ff',
          '300': '#8ebfff',
          '400': '#5c9eff',
          '500': '#3b7fff',
          '600': '#1b5ef7',
          '700': '#1549e2',
          '800': '#173cb6',
          '900': '#19398f',
          '950': '#132257',
        },
      },
    },
  },
  plugins: [],
}