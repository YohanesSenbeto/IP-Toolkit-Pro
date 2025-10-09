/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: "var(--card)",
                border: "var(--border)",
                muted: "var(--muted-foreground)",
                accent: "var(--accent-foreground)",
                primary: "var(--primary)",
                secondary: "var(--secondary)",
                destructive: "var(--destructive)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
