import { Link } from 'react-router-dom'
import {useLanguage} from '../../context/LanguageContext'
 function Footer() {
  const {t}=useLanguage();
  
    return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* ستون اول: معرفی و برند */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white"> {t('footer.brandName')}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('footer.brandDescription')}
             </p>
          </div>

          {/* ستون دوم: دسترسی سریع */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors duration-200">{t('nav.home')}</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors duration-200">{t('nav.about')}</Link>
              </li>
              <li>
                <Link to="/my-project" className="hover:text-white transition-colors duration-200">{t('nav.myProject')}</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors duration-200">{t('nav.contact')}</Link>
              </li>
            </ul>
          </div>

          {/* ستون سوم: ویژگی‌های پروژه */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">{t('footer.features')}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>{t('footer.responsive')}</li>
              <li>{t('footer.darkMode')}</li>
              <li>{t('footer.bilingual')}</li>
              <li>{t('footer.spa')}</li>
            </ul>
          </div>

          {/* ستون چهارم: راهنمای بخش محافظت شده */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">{t('footer.contactInfo')}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('footer.protectedInfo')}
             </p>
            <Link 
              to="/contact" 
              className="inline-block text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
                 {t('footer.loginRegister')}
            </Link>
          </div>

        </div>

        {/* کپی‌رایت پایین صفحه */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} LianaDev. All rights reserved.</p>
          <p>   {t('footer.rights')}</p>
          <p className="mt-4 sm:mt-0"> {t('footer.builtWith')}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer