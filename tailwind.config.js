/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#FFF8EF',
          surface: '#FFFFFF',
          primary: '#6558E8',
          'primary-dark': '#4C40C7',
          accent: '#FFB84D',
          success: '#36B879',
          danger: '#F06B6B',
          text: '#25233A',
          muted: '#77758A',
          'board-a': '#F4E9D8',
          'board-b': '#FFFDF8',
          border: '#E9E2D9',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-short': 'bounce 0.5s ease-in-out 2',
        'wiggle': 'wiggle 0.3s ease-in-out infinite',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
};
