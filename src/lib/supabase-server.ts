import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

/**
 * Creates a Supabase client for server-side operations
 * This client can read authentication state from cookies
 * and is safe to use in Server Components and API routes
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Gets the current authenticated user from server-side cookies
 * Returns null if no user is authenticated
 */
export async function getServerUser() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Only log actual errors, not "no user" cases
      if (error.message !== 'Auth session missing!' && error.message !== 'JWT expired') {
        console.warn('Server auth warning:', error.message);
      }
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error creating server Supabase client:', error)
    return null
  }
}

/**
 * Gets the user profile with subscription status from server-side
 * Returns null if no user is authenticated or profile doesn't exist
 */
export async function getServerUserProfile() {
  try {
    const user = await getServerUser()
    if (!user) return null
    
    const supabase = await createServerSupabaseClient()
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error getting server user profile:', error)
      return null
    }
    
    return profile
  } catch (error) {
    console.error('Error getting server user profile:', error)
    return null
  }
}
