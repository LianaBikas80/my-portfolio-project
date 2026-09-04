import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function Navbar({ onOpenAuthModal }) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLang, t } = useLanguage()
  const { currentUser } = useAuth()

  // وضعیت ادمین بودن به صورت خودکار از کانتکست خوانده می‌شود
  const isAdmin = currentUser?.role === 'admin'

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400"
            >
              LianaDev
            </Link>
          </div>

          {/* منوی لینک‌های اصلی سایت */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/') || isActive('/home')
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                {t('nav.home')}
              </Link>

              <Link
                to="/about"
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/about')
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                {t('nav.about')}
              </Link>

              <Link
                to="/my-project"
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/my-project')
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                {t('nav.myProject')}
              </Link>

              <Link
                to="/contact"
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/contact')
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                {t('nav.contact')}
              </Link>
            </div>
          </div>

          {/* بخش دکمه‌های کنترلی سمت راست/چپ (ورود، پنل ادمین، تم و زبان) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* دکمه پنل ادمین در کنار دکمه ورود/ثبت‌نام */}
            {isAdmin && (
              <Link
                to="/admin/messages"
                className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors duration-200 ${
                  isActive('/admin/messages')
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-400'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {lang === 'fa' ? 'پنل ادمین' : 'Admin Panel'}
              </Link>
            )}

            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t('nav.authButton')}
            </button>

            <button
              onClick={toggleLang}
              className="px-3 py-1 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {lang === 'fa' ? 'EN' : 'FA'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {/* منوی موبایل (همبرگری) */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 focus:outline-none"
            >
              <span className="sr-only">{t('nav.openMainMenu')}</span>
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 16h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.home')}
            </Link>

            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.about')}
            </Link>

            <Link
              to="/my-project"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.myProject')}
            </Link>

            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.contact')}
            </Link>

            {isAdmin && (
              <Link
                to="/admin/messages"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
              >
                {lang === 'fa' ? 'پنل ادمین' : 'Admin Panel'}
              </Link>
            )}

            <div className="py-2 px-4 w-full">
              <button
                onClick={() => {
                  onOpenAuthModal?.()
                  setIsOpen(false)
                }}
                className="w-full text-center px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t('nav.authButton')}
              </button>
            </div>

            <div className="px-3 py-2 flex gap-2">
              <button
                onClick={toggleLang}
                className="w-full text-center px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {lang === 'fa' ? 'EN' : 'FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar