-- Add featured_color column to briefs table
-- Stores hex color codes for visual theming and categorization

ALTER TABLE public.briefs 
ADD COLUMN featured_color TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.briefs.featured_color IS 'Hex color code for brief theming and visual differentiation (e.g., #FF5733). Optional field for UI customization.';
