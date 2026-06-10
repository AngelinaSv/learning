import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#05030a',
        dusk: '#090611',
        veil: '#160b24',
        rune: '#8b5cf6',
        aether: '#20e7ff',
        ember: '#f6c65b',
        plasma: '#ff3bd4',
      },
      boxShadow: {
        glow: '0 0 26px rgba(255, 59, 212, 0.18)',
        violet: '0 0 34px rgba(139, 92, 246, 0.22)',
        gold: '0 0 24px rgba(246, 198, 91, 0.16)',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
