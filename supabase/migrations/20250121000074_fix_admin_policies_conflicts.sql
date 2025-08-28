-- Fix Admin Policies Conflicts
-- This migration ensures admin policies work alongside existing user access patterns
-- without breaking normal user profile access

-- First, ensure users can still read their own profiles
-- Check if the basic user profile policy exists, if not create it
DO $$
BEGIN
  -- Add policy for users to read their own profile if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own profile"
    ON "public"."user_profiles"
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id)';
  END IF;
END
$$;

-- Ensure the existing authenticated users policy exists for basic info
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

-- Modify the admin policies to be more specific and non-conflicting
-- Drop the existing admin policies and recreate them as permissive
DROP POLICY IF EXISTS "Admins can view all user profiles" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Admins can update all user profiles" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Admins can delete user profiles" ON "public"."user_profiles";

-- Create more specific admin policies that work alongside existing ones
CREATE POLICY "Admins can manage any user profile"
ON "public"."user_profiles"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Ensure admin access to activity tables is permissive (doesn't override existing policies)
DROP POLICY IF EXISTS "Admins can view all article views" ON "public"."article_views";
DROP POLICY IF EXISTS "Admins can view all brief views" ON "public"."brief_views";
DROP POLICY IF EXISTS "Admins can view all bookmarks" ON "public"."bookmarks";
DROP POLICY IF EXISTS "Admins can view all bull room messages" ON "public"."bull_room_messages";
DROP POLICY IF EXISTS "Admins can view all bull room reactions" ON "public"."bull_room_reactions";

-- Create permissive admin policies for activity tables
CREATE POLICY "Admins can access all article views"
ON "public"."article_views"
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can access all brief views"
ON "public"."brief_views"
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can access all bookmarks"
ON "public"."bookmarks"
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can access all bull room messages"
ON "public"."bull_room_messages"
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can access all bull room reactions"
ON "public"."bull_room_reactions"
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Ensure user restrictions table has proper admin access
-- This should already exist from the user_restrictions migration but ensure it's permissive
DROP POLICY IF EXISTS "Admins can manage all user restrictions" ON "public"."user_restrictions";

CREATE POLICY "Admins can manage all user restrictions"
ON "public"."user_restrictions"
AS PERMISSIVE
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Add comments explaining the fixed policies
COMMENT ON POLICY "Users can read own profile" ON user_profiles IS 
'Allows users to read their own profile information';

COMMENT ON POLICY "Admins can manage any user profile" ON user_profiles IS 
'Allows admin users to manage any user profile - works alongside existing user policies';

COMMENT ON POLICY "Admins can access all article views" ON article_views IS 
'Allows admin users to view all article view records for analytics - permissive policy';

COMMENT ON POLICY "Admins can access all brief views" ON brief_views IS 
'Allows admin users to view all brief view records for analytics - permissive policy';
