import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login } = useAuth( )
  const navigate = useNavigate()

  const [form, setForm] = useState({
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

    if (!form.email || !form.password) {
      toast.error('لطفاً همه فیلدها را پر کن')
      return
    }

    login({
      email: form.email,
    })

    toast.success('ورود با موفقیت انجام شد')
    navigate('/contact')
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Login</h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Login