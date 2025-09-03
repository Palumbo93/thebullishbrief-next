-- Add show_featured_media column to briefs table
-- Controls whether FeaturedMedia component (video/image) displays on Brief Page
-- Default true maintains backward compatibility with existing briefs

ALTER TABLE public.briefs 
ADD COLUMN show_featured_media BOOLEAN NOT NULL DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.briefs.show_featured_media IS 'Controls whether featured media (video/image) displays on the brief page. When false, FeaturedMedia component is hidden completely.';
