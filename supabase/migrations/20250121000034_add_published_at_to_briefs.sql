-- Add published_at field to briefs table
ALTER TABLE briefs ADD COLUMN published_at timestamptz;

-- Create index for published_at (similar to articles)
CREATE INDEX idx_briefs_published_at ON briefs USING btree (published_at DESC);

-- Update existing published briefs to have published_at set to created_at
UPDATE briefs 
SET published_at = created_at 
WHERE status = 'published' AND published_at IS NULL;
