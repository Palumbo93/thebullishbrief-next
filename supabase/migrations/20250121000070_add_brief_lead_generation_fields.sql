-- Add lead generation fields to briefs table for Mailchimp integration and popup configuration
ALTER TABLE briefs 
ADD COLUMN mailchimp_audience_tag text,
ADD COLUMN popup_copy jsonb;

-- Add brief tracking fields to emails table
ALTER TABLE emails 
ADD COLUMN brief_id uuid REFERENCES briefs(id) ON DELETE SET NULL,
ADD COLUMN source text DEFAULT 'popup',
ADD COLUMN mailchimp_status text DEFAULT 'pending',
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for performance and analytics
CREATE INDEX idx_emails_brief_id ON emails (brief_id);
CREATE INDEX idx_emails_source ON emails (source);
CREATE INDEX idx_emails_mailchimp_status ON emails (mailchimp_status);
CREATE INDEX idx_emails_user_id ON emails (user_id);
CREATE INDEX idx_briefs_mailchimp_campaign ON briefs (mailchimp_campaign_id);

-- Add comments for documentation
COMMENT ON COLUMN briefs.mailchimp_campaign_id IS 'Mailchimp campaign/audience ID for this brief';
COMMENT ON COLUMN briefs.mailchimp_audience_tag IS 'Tag to apply to subscribers for segmentation';
COMMENT ON COLUMN briefs.popup_copy IS 'JSON object containing popup copy configuration';
COMMENT ON COLUMN emails.brief_id IS 'Links email to the specific brief that generated it';
COMMENT ON COLUMN emails.source IS 'Source of email collection (popup, widget, newsletter, manual)';
COMMENT ON COLUMN emails.mailchimp_status IS 'Mailchimp sync status (pending, synced, failed)';
COMMENT ON COLUMN emails.user_id IS 'Links to authenticated user for tracking';

-- Create function to sync email to Mailchimp (placeholder for application layer)
CREATE OR REPLACE FUNCTION sync_email_to_mailchimp(
  email_id uuid
) RETURNS jsonb AS $$
DECLARE
  email_record record;
  audience_tag text;
  brief_title text;
  company_name text;
BEGIN
  -- Get email info
  SELECT * INTO email_record
  FROM emails 
  WHERE id = email_id;
  
  -- Validate email exists
  IF email_record IS NULL THEN
    RETURN '{"success": false, "error": "Email not found"}'::jsonb;
  END IF;
  
  -- Get brief info if brief_id exists
  IF email_record.brief_id IS NOT NULL THEN
    SELECT b.mailchimp_audience_tag, b.title, b.company_name
    INTO audience_tag, brief_title, company_name
    FROM briefs b
    WHERE b.id = email_record.brief_id;
  END IF;
  
  -- Update sync status (actual Mailchimp sync handled by application layer)
  UPDATE emails 
  SET mailchimp_status = 'pending'
  WHERE id = email_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'email_id', email_id,
    'email', email_record.email,
    'brief_id', email_record.brief_id,
    'audience_tag', audience_tag,
    'mailchimp_url', 'https://bullishbrief.us14.list-manage.com/subscribe/post?u=a69d5b5fa1c66fd8c078d560f&id=9cd1fb4392&f_id=0072a9e0f0'
  );
END;
$$ LANGUAGE plpgsql;
