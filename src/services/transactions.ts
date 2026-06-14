import { supabase } from '../lib/supabaseClient'

export type TransactionRecord = {
  id: string
  user_id: string
  amount: number
  category_id: string | null
  note: string | null
  created_at: string
  categories?: {
    id: string
    name: string | null
    type: string | null
  } | null
}

export type ProfileRecord = {
  id: string
  daily_budget: number | null
  created_at: string | null
}

export type CategoryRecord = {
  id: string
  name: string | null
  type: string | null
}

export async function getCurrentUserId() {
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData.user) {
    return null
  }

  return userData.user.id
}

export async function getTransactions(): Promise<TransactionRecord[]> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return []
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('id, user_id, amount, category_id, note, created_at, categories!category_id(id, name, type)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch transactions:', error)
    return []
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string
    user_id: string
    amount: number
    category_id: string | null
    note: string | null
    created_at: string
    categories: { id: string; name: string | null; type: string | null } | null
  }>

  return rows.map((row) => ({
    ...row,
    categories: row.categories ?? null,
  })) as TransactionRecord[]
}

export async function getCategories(): Promise<CategoryRecord[]> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return []
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, type')
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }

  return (data ?? []) as CategoryRecord[]
}

export async function createCategory(input: { name: string; type: 'income' | 'expense' }) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { error: new Error('You must be signed in to create a category.') }
  }

  const { error } = await supabase.from('categories').insert({
    user_id: userId,
    name: input.name.trim(),
    type: input.type,
    created_at: new Date().toISOString(),
  })

  return { error }
}

export async function updateCategory(id: string, input: { name: string; type: 'income' | 'expense' }) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { error: new Error('You must be signed in to update a category.') }
  }

  const { error } = await supabase
    .from('categories')
    .update({ name: input.name.trim(), type: input.type })
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}

export async function deleteCategory(id: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { error: new Error('You must be signed in to delete a category.') }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}

export async function addTransaction(input: {
  amount: number
  note: string
  category_id?: string | null
  created_at?: string
}) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { error: new Error('You must be signed in to add a transaction.') }
  }

  const { error } = await supabase.from('transactions').insert({
    user_id: userId,
    amount: Math.abs(input.amount),
    note: input.note,
    category_id: input.category_id ?? null,
    created_at: input.created_at ?? new Date().toISOString().slice(0, 10),
  })

  return { error }
}

export async function updateTransaction(id: string, input: {
  amount: number
  note: string
  category_id?: string | null
  created_at?: string
}) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { error: new Error('You must be signed in to update a transaction.') }
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      amount: Math.abs(input.amount),
      note: input.note,
      category_id: input.category_id ?? null,
      created_at: input.created_at ?? new Date().toISOString().slice(0, 10),
    })
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}

export async function deleteTransaction(id: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { error: new Error('You must be signed in to delete a transaction.') }
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}

export async function getProfile(): Promise<ProfileRecord | null> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, daily_budget, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch profile:', error)
    return null
  }

  return (data as ProfileRecord | null) ?? null
}

export async function updateDailyBudget(dailyBudget: number) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { error: new Error('You must be signed in to update your daily budget.') }
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, daily_budget: dailyBudget, created_at: new Date().toISOString() }, { onConflict: 'id' })

  return { error }
}
