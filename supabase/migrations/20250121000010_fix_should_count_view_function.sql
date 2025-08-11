-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS should_count_view(text, inet, uuid, interval);
DROP FUNCTION IF EXISTS should_count_view(text, text, text, interval);

-- Create the fixed function with proper type handling
CREATE OR REPLACE FUNCTION should_count_view(
  p_article_id text,
  p_ip_address text,
  p_user_id text DEFAULT NULL,
  p_time_window interval DEFAULT '1 hour'
) RETURNS boolean AS $$
DECLARE
  existing_view_count integer;
BEGIN
  -- Check for existing view within time window for anonymous users
  SELECT COUNT(*) INTO existing_view_count
  FROM article_views
  WHERE article_id = p_article_id
    AND ip_address = p_ip_address::inet
    AND viewed_at > NOW() - p_time_window;
  
  -- If user is authenticated, also check user-based deduplication
  IF p_user_id IS NOT NULL AND p_user_id != '' THEN
    SELECT COUNT(*) INTO existing_view_count
    FROM article_views
    WHERE article_id = p_article_id
      AND user_id = p_user_id::uuid
      AND viewed_at > NOW() - INTERVAL '24 hours';
  END IF;
  
  -- Return true if no existing view found
  RETURN existing_view_count = 0;
END;
$$ LANGUAGE plpgsql; 