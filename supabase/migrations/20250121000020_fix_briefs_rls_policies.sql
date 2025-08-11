-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Briefs are manageable by content managers" ON briefs;

-- Create a simpler policy that allows admin users to manage briefs
CREATE POLICY "Allow admins to manage briefs"
  ON briefs
  AS permissive
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- Keep the existing public read policy for published briefs
-- (This should already exist from the previous migration) 