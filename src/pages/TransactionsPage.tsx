import { useEffect, useMemo, useState } from 'react'
import AppNavigation from '../components/AppNavigation'
import { addTransaction, deleteTransaction, getCategories, getTransactions, updateTransaction, type CategoryRecord, type TransactionRecord } from '../services/transactions'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [categories, setCategories] = useState<CategoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'highest'>('newest')
  const [form, setForm] = useState({
    note: '',
    amount: '',
    categoryId: '',
    createdAt: new Date().toISOString().slice(0, 10),
  })

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [rows, availableCategories] = await Promise.all([getTransactions(), getCategories()])
      setTransactions(rows)
      setCategories(availableCategories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load transactions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!mounted) return
      await loadData()
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  function resetForm() {
    setForm({ note: '', amount: '', categoryId: '', createdAt: new Date().toISOString().slice(0, 10) })
    setEditingId(null)
  }

  async function handleCreateTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFormMessage('')
    setError('')

    const amount = Number(form.amount)

    if (!form.note.trim()) {
      setFormMessage('Please enter a title for this expense.')
      setSubmitting(false)
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormMessage('Please enter a valid amount greater than zero.')
      setSubmitting(false)
      return
    }

    const result = editingId
      ? await updateTransaction(editingId, {
          note: form.note.trim(),
          amount: Math.abs(amount),
          category_id: form.categoryId || null,
          created_at: form.createdAt,
        })
      : await addTransaction({
          note: form.note.trim(),
          amount: Math.abs(amount),
          category_id: form.categoryId || null,
          created_at: form.createdAt,
        })

    if (result.error) {
      setFormMessage(result.error.message)
      setSubmitting(false)
      return
    }

    resetForm()
    setFormMessage(editingId ? 'Expense updated successfully.' : 'Expense added successfully.')
    await loadData()
    setSubmitting(false)
  }

  async function handleDeleteTransaction(id: string) {
    const { error } = await deleteTransaction(id)

    if (error) {
      setFormMessage(error.message)
      return
    }

    await loadData()
    setFormMessage('Expense deleted successfully.')
  }

  function startEdit(transaction: TransactionRecord) {
    setEditingId(transaction.id)
    setForm({
      note: transaction.note ?? '',
      amount: String(transaction.amount),
      categoryId: transaction.category_id ?? '',
      createdAt: transaction.created_at.slice(0, 10),
    })
  }

  const sortedTransactions = useMemo(() => {
    const rows = [...transactions]

    if (sortBy === 'highest') {
      return rows.sort((a, b) => Number(b.amount) - Number(a.amount))
    }

    return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [sortBy, transactions])

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6 md:p-10">
      <AppNavigation />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-2 md:px-0">
        <header className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Transactions</p>
            <p className="mt-3 max-w-2xl text-slate-300">Create and view transactions for the signed-in user only.</p>
          </div>
        </header>

        <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-black/30 sm:p-6 lg:grid-cols-[1fr_1.2fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <h2 className="text-xl font-semibold text-white">{editingId ? 'Edit expense' : 'Add expense'}</h2>
            <p className="mt-2 text-sm text-slate-300">Create or update a transaction for the signed-in user only.</p>

            <form onSubmit={handleCreateTransaction} className="mt-5 space-y-4">
              <input value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Title" className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400" />
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount" className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400" />
              <select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400">
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <input type="date" value={form.createdAt} onChange={(event) => setForm((current) => ({ ...current, createdAt: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={submitting} className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-70 sm:flex-1">{submitting ? 'Saving...' : editingId ? 'Update expense' : 'Save expense'}</button>
                {editingId ? <button type="button" onClick={resetForm} className="w-full rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 sm:w-auto">Cancel</button> : null}
              </div>
            </form>

            {formMessage ? <p className="mt-4 text-sm text-emerald-200">{formMessage}</p> : null}
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Recent expenses</h2>
                <p className="mt-2 text-sm text-slate-300">Only transactions for the current authenticated user are shown.</p>
              </div>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'newest' | 'highest')} className="w-full rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 sm:w-auto">
                <option value="newest">Newest first</option>
                <option value="highest">Highest amount</option>
              </select>
            </div>

            {loading && <p className="mt-4 text-slate-300">Loading transactions...</p>}
            {error && <p className="mt-4 text-rose-300">{error}</p>}
            {!loading && !error && transactions.length === 0 && <p className="mt-4 text-slate-300">No transactions found for this user yet.</p>}

            {!loading && !error && transactions.length > 0 && (
              <>
                <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-slate-800 lg:block">
                  <table className="min-w-[640px] divide-y divide-slate-800 text-left text-sm">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Note</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {sortedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-slate-800/60">
                          <td className="px-4 py-3 text-slate-200">{new Date(transaction.created_at).toLocaleDateString()}</td>
                          <td className={`px-4 py-3 font-semibold ${((transaction.categories?.type ?? 'expense') === 'income') ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {Number(transaction.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-slate-200">{(transaction as TransactionRecord & { categories?: { name?: string | null } }).categories?.name ?? 'Uncategorized'}</td>
                          <td className="px-4 py-3 text-slate-300">{transaction.note ?? '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => startEdit(transaction)} className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">Edit</button>
                              <button type="button" onClick={() => void handleDeleteTransaction(transaction.id)} className="rounded-full border border-rose-700/70 px-3 py-1 text-xs font-semibold text-rose-200">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 space-y-3 lg:hidden">
                  {sortedTransactions.map((transaction) => (
                    <article key={transaction.id} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-black/20">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-400">{new Date(transaction.created_at).toLocaleDateString()}</p>
                          <p className="mt-1 text-base font-semibold text-white">{transaction.note ?? 'Transaction'}</p>
                          <p className="mt-1 text-sm text-slate-300">{(transaction as TransactionRecord & { categories?: { name?: string | null } }).categories?.name ?? 'Uncategorized'}</p>
                        </div>
                        <p className={`text-base font-semibold ${((transaction.categories?.type ?? 'expense') === 'income') ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {Number(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => startEdit(transaction)} className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-100">Edit</button>
                        <button type="button" onClick={() => void handleDeleteTransaction(transaction.id)} className="rounded-full border border-rose-700/70 px-3 py-1.5 text-xs font-semibold text-rose-200">Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </article>
        </section>
      </div>
    </main>
  )
}
