-- Add video_thumbnail_url column to briefs table
ALTER TABLE public.briefs 
ADD COLUMN video_thumbnail_url text;

-- Add comment for the new column
COMMENT ON COLUMN public.briefs.video_thumbnail_url IS 'URL to a short video clip used as thumbnail/preview in FeaturedBriefCard';
