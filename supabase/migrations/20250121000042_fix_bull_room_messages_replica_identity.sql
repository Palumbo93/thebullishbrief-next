-- Fix real-time DELETE events for bull_room_messages
-- This migration adds REPLICA IDENTITY FULL to ensure DELETE events work properly

-- Add REPLICA IDENTITY FULL to bull_room_messages table
-- This ensures that DELETE events include the old row data in payload.old
ALTER TABLE bull_room_messages REPLICA IDENTITY FULL;

-- Verify the change
-- You can check this with: SELECT relname, relreplident FROM pg_class WHERE relname = 'bull_room_messages';
