import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f3f6f8',
          100: '#e4eaee',
          200: '#c8d5dd',
          300: '#9fb3c0',
          400: '#5a7487',
          500: '#4d6d81',
          600: '#3a5668',
          700: '#304554',
          800: '#22333f',
          900: '#14232d',
          950: '#0b161e',
        },
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        teal: {
          50: '#effdf9',
          100: '#d5f8ee',
          200: '#adf0dd',
          300: '#77e2c7',
          400: '#3ecaa9',
          500: '#1eae90',
          600: '#148b75',
          700: '#126e5e',
          800: '#12584c',
          900: '#104940',
        },
        canvas: '#f7f8f7',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', '"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,35,45,.04), 0 8px 24px rgba(20,35,45,.06)',
        lift: '0 12px 40px rgba(20,35,45,.12)',
        focus: '0 0 0 3px rgba(30,174,144,.22)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.375rem',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        'fade-up': 'fade-up .35s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;
