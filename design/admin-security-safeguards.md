# Admin Security Safeguards - Design Document

## Problem Statement

The current admin authorization system has critical security vulnerabilities that allow users to potentially escalate their privileges to admin status. Specifically:

1. **Weak RLS Policy**: Users can update their own `user_profiles` record, potentially including the `is_admin` field
2. **No Column-Level Protection**: The `is_admin` field lacks explicit protection against unauthorized modifications
3. **Client-Side Validation**: Admin status checks are primarily client-side and can be manipulated
4. **No Audit Trail**: Admin privilege changes are not logged or tracked

This creates a significant security risk where malicious users could gain unauthorized admin access to the platform.

## Requirements

### Functional Requirements
- Only service-level operations should be able to grant/revoke admin privileges
- All admin privilege changes must be logged with audit trail
- Admin status verification must happen server-side for all sensitive operations
- Users should be able to update their profile without affecting admin status
- Clear separation between user-editable and admin-only profile fields

### Non-Functional Requirements
- **Security**: Zero-trust approach - assume all client requests are potentially malicious
- **Performance**: Admin checks should be efficient and cached where appropriate
- **Maintainability**: Clear separation of concerns between user and admin operations
- **Auditability**: Complete audit trail for all admin privilege changes

## Current Vulnerabilities

### 1. User Profile Update Policy
```sql
create policy "Users can update own profile"
on "public"."user_profiles"
for update
to public
using ((auth.uid() = id));
```
**Issue**: This policy allows users to update ANY field in their profile, including `is_admin`.

### 2. No Field-Level Protection
The `user_profiles` table has no column-level security to prevent modification of sensitive fields.

### 3. Client-Side Admin Determination
```typescript
// In AuthContext.tsx
const isAdmin = profile?.is_admin || jwtIsAdmin;
```
**Issue**: While this checks both database and JWT, the database value could be compromised.

## Proposed Security Architecture

### 1. Multi-Layer Security Model

```
┌─────────────────────────────────────────┐
│              Client Layer               │
│  (Admin UI - Display Only, No Trust)   │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│            Application Layer            │
│     (Server-Side Admin Verification)   │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│             Database Layer              │
│  (RLS Policies + Column Protection)    │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│               Auth Layer                │
│        (JWT app_metadata only)         │
└─────────────────────────────────────────┘
```

### 2. Database Security Enhancements

#### A. Split User Profile Policies
Create separate policies for user-editable vs admin-only fields:

```sql
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Allow users to update only safe fields
CREATE POLICY "Users can update safe profile fields" 
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Prevent modification of admin-only fields
  is_admin = OLD.is_admin AND
  id = OLD.id AND
  created_at = OLD.created_at
);

-- Only service role can manage admin status
CREATE POLICY "Service role manages admin status" 
ON user_profiles FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);
```

#### B. Admin Audit Trail
Create a dedicated table for tracking admin privilege changes:

```sql
CREATE TABLE admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  action text NOT NULL CHECK (action IN ('granted', 'revoked')),
  granted_by uuid REFERENCES user_profiles(id),
  reason text,
  created_at timestamptz DEFAULT now()
);
```

#### C. Secure Admin Management Functions
Create database functions that handle admin privilege changes with proper validation:

```sql
CREATE OR REPLACE FUNCTION grant_admin_privileges(
  target_user_id uuid,
  granting_admin_id uuid,
  reason text DEFAULT NULL
) RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Verify the granting user is actually an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = granting_admin_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only admins can grant admin privileges';
  END IF;
  
  -- Update user to admin
  UPDATE user_profiles 
  SET is_admin = true, updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the action
  INSERT INTO admin_audit_log (user_id, action, granted_by, reason)
  VALUES (target_user_id, 'granted', granting_admin_id, reason);
  
  RETURN true;
END;
$$;
```

### 3. Application Layer Security

#### A. Server-Side Admin Verification
Create a secure admin verification utility:

```typescript
// utils/adminSecurity.ts
export async function verifyAdminStatus(userId: string): Promise<boolean> {
  // Check JWT app_metadata first (most secure)
  const { data: { session } } = await supabase.auth.getSession();
  const jwtIsAdmin = session?.user?.app_metadata?.is_admin || false;
  
  if (jwtIsAdmin) return true;
  
  // Fallback to database check with service role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
    
  return profile?.is_admin || false;
}

export async function requireAdmin(userId: string): Promise<void> {
  const isAdmin = await verifyAdminStatus(userId);
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
}
```

#### B. Secure API Endpoints
All admin API endpoints must verify admin status server-side:

```typescript
// Example: api/admin/users/route.ts
export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Server-side admin verification
  await requireAdmin(session.user.id);
  
  // Proceed with admin operation...
}
```

### 4. Implementation Plan

#### Phase 1: Database Security (Critical)
1. Create admin audit log table
2. Update user_profiles RLS policies to prevent is_admin modification
3. Create secure admin management functions
4. Test with existing admin accounts

#### Phase 2: Application Security
1. Implement server-side admin verification utilities
2. Update all admin API endpoints with proper verification
3. Add admin audit logging to all privilege changes

#### Phase 3: Enhanced Security
1. Implement admin session timeouts
2. Add multi-factor authentication for admin operations
3. Create admin activity monitoring dashboard

## Migration Strategy

### Step 1: Backup and Assessment
```sql
-- Backup current admin users
CREATE TEMP TABLE admin_backup AS 
SELECT id, email, username, is_admin 
FROM user_profiles 
WHERE is_admin = true;
```

### Step 2: Apply Database Changes
Run new migration with enhanced RLS policies and audit table.

### Step 3: Verify Admin Access
Ensure all existing admins retain access after policy changes.

### Step 4: Update Application Code
Deploy server-side verification for all admin endpoints.

## Security Testing

### Test Cases
1. **Privilege Escalation**: Attempt to set `is_admin = true` via profile update
2. **API Bypass**: Try accessing admin endpoints without proper verification
3. **Token Manipulation**: Test with modified JWT tokens
4. **Database Direct Access**: Verify RLS policies block unauthorized access

### Expected Results
- All privilege escalation attempts should fail
- Admin endpoints should require server-side verification
- Audit log should capture all admin privilege changes
- Only service role should be able to modify admin status

## Monitoring and Alerting

### Key Metrics
- Failed admin access attempts
- Admin privilege changes
- Unusual admin activity patterns
- Database policy violations

### Alerts
- Immediate notification on any admin privilege changes
- Alert on repeated failed admin access attempts
- Monitor for database policy violations

## Conclusion

This comprehensive security enhancement will:
1. **Eliminate** the ability for users to self-promote to admin
2. **Provide** complete audit trail for admin operations  
3. **Ensure** server-side verification for all admin functions
4. **Maintain** usability for legitimate admin operations

The implementation follows security best practices with defense in depth, zero-trust principles, and comprehensive logging.
