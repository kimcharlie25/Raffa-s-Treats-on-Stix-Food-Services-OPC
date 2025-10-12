/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Raffa's Treats on Stix palette
        raffa: {
          yellow: '#F4C430', // primary brand yellow (approx)
          orange: '#F28C28', // secondary orange
          red: '#C83B2B', // warm red accents
          dark: '#5A2F21', // chocolate brown
          cream: '#FFF4D9' // warm cream background
        },
        red: {
          50: '#fff1f1',
          100: '#ffd9d6',
          200: '#ffb4ad',
          300: '#ff8f84',
          400: '#ff6a5b',
          500: '#C83B2B',
          600: '#a33124',
          700: '#7f271d',
          800: '#5a1d16',
          900: '#36130f'
        },
        yellow: {
          50: '#fff8e6',
          100: '#fff1cc',
          200: '#ffe399',
          300: '#ffd666',
          400: '#ffc933',
          500: '#F4C430',
          600: '#d1a82a',
          700: '#ae8d23',
          800: '#8b711c',
          900: '#685615'
        },
        orange: {
          500: '#F28C28'
        },
        brown: {
          700: '#5A2F21'
        }
      },
      fontFamily: {
        'fredoka': ['Fredoka', 'system-ui', 'sans-serif'],
        'lilita': ['"Lilita One"', 'cursive'],
        'inter': ['Fredoka', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
};