-- Add email_verified column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN email_verified boolean DEFAULT false;

-- Add index for email_verified for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified 
ON public.user_profiles (email_verified);

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.email_verified IS 'Whether the user has verified their email address';

-- Update existing user profiles to set email_verified based on auth.users.email_confirmed_at
UPDATE public.user_profiles 
SET email_verified = true 
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email_confirmed_at IS NOT NULL
);
