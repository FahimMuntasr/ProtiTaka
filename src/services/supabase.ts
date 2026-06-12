import { supabase } from '../lib/supabaseClient'

export async function getSupabaseSession() {
  const { data, error } = await supabase.auth.getSession()
  console.log({ data, error })
  return { data, error }
}
