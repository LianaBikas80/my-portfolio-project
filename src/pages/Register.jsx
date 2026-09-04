import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { register } = useAuth( )
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.password) {
      Swal.fire({
        icon: 'error',
        title: 'خطا',
        text: 'همه فیلدها را پر کن',
      })
      return
    }

    register({
      name: form.name,
      email: form.email,
    })

    Swal.fire({
      icon: 'success',
      title: 'ثبت‌نام موفق',
      text: 'حساب کاربری ساخته شد',
    })

    navigate('/contact')
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Register</h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 dark:bg-slate-800 dark:text-white"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 dark:bg-slate-800 dark:text-white"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 dark:bg-slate-800 dark:text-white"
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Register