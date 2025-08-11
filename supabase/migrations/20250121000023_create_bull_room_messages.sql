-- Create bull_room_messages table
CREATE TABLE "public"."bull_room_messages" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "room_id" uuid NOT NULL REFERENCES bull_rooms(id) ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    "content" text NOT NULL,
    "message_type" text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    "file_data" jsonb,
    "reply_to_id" uuid,
    "reactions" jsonb DEFAULT '{}',
    "is_edited" boolean DEFAULT false,
    "edited_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_bull_room_messages_room_id ON bull_room_messages(room_id);
CREATE INDEX idx_bull_room_messages_user_id ON bull_room_messages(user_id);
CREATE INDEX idx_bull_room_messages_created_at ON bull_room_messages(created_at DESC);
CREATE INDEX idx_bull_room_messages_reply_to_id ON bull_room_messages(reply_to_id);

-- Enable RLS
ALTER TABLE bull_room_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to read messages in active rooms
CREATE POLICY "Users can read messages in active rooms" ON bull_room_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bull_rooms 
            WHERE id = room_id AND is_active = true
        )
    );

-- Allow authenticated users to create messages in active rooms
CREATE POLICY "Users can create messages in active rooms" ON bull_room_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM bull_rooms 
            WHERE id = room_id AND is_active = true
        )
    );

-- Allow users to update their own messages
CREATE POLICY "Users can update their own messages" ON bull_room_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own messages" ON bull_room_messages
    FOR DELETE USING (auth.uid() = user_id);

-- Create primary key constraint
ALTER TABLE "public"."bull_room_messages" ADD CONSTRAINT "bull_room_messages_pkey" PRIMARY KEY ("id");

-- Add self-referencing foreign key after primary key is created
ALTER TABLE "public"."bull_room_messages" ADD CONSTRAINT "bull_room_messages_reply_to_id_fkey" 
    FOREIGN KEY ("reply_to_id") REFERENCES bull_room_messages(id) ON DELETE SET NULL;

-- Add updated_at trigger
CREATE TRIGGER update_bull_room_messages_updated_at 
    BEFORE UPDATE ON public.bull_room_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update bull_rooms table to track message count
ALTER TABLE bull_rooms ADD COLUMN IF NOT EXISTS message_count integer DEFAULT 0;

-- Create function to update message count
CREATE OR REPLACE FUNCTION update_bull_room_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE bull_rooms 
        SET message_count = message_count + 1,
            last_activity_at = NEW.created_at
        WHERE id = NEW.room_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE bull_rooms 
        SET message_count = GREATEST(message_count - 1, 0)
        WHERE id = OLD.room_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update message count
CREATE TRIGGER update_bull_room_message_count_trigger
    AFTER INSERT OR DELETE ON bull_room_messages
    FOR EACH ROW EXECUTE FUNCTION update_bull_room_message_count(); 