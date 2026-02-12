import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './types'

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Lazy-initialized client for browser usage
let _supabase: SupabaseClient<Database> | null = null

export function getSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null
  }
  
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  return _supabase
}

// Server-side client for API routes (creates new instance each time)
export function createServerClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return null
  }

  return createClient<Database>(url, key)
}

// For backward compatibility - but prefer using getSupabase()
export const supabase = null as SupabaseClient<Database> | null
