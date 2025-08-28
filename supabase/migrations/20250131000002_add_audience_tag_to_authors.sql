-- Add audience_tag field to authors table for Mailchimp audience management

ALTER TABLE "public"."authors" 
ADD COLUMN "audience_tag" text;

-- Add comment to document the purpose
COMMENT ON COLUMN "public"."authors"."audience_tag" IS 'Optional Mailchimp audience tag for author-specific email signups and updates.';
