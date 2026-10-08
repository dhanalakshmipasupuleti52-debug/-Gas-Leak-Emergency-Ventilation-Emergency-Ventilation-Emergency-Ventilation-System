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
        scada: {
          darkest: '#07090e',
          bg: '#0c1017',
          card: '#121824',
          cardHover: '#172030',
          border: '#1f2b3e',
          borderLight: '#2c3c54',
          cyan: '#00f0ff',
          neonGreen: '#00ff66',
          amber: '#ffaa00',
          danger: '#ff2a4b',
          electricBlue: '#0070f3',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 6s linear infinite',
        'spin-medium': 'spin 2s linear infinite',
        'spin-fast': 'spin 0.4s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
