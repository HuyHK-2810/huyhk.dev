import type { Config } from "tailwindcss"
import colors from 'tailwindcss/colors'

const config = {
    darkMode: ["class", "html"],
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1.5rem',
                sm: '1.5rem',
                lg: '2rem',
                xl: '4rem',
                '2xl': '4rem',
            },
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                slate: colors.slate,
                gray: colors.gray,
                transparent: "transparent",

                primary: {
                    '50': '#eef2ff',
                    '100': '#e0e7ff',
                    '200': '#c7d2fe',
                    '300': '#a5b4fc',
                    '400': '#818cf8',
                    '500': '#6366f1',
                    '600': '#4f46e5',
                    '700': '#4338ca',
                    '800': '#3730a3',
                    '900': '#312e81',
                    '950': '#1e1b4b',
                },

                secondary: {
                    '50': '#eff6ff',
                    '100': '#dbeafe',
                    '200': '#bfdbfe',
                    '300': '#93c5fd',
                    '400': '#60a5fa',
                    '500': '#3b82f6',
                    '600': '#2563eb',
                    '700': '#1d4ed8',
                    '800': '#1e40af',
                    '900': '#1e3a8a',
                    '950': '#172554',
                },

                accent: {
                    '50': '#f5f3ff',
                    '100': '#ede9fe',
                    '200': '#ddd6fe',
                    '300': '#c4b5fd',
                    '400': '#a78bfa',
                    '500': '#8b5cf6',
                    '600': '#7c3aed',
                    '700': '#6d28d9',
                    '800': '#5b21b6',
                    '900': '#4c1d95',
                },

                dark: {
                    DEFAULT: '#080B14',
                    '50': '#0d1117',
                    '100': '#0a0e1a',
                    '200': '#080B14',
                    '300': '#060810',
                },

                divider: {
                    light: colors.slate[200],
                    dark: 'rgba(255,255,255,0.08)',
                },
            },

            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-indigo': 'linear-gradient(135deg, #6366f1, #3b82f6)',
                'gradient-violet': 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            },

            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.563rem',
                '3xl': '1.953rem',
                '4xl': '2.441rem',
                '5xl': '3.052rem',
                '6xl': '3.75rem',
                '7xl': '4.5rem',
                '8xl': '6rem',
            },

            keyframes: {
                "fade-up": {
                    from: { opacity: '0', transform: "translateY(24px)" },
                    to: { opacity: '1', transform: "translateY(0)" },
                },
                "fade-in": {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                "glow-pulse": {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '0.8' },
                },
                "float": {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
            },
            animation: {
                "fade-up": "fade-up 0.6s ease-out",
                "fade-in": "fade-in 0.4s ease-out",
                "glow-pulse": "glow-pulse 3s ease-in-out infinite",
                "float": "float 6s ease-in-out infinite",
            },

            boxShadow: {
                'glow-sm': '0 0 20px rgba(99,102,241,0.2)',
                'glow': '0 0 40px rgba(99,102,241,0.3)',
                'glow-lg': '0 0 80px rgba(99,102,241,0.4)',
                'glass': '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                'glass-lg': '0 16px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
