-- Enable real-time replication for bull_room_reactions table
ALTER PUBLICATION supabase_realtime ADD TABLE bull_room_reactions;

-- Add comment
COMMENT ON TABLE "public"."bull_room_reactions" IS 'Real-time enabled: reaction changes are broadcast to all clients';
