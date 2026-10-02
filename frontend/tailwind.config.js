/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ramyaa: {
          pink: {
            DEFAULT: '#E785B1',
            50: '#FDF5F8',
            100: '#FBE9F1',
            200: '#F7C9DF',
            300: '#F1A2C8',
            400: '#E785B1',
            500: '#D65893',
            600: '#BE3776',
            700: '#9E285F',
            800: '#832450',
            900: '#6D2244',
          },
          blue: {
            DEFAULT: '#1E65B3',
            50: '#F0F6FC',
            100: '#E0EDF9',
            200: '#BBD8F3',
            300: '#82B7EA',
            400: '#4390DC',
            500: '#1E65B3',
            600: '#154E94',
            700: '#133E78',
            800: '#133563',
            900: '#142D52',
          },
          gold: {
            DEFAULT: '#C5A059',
            light: '#E6CF9B',
            dark: '#9A7733',
          },
          cream: '#FDFBF7',
          sand: '#FAF4EB',
          charcoal: '#1A2332',
        }
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-outfit)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(231, 133, 177, 0.15), 0 2px 6px -1px rgba(30, 101, 179, 0.1)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 0 15px 0 rgba(231, 133, 177, 0.05)',
        'glass': '0 8px 32px 0 rgba(30, 101, 179, 0.08)',
      }
    },
  },
  plugins: [],
};
