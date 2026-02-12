/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#09090b', // Zinc-950
                surface: '#18181b',    // Zinc-900
                surfaceHover: '#27272a', // Zinc-800
                border: '#27272a',     // Zinc-800

                primary: '#8b5cf6',    // Violet-500
                primaryHover: '#7c3aed', // Violet-600
                primaryLight: 'rgba(139, 92, 246, 0.1)',

                secondary: '#06b6d4',  // Cyan-500
                secondaryHover: '#0891b2', // Cyan-600

                success: '#10b981',    // Emerald-500
                danger: '#ef4444',     // Red-500
                warning: '#f59e0b',    // Amber-500

                text: '#fafafa',       // Zinc-50
                textMuted: '#a1a1aa',  // Zinc-400
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2327272a' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }
        },
    },
    plugins: [],
}
