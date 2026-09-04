import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // بازگرداندن اسکرول به بالاترین نقطه صفحه با افکت نرم
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [pathname]) // هر بار که مسیر (Route) تغییر کرد، این افکت اجرا می‌شود

  return null // این کامپوننت چیزی رندر نمی‌کند و فقط کار منطقی انجام می‌دهد
}

export default ScrollToTop