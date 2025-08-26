-- Add feature_featured_video column to briefs table
-- When true, featured video replaces the featured image in the header
-- When false, featured video appears in the action panel

ALTER TABLE public.briefs 
ADD COLUMN feature_featured_video BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.briefs.feature_featured_video IS 'When true, featured video replaces featured image in header. When false, video appears in action panel.';
