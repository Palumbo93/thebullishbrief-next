-- Function to update article bookmark counts
CREATE OR REPLACE FUNCTION update_article_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment bookmark count
    UPDATE articles 
    SET bookmark_count = COALESCE(bookmark_count, 0) + 1
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement bookmark count
    UPDATE articles 
    SET bookmark_count = GREATEST(COALESCE(bookmark_count, 0) - 1, 0)
    WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update bookmark counts
CREATE TRIGGER update_bookmark_count_trigger
  AFTER INSERT OR DELETE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_article_bookmark_count();

-- Function to sync all bookmark counts (for manual runs)
CREATE OR REPLACE FUNCTION sync_all_bookmark_counts()
RETURNS void AS $$
BEGIN
  UPDATE articles 
  SET bookmark_count = (
    SELECT COUNT(*) 
    FROM bookmarks 
    WHERE bookmarks.article_id = articles.id
  );
END;
$$ LANGUAGE plpgsql; 