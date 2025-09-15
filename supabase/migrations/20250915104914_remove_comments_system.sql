-- Remove comments system completely from the database
-- This migration drops all comment-related tables and functionality

-- Drop comment_reactions table first (has foreign key to article_comments)
DROP TABLE IF EXISTS "public"."comment_reactions" CASCADE;

-- Drop article_comments table
DROP TABLE IF EXISTS "public"."article_comments" CASCADE;

-- Remove comment_count column from articles table as it's no longer needed
ALTER TABLE "public"."articles" 
DROP COLUMN IF EXISTS "comment_count";

-- Add comment for documentation
COMMENT ON TABLE "public"."articles" IS 'Articles table - comments system completely removed';
