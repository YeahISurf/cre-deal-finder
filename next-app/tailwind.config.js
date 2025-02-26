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
          '50': '#f0f7ff',
          '100': '#e0eefe',
          '200': '#bae0fd',
          '300': '#7cc8fb',
          '400': '#36aaf4',
          '500': '#0d96e6',
          '600': '#0077c2',
          '700': '#015fa0',
          '800': '#065285',
          '900': '#08426e',
          '950': '#062947',
        },
      },
      boxShadow: {
        'apple': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05)',
        'apple-md': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}