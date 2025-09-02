-- Remove unused fields from briefs table
-- These fields are no longer needed:
-- - video_thumbnail_url: Card preview video functionality removed
-- - widget_code: Widget functionality removed
-- - investor_deck_url: Investor deck functionality removed

ALTER TABLE public.briefs 
DROP COLUMN IF EXISTS video_thumbnail_url,
DROP COLUMN IF EXISTS widget_code,
DROP COLUMN IF EXISTS investor_deck_url;

-- Add new additional_copy field for flexible content storage
ALTER TABLE public.briefs 
ADD COLUMN additional_copy JSONB;

-- Add comment for the new column
COMMENT ON COLUMN public.briefs.additional_copy IS 'JSON object for storing additional copy/content that can be used flexibly throughout the brief';
