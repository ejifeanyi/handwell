import type { Config } from 'tailwindcss';

// Tokens come straight from the Handwell Figma file (variables and text styles).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        linen: '#FAF6F0', sand: '#F1E9DD', line: '#E6DDCF',
        ink: '#1E2B27', 'ink-soft': '#5B6B65',
        pine: { DEFAULT: '#14463F', dark: '#0E332E' },
        sage: { DEFAULT: '#E3EEE7', mid: '#BBD4C4' },
        clay: { DEFAULT: '#C4532D', dark: '#A6431F', tint: '#FBE8DF' },
        marigold: '#F2B134',
        amber: { tint: '#FFF1D6', ink: '#8A5A00' },
        success: { DEFAULT: '#2E7D52', tint: '#DFF1E6' },
        danger: { DEFAULT: '#B3372D', tint: '#FBE4E1' },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Figtree Variable"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(40px, 6.2vw, 68px)', { lineHeight: '1.06', fontWeight: '600', letterSpacing: '-0.02em' }],
        h1: ['clamp(32px, 4.4vw, 48px)', { lineHeight: '1.12', fontWeight: '600', letterSpacing: '-0.015em' }],
        h2: ['clamp(26px, 3.2vw, 36px)', { lineHeight: '1.18', fontWeight: '600', letterSpacing: '-0.01em' }],
        h3: ['clamp(21px, 2.2vw, 26px)', { lineHeight: '1.25', fontWeight: '600' }],
        h4: ['20px', { lineHeight: '28px', fontWeight: '700' }],
        numeric: ['40px', { lineHeight: '44px', fontWeight: '600' }],
        lg: ['20px', { lineHeight: '30px' }],
        base: ['16px', { lineHeight: '24px' }],
        sm: ['14px', { lineHeight: '20px' }],
        xs: ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(14, 51, 46, 0.07)',
        card: '0 10px 28px rgba(14, 51, 46, 0.12)',
      },
      borderRadius: { card: '20px', panel: '24px' },
    },
  },
  plugins: [],
};
export default config;
