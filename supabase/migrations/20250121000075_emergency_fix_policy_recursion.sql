-- EMERGENCY FIX: Remove all problematic admin policies causing infinite recursion
-- This migration removes the conflicting policies and restores basic functionality

-- 1. Drop ALL admin policies that are causing recursion
DROP POLICY IF EXISTS "Admins can manage any user profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Admins can view all user profiles" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Admins can update all user profiles" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Admins can delete user profiles" ON "public"."user_profiles";

-- 2. Drop admin activity table policies
DROP POLICY IF EXISTS "Admins can access all article views" ON "public"."article_views";
DROP POLICY IF EXISTS "Admins can access all brief views" ON "public"."brief_views";
DROP POLICY IF EXISTS "Admins can access all bookmarks" ON "public"."bookmarks";
DROP POLICY IF EXISTS "Admins can access all bull room messages" ON "public"."bull_room_messages";
DROP POLICY IF EXISTS "Admins can access all bull room reactions" ON "public"."bull_room_reactions";

-- 3. Ensure basic user access policies exist and work
-- Drop any conflicting policies first
DROP POLICY IF EXISTS "Users can read own profile" ON "public"."user_profiles";

-- Create simple, non-recursive user profile policies
CREATE POLICY "Users can read own profile"
ON "public"."user_profiles"
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Ensure the basic authenticated read policy exists (this should already be there)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Authenticated users can read basic profile info'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can read basic profile info" 
    ON "public"."user_profiles"
    AS PERMISSIVE
    FOR SELECT 
    TO authenticated
    USING (true)';
  END IF;
END
$$;

-- 4. Create SIMPLE, NON-RECURSIVE admin policies using direct role check
-- Instead of querying user_profiles table, we'll use a different approach

-- Create a simple function to check if current user is admin without recursion
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean AS $$
BEGIN
  -- Check JWT metadata first (most secure, no recursion)
  IF (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin' = 'true' THEN
    RETURN true;
  END IF;
  
  -- Fallback: direct check without policy involvement
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin policies using the non-recursive function
CREATE POLICY "Admins can manage all user profiles (non-recursive)"
ON "public"."user_profiles"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Create simple admin policies for activity tables
CREATE POLICY "Admins can view all bookmarks (non-recursive)"
ON "public"."bookmarks"
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (is_admin_user());

-- Add comment explaining the fix
COMMENT ON FUNCTION is_admin_user() IS 
'Non-recursive admin check function that avoids policy infinite recursion by checking JWT metadata first';

COMMENT ON POLICY "Admins can manage all user profiles (non-recursive)" ON user_profiles IS 
'Admin policy that uses non-recursive function to avoid infinite recursion in RLS policies';
