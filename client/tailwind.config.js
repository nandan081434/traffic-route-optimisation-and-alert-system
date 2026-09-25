/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070b14',
          900: '#0b1120',
          850: '#0f172a',
          800: '#1e293b',
          700: '#334155'
        },
        traffic: {
          low: '#10b981',      // Emerald Green
          moderate: '#f59e0b', // Amber
          high: '#f97316',     // Orange
          severe: '#ef4444',   // Red
          closed: '#475569'    // Slate
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite'
      }
    },
  },
  plugins: [],
}
