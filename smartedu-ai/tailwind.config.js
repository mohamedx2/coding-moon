/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                black: "var(--black)",
                "color-tokens-color-tokens-background-primary-duplicate":
                    "var(--color-tokens-color-tokens-background-primary-duplicate)",
                "color-tokens-color-tokens-background-secondary":
                    "var(--color-tokens-color-tokens-background-secondary)",
                "color-tokens-color-tokens-background-tertiary":
                    "var(--color-tokens-color-tokens-background-tertiary)",
                "color-tokens-color-tokens-border-primary-duplicate":
                    "var(--color-tokens-color-tokens-border-primary-duplicate)",
                "color-tokens-color-tokens-content-dark-primary-duplicate":
                    "var(--color-tokens-color-tokens-content-dark-primary-duplicate)",
                "color-tokens-color-tokens-content-dark-secondary-duplicate":
                    "var(--color-tokens-color-tokens-content-dark-secondary-duplicate)",
                colorblack: "var(--colorblack)",
                colorwhite: "var(--colorwhite)",
                "gray-100": "var(--gray-100)",
                "gray-200": "var(--gray-200)",
                "gray-25": "var(--gray-25)",
                "gray-300": "var(--gray-300)",
                "gray-400": "var(--gray-400)",
                "gray-50": "var(--gray-50)",
                "gray-500": "var(--gray-500)",
                "gray-600": "var(--gray-600)",
                "gray-700": "var(--gray-700)",
                "gray-800": "var(--gray-800)",
                "gray-900": "var(--gray-900)",
                "mode-app-background": "var(--mode-app-background)",
                "mode-app-border": "var(--mode-app-border)",
                "mode-app-foreground": "var(--mode-app-foreground)",
                "mode-app-muted-foreground": "var(--mode-app-muted-foreground)",
                orange: "var(--orange)",
                "tw-colors-neutral-200": "var(--tw-colors-neutral-200)",
                "tw-colors-neutral-500": "var(--tw-colors-neutral-500)",
                "tw-colors-white": "var(--tw-colors-white)",
                white: "var(--white)",
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            fontFamily: {
                "text-base-regular": "var(--text-base-regular-font-family)",
                "text-sm-medium": "var(--text-sm-medium-font-family)",
                sans: [
                    "ui-sans-serif",
                    "system-ui",
                    "sans-serif",
                    '"Apple Color Emoji"',
                    '"Segoe UI Emoji"',
                    '"Segoe UI Symbol"',
                    '"Noto Color Emoji"',
                ],
            },
            boxShadow: { "box-shadow-shadow-xs": "var(--box-shadow-shadow-xs)" },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [],
    darkMode: ["class"],
};
