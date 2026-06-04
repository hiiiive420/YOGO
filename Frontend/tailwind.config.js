/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#f8f4ec',
        pearl: '#fdfbf7',
        obsidian: '#050505',
        ink: '#121212',
        champagne: '#d7bd8b',
        cinnamon: '#a34d2c',
        lagoon: '#0f7c7f',
        lotus: '#d65d86',
        saffron: '#f2aa30',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 28px 80px rgba(0, 0, 0, 0.28)',
        glow: '0 24px 70px rgba(215, 189, 139, 0.18)',
      },
      backgroundImage: {
        'soft-noise':
          'radial-gradient(circle at 20% 20%, rgba(215, 189, 139, 0.18), transparent 28%), radial-gradient(circle at 80% 0%, rgba(15, 124, 127, 0.16), transparent 26%), linear-gradient(135deg, #050505 0%, #121212 50%, #050505 100%)',
      },
    },
  },
  plugins: [],
};
