-- Allow unauthenticated users to read basic user profile information for public content
-- This enables comment functionality where unauthenticated users can see usernames

-- Create a function that returns only username for public access
CREATE OR REPLACE FUNCTION public.get_user_username(user_id uuid)
RETURNS text AS $$
BEGIN
  -- Allow both authenticated and unauthenticated users to read usernames
  RETURN (
    SELECT username 
    FROM public.user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get multiple usernames for public access
CREATE OR REPLACE FUNCTION public.get_user_usernames(user_ids uuid[])
RETURNS TABLE (
  id uuid,
  username text
) AS $$
BEGIN
  -- Allow both authenticated and unauthenticated users to read usernames
  RETURN QUERY
  SELECT 
    up.id,
    up.username
  FROM public.user_profiles up
  WHERE up.id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments explaining the security model
COMMENT ON FUNCTION public.get_user_username(uuid) IS 
'Returns username for any user, accessible by both authenticated and unauthenticated users for public content like comments.';

COMMENT ON FUNCTION public.get_user_usernames(uuid[]) IS 
'Returns usernames for multiple users, accessible by both authenticated and unauthenticated users for public content like comments.';
