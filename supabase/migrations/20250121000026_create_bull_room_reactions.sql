-- Create bull_room_reactions table for better reaction management
CREATE TABLE "public"."bull_room_reactions" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "message_id" uuid NOT NULL REFERENCES bull_room_messages(id) ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    "emoji" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Add unique constraint to prevent duplicate reactions from same user
ALTER TABLE "public"."bull_room_reactions" 
ADD CONSTRAINT "bull_room_reactions_message_user_emoji_unique" 
UNIQUE ("message_id", "user_id", "emoji");

-- Create indexes for performance
CREATE INDEX "idx_bull_room_reactions_message_id" ON "public"."bull_room_reactions" ("message_id");
CREATE INDEX "idx_bull_room_reactions_user_id" ON "public"."bull_room_reactions" ("user_id");
CREATE INDEX "idx_bull_room_reactions_emoji" ON "public"."bull_room_reactions" ("emoji");

-- Enable RLS
ALTER TABLE "public"."bull_room_reactions" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view reactions" ON "public"."bull_room_reactions"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own reactions" ON "public"."bull_room_reactions"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON "public"."bull_room_reactions"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE "public"."bull_room_reactions" IS 'Stores individual emoji reactions on bull room messages for better scalability';
