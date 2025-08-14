-- Fix bull_room_message_count trigger to handle missing bull_rooms table
-- This migration makes the trigger more robust to prevent user deletion errors

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS update_bull_room_message_count_trigger ON bull_room_messages;
DROP FUNCTION IF EXISTS update_bull_room_message_count();

-- Create a more robust function that handles missing bull_rooms gracefully
CREATE OR REPLACE FUNCTION update_bull_room_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Only update if the bull_room exists
        UPDATE bull_rooms 
        SET message_count = message_count + 1,
            last_activity_at = NEW.created_at
        WHERE id = NEW.room_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Only update if the bull_room exists
        UPDATE bull_rooms 
        SET message_count = GREATEST(message_count - 1, 0)
        WHERE id = OLD.room_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
EXCEPTION
    -- Handle any errors gracefully (like missing bull_rooms table)
    WHEN OTHERS THEN
        -- Log the error but don't fail the operation
        RAISE WARNING 'Error updating bull_room message count: %', SQLERRM;
        IF TG_OP = 'INSERT' THEN
            RETURN NEW;
        ELSE
            RETURN OLD;
        END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_bull_room_message_count_trigger
    AFTER INSERT OR DELETE ON bull_room_messages
    FOR EACH ROW EXECUTE FUNCTION update_bull_room_message_count();
