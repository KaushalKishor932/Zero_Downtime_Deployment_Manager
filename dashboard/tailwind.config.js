/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#ffffff',     // Main background
                    surface: '#f1f5f9',  // Secondary background (slate-100)
                    accent: '#4f46e5',   // Indigo-600
                    dim: '#94a3b8'       // Slate-400
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                glow: {
                    'from': { boxShadow: '0 0 10px -10px rgba(99, 102, 241, 0)' },
                    'to': { boxShadow: '0 0 20px -5px rgba(99, 102, 241, 0.5)' },
                }
            }
        },
    },
    plugins: [],
}
