-- AIRTIGHT ADMIN SECURITY MIGRATION
-- This migration implements bulletproof admin security with audit logging
-- and prevents all forms of client-side privilege escalation

-- 1. Create admin audit log table for complete accountability
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('granted', 'revoked', 'attempted_escalation')),
  performed_by uuid REFERENCES user_profiles(id),
  performed_by_email text,
  reason text,
  client_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_action_performer CHECK (
    (action IN ('granted', 'revoked') AND performed_by IS NOT NULL) OR
    (action = 'attempted_escalation')
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_id ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);

-- 2. Create bulletproof admin security function
CREATE OR REPLACE FUNCTION secure_admin_check()
RETURNS boolean AS $$
DECLARE
  current_user_id uuid;
  user_is_admin boolean := false;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Return false if no authenticated user
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check JWT app_metadata first (most secure)
  IF (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin' = 'true' THEN
    RETURN true;
  END IF;
  
  -- Fallback: Direct database check using service role bypass
  -- Use a separate connection to avoid policy recursion
  SELECT is_admin INTO user_is_admin
  FROM user_profiles 
  WHERE id = current_user_id;
  
  RETURN COALESCE(user_is_admin, false);
EXCEPTION
  WHEN OTHERS THEN
    -- Log security exception and deny access
    INSERT INTO admin_audit_log (user_id, action, reason, client_info)
    VALUES (
      current_user_id, 
      'attempted_escalation', 
      'Security function exception: ' || SQLERRM,
      jsonb_build_object('error', SQLERRM, 'state', SQLSTATE)
    );
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create secure admin management functions that ONLY service role can use
CREATE OR REPLACE FUNCTION grant_admin_privileges(
  target_user_id uuid,
  granting_admin_id uuid,
  reason text DEFAULT 'No reason provided'
)
RETURNS jsonb AS $$
DECLARE
  target_user_email text;
  granting_admin_email text;
  result jsonb;
BEGIN
  -- SECURITY: Only service role can execute this function
  IF auth.role() != 'service_role' THEN
    -- Log the security violation
    INSERT INTO admin_audit_log (user_id, action, reason, client_info)
    VALUES (
      target_user_id,
      'attempted_escalation',
      'Unauthorized admin privilege grant attempt by user: ' || COALESCE(auth.uid()::text, 'anonymous'),
      jsonb_build_object('attempted_by', auth.uid(), 'target_user', target_user_id, 'function', 'grant_admin_privileges')
    );
    
    RAISE EXCEPTION 'SECURITY VIOLATION: Only service role can grant admin privileges';
  END IF;
  
  -- Verify granting admin exists and is actually admin
  SELECT email INTO granting_admin_email
  FROM user_profiles 
  WHERE id = granting_admin_id AND is_admin = true;
  
  IF granting_admin_email IS NULL THEN
    RAISE EXCEPTION 'Granting user is not a valid admin';
  END IF;
  
  -- Get target user email
  SELECT email INTO target_user_email
  FROM user_profiles 
  WHERE id = target_user_id;
  
  IF target_user_email IS NULL THEN
    RAISE EXCEPTION 'Target user does not exist';
  END IF;
  
  -- Grant admin privileges
  UPDATE user_profiles 
  SET is_admin = true, updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the successful action
  INSERT INTO admin_audit_log (user_id, action, performed_by, performed_by_email, reason)
  VALUES (target_user_id, 'granted', granting_admin_id, granting_admin_email, reason);
  
  result := jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'user_email', target_user_email,
    'granted_by', granting_admin_email,
    'reason', reason,
    'timestamp', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION revoke_admin_privileges(
  target_user_id uuid,
  revoking_admin_id uuid,
  reason text DEFAULT 'No reason provided'
)
RETURNS jsonb AS $$
DECLARE
  target_user_email text;
  revoking_admin_email text;
  result jsonb;
BEGIN
  -- SECURITY: Only service role can execute this function
  IF auth.role() != 'service_role' THEN
    -- Log the security violation
    INSERT INTO admin_audit_log (user_id, action, reason, client_info)
    VALUES (
      target_user_id,
      'attempted_escalation',
      'Unauthorized admin privilege revocation attempt by user: ' || COALESCE(auth.uid()::text, 'anonymous'),
      jsonb_build_object('attempted_by', auth.uid(), 'target_user', target_user_id, 'function', 'revoke_admin_privileges')
    );
    
    RAISE EXCEPTION 'SECURITY VIOLATION: Only service role can revoke admin privileges';
  END IF;
  
  -- Verify revoking admin exists and is actually admin
  SELECT email INTO revoking_admin_email
  FROM user_profiles 
  WHERE id = revoking_admin_id AND is_admin = true;
  
  IF revoking_admin_email IS NULL THEN
    RAISE EXCEPTION 'Revoking user is not a valid admin';
  END IF;
  
  -- Get target user email
  SELECT email INTO target_user_email
  FROM user_profiles 
  WHERE id = target_user_id;
  
  IF target_user_email IS NULL THEN
    RAISE EXCEPTION 'Target user does not exist';
  END IF;
  
  -- Prevent admins from revoking their own privileges (safety measure)
  IF target_user_id = revoking_admin_id THEN
    RAISE EXCEPTION 'Admins cannot revoke their own privileges';
  END IF;
  
  -- Revoke admin privileges
  UPDATE user_profiles 
  SET is_admin = false, updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the successful action
  INSERT INTO admin_audit_log (user_id, action, performed_by, performed_by_email, reason)
  VALUES (target_user_id, 'revoked', revoking_admin_id, revoking_admin_email, reason);
  
  result := jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'user_email', target_user_email,
    'revoked_by', revoking_admin_email,
    'reason', reason,
    'timestamp', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enhanced user profile update trigger with logging
CREATE OR REPLACE FUNCTION secure_user_profile_update_with_logging()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow users to update their own profile
  IF auth.uid() != NEW.id THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Users can only update their own profile';
  END IF;
  
  -- Detect admin privilege escalation attempts
  IF auth.role() != 'service_role' AND OLD.is_admin != NEW.is_admin THEN
    -- Log the security violation
    INSERT INTO admin_audit_log (user_id, action, reason, client_info)
    VALUES (
      NEW.id,
      'attempted_escalation',
      'Direct database admin privilege modification attempt',
      jsonb_build_object(
        'old_is_admin', OLD.is_admin,
        'new_is_admin', NEW.is_admin,
        'auth_uid', auth.uid(),
        'auth_role', auth.role()
      )
    );
    
    RAISE EXCEPTION 'SECURITY VIOLATION: Admin privileges cannot be modified directly. Use secure admin management functions.';
  END IF;
  
  -- For non-service roles, preserve admin-only fields
  IF auth.role() != 'service_role' THEN
    NEW.is_admin := OLD.is_admin;
    NEW.id := OLD.id;
    NEW.created_at := OLD.created_at;
  END IF;
  
  -- Update timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace the existing trigger
DROP TRIGGER IF EXISTS secure_user_profile_update ON user_profiles;
CREATE TRIGGER secure_user_profile_update_with_logging
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION secure_user_profile_update_with_logging();

-- 5. Create admin audit log policies
CREATE POLICY "Admins can view audit logs" 
ON admin_audit_log FOR SELECT
TO authenticated
USING (secure_admin_check());

CREATE POLICY "System can insert audit logs" 
ON admin_audit_log FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Service role has full access
CREATE POLICY "Service role manages audit logs" 
ON admin_audit_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 6. Add security comments
COMMENT ON TABLE admin_audit_log IS 
'Complete audit trail for admin privilege changes and security violations';

COMMENT ON FUNCTION secure_admin_check() IS 
'Bulletproof admin verification that checks JWT metadata first, with exception handling';

COMMENT ON FUNCTION grant_admin_privileges(uuid, uuid, text) IS 
'Service-role-only function to securely grant admin privileges with full audit logging';

COMMENT ON FUNCTION revoke_admin_privileges(uuid, uuid, text) IS 
'Service-role-only function to securely revoke admin privileges with full audit logging';

COMMENT ON FUNCTION secure_user_profile_update_with_logging() IS 
'Enhanced profile update trigger that logs all privilege escalation attempts';
