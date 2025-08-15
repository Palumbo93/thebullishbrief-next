-- Force add bull_room_reactions table to real-time publication
-- This ensures INSERT events are broadcast to all clients

-- Remove the table from publication if it exists (to avoid errors)
ALTER PUBLICATION supabase_realtime DROP TABLE bull_room_reactions;

-- Add the table to the real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE bull_room_reactions;

-- Verify the table is in the publication
-- This will show all tables in the real-time publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'bull_room_reactions';

-- Add comment
COMMENT ON TABLE "public"."bull_room_reactions" IS 'Real-time publication verified: table is now included in supabase_realtime publication';
