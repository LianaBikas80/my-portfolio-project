 import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import About from './pages/About'
import MyProject from './pages/MyProject'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Navbar from './components/Navbar/Nanbar'
import Footer from './components/Footer/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthModal from './components/AuthModal/AuthModal'
import AdminMessages from './pages/AdminMessages'

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const openAuthModal = () => {
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

        {/* هدر سراسری */}
        <Navbar onOpenAuthModal={openAuthModal} />

        {/* محتوای اصلی صفحات با قابلیت رشد برای چسبیدن فوتر به پایین صفحه */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/my-project" element={<MyProject />} />
            <Route
              path="/contact"
              element={<Contact onOpenAuthModal={openAuthModal} />}
            />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>

        {/* فوتر سراسری */}
        <Footer />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
        />
      </div>
    </>
  )
}

export default App