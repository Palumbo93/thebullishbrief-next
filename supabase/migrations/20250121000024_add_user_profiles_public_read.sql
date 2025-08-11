-- Add policy to allow authenticated users to read basic user profile information
-- This enables chat functionality where users can see usernames but not sensitive data

CREATE POLICY "Authenticated users can read basic profile info" 
ON "public"."user_profiles"
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (true);

-- Add comment explaining the policy
COMMENT ON POLICY "Authenticated users can read basic profile info" ON "public"."user_profiles" IS 
'Allows authenticated users to read basic profile information (id, username, created_at, updated_at) for chat functionality while protecting sensitive data like email.';
