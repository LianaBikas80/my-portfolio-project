import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext' // یا مسیری که هوک زبان در پروژه‌ات دارد

function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 transition-colors duration-300">
      <h1 className="text-6xl font-black text-red-500">404</h1>
      
      <p className="text-lg text-slate-600 dark:text-slate-300">
        {t('notFound.title')}
      </p>

      <Link
        to="/"
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-md hover:shadow-lg"
      >
        {t('notFound.backHome')}
      </Link>
    </div>
  )
}

export default NotFound
