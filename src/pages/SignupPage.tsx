import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SignupPage() {
  const { user, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/transactions', { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await signUp(email, password)

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('Account created. Check your email to confirm sign-in, then log in.')
    setLoading(false)
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Sign up</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Create your account</h1>
        <p className="mt-3 text-slate-300">Register to start tracking transactions and daily limits.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400" />
          <button disabled={loading} className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-70">{loading ? 'Creating account...' : 'Create account'}</button>
        </form>

        {message ? <p className="mt-4 text-sm text-emerald-200">{message}</p> : null}

        <p className="mt-6 text-sm text-slate-300">Already have an account? <Link to="/login" className="text-emerald-300">Sign in</Link></p>
      </section>
    </main>
  )
}
