/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        textMuted: 'var(--color-text-muted)',
        primary: 'var(--color-primary)',
        primaryHover: 'var(--color-primary-hover)',
        title: 'var(--color-title)',
        chapita: 'var(--color-chapita)',
        crema: 'var(--color-crema)',
        arena: 'var(--color-arena)',
        cafe: 'var(--color-cafe)',
        turquesa: 'var(--color-turquesa)',
        cobreClaro: 'var(--color-cobre-claro)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
