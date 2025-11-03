"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <motion.button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-12 h-12 rounded-full bg-[hsl(var(--neuro-bg))] shadow-[8px_8px_16px_hsl(var(--shadow-dark)),_-8px_-8px_16px_hsl(var(--shadow-light))] hover:shadow-[6px_6px_12px_hsl(var(--shadow-dark)),_-6px_-6px_12px_hsl(var(--shadow-light))] active:shadow-[inset_4px_4px_8px_hsl(var(--shadow-dark)),_inset_-4px_-4px_8px_hsl(var(--shadow-light))] transition-all duration-200 flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
    </motion.button>
  )
}

