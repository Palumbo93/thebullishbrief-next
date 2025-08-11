-- Function to update article comment counts
CREATE OR REPLACE FUNCTION update_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment comment count
    UPDATE articles 
    SET comment_count = COALESCE(comment_count, 0) + 1
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement comment count
    UPDATE articles 
    SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
    WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update comment counts
CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE ON article_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_article_comment_count();

-- Function to sync all comment counts (for manual runs)
CREATE OR REPLACE FUNCTION sync_all_comment_counts()
RETURNS void AS $$
BEGIN
  UPDATE articles 
  SET comment_count = (
    SELECT COUNT(*) 
    FROM article_comments 
    WHERE article_comments.article_id = articles.id
  );
END;
$$ LANGUAGE plpgsql; 