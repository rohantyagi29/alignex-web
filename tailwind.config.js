/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82C4',
        'primary-dark': '#2C6EA8',
        'primary-light': '#5B9CD4',
        'primary-bg': '#EBF4FF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(135deg, #3B82C4 0%, #2C6EA8 100%)',
      },
    },
  },
  plugins: [],
}
