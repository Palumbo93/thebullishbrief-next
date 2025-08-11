-- Add comment_count column to articles table
ALTER TABLE articles ADD COLUMN comment_count INTEGER DEFAULT 0;

-- Create function to update comment count
CREATE OR REPLACE FUNCTION update_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles 
    SET comment_count = GREATEST(comment_count - 1, 0) 
    WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update comment count
CREATE TRIGGER update_article_comment_count_trigger
  AFTER INSERT OR DELETE ON article_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_article_comment_count();

-- Update existing articles with their current comment counts
UPDATE articles 
SET comment_count = (
  SELECT COUNT(*) 
  FROM article_comments 
  WHERE article_comments.article_id = articles.id
); 