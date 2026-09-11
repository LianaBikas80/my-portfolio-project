import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaMapMarkerAlt, FaLinkedin, FaEnvelope, FaCheckCircle, FaExclamationCircle, FaCloudUploadAlt } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL ||'https://liana-portfolio.ir';
const QUEUE_STORAGE_KEY = 'portfolio_pending_contact_messages';

const Contact = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const [status, setStatus] = useState({
    type: '', // 'success' | 'queued' | 'error'
    messageKey: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // پر کردن خودکار فیلدها در صورت ورود کاربر
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setFormData((prev) => ({
        ...prev,
        email: currentUser.email || '',
        name: currentUser.name || '',
      }));
    } else {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }
  }, [isAuthenticated, currentUser]);

  // حذف خودکار پیام وضعیت بعد از ۵ ثانیه
  useEffect(() => {
    if (!status.type) return;
    const timer = setTimeout(() => {
      setStatus({ type: '', messageKey: '' });
    }, 5000);
    return () => clearTimeout(timer);
  }, [status.type]);

  // ارسال پیام به سمت سرور
  const sendMessageToServer = async (payload) => {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'errorMsg');
    }

    return response.json();
  };

  // ارسال پیام‌های ذخیره‌شده در LocalStorage به سرور
  const flushQueuedMessages = useCallback(async () => {
    const rawQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!rawQueue) return;

    let queue = [];
    try {
      queue = JSON.parse(rawQueue);
    } catch {
      localStorage.removeItem(QUEUE_STORAGE_KEY);
      return;
    }

    if (!Array.isArray(queue) || queue.length === 0) return;

    const remainingQueue = [];
    for (const item of queue) {
      try {
        await sendMessageToServer(item);
      } catch {
        remainingQueue.push(item);
      }
    }

    if (remainingQueue.length === 0) {
      localStorage.removeItem(QUEUE_STORAGE_KEY);
      setStatus({
        type: 'success',
        messageKey: 'syncedMsg',
      });
    } else {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));
    }
  }, []);

  // بررسی وضعیت آنلاین و همگام‌سازی
  useEffect(() => {
    const handleOnline = () => {
      flushQueuedMessages();
    };

    window.addEventListener('online', handleOnline);

    if (navigator.onLine) {
      flushQueuedMessages();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [flushQueuedMessages]);

  const myContacts = {
    location: 'https://maps.app.goo.gl/vyPi25Sr6fCM1vnZ7',
    linkedin: 'https://www.linkedin.com/in/liana-bikas-410041434/',
    email: 'liana80.dev@gmail.com',
  };

  const handleOpenForm = () => {
    setStatus({ type: '', messageKey: '' });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', messageKey: '' });

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'nameRequired';
    if (!formData.email.trim()) {
      newErrors.email = 'emailRequired';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'emailInvalid';
    }
    if (!formData.subject.trim()) newErrors.subject = 'subjectRequired';
    if (!formData.message.trim()) newErrors.message = 'messageRequired';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await sendMessageToServer(formData);

      setFormData((prev) => ({
        name: isAuthenticated && currentUser?.name ? currentUser.name : '',
        email: isAuthenticated && currentUser?.email ? currentUser.email : '',
        subject: '',
        message: '',
      }));
      setShowForm(false);
      setStatus({
        type: 'success',
        messageKey: 'successMsg',
      });
    } catch {
      // در صورت قطعی اینترنت یا خطا در سرور، پیام در صف ذخیره می‌شود
      try {
        const rawQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
        const queue = rawQueue ? JSON.parse(rawQueue) : [];
        queue.push({
          ...formData,
          queuedAt: new Date().toISOString(),
        });
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));

        setFormData((prev) => ({
          name: isAuthenticated && currentUser?.name ? currentUser.name : '',
          email: isAuthenticated && currentUser?.email ? currentUser.email : '',
          subject: '',
          message: '',
        }));
        setShowForm(false);

        setStatus({
          type: 'queued',
          messageKey: 'queuedMsg',
        });
      } catch {
        setStatus({
          type: 'error',
          messageKey: 'errorMsg',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] px-6 py-12 bg-gray-50 dark:bg-transparent">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="animate-fade-in-up text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            {t('contact.title')}
          </h1>
          <p className="animate-fade-in-up animation-delay-300 opacity-0 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* کارت‌های ارتباطی */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* لوکیشن */}
          <a
            href={myContacts.location}
            target="_blank"
            rel="noreferrer"
            className="group p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-transparent hover:border-blue-500 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <FaMapMarkerAlt size={35} />
              </div>
              <h3 className="text-xl font-bold dark:text-white text-center">
                {t('contact.location')}
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                {t('contact.locationUnlocked')}
              </p>
            </div>
          </a>

          {/* لینکدین */}
          <div className="group p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-transparent hover:border-[#0A66C2] transition-all flex flex-col justify-between">
            <div>
              <div className="w-20 h-20 bg-blue-50 dark:bg-[#0A66C2]/15 text-[#0A66C2] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <FaLinkedin size={36} />
              </div>
              <h3 className="text-xl font-bold dark:text-white text-center">
                {t('contact.linkedin') || 'LinkedIn'}
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                {t('contact.linkedinDesc') || 'ارتباط حرفه‌ای و رزومه کاری'}
              </p>
            </div>
            <a
              href={myContacts.linkedin}
              target="_blank"
              rel="noreferrer"
              className="mt-6 block text-center rounded-xl bg-[#0A66C2] text-white py-3 font-semibold hover:bg-[#004182] transition shadow-md shadow-[#0A66C2]/20"
            >
              {t('contact.viewProfile') || 'مشاهده پروفایل'}
            </a>
          </div>

          {/* ایمیل */}
          <div className="group p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-transparent hover:border-purple-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <FaEnvelope size={35} />
              </div>
              <h3 className="text-xl font-bold dark:text-white text-center">
                {t('contact.email')}
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-center break-all">
                {myContacts.email}
              </p>
            </div>
            <button
              onClick={handleOpenForm}
              className="mt-6 w-full text-center rounded-xl bg-purple-600 text-white py-3 font-semibold hover:bg-purple-700 transition shadow-md shadow-purple-500/20"
            >
              {t('contact.sendEmail')}
            </button>
          </div>
        </div>

        {/* کادر وضعیت */}
        {status.type && !showForm && (
          <div className="mx-auto max-w-md p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border text-center animate-fade-in-up transition-all border-gray-200 dark:border-gray-700">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                status.type === 'queued'
                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                  : 'bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400'
              }`}
            >
              {status.type === 'queued' ? (
                <FaCloudUploadAlt size={36} />
              ) : (
                <FaCheckCircle size={36} />
              )}
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {status.type === 'queued'
                ? (t('contact.queuedTitle') || 'ذخیره در صف ارسال')
                : t('contact.successTitle')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {t(`contact.${status.messageKey}`)}
            </p>
          </div>
        )}

        {/* فرم پیام */}
        {showForm && (
          <form
            ref={formRef}
            noValidate
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('contact.formTitle')}
            </h2>

            {status.type === 'error' && (
              <div className="mb-6 rounded-2xl p-4 flex items-center gap-3 text-sm font-semibold border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 animate-fade-in-up">
                <FaExclamationCircle className="text-red-600 dark:text-red-400 shrink-0 text-xl" />
                <span>{t(`contact.${status.messageKey}`)}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  {t('contact.nameLabel')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('contact.namePlaceholder')}
                  className={`w-full rounded-xl border bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 transition-colors ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {t(`contact.${errors.name}`)}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  {t('contact.emailLabel')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly={isAuthenticated}
                  placeholder={t('contact.emailPlaceholder')}
                  dir="ltr"
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition-colors ${
                    isAuthenticated
                      ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                      : errors.email
                      ? 'border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {t(`contact.${errors.email}`)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="subject"
                className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                {t('contact.subjectLabel')}
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t('contact.subjectPlaceholder')}
                className={`w-full rounded-xl border bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 transition-colors ${
                  errors.subject
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.subject && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  {t(`contact.${errors.subject}`)}
                </p>
              )}
            </div>

            <div className="mt-5">
              <label
                htmlFor="message"
                className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                {t('contact.messageLabel')}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t('contact.messagePlaceholder')}
                rows="6"
                className={`w-full resize-y rounded-xl border bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 transition-colors ${
                  errors.message
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.message && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  {t(`contact.${errors.message}`)}
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? t('contact.sending') : t('contact.submitButton')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-gray-300 dark:border-gray-600 px-6 py-3.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {t('contact.cancelButton') || 'انصراف'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;