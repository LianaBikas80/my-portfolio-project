import { useEffect, useState } from 'react'
import NotFound from './NotFound.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

function getPayloadFromToken(token) {
  if (!token) return null
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

function AdminMessages() {
  const { t, language } = useLanguage()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [activeReplyId, setActiveReplyId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all') // all | pending | replied
  const [sortOrder, setSortOrder] = useState('newest') // newest | oldest
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
  const payload = getPayloadFromToken(token)
  const isAdmin = payload?.role === 'admin'

  if (!isAdmin) {
    return <NotFound />
  }

  // const fetchMessages = async () => {
  //   try {
  //     setLoading(true)
  //     const res = await fetch('http://localhost:5000/api/messages', {
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     })
  //     const data = await res.json()
  //     if (res.ok) {
  //       setMessages(data)
  //     } 
  //     else {
  //       setError(data.message || t('adminMessages.deleteError'))
  //     }
      
  //   } catch (err) {
  //     setError(t('adminMessages.deleteError'))
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const fetchMessages = async () => {
  try {
    setLoading(true)

    const res = await fetch('http://localhost:5000/api/messages', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await res.json()

    if (res.ok) {
      setMessages(data)
      setError(null)
    } else {
      setError('adminMessages.deleteError')
    }
  } catch (err) {
    setError('adminMessages.deleteError')
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    fetchMessages()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm(t('adminMessages.deleteConfirm') || 'Are you sure?')) return

    try {
      const res = await fetch(`http://localhost:5000/api/messages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg._id !== id))
      } else {
        alert(t('adminMessages.deleteError'))
      }
    } catch (err) {
      alert(t('adminMessages.deleteError'))
    }
  }

  const handleSendReply = async (id) => {
    if (!replyText.trim()) {
      alert(t('adminMessages.replyRequired'))
      return
    }

    try {
      setSendingReply(true)
      const res = await fetch(`http://localhost:5000/api/messages/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ replyText })
      })

      const result = await res.json()

      if (res.ok) {
        alert(t('adminMessages.replySuccess'))
        setMessages((prev) =>
          prev.map((msg) => (msg._id === id ? result.data : msg))
        )
        setActiveReplyId(null)
        setReplyText('')
      } else {
        alert(result.message || t('adminMessages.replyError'))
      }
    } catch (err) {
      alert(t('adminMessages.replyError'))
    } finally {
      setSendingReply(false)
    }
  }

  // ۱. فیلتر و جستجو
  const filteredMessages = messages
    .filter((msg) => {
      if (filterStatus === 'pending') return !msg.replyMessage
      if (filterStatus === 'replied') return !!msg.replyMessage
      return true
    })
    .filter((msg) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        msg.name?.toLowerCase().includes(q) ||
        msg.email?.toLowerCase().includes(q) ||
        msg.subject?.toLowerCase().includes(q) ||
        msg.message?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB
    })

  // ۲. صفحه‌بندی
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage) || 1
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const dateLocale = language === 'fa' ? 'fa-IR' : 'en-US'

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 min-h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        {t('adminMessages.title')}
      </h1>

      {/* نوار فیلترها و مرتب‌سازی */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder={t('adminMessages.searchPlaceholder')}
            className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('adminMessages.filterAll')}</option>
            <option value="pending">{t('adminMessages.filterPending')}</option>
            <option value="replied">{t('adminMessages.filterReplied')}</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">{t('adminMessages.sortNewest')}</option>
            <option value="oldest">{t('adminMessages.sortOldest')}</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-slate-500">{t('adminMessages.loading')}</p>}
      {/* {error && <p className="text-red-500">{error}</p>} */}
      {error && (
  <p className="text-red-500">
    {t(error)}
  </p>
)}


      {!loading && !error && filteredMessages.length === 0 && (
        <p className="text-slate-500">{t('adminMessages.noMessages')}</p>
      )}

      <div className="grid gap-4">
        {paginatedMessages.map((msg) => (
          <div
            key={msg._id}
            className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm flex flex-col gap-4"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {msg.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({msg.email})
                  </span>
                  {msg.replyMessage && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                      {t('adminMessages.statusReplied')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(msg.createdAt).toLocaleString(dateLocale)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveReplyId(activeReplyId === msg._id ? null : msg._id)
                    setReplyText('')
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-300 dark:border-blue-800 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                >
                  {activeReplyId === msg._id ? t('adminMessages.cancelBtn') : t('adminMessages.replyBtn')}
                </button>

                <button
                  onClick={() => handleDelete(msg._id)}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-300 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  {t('adminMessages.deleteBtn')}
                </button>
              </div>
            </div>

            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
              <span className="text-slate-400 text-xs">{t('adminMessages.subjectLabel')}: </span>
              {msg.subject || t('adminMessages.noSubject')}
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-900/40 p-3 rounded border border-slate-100 dark:border-slate-800">
              {msg.message}
            </div>

            {msg.replyMessage && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-r-4 border-blue-500 rounded text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {t('adminMessages.yourReply')}:{' '}
                </span>
                {msg.replyMessage}
                <div className="text-[10px] text-slate-400 mt-1">
                  {t('adminMessages.repliedAt')}: {new Date(msg.repliedAt).toLocaleString(dateLocale)}
                </div>
              </div>
            )}

            {activeReplyId === msg._id && (
              <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <textarea
                  rows="3"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t('adminMessages.replyPlaceholder')}
                  className="w-full p-2.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    disabled={sendingReply}
                    onClick={() => handleSendReply(msg._id)}
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
                  >
                    {sendingReply ? t('adminMessages.sendingReply') : t('adminMessages.sendReplyBtn')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* صفحه‌بندی */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t('adminMessages.prevPage')}
          </button>

          <span className="text-xs text-slate-600 dark:text-slate-400">
            {currentPage} {t('adminMessages.pageOf')} {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t('adminMessages.nextPage')}
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminMessages
