import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getSupabaseSession } from '../services/supabase.ts'

export default function HomePage() {
  const [status, setStatus] = useState('Checking Supabase connection...')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/transactions', { replace: true })
      return
    }

    let mounted = true

    getSupabaseSession()
      .then(({ error }) => {
        if (!mounted) return

        if (error) {
          setStatus(`Supabase session check failed: ${error.message}`)
          return
        }

        setStatus('Supabase is connected and ready for Day 1 setup.')
      })
      .catch(() => {
        if (mounted) {
          setStatus('Supabase session check failed.')
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Day 1 foundation</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
          ProtiTaka is now wired for routing, React Query, and Supabase.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          This setup gives you the base architecture for the expense app: pages, providers, and a connected Supabase client.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-semibold text-white">Routing</h2>
            <p className="mt-3 text-slate-300">Navigate between the main app sections with React Router.</p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-semibold text-white">Data layer</h2>
            <p className="mt-3 text-slate-300">Supabase is initialized in the app shell and ready for transactions, categories, and profiles.</p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-semibold text-white">State</h2>
            <p className="mt-3 text-slate-300">TanStack Query is enabled for the future finance queries and mutations.</p>
          </article>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link to="/transactions" className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">View transactions</Link>
          <Link to="/daily-overview" className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900">Daily overview</Link>
          <Link to="/profile" className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900">Profile</Link>
        </div>

        <p className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">{status}</p>
      </section>
    </main>
  )
}
