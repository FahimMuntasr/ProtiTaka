import { useEffect, useMemo, useState } from 'react'
import AppNavigation from '../components/AppNavigation'
import { getCategories, getTransactions, type CategoryRecord, type TransactionRecord } from '../services/transactions'

function formatMonthKey(dateString: string) {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-')
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString('en', { month: 'short', year: 'numeric' })
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [categories, setCategories] = useState<CategoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const [rows, availableCategories] = await Promise.all([getTransactions(), getCategories()])

        if (mounted) {
          setTransactions(rows)
          setCategories(availableCategories)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unable to load dashboard data.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const monthOptions = useMemo(() => {
    const keys = Array.from(new Set(transactions.map((row) => formatMonthKey(row.created_at))))
    return keys.sort((a, b) => b.localeCompare(a))
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((row) => {
      const isExpense = (row.categories?.type ?? 'expense') === 'expense'
      if (!isExpense) return false

      const monthKey = formatMonthKey(row.created_at)
      const monthMatch = selectedMonth === 'all' || monthKey === selectedMonth
      const categoryMatch = selectedCategory === 'all' || row.category_id === selectedCategory

      return monthMatch && categoryMatch
    })
  }, [selectedCategory, selectedMonth, transactions])

  const monthlySpend = useMemo(
    () => filteredTransactions.reduce((sum, row) => sum + Number(row.amount), 0),
    [filteredTransactions],
  )

  const filteredIncomeTransactions = useMemo(() => {
    return transactions.filter((row) => {
      const isIncome = (row.categories?.type ?? 'expense') === 'income'
      if (!isIncome) return false

      const monthKey = formatMonthKey(row.created_at)
      const monthMatch = selectedMonth === 'all' || monthKey === selectedMonth
      const categoryMatch = selectedCategory === 'all' || row.category_id === selectedCategory

      return monthMatch && categoryMatch
    })
  }, [selectedCategory, selectedMonth, transactions])

  const monthlyIncome = useMemo(
    () => filteredIncomeTransactions.reduce((sum, row) => sum + Number(row.amount), 0),
    [filteredIncomeTransactions],
  )

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>()

    filteredTransactions.forEach((row) => {
      const name = row.categories?.name ?? 'Uncategorized'
      totals.set(name, (totals.get(name) ?? 0) + Number(row.amount))
    })

    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
  }, [filteredTransactions])

  const monthlyTrend = useMemo(() => {
    const trendMap = new Map<string, number>()

    transactions
      .filter((row) => (row.categories?.type ?? 'expense') === 'expense')
      .forEach((row) => {
        const monthKey = formatMonthKey(row.created_at)
        const categoryMatch = selectedCategory === 'all' || row.category_id === selectedCategory
        if (!categoryMatch) return

        trendMap.set(monthKey, (trendMap.get(monthKey) ?? 0) + Number(row.amount))
      })

    const recentMonths = monthOptions.slice(0, 6)
    return recentMonths.map((monthKey) => ({
      monthKey,
      label: formatMonthLabel(monthKey),
      total: trendMap.get(monthKey) ?? 0,
    }))
  }, [monthOptions, selectedCategory, transactions])

  const maxTrend = Math.max(...monthlyTrend.map((item) => item.total), 1)
  const pieGradient = categoryBreakdown.length
    ? `conic-gradient(${categoryBreakdown.map((entry, index) => {
        const colors = ['#34d399', '#38bdf8', '#f472b6', '#fbbf24', '#a78bfa', '#fb7185']
        return `${colors[index % colors.length]} 0 ${((entry[1] / Math.max(monthlySpend, 1)) * 100).toFixed(2)}%`
      }).join(', ')})`
    : 'conic-gradient(#1f2937 0% 100%)'

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100 md:p-10">
      <AppNavigation />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-2 md:px-0">
        <header className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Monthly insights and category trends</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Turn your transactions into a clear financial dashboard with spend totals, breakdowns, and simple charts.</p>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 md:grid-cols-4">
          <article className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-sm text-slate-400">Monthly spend</p>
            <p className="mt-2 text-3xl font-semibold text-rose-300">{monthlySpend.toFixed(2)}</p>
            <p className="mt-2 text-xs text-slate-400">Filtered for {selectedMonth === 'all' ? 'all months' : formatMonthLabel(selectedMonth)}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-sm text-slate-400">Monthly income</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{monthlyIncome.toFixed(2)}</p>
            <p className="mt-2 text-xs text-slate-400">Income for the selected month and category</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-sm text-slate-400">Expense categories</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{categoryBreakdown.length}</p>
            <p className="mt-2 text-xs text-slate-400">Visible in the current filter set</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-sm text-slate-400">Trend window</p>
            <p className="mt-2 text-3xl font-semibold text-sky-300">{monthlyTrend.length} months</p>
            <p className="mt-2 text-xs text-slate-400">Latest monthly trend for the selected category</p>
          </article>
        </section>

        <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Filters</h2>
                <p className="mt-2 text-sm text-slate-300">Use the month and category filters to explore your spending patterns.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMonth('all')
                  setSelectedCategory('all')
                }}
                className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100"
              >
                Reset
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-300">
                Month
                <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400">
                  <option value="all">All months</option>
                  {monthOptions.map((monthKey) => (
                    <option key={monthKey} value={monthKey}>{formatMonthLabel(monthKey)}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-300">
                Category
                <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400">
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <h2 className="text-xl font-semibold text-white">Category distribution</h2>
            <p className="mt-2 text-sm text-slate-300">Share of your current filtered spend by category.</p>

            {loading && <p className="mt-4 text-slate-300">Loading dashboard data...</p>}
            {error && <p className="mt-4 text-rose-300">{error}</p>}

            {!loading && !error && (
              <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="flex h-48 w-48 items-center justify-center rounded-full border border-slate-800" style={{ background: pieGradient }}>
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-950 text-center text-xs text-slate-200">{categoryBreakdown.length ? 'Spend mix' : 'No data'}</div>
                </div>
                <ul className="flex-1 space-y-3 text-sm text-slate-200">
                  {categoryBreakdown.length === 0 && <li>No expense data matches the current filters.</li>}
                  {categoryBreakdown.map(([name, total], index) => (
                    <li key={name} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                      <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ['#34d399', '#38bdf8', '#f472b6', '#fbbf24', '#a78bfa', '#fb7185'][index % 6] }} />{name}</span>
                      <strong>{total.toFixed(2)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </section>

        <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <h2 className="text-xl font-semibold text-white">Monthly spend trend</h2>
            <p className="mt-2 text-sm text-slate-300">A simple line view of your previous spending months.</p>

            {!loading && !error && (
              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <svg viewBox="0 0 420 180" className="h-48 w-full">
                  <defs>
                    <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(52, 211, 153, 0.25)" />
                      <stop offset="100%" stopColor="rgba(52, 211, 153, 0.02)" />
                    </linearGradient>
                  </defs>
                  <path d="M0 160 H420" stroke="rgba(148, 163, 184, 0.25)" />
                  <path d="M0 120 H420" stroke="rgba(148, 163, 184, 0.18)" />
                  <path d="M0 80 H420" stroke="rgba(148, 163, 184, 0.18)" />
                  <path d="M0 40 H420" stroke="rgba(148, 163, 184, 0.18)" />
                  {(() => {
                    const points = monthlyTrend.map((item, index) => {
                      const x = 30 + (index * 360) / Math.max(monthlyTrend.length - 1, 1)
                      const y = 150 - (item.total / maxTrend) * 100
                      return `${x},${y}`
                    })

                    return (
                      <>
                        <polyline points={`30,150 ${points.join(' ')} 390,150`} fill="url(#trendFill)" stroke="none" />
                        <polyline points={points.join(' ')} fill="none" stroke="#34d399" strokeWidth="3" />
                        {monthlyTrend.map((item, index) => {
                          const x = 30 + (index * 360) / Math.max(monthlyTrend.length - 1, 1)
                          const y = 150 - (item.total / maxTrend) * 100
                          return <g key={item.monthKey}><circle cx={x} cy={y} r="4.5" fill="#ecfdf5" stroke="#34d399" strokeWidth="2" /><text x={x} y="170" textAnchor="middle" fontSize="10" fill="#cbd5e1">{item.label}</text></g>
                        })}
                      </>
                    )
                  })()}
                </svg>
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <h2 className="text-xl font-semibold text-white">Quick takeaways</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">Your current filtered spend total is <strong>{monthlySpend.toFixed(2)}</strong>.</li>
              <li className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">The largest category in view is <strong>{categoryBreakdown[0]?.[0] ?? 'No data'}</strong>.</li>
              <li className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">The line chart shows the last 6 months of expense movement for the selected category.</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  )
}
