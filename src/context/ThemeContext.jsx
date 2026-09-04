import { createContext, useContext, useState, useEffect } from 'react'

// Context اصلی برای تم
const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // مقدار اولیه: از localStorage بخوان، اگر نبود 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  // هر بار که theme عوض شد، کلاس dark را روی عنصر html اعمال کن
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // تابعی برای جابه‌جا کردن بین dark و light
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// هوکی که در هر کامپوننت قابل استفاده است
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme باید داخل ThemeProvider استفاده شود')
  }
  return context
}