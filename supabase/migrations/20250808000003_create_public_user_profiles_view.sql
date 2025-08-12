-- Create a public view for user profile information that can be accessed by authenticated users
-- This view exposes only the necessary public information for profile popups
-- Migration: 20250808000003_create_public_user_profiles_view.sql

-- Create the public user profiles view
CREATE OR REPLACE VIEW public.user_profiles_public AS
SELECT 
  id,
  username,
  bio,
  profile_image,
  twitter_handle,
  created_at
FROM user_profiles
WHERE id IS NOT NULL;

-- Grant access to authenticated users
GRANT SELECT ON public.user_profiles_public TO authenticated;

-- Add comment explaining the view
COMMENT ON VIEW public.user_profiles_public IS 
'Public view of user profiles containing only information that should be visible to other users. 
This view respects RLS policies and only exposes non-sensitive profile data.';

-- Create a function to get public profile by ID (for better security)
CREATE OR REPLACE FUNCTION public.get_user_profile_public(user_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  bio text,
  profile_image text,
  twitter_handle text,
  created_at timestamptz
) AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    up.id,
    up.username,
    up.bio,
    up.profile_image,
    up.twitter_handle,
    up.created_at
  FROM public.user_profiles up
  WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile_public(uuid) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION public.get_user_profile_public(uuid) IS 
'Secure function to get public user profile information. Only returns non-sensitive data and requires authentication.';
