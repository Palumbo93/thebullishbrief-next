-- Add room_id column to bull_room_reactions table for better filtering
ALTER TABLE "public"."bull_room_reactions" 
ADD COLUMN "room_id" uuid REFERENCES bull_rooms(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX "idx_bull_room_reactions_room_id" ON "public"."bull_room_reactions" ("room_id");

-- Update existing reactions to have the correct room_id based on their message
UPDATE "public"."bull_room_reactions" 
SET room_id = (
  SELECT room_id 
  FROM bull_room_messages 
  WHERE bull_room_messages.id = bull_room_reactions.message_id
);

-- Make room_id NOT NULL after populating existing data
ALTER TABLE "public"."bull_room_reactions" 
ALTER COLUMN "room_id" SET NOT NULL;

-- Add comment
COMMENT ON COLUMN "public"."bull_room_reactions"."room_id" IS 'Room ID for direct filtering of reactions by room';
