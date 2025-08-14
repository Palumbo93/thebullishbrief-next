-- Fix user account deletion by adding missing foreign key constraints
-- This migration addresses the "Database error deleting user" issue

-- First, handle existing orphaned data before adding constraints

-- Set orphaned article views to NULL (preserve analytics data)
UPDATE article_views 
SET user_id = NULL 
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM user_profiles);

-- Set orphaned brief views to NULL (preserve analytics data)  
UPDATE brief_views 
SET user_id = NULL 
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM user_profiles);

-- Delete orphaned bookmarks (user-specific data that should be removed)
DELETE FROM bookmarks 
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM user_profiles);

-- Add foreign key constraints

-- Bookmarks table: CASCADE delete user-specific data
ALTER TABLE bookmarks 
ADD CONSTRAINT bookmarks_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Article views table: SET NULL to preserve analytics data
ALTER TABLE article_views
ADD CONSTRAINT article_views_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Brief views table: SET NULL to preserve analytics data
ALTER TABLE brief_views
ADD CONSTRAINT brief_views_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Add comments explaining the constraints
COMMENT ON CONSTRAINT bookmarks_user_id_fkey ON bookmarks IS 'Cascade delete user bookmarks when user is deleted';
COMMENT ON CONSTRAINT article_views_user_id_fkey ON article_views IS 'Set user_id to NULL to preserve analytics data when user is deleted';
COMMENT ON CONSTRAINT brief_views_user_id_fkey ON brief_views IS 'Set user_id to NULL to preserve analytics data when user is deleted';
