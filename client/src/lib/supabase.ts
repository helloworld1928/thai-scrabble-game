import { createClient } from '@supabase/supabase-js'

// Supabase client for frontend operations
// Use placeholder values if env vars not set (for development)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: window.localStorage,
  },
})

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
}
