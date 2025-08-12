import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have real Supabase credentials
export const hasSupabaseCredentials = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key' &&
  !supabaseUrl.includes('your-supabase-url-here') &&
  !supabaseAnonKey.includes('your-supabase-anon-key-here')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auto-refresh on window focus to prevent unnecessary auth state changes
    autoRefreshToken: false,
    // Still allow manual token refresh when needed
    persistSession: true,
    // Detect session in URL for magic links
    detectSessionInUrl: true
  }
})