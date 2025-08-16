-- Enable real-time broadcasts for user restrictions
-- This allows immediate notification when users are muted/unmuted

-- Enable realtime for user_restrictions table
ALTER PUBLICATION supabase_realtime ADD TABLE user_restrictions;

-- Create broadcast trigger function for user restrictions
CREATE OR REPLACE FUNCTION broadcast_user_restriction_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Broadcast when a restriction is added
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_notify(
      'user_restriction_change',
      json_build_object(
        'type', 'INSERT',
        'table', 'user_restrictions',
        'record', row_to_json(NEW),
        'user_id', NEW.user_id,
        'restriction_type', NEW.restriction_type,
        'restricted_by', NEW.restricted_by
      )::text
    );
    RETURN NEW;
  END IF;

  -- Broadcast when a restriction is removed
  IF TG_OP = 'DELETE' THEN
    PERFORM pg_notify(
      'user_restriction_change',
      json_build_object(
        'type', 'DELETE',
        'table', 'user_restrictions',
        'old_record', row_to_json(OLD),
        'user_id', OLD.user_id,
        'restriction_type', OLD.restriction_type
      )::text
    );
    RETURN OLD;
  END IF;

  -- Broadcast when a restriction is updated (e.g., expiration changed)
  IF TG_OP = 'UPDATE' THEN
    PERFORM pg_notify(
      'user_restriction_change',
      json_build_object(
        'type', 'UPDATE',
        'table', 'user_restrictions',
        'old_record', row_to_json(OLD),
        'record', row_to_json(NEW),
        'user_id', NEW.user_id,
        'restriction_type', NEW.restriction_type
      )::text
    );
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user restriction changes
CREATE TRIGGER user_restrictions_broadcast_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_restrictions
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_user_restriction_change();

-- Add comment
COMMENT ON TRIGGER user_restrictions_broadcast_trigger ON user_restrictions IS 'Broadcasts real-time changes to user restrictions for immediate UI updates';
