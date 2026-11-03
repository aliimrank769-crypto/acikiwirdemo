/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: 'var(--color-primary)',
        'primary-soft': 'var(--color-primary-soft)',
        accent: 'var(--color-accent)',
        'accent-soft': 'var(--color-accent-soft)',
        btn: 'var(--color-btn)',
      },
      boxShadow: {
        'sheet': '0 -10px 40px -10px rgba(15, 23, 42, 0.22)',
        'floating': '0 10px 30px -5px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
};

