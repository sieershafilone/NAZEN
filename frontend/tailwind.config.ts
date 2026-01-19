import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Luxury Palette
                background: "#0B0D10", // Jet Black
                foreground: "#f8fafc",
                card: "#111318", // Carbon
                "card-foreground": "#f8fafc",

                // Neutrals
                "steel-gray": "#9CA3AF",
                graphite: "#1F2937",

                // Accents (Strength)
                primary: {
                    DEFAULT: "#FF6A00", // Inferno Orange
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#C92A2A", // Burnt Red
                    foreground: "#ffffff",
                },

                // Status
                success: "#16A34A",
                warning: "#F59E0B",
                danger: "#DC2626",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                heading: ["var(--font-space-grotesk)", "sans-serif"],
                mono: ["var(--font-jetbrains-mono)", "monospace"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "luxury-gradient": "linear-gradient(135deg, #FF6A00 0%, #C92A2A 100%)",
            },
            boxShadow: {
                'glow': '0 0 20px rgba(255, 106, 0, 0.15)',
                'glow-hover': '0 0 30px rgba(255, 106, 0, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
export default config;
