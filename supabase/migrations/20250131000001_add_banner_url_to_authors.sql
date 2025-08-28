-- Add banner_url field to authors table for 1500x500 banner images

ALTER TABLE "public"."authors" 
ADD COLUMN "banner_url" text;

-- Add comment to document the expected dimensions
COMMENT ON COLUMN "public"."authors"."banner_url" IS 'Optional banner image URL for author page header. Recommended dimensions: 1500x500 pixels.';
