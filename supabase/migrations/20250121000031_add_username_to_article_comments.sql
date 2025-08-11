-- Add username column to article_comments table
-- This allows unauthenticated users to see usernames without RLS issues

ALTER TABLE public.article_comments
ADD COLUMN username text;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_article_comments_username 
ON public.article_comments (username);

-- Add comment explaining the column
COMMENT ON COLUMN public.article_comments.username IS 'Username of the comment author, stored directly to avoid RLS issues for unauthenticated users';

-- Update existing comments to populate username from user_profiles
UPDATE public.article_comments 
SET username = (
  SELECT up.username 
  FROM public.user_profiles up 
  WHERE up.id = article_comments.user_id
)
WHERE username IS NULL;

-- Make username required for future comments
ALTER TABLE public.article_comments
ALTER COLUMN username SET NOT NULL;
