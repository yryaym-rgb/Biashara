import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: 'var(--brand-blue)',
          'blue-dark': 'var(--brand-blue-dark)',
          gold: 'var(--brand-gold)',
          'gold-dark': 'var(--brand-gold-dark)',
        },
        ink: 'var(--ink)',
        body: 'var(--body)',
        muted: 'var(--muted)',
        bg: 'var(--bg)',
        'bg-tint': 'var(--bg-tint)',
        border: 'var(--border)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        'market-live': 'var(--market-live)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        button: '10px',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
