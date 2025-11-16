import { createClient } from '@supabase/supabase-js'

// Supabase client for server-side operations
// Use placeholder values if env vars not set (for development)
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
}
