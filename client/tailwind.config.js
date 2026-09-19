/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        holst: {
          navy: {
            950: '#060E18',
            900: '#0D1B2A',
            800: '#1B263B',
            700: '#243447',
            600: '#2D4155',
          },
          blue: {
            DEFAULT: '#415A77',
            light: '#5A7A9E',
            muted: '#6B8AAE',
          },
          sage: {
            DEFAULT: '#778D7A',
            light: '#8FA192',
            muted: '#96A899',
          },
          sand: {
            DEFAULT: '#D4C4A8',
            light: '#E0D4BC',
            dark: '#C4B498',
            warm: '#CCB898',
          },
          cream: {
            DEFAULT: '#F4F1DE',
            light: '#F8F6EC',
            dark: '#EDE8D0',
          },
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        accent: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        // Neumorphism - light raised
        'neu': '6px 6px 12px #d1ccc0',
        'neu-sm': '3px 3px 6px #d1ccc0',
        'neu-lg': '10px 10px 20px #d1ccc0',
        'neu-xl': '15px 15px 30px #d1ccc0',
        // Neumorphism - inset
        'neu-inset': 'inset 3px 3px 6px #d1ccc0',
        'neu-inset-lg': 'inset 5px 5px 10px #d1ccc0',
        // Neumorphism - dark
        'neu-dark': '6px 6px 12px #0a1420, -6px -6px 12px #1e3044',
        'neu-dark-inset': 'inset 3px 3px 6px #0a1420, inset -3px -3px 6px #1e3044',
        // Glow effects removed
        // Glow effects removed
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
};
