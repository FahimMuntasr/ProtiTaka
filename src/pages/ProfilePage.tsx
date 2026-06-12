import { useEffect, useState } from 'react'
import AppNavigation from '../components/AppNavigation'
import { useAuth } from '../contexts/AuthContext'
import { getProfile, updateDailyBudget } from '../services/transactions'

export default function ProfilePage() {
  const { signOut } = useAuth()
  const [dailyBudget, setDailyBudget] = useState('0')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      const profile = await getProfile()
      if (mounted) {
        setDailyBudget(String(profile?.daily_budget ?? 0))
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  async function handleSignOut() {
    const result = await signOut()
    if (result.error) {
      setStatus(result.error.message)
      return
    }
    setStatus('Signed out successfully.')
  }

  async function handleSave() {
    setStatus('Saving...')
    const result = await updateDailyBudget(Number(dailyBudget) || 0)

    if (result.error) {
      setStatus(result.error.message)
      return
    }

    setStatus('Daily budget saved successfully.')
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100 md:p-10">
      <AppNavigation />
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-2 md:px-0">
        <header className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Profile</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Set your daily budget</h1>
            <p className="mt-3 text-slate-300">This value is used by the daily overview page to show how much of your limit remains.</p>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
          <label className="text-sm text-slate-300" htmlFor="dailyBudget">Daily budget</label>
          <input
            id="dailyBudget"
            type="number"
            value={dailyBudget}
            onChange={(event) => setDailyBudget(event.target.value)}
            disabled={loading}
            className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-emerald-400"
          />
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Save daily budget
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Sign out
            </button>
          </div>
          {status ? <p className="mt-4 text-sm text-emerald-200">{status}</p> : null}
        </section>
      </div>
    </main>
  )
}
