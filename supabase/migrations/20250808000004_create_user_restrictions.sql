-- Create user_restrictions table for bull room moderation
-- This table tracks user restrictions like muting, with audit trail and expiration support

CREATE TABLE "public"."user_restrictions" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    "restriction_type" text NOT NULL CHECK (restriction_type IN ('muted')),
    "restricted_by" uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    "reason" text,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

-- Add primary key constraint
ALTER TABLE "public"."user_restrictions" ADD CONSTRAINT "user_restrictions_pkey" PRIMARY KEY ("id");

-- Create indexes for performance
CREATE INDEX idx_user_restrictions_user_id ON user_restrictions(user_id);
CREATE INDEX idx_user_restrictions_type ON user_restrictions(restriction_type);
CREATE INDEX idx_user_restrictions_expires_at ON user_restrictions(expires_at);
CREATE INDEX idx_user_restrictions_created_at ON user_restrictions(created_at DESC);

-- Create unique constraint to prevent duplicate active restrictions of same type
-- Note: We'll handle this logic in application code since PostgreSQL requires immutable functions in index predicates
CREATE UNIQUE INDEX idx_user_restrictions_user_type 
ON user_restrictions(user_id, restriction_type, expires_at);

-- Enable RLS
ALTER TABLE user_restrictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow admins to manage all restrictions
CREATE POLICY "Admins can manage all user restrictions" ON user_restrictions
    FOR ALL USING (
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

-- Allow users to view their own restrictions (for transparency)
CREATE POLICY "Users can view their own restrictions" ON user_restrictions
    FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON "public"."user_restrictions" TO authenticated;
GRANT ALL ON "public"."user_restrictions" TO service_role;

-- Add helpful function to check if user has active restriction
CREATE OR REPLACE FUNCTION public.user_has_restriction(
    p_user_id uuid,
    p_restriction_type text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_restrictions
        WHERE user_id = p_user_id
        AND restriction_type = p_restriction_type
        AND (expires_at IS NULL OR expires_at > now())
    );
END;
$$;

-- Add comment
COMMENT ON TABLE "public"."user_restrictions" IS 'Tracks user restrictions for moderation (muting, etc.) with admin audit trail and expiration support';
