-- Remove Bull Room system completely from the database
-- This migration drops all bull room related tables and functionality

-- Drop tables in dependency order (foreign keys first)
DROP TABLE IF EXISTS "public"."bull_room_reactions" CASCADE;
DROP TABLE IF EXISTS "public"."bull_room_messages" CASCADE;
DROP TABLE IF EXISTS "public"."bull_rooms" CASCADE;

-- Remove any functions, triggers, or procedures related to bull rooms
-- These will be automatically cleaned up with CASCADE, but explicitly listed for clarity

-- Add comment for documentation
COMMENT ON SCHEMA "public" IS 'Public schema - Bull Room system completely removed';
