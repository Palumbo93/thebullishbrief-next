-- This migration adds REPLICA IDENTITY FULL to ensure DELETE events work properly
-- for bull_room_reactions table

-- Add REPLICA IDENTITY FULL to bull_room_reactions table
-- This ensures that DELETE events include all columns in the payload
ALTER TABLE bull_room_reactions REPLICA IDENTITY FULL;

-- Add comment
COMMENT ON TABLE "public"."bull_room_reactions" IS 'REPLICA IDENTITY FULL: DELETE events now include all columns for proper real-time filtering';
