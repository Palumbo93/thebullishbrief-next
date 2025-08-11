-- Drop all existing comment count triggers to prevent duplicates
DROP TRIGGER IF EXISTS update_article_comment_count_trigger ON article_comments;
DROP TRIGGER IF EXISTS update_comment_count_trigger ON article_comments;
DROP FUNCTION IF EXISTS update_article_comment_count();

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION update_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    UPDATE articles 
    SET comment_count = COALESCE(comment_count, 0) + 1 
    WHERE id = NEW.article_id;
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE articles 
    SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0) 
    WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create only ONE trigger
CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE ON article_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_article_comment_count();

-- Sync all comment counts to ensure accuracy
UPDATE articles 
SET comment_count = (
  SELECT COUNT(*) 
  FROM article_comments 
  WHERE article_comments.article_id = articles.id
); 