/**
 * Server-side admin security utilities
 * 
 * This module provides secure admin verification functions that should be used
 * on the server-side to verify admin status before allowing access to admin
 * functionality.
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Creates a Supabase server client for admin verification
 */
async function createAdminSupabaseClient() {
  const cookieStore = await cookies();
  
  // Get all cookies to find Supabase session cookies
  const allCookies = cookieStore.getAll();
  console.log('Available cookies:', allCookies.map(c => c.name));
  
  // Try to find the Supabase session cookies
  // Supabase typically uses cookies like: sb-[project-ref]-auth-token
  let accessToken = null;
  const refreshToken = null;
  
  for (const cookie of allCookies) {
    if (cookie.name.includes('auth-token') && !cookie.name.includes('refresh')) {
      try {
        const sessionData = JSON.parse(cookie.value);
        if (sessionData.access_token) {
          accessToken = sessionData.access_token;
        }
      } catch (e) {
        // Cookie might not be JSON, try as direct token
        if (cookie.value.length > 100) { // JWT tokens are typically longer
          accessToken = cookie.value;
        }
      }
    }
  }
  
  console.log('Found access token:', !!accessToken);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    }
  );
  
  return supabase;
}

/**
 * Verifies if the current user has admin privileges
 * 
 * This function checks admin status by:
 * 1. Getting the current authenticated user
 * 2. Checking their profile in the database for is_admin flag
 * 
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export async function verifyAdminStatus(): Promise<boolean> {
  try {
    const supabase = await createAdminSupabaseClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return false;
    }
    
    // Check JWT app_metadata first (most secure)
    if (user.app_metadata?.is_admin === true) {
      return true;
    }
    
    // Fallback: Check database profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error checking admin status:', profileError);
      return false;
    }
    
    return profile?.is_admin || false;
  } catch (error) {
    console.error('Error in verifyAdminStatus:', error);
    return false;
  }
}

/**
 * Gets the current authenticated user
 * 
 * @returns Promise<User | null> - Current user if authenticated, null otherwise
 */
export async function getCurrentUser() {
  try {
    const supabase = await createAdminSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Server-side admin verification middleware
 * Throws error if not authenticated or not admin
 * 
 * @throws Error if not authenticated or not admin
 */
export async function verifyAdminAccess(): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const isAdmin = await verifyAdminStatus();
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
}

/**
 * Requires admin access and redirects if not authorized
 * Use this in server components to protect admin pages
 */
export async function requireAdminOrRedirect(): Promise<void> {
  try {
    await verifyAdminAccess();
  } catch (error) {
    console.log('Admin access denied:', error instanceof Error ? error.message : 'Unknown error');
    redirect('/');
  }
}
