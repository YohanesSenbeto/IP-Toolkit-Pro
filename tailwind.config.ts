import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"], // class strategy for dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Simplified pure black/white light & dark mode colors
        background: {
          DEFAULT: "#ffffff",
          dark: "#000000",
        },
        foreground: {
          DEFAULT: "#000000",
          dark: "#ffffff",
        },
        card: {
          DEFAULT: "#ffffff",
          dark: "#000000",
        },
        input: {
          DEFAULT: "#ffffff",
          dark: "#000000",
        },
        border: {
          DEFAULT: "#d1d5db", // gray-300
          dark: "#4b5563", // gray-700
        },
        ring: {
          DEFAULT: "#000000",
          dark: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444", // red-500
          dark: "#fca5a5",   // red-300
        },
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
