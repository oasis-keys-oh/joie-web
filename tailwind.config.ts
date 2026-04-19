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
        morocco: '#1B2B4B',
        france: '#2E5544',
        paris: '#3D3D3D',
        transit: '#6B7280',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
