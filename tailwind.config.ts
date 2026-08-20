import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep charcoal / near-black base ramp.
        // Retained ONLY for the black NEO product render + 3D hero canvas — the
        // product itself stays graphite with teal lighting for contrast.
        base: {
          DEFAULT: '#06080a',
          950: '#06080a',
          900: '#0a0d11',
          800: '#0f141a',
          700: '#161c24',
          600: '#1f2732',
        },
        // Bright accents used exclusively for the black NEO product lighting.
        neon: {
          cyan: '#57e0ff',
          green: '#69f0b4',
        },

        // ────────────────────────────────────────────────────────────
        //  Unified warm/light product theme — the single source of truth
        //  for both the landing page and the application.
        // ────────────────────────────────────────────────────────────
        ivory: '#F5F3EE', // primary background (app main + landing)
        sand: '#ECEAE4', // secondary background / sidebar
        card: {
          DEFAULT: '#FFFFFF', // primary card surface
          soft: '#F0EEE8', // soft card / inset surface
        },
        ink: {
          DEFAULT: '#171717', // primary text
          soft: '#66645E', // secondary text
          muted: '#8A8881', // muted / tertiary text
        },
        line: '#DCD9D1', // hairline border (name kept: existing border-line updates)
        teal: {
          DEFAULT: '#12AFC2', // primary accent
          soft: '#DDF7F7', // accent light (tint fills)
        },
        positive: {
          DEFAULT: '#55B889', // healthy / focused
          soft: '#E3F5EA',
        },
        highlight: '#F4C84A', // warm yellow (fills, badges)
        warm: '#E7A54A', // warm orange — cognitive load / fatigue text
        warning: '#E7A54A',
        danger: '#D96B63', // soft red — errors only
        coral: '#E28560',
        lime: '#C6E85A',
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
      borderRadius: {
        card: '18px',
      },
      boxShadow: {
        // Soft, warm card shadow used across the light application surfaces.
        card: '0 8px 30px rgba(30, 30, 20, 0.05)',
        'card-hover': '0 14px 40px rgba(30, 30, 20, 0.08)',
        // Bright glows — reserved for the 3D NEO product lighting only.
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
