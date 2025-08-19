-- Secure Admin Access Migration
-- This migration implements server-side admin security safeguards
-- to prevent users from escalating their privileges to admin status

-- Drop the overly permissive user profile update policy
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create a function to validate user profile updates
-- This function prevents users from modifying admin-only fields
CREATE OR REPLACE FUNCTION validate_user_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow users to update their own profile
  IF auth.uid() != NEW.id THEN
    RAISE EXCEPTION 'Users can only update their own profile';
  END IF;
  
  -- Prevent modification of admin-only fields by non-service users
  IF auth.role() != 'service_role' THEN
    -- Preserve admin status - users cannot change this
    NEW.is_admin := OLD.is_admin;
    
    -- Preserve immutable fields
    NEW.id := OLD.id;
    NEW.created_at := OLD.created_at;
  END IF;
  
  -- Update the updated_at timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce field-level security
DROP TRIGGER IF EXISTS secure_user_profile_update ON user_profiles;
CREATE TRIGGER secure_user_profile_update
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_profile_update();

-- Create a secure policy that allows users to update their profile
CREATE POLICY "Users can update own profile securely" 
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure service role can manage all profiles
CREATE POLICY "Service role manages all profiles" 
ON user_profiles FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Add comments explaining the security model
COMMENT ON FUNCTION validate_user_profile_update() IS 
'Enforces field-level security for user profile updates, preventing privilege escalation';

COMMENT ON POLICY "Users can update own profile securely" ON user_profiles IS 
'Allows users to update their profile with trigger-based field protection';

COMMENT ON POLICY "Service role manages all profiles" ON user_profiles IS 
'Allows service role to manage admin privileges and other sensitive operations';
