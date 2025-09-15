-- Remove featured_color columns from articles and briefs tables
-- This migration removes the featured color styling system completely

-- Drop featured_color column from articles table
ALTER TABLE "public"."articles" 
DROP COLUMN IF EXISTS "featured_color";

-- Drop featured_color column from briefs table  
ALTER TABLE "public"."briefs"
DROP COLUMN IF EXISTS "featured_color";

-- Add comment for documentation
COMMENT ON TABLE "public"."articles" IS 'Articles table - featured color styling system removed';
COMMENT ON TABLE "public"."briefs" IS 'Briefs table - featured color styling system removed';
