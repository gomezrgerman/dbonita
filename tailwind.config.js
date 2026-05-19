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
        // ── Base canvas ───────────────────────────
        bg:      '#faf9f7',
        surface: '#ffffff',
        text:    '#000000',
        'text-muted': '#9f9b93',
        'text-dark':  '#55534e',
        accent:       '#dad4c8',
        'accent-light': '#eee9df',

        // ── Colores de marca D Bonita ─────────────
        brand:          '#F9BC1A',   /* amarillo logo */
        'brand-dark':   '#D9A010',
        'brand-light':  '#FDE9A0',
        'brand-blue':   '#6CC4E6',   /* azul logo */
        'brand-blue-light': '#D6EFFA',

        // ── Alias (compatibilidad componentes) ───
        primary:      '#F9BC1A',
        'primary-dark': '#D9A010',
        pomegranate:  '#F9BC1A',
        lemon:        '#F9BC1A',
        'lemon-light':  '#FDE9A0',
        'lemon-dark':   '#D9A010',
        ube:          '#6CC4E6',
        'ube-light':    '#D6EFFA',
        matcha:       '#6CC4E6',
        'matcha-dark':  '#000000',
        'matcha-light': '#D6EFFA',
        slushie:      '#6CC4E6',
        blueberry:    '#3A9DC4',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Arial', 'sans-serif'],
        sans:    ['"Plus Jakarta Sans"', 'Arial', 'sans-serif'],
        mono:    ['"Space Mono"', 'monospace'],
      },
      borderRadius: {
        sharp:   '4px',
        card:    '12px',
        feature: '24px',
        section: '40px',
        pill:    '9999px',
      },
      boxShadow: {
        clay: 'rgba(0,0,0,0.10) 0px 1px 1px, rgba(0,0,0,0.04) 0px -1px 1px inset, rgba(0,0,0,0.05) 0px -0.5px 1px',
        hard: 'rgb(0,0,0) -7px 7px',
      },
      animation: {
        ticker: 'ticker 30s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function ({ addUtilities }) {
      addUtilities({
        '.bg-gradient-radial': {
          backgroundImage: 'radial-gradient(var(--tw-gradient-stops))',
        },
      })
    },
  ],
}
