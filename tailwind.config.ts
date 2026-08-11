import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep charcoal / near-black base ramp.
        base: {
          DEFAULT: '#06080a',
          950: '#06080a',
          900: '#0a0d11',
          800: '#0f141a',
          700: '#161c24',
          600: '#1f2732',
        },
        // Restrained neon accents — used sparingly, mostly as low-opacity glows.
        neon: {
          cyan: '#57e0ff',
          green: '#69f0b4',
        },
        // Subtle warm accent for rare emphasis.
        warm: '#f0b866',
        line: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      maxWidth: {
        container: '1200px',
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(87, 224, 255, 0.35)',
        'glow-green': '0 0 40px -12px rgba(105, 240, 180, 0.35)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'grain-shift': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-2%, 1%)' },
          '50%': { transform: 'translate(1%, -2%)' },
          '75%': { transform: 'translate(-1%, 2%)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 3.5s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'grain-shift': 'grain-shift 8s steps(4) infinite',
      },
    },
  },
  plugins: [],
}

export default config
