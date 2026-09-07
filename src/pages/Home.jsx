import { Link } from 'react-router-dom'
// ۱. ایمپورت یک تصویر واحد
import profileImg from '../assets/images/profile-en.jpg'
import { useLanguage } from '../context/LanguageContext'

function Home() {
  const { t, lang } = useLanguage()

  return (
    <section className="min-h-[calc(100vh-140px)] flex items-center">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        
        <div className="order-2 lg:order-1 space-y-6 text-center lg:text-left">
          <h1 className="animate-fade-in-up font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-700 dark:text-slate-200">
              {t('home.heroPrefix')}
            </span>
            <span className="inline-block mx-2 text-4xl sm:text-5xl lg:text-6xl text-blue-600 dark:text-blue-400">
              {t('home.heroName')}
            </span>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-700 dark:text-slate-200">
              {t('home.heroSuffix')}
            </span>
          </h1>

          <p className="animate-fade-in-up animation-delay-300 opacity-0 mx-auto max-w-xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0 dark:text-slate-300">
            {t('home.description')}
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to="/my-project"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-center font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl sm:w-auto"
            >
              {t('home.projectsButton')}
            </Link>

            <Link
              to="/contact"
              className="w-full rounded-xl border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-400 sm:w-auto"
            >
              {t('home.contactButton')}
            </Link>
          </div>
        </div>

        <div className="order-1 lg:order-2 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-2xl" />
            
            {/* ترنسفورم داینامیک و انیمیشنی افقی با CSS */}
            <img
              src={profileImg}
              alt={t('home.profileAlt')}
              className={`relative h-[280px] w-[280px] rounded-[2rem] object-cover shadow-2xl ring-1 ring-slate-200 transition-transform duration-500 sm:h-[340px] sm:w-[340px] lg:h-[420px] lg:w-[420px] dark:ring-slate-700 ${
                lang === 'fa' ? '-scale-x-100' : 'scale-x-100'
              }`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home
