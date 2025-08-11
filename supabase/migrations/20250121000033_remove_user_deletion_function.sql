-- Remove the client-side user deletion function since it can't delete auth users
-- We'll replace this with an Edge Function that has admin privileges

-- Drop the function (using IF EXISTS to handle case where it might not exist)
DROP FUNCTION IF EXISTS public.delete_user_account();

-- Note: REVOKE will only run if function exists, which we just dropped, so we skip it
