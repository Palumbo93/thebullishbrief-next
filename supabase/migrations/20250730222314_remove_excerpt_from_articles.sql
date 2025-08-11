-- Remove excerpt field from articles table
ALTER TABLE articles DROP COLUMN IF EXISTS excerpt;
