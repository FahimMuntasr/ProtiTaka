import { useEffect, useState } from 'react'
import AppNavigation from '../components/AppNavigation'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../services/transactions'

export default function CategoriesPage() {
  const [name, setName] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ id: string; name: string | null; type: string | null }>>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadCategories() {
    setLoading(true)
    setMessage('')

    try {
      const rows = await getCategories()
      setCategories(rows)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  async function handleSaveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    if (!name.trim()) {
      setMessage('Please enter a category name.')
      setSaving(false)
      return
    }

    const { error } = editingId
      ? await updateCategory(editingId, { name, type })
      : await createCategory({ name, type })

    if (error) {
      setMessage(error.message)
      setSaving(false)
      return
    }

    setName('')
    setType('expense')
    await loadCategories()
    setSaving(false)
    setEditingId(null)
    setMessage(editingId ? 'Category updated successfully.' : 'Category created successfully.')
  }

  async function handleDeleteCategory(id: string) {
    const { error } = await deleteCategory(id)

    if (error) {
      setMessage(error.message)
      return
    }

    await loadCategories()
    setMessage('Category deleted successfully.')
  }

  function startEdit(category: { id: string; name: string | null; type: string | null }) {
    setEditingId(category.id)
    setName(category.name ?? '')
    setType((category.type as 'income' | 'expense') ?? 'expense')
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6 md:p-10">
      <AppNavigation />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-2 md:px-0">
        <header className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Categories</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Create your own expense categories</h1>
            <p className="mt-3 text-slate-300">These categories are tied to your account and available in your transaction form.</p>
          </div>
        </header>

        <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-black/30 sm:p-6 lg:grid-cols-[1fr_1.1fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <h2 className="text-xl font-semibold text-white">Create category</h2>
            <p className="mt-2 text-sm text-slate-300">Add names you want to reuse when logging expenses.</p>

            <form onSubmit={handleSaveCategory} className="mt-5 space-y-4">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Category name"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
              />
              <select
                value={type}
                onChange={(event) => setType(event.target.value as 'income' | 'expense')}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-70"
              >
                {saving ? 'Saving...' : editingId ? 'Update category' : 'Create category'}
              </button>
            </form>

            {message ? <p className="mt-4 text-sm text-emerald-200">{message}</p> : null}
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <h2 className="text-xl font-semibold text-white">Your categories</h2>
            <p className="mt-2 text-sm text-slate-300">Your custom categories appear in the transaction form for faster expense entry.</p>

            {loading && <p className="mt-4 text-slate-300">Loading categories...</p>}
            {!loading && categories.length === 0 && <p className="mt-4 text-slate-300">You haven’t created any custom categories yet.</p>}

            {!loading && categories.length > 0 && (
              <ul className="mt-4 space-y-3">
                {categories
                  .slice()
                  .sort((a, b) => (a.type ?? '').localeCompare(b.type ?? '') || (a.name ?? '').localeCompare(b.name ?? ''))
                  .map((category) => (
                    <li key={category.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-slate-100">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold">{category.name}</p>
                          <p className="text-sm text-slate-400">Type: {category.type}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => startEdit(category)} className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">Edit</button>
                          <button type="button" onClick={() => void handleDeleteCategory(category.id)} className="rounded-full border border-rose-700/70 px-3 py-1 text-xs font-semibold text-rose-200">Delete</button>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </article>
        </section>
      </div>
    </main>
  )
}
