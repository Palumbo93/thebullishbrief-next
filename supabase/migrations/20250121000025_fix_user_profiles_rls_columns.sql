-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can read basic profile info" ON "public"."user_profiles";

-- Create a secure function that returns only basic user profile information
CREATE OR REPLACE FUNCTION public.get_user_profile_basic(user_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  created_at timestamptz,
  updated_at timestamptz
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
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get multiple basic profiles (for chat functionality)
CREATE OR REPLACE FUNCTION public.get_user_profiles_basic(user_ids uuid[])
RETURNS TABLE (
  id uuid,
  username text,
  created_at timestamptz,
  updated_at timestamptz
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
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments explaining the security model
COMMENT ON FUNCTION public.get_user_profile_basic(uuid) IS 
'Returns only basic user profile information (id, username, created_at, updated_at) for authenticated users. Sensitive data like email is protected.';

COMMENT ON FUNCTION public.get_user_profiles_basic(uuid[]) IS 
'Returns basic profile information for multiple users, used for chat functionality. Sensitive data like email is protected.';
