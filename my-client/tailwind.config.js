/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "team-blue": {
                    DEFAULT: "#3B82F6",
                    light: "#93C5FD",
                    dark: "#1D4ED8",
                    bg: "#EFF6FF",
                },
                "team-green": {
                    DEFAULT: "#22C55E",
                    light: "#86EFAC",
                    dark: "#15803D",
                    bg: "#F0FDF4",
                },
            },
            animation: {
                "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "bounce-in": "bounceIn 0.5s ease-out",
                "slide-up": "slideUp 0.3s ease-out",
            },
            keyframes: {
                bounceIn: {
                    "0%": { transform: "scale(0.3)", opacity: "0" },
                    "50%": { transform: "scale(1.05)" },
                    "70%": { transform: "scale(0.9)" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
        },
    },
    plugins: [],
};
