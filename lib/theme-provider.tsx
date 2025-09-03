"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light"
  systemTheme: "dark" | "light" | undefined
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
  systemTheme: undefined,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<"dark" | "light" | undefined>(
    undefined
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (disableTransitionOnChange) {
      const css = document.createElement("style")
      css.appendChild(
        document.createTextNode(
          `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
        )
      )
      document.head.appendChild(css)

      requestAnimationFrame(() => {
        document.head.removeChild(css)
      })
    }

    const systemThemeResult = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light"

    setSystemTheme(systemThemeResult)

    const storedTheme = localStorage.getItem(storageKey) as Theme | null
    const preferredTheme = storedTheme ?? theme ?? defaultTheme

    const themeToApply =
      preferredTheme === "system" && enableSystem ? systemThemeResult : preferredTheme

    root.classList.add(themeToApply)
    root.setAttribute("data-theme", themeToApply)
  }, [theme, enableSystem, storageKey, defaultTheme, disableTransitionOnChange])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem(storageKey, newTheme)

    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    const systemThemeResult = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light"

    if (newTheme === "system" && enableSystem) {
      root.classList.add(systemThemeResult)
      root.setAttribute("data-theme", systemThemeResult)
    } else {
      root.classList.add(newTheme)
      root.setAttribute("data-theme", newTheme)
    }
  }

  const resolvedTheme =
    theme === "system" && enableSystem
      ? systemTheme || "light"
      : theme === "dark"
      ? "dark"
      : "light"

  const value = {
    theme,
    setTheme: handleSetTheme,
    resolvedTheme,
    systemTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}