import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"], // enables dark mode using 'class' strategy
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "rgb(var(--background-rgb))",
        foreground: "rgb(var(--foreground-rgb))",
        card: "rgb(var(--card-rgb))",
        border: "rgb(var(--border-rgb))",
        "muted-foreground": "rgb(var(--muted-foreground-rgb))",
        primary: "rgb(var(--primary-rgb))",
        secondary: "rgb(var(--secondary-rgb))",
        destructive: "rgb(var(--destructive-rgb))",
      },
    },
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#000000",
          secondary: "#ffffff",
          accent: "#000000",
          neutral: "#000000",
          "base-100": "#ffffff",
          "base-content": "#000000",
        },
        dark: {
          primary: "#ffffff",
          secondary: "#000000",
          accent: "#ffffff",
          neutral: "#ffffff",
          "base-100": "#000000",
          "base-content": "#ffffff",
        },
      },
    ],
    darkTheme: "dark",
  },
};

export default config;
