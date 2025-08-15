-- Fix real-time reactions by ensuring the SELECT policy allows all authenticated users to see all reactions
-- This is needed because real-time events are filtered by RLS policies

-- Drop the existing SELECT policy if it exists
DROP POLICY IF EXISTS "Users can view reactions" ON "public"."bull_room_reactions";

-- Recreate the SELECT policy to ensure it allows all authenticated users to see all reactions
CREATE POLICY "Users can view reactions" ON "public"."bull_room_reactions"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- Add comment
COMMENT ON TABLE "public"."bull_room_reactions" IS 'Real-time fixed: all authenticated users can see all reactions for real-time updates';
