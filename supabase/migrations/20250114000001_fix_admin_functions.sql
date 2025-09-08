-- Fix admin functions to also manage role assignments
-- This ensures when admin status is granted/revoked, the proper roles are also set

-- 1. Update grant_admin_privileges to also assign admin role
CREATE OR REPLACE FUNCTION grant_admin_privileges(
  target_user_id uuid,
  granting_admin_id uuid,
  reason text DEFAULT 'No reason provided'
)
RETURNS jsonb AS $$
DECLARE
  target_user_email text;
  granting_admin_email text;
  admin_role_id uuid;
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
  
  -- Get or create admin role
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  IF admin_role_id IS NULL THEN
    -- Create admin role if it doesn't exist
    INSERT INTO roles (name, description, permissions, created_at, updated_at)
    VALUES (
      'admin',
      'Full administrative access with all content management permissions',
      jsonb_build_object(
        'articles', jsonb_build_array('create', 'read', 'update', 'delete'),
        'authors', jsonb_build_array('create', 'read', 'update', 'delete'),
        'categories', jsonb_build_array('create', 'read', 'update', 'delete'),
        'tags', jsonb_build_array('create', 'read', 'update', 'delete'),
        'briefs', jsonb_build_array('create', 'read', 'update', 'delete'),
        'users', jsonb_build_array('create', 'read', 'update', 'delete'),
        'bull_rooms', jsonb_build_array('create', 'read', 'update', 'delete'),
        'prompts', jsonb_build_array('create', 'read', 'update', 'delete')
      ),
      now(),
      now()
    ) RETURNING id INTO admin_role_id;
  END IF;
  
  -- Grant admin privileges in user_profiles
  UPDATE user_profiles 
  SET is_admin = true, updated_at = now()
  WHERE id = target_user_id;
  
  -- Add admin role in user_roles (remove existing first)
  DELETE FROM user_roles WHERE user_id = target_user_id AND role_id = admin_role_id;
  INSERT INTO user_roles (user_id, role_id, granted_by, granted_at)
  VALUES (target_user_id, admin_role_id, granting_admin_id, now());
  
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

-- 2. Update revoke_admin_privileges to also remove admin role
CREATE OR REPLACE FUNCTION revoke_admin_privileges(
  target_user_id uuid,
  revoking_admin_id uuid,
  reason text DEFAULT 'No reason provided'
)
RETURNS jsonb AS $$
DECLARE
  target_user_email text;
  revoking_admin_email text;
  admin_role_id uuid;
  result jsonb;
BEGIN
  -- SECURITY: Only service role can execute this function
  IF auth.role() != 'service_role' THEN
    -- Log the security violation
    INSERT INTO admin_audit_log (user_id, action, reason, client_info)
    VALUES (
      target_user_id,
      'attempted_escalation',
      'Unauthorized admin privilege revoke attempt by user: ' || COALESCE(auth.uid()::text, 'anonymous'),
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
  
  -- Get admin role
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  -- Revoke admin privileges in user_profiles
  UPDATE user_profiles 
  SET is_admin = false, updated_at = now()
  WHERE id = target_user_id;
  
  -- Remove admin role from user_roles
  IF admin_role_id IS NOT NULL THEN
    DELETE FROM user_roles WHERE user_id = target_user_id AND role_id = admin_role_id;
  END IF;
  
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
