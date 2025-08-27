-- Add popup_featured_image field to briefs table
-- This allows for dedicated popup images separate from the main featured image

ALTER TABLE briefs 
ADD COLUMN popup_featured_image TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN briefs.popup_featured_image IS 'URL for the image displayed in the lead generation popup. Falls back to featured_image_url if not set.';
