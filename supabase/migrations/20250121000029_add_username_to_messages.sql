-- Add username column to bull_room_messages for faster display
ALTER TABLE "public"."bull_room_messages" 
ADD COLUMN "username" text;

-- Update existing messages with usernames
UPDATE "public"."bull_room_messages" 
SET username = (
  SELECT username 
  FROM user_profiles 
  WHERE user_profiles.id = bull_room_messages.user_id
);

-- Make username required for new messages
ALTER TABLE "public"."bull_room_messages" 
ALTER COLUMN "username" SET NOT NULL;
