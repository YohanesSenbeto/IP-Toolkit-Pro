import type { Config } from "tailwindcss"

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
        // 🎨 Ethio Telecom extended brand palette
        brand: {
          green: "#008060", // main Ethio Telecom green
          darkGreen: "#00543C", // deep green
          yellow: "#FFD600", // accent yellow
          lightGreen: "#E6F4EA", // pale green bg
        },
        background: {
          DEFAULT: "#F6FFF7",
          dark: "#0B1F17",
        },
        foreground: {
          DEFAULT: "#00543C",
          dark: "#F6FFF7",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#00543C",
          dark: "#11291F",
          "dark-foreground": "#FFD600",
        },
        popover: {
          DEFAULT: "#F6FFF7",
          foreground: "#00543C",
          dark: "#11291F",
          "dark-foreground": "#FFD600",
        },
        primary: {
          DEFAULT: "#008060",
          foreground: "#FFFFFF",
          dark: "#FFD600",
          "dark-foreground": "#00543C",
        },
        secondary: {
          DEFAULT: "#FFD600",
          foreground: "#00543C",
          dark: "#FFD600",
          "dark-foreground": "#00543C",
        },
        muted: {
          DEFAULT: "#E6F4EA",
          foreground: "#00543C",
          dark: "#1A2F25",
          "dark-foreground": "#FFD600",
        },
        accent: {
          DEFAULT: "#FFD600",
          foreground: "#008060",
          dark: "#008060",
          "dark-foreground": "#FFD600",
        },
        destructive: {
          DEFAULT: "#E53935",
          foreground: "#FFFFFF",
          dark: "#FFB4A9",
          "dark-foreground": "#8B1F1A",
        },
        border: {
          DEFAULT: "#B2DFDB",
          dark: "#224D3B",
        },
        input: {
          DEFAULT: "#E6F4EA",
          dark: "#224D3B",
        },
        ring: {
          DEFAULT: "#FFD600",
          dark: "#FFD600",
        },
        chart: {
          1: "#008060",
          2: "#FFD600",
          3: "#00543C",
          4: "#E6F4EA",
          5: "#B2DFDB",
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
        ethio: {
          primary: "#008060",
          secondary: "#FFD600",
          accent: "#FFD600",
          neutral: "#00543C",
          "base-100": "#F6FFF7",
          "base-content": "#00543C",
        },
        "ethio-dark": {
          primary: "#FFD600",
          secondary: "#008060",
          accent: "#FFD600",
          neutral: "#11291F",
          "base-100": "#0B1F17",
          "base-content": "#F6FFF7",
        },
      },
    ],
    darkTheme: "ethio-dark",
  },
}

export default config
