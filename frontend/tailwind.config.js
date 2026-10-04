import containerQueries from '@tailwindcss/container-queries'
import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Zinc base; shades 600-950 come from CSS variables so dark mode can
        // use its own palette (see --gray-* in src/assets/main.css)
        gray: {
          ...colors.zinc,
          600: 'rgb(var(--gray-600) / <alpha-value>)',
          700: 'rgb(var(--gray-700) / <alpha-value>)',
          800: 'rgb(var(--gray-800) / <alpha-value>)',
          900: 'rgb(var(--gray-900) / <alpha-value>)',
          950: 'rgb(var(--gray-950) / <alpha-value>)',
        },
        primary: {
          50: '#fef5ea',
          100: '#fde7ca',
          200: '#fcd098',
          300: '#fab05b',
          400: '#f78f2f',
          500: '#F0812A',
          600: '#e46a16',
          700: '#bd4f13',
          800: '#973f17',
          900: '#7a3616',
        },
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      }
    },
  },
  plugins: [
    containerQueries,
  ],
}
