/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#283142',
          950: '#030712',
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
          },
          '50%': {
            transform: 'scale(1.01)',
            boxShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.5)',
          },
        },
        'bounce-slow': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-4px)',
          },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    // Safelist dynamic color classes used in components
    'bg-blue-50', 'bg-blue-100', 'bg-blue-600', 'border-blue-200', 'border-blue-300', 'text-blue-400', 'text-blue-600',
    'bg-green-50', 'bg-green-100', 'bg-green-600', 'border-green-200', 'border-green-300', 'text-green-400', 'text-green-600',
    'bg-purple-50', 'bg-purple-100', 'bg-purple-600', 'border-purple-200', 'border-purple-300', 'text-purple-400', 'text-purple-600',
    'bg-orange-50', 'bg-orange-100', 'bg-orange-600', 'border-orange-200', 'border-orange-300', 'text-orange-400', 'text-orange-600',
    'bg-cyan-50', 'bg-cyan-100', 'bg-cyan-600', 'border-cyan-200', 'border-cyan-300', 'text-cyan-400', 'text-cyan-600',
    'bg-amber-50', 'bg-amber-100', 'bg-amber-600', 'border-amber-200', 'border-amber-300', 'text-amber-400', 'text-amber-600',
  ]
}