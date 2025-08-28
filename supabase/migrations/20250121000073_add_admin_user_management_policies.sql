-- Add Admin User Management Policies
-- This migration adds RLS policies that allow admins to access all user data
-- for user management and analytics purposes in the admin portal

-- 1. User Profiles - Add admin access policy
CREATE POLICY "Admins can view all user profiles"
ON "public"."user_profiles"
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update all user profiles"
ON "public"."user_profiles"
FOR UPDATE
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

CREATE POLICY "Admins can delete user profiles"
ON "public"."user_profiles"
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 2. Article Views - Add admin access policy
CREATE POLICY "Admins can view all article views"
ON "public"."article_views"
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 3. Brief Views - Add admin access policy
CREATE POLICY "Admins can view all brief views"
ON "public"."brief_views"
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 4. Bookmarks - Add admin access policy
CREATE POLICY "Admins can view all bookmarks"
ON "public"."bookmarks"
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 5. Bull Room Messages - Add admin access policy
CREATE POLICY "Admins can view all bull room messages"
ON "public"."bull_room_messages"
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 6. Bull Room Reactions - Add admin access policy
CREATE POLICY "Admins can view all bull room reactions"
ON "public"."bull_room_reactions"
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 7. Article Comments - Add admin access policy (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'article_comments') THEN
    EXECUTE 'CREATE POLICY "Admins can view all article comments"
    ON "public"."article_comments"
    FOR SELECT 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND is_admin = true
      )
    )';
  END IF;
END
$$;

-- 8. User Roles - Add admin access policy (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    EXECUTE 'CREATE POLICY "Admins can view all user roles"
    ON "public"."user_roles"
    FOR SELECT 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND is_admin = true
      )
    )';
  END IF;
END
$$;

-- Add comments explaining the admin policies
COMMENT ON POLICY "Admins can view all user profiles" ON user_profiles IS 
'Allows admin users to view all user profiles for user management purposes';

COMMENT ON POLICY "Admins can update all user profiles" ON user_profiles IS 
'Allows admin users to update any user profile for user management purposes';

COMMENT ON POLICY "Admins can delete user profiles" ON user_profiles IS 
'Allows admin users to delete user profiles for user management purposes';

COMMENT ON POLICY "Admins can view all article views" ON article_views IS 
'Allows admin users to view all article view records for analytics purposes';

COMMENT ON POLICY "Admins can view all brief views" ON brief_views IS 
'Allows admin users to view all brief view records for analytics purposes';

COMMENT ON POLICY "Admins can view all bookmarks" ON bookmarks IS 
'Allows admin users to view all bookmark records for user analytics purposes';

COMMENT ON POLICY "Admins can view all bull room messages" ON bull_room_messages IS 
'Allows admin users to view all bull room messages for moderation purposes';

COMMENT ON POLICY "Admins can view all bull room reactions" ON bull_room_reactions IS 
'Allows admin users to view all bull room reactions for analytics purposes';
