/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                garden: {
                    100: '#f0fdf4',
                    200: '#dcfce7',
                    300: '#bbf7d0',
                    400: '#86efac',
                    500: '#4ade80',
                    600: '#22c55e',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                earth: {
                    100: '#fdf4f0',
                    800: '#5c4033',
                }
            },
            animation: {
                'sway': 'sway 3s ease-in-out infinite',
                'grow': 'grow 1s ease-out forwards',
            },
            keyframes: {
                sway: {
                    '0%, 100%': { transform: 'rotate(-5deg)' },
                    '50%': { transform: 'rotate(5deg)' },
                },
                grow: {
                    '0%': { transform: 'scale(0)' },
                    '100%': { transform: 'scale(1)' },
                }
            }
        },
    },
    plugins: [],
}
