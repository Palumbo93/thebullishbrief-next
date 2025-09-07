-- Add featured_color field to articles table
-- This field will store hex color values for article featured color gradients

ALTER TABLE "public"."articles" 
ADD COLUMN "featured_color" text;

COMMENT ON COLUMN "public"."articles"."featured_color" IS 'Hex color value for article featured color gradient background';
