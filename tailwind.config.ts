import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1B2B4B',
        gold: '#C9A84C',
        'gold-light': 'rgba(201,168,76,0.12)',
        'gold-muted': 'rgba(201,168,76,0.35)',
        ink: '#1a1a1a',
        'ink-muted': '#6b6b6b',
        'ink-faint': '#f5f4f1',
        morocco: '#1B2B4B',
        france: '#2E5544',
        paris: '#3D3D3D',
        transit: '#6B7280',
        parchment: '#faf8f4',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'hero': ['6rem', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '36': '9rem',
      },
      letterSpacing: {
        'widest2': '0.2em',
        'widest3': '0.3em',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)',
        'gradient-day': 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
