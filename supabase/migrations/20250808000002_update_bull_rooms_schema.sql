-- Add rules field and remove banner_photo_url from bull_rooms table
-- Migration: 20250808000002_update_bull_rooms_schema.sql

-- Add rules field as JSONB
ALTER TABLE bull_rooms 
ADD COLUMN rules JSONB DEFAULT '[]'::jsonb;

-- Remove banner_photo_url field
ALTER TABLE bull_rooms 
DROP COLUMN IF EXISTS banner_photo_url;

-- Add comment to explain the rules field
COMMENT ON COLUMN bull_rooms.rules IS 'JSON array of room rules and guidelines';
