-- Remove like_count column from articles table
ALTER TABLE articles DROP COLUMN IF EXISTS like_count; 