-- Function to update article view count
CREATE OR REPLACE FUNCTION update_article_view_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment view count
    UPDATE articles 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = NEW.article_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update view counts
CREATE TRIGGER update_article_view_count_trigger
  AFTER INSERT ON article_views
  FOR EACH ROW
  EXECUTE FUNCTION update_article_view_count();

-- Function to check if view should be counted (deduplication)
CREATE OR REPLACE FUNCTION should_count_view(
  p_article_id text,
  p_ip_address inet,
  p_user_id uuid DEFAULT NULL,
  p_time_window interval DEFAULT '1 hour'
) RETURNS boolean AS $$
DECLARE
  existing_view_count integer;
BEGIN
  -- Check for existing view within time window
  SELECT COUNT(*) INTO existing_view_count
  FROM article_views
  WHERE article_id = p_article_id
    AND ip_address = p_ip_address
    AND viewed_at > NOW() - p_time_window;
  
  -- If user is authenticated, also check user-based deduplication
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO existing_view_count
    FROM article_views
    WHERE article_id = p_article_id
      AND user_id = p_user_id
      AND viewed_at > NOW() - INTERVAL '24 hours';
  END IF;
  
  -- Return true if no existing view found
  RETURN existing_view_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to sync all view counts (for manual runs)
CREATE OR REPLACE FUNCTION sync_all_view_counts()
RETURNS void AS $$
BEGIN
  UPDATE articles 
  SET view_count = (
    SELECT COUNT(*) 
    FROM article_views 
    WHERE article_views.article_id = articles.id
  );
END;
$$ LANGUAGE plpgsql; 