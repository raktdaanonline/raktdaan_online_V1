/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        cinzel: ['Cinzel', 'Georgia', 'serif'],
      },
      colors: {
        accent: '#e11d48',
        'accent-2': '#fb7185',
        'accent-dark': '#dc2626',
        primary: '#2563eb',
        'primary-2': '#38bdf8',
      },
      animation: {
        'float-orb': 'float-orb 22s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 1s ease-out',
        'pulse-scale': 'pulse-scale 3.2s ease-in-out infinite',
        'sheen-idle': 'sheenIdle 6.2s ease-in-out infinite',
        'hero-mesh': 'heroMesh 14s ease-in-out infinite',
        'pulse-heart': 'pulse-heart 2s ease-in-out infinite',
      },
      keyframes: {
        'float-orb': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(55px, -45px) scale(1.08)' },
          '66%': { transform: 'translate(-35px, 35px) scale(0.92)' },
        },
        'fadeInUp': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'sheenIdle': {
          '0%': { transform: 'translateX(-70%) rotate(10deg)', opacity: '0.12' },
          '55%': { transform: 'translateX(10%) rotate(10deg)', opacity: '0.20' },
          '100%': { transform: 'translateX(70%) rotate(10deg)', opacity: '0.12' },
        },
        'heroMesh': {
          '0%': { transform: 'translate3d(-2%, -1%, 0) scale(1)' },
          '50%': { transform: 'translate3d(2%, 2%, 0) scale(1.05)' },
          '100%': { transform: 'translate3d(-2%, -1%, 0) scale(1)' },
        },
        'pulse-heart': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.15)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
