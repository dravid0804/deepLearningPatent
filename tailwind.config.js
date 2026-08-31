/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ev: {
          bg: "#f8fafc",
          surface: "#ffffff",
          panel: "#f1f5f9",
          border: "#e2e8f0",
          borderDark: "#cbd5e1",
          text: "#0f172a",
          textMuted: "#64748b",
          cyan: "#0284c7",
          cyanLight: "#e0f2fe",
          blue: "#2563eb",
          blueLight: "#eff6ff",
          green: "#059669",
          greenLight: "#ecfdf5",
          amber: "#d97706",
          amberLight: "#fffbeb",
          crimson: "#dc2626",
          crimsonLight: "#fef2f2",
          purple: "#7c3aed",
          purpleLight: "#f5f3ff",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'glow-cyan': '0 0 20px -3px rgba(2, 132, 199, 0.3)',
        'glow-emerald': '0 0 20px -3px rgba(5, 150, 105, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 20s linear infinite',
      }
    },
  },
  plugins: [],
}
