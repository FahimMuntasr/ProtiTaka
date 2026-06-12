import { useEffect, useMemo, useState } from 'react'
import AppNavigation from '../components/AppNavigation'
import { getProfile, getTransactions, type ProfileRecord, type TransactionRecord } from '../services/transactions'

export default function DailyOverviewPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const [rows, profileData] = await Promise.all([getTransactions(), getProfile()])
        if (mounted) {
          setTransactions(rows)
          setProfile(profileData)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unable to load overview data.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const todayTransactions = useMemo(
    () => transactions.filter((row) => new Date(row.created_at).toISOString().slice(0, 10) === today),
    [transactions, today],
  )

  const spentToday = useMemo(
    () => todayTransactions
      .filter((row) => (row.categories?.type ?? 'expense') === 'expense')
      .reduce((sum, row) => sum + Number(row.amount), 0),
    [todayTransactions],
  )

  const dailyLimit = Number(profile?.daily_budget ?? 0)
  const remaining = Math.max(0, dailyLimit - spentToday)
  const progress = dailyLimit > 0 ? Math.min(100, Math.max(0, (spentToday / dailyLimit) * 100)) : 0

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100 md:p-10">
      <AppNavigation />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-2 md:px-0">
        <header className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Daily overview</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Today’s spending and limit progress</h1>
            <p className="mt-3 max-w-2xl text-slate-300">This overview reads from your transactions and your profile daily budget.</p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Spent today</p>
            <p className="mt-4 text-4xl font-semibold text-rose-300">{spentToday.toFixed(2)}</p>
            <p className="mt-3 text-slate-300">Transactions found for {today}</p>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Daily limit progress</p>
            <p className="mt-4 text-4xl font-semibold text-emerald-300">{remaining.toFixed(2)} left</p>
            <p className="mt-3 text-slate-300">Your profile limit is {dailyLimit.toFixed(2)}.</p>
            <div className="mt-5 h-3 rounded-full bg-slate-800">
              <div className="h-3 rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-400">{progress.toFixed(0)}% of your daily limit used.</p>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
          {loading && <p className="text-slate-300">Loading overview...</p>}
          {error && <p className="text-rose-300">{error}</p>}
          {!loading && !error && todayTransactions.length === 0 && <p className="text-slate-300">No transactions were recorded today.</p>}

          {!loading && !error && todayTransactions.length > 0 && (
            <ul className="space-y-3">
              {todayTransactions.map((transaction) => (
                <li key={transaction.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <div>
                    <p className="text-slate-200">{transaction.note || 'Transaction'}</p>
                    <p className="text-sm text-slate-400">{new Date(transaction.created_at).toLocaleTimeString()}</p>
                  </div>
                  <p className={`text-lg font-semibold ${((transaction.categories?.type ?? 'expense') === 'income') ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {Number(transaction.amount).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
