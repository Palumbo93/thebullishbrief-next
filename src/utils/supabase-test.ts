import { supabase, hasSupabaseCredentials } from '../lib/supabase';

export const testSupabaseConnection = async () => {
  console.log('=== Supabase Connection Test ===');
  console.log('Has credentials:', hasSupabaseCredentials);
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  
  if (!hasSupabaseCredentials) {
    console.error('❌ No valid Supabase credentials found');
    return false;
  }

  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    console.log('Session test:', { data, error });
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
    return false;
  }
};

export const testOTPConfiguration = async (email: string) => {
  console.log('=== OTP Configuration Test ===');
  
  if (!hasSupabaseCredentials) {
    console.error('❌ Cannot test OTP without Supabase credentials');
    return false;
  }

  try {
    // Test OTP send
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      }
    });
    
    console.log('OTP test response:', { data, error });
    
    if (error) {
      console.error('❌ OTP configuration error:', error);
      return false;
    }
    
    console.log('✅ OTP configuration appears to be working');
    return true;
  } catch (err) {
    console.error('❌ OTP test error:', err);
    return false;
  }
}; 