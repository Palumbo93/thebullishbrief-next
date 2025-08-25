-- Add featured_video_thumbnail column to briefs table
ALTER TABLE public.briefs 
ADD COLUMN featured_video_thumbnail text;

-- Add comment for the new column
COMMENT ON COLUMN public.briefs.featured_video_thumbnail IS 'URL to the video thumbnail image for use as poster attribute';
