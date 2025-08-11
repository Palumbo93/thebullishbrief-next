-- Remove reading_time_seconds column from article_views table
-- This column was intended for reading time tracking but was never implemented
-- and has been removed from the application code

ALTER TABLE "public"."article_views" DROP COLUMN IF EXISTS "reading_time_seconds"; 