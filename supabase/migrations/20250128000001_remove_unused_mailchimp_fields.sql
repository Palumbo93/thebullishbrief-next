-- Remove unused Mailchimp fields from database schema
-- This removes fields that are no longer needed since we handle Mailchimp submission directly in components

-- Remove mailchimp_status column from emails table
ALTER TABLE public.emails DROP COLUMN IF EXISTS mailchimp_status;

-- Remove mailchimp_campaign_id column from briefs table  
ALTER TABLE public.briefs DROP COLUMN IF EXISTS mailchimp_campaign_id;

-- Drop related indexes if they exist
DROP INDEX IF EXISTS idx_emails_mailchimp_status;
DROP INDEX IF EXISTS idx_briefs_mailchimp_campaign;

-- Add comment explaining the cleanup
COMMENT ON TABLE public.emails IS 'Tracks all email addresses entered in the system for analytics and debugging purposes. Mailchimp integration now handled client-side.';
