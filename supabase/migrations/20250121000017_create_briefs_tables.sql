-- Create briefs table
CREATE TABLE briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  subtitle text,
  content text NOT NULL,
  sponsored boolean DEFAULT false,
  disclaimer text,
  featured_image_url text,
  featured_image_alt text,
  reading_time_minutes integer DEFAULT 5,
  status text DEFAULT 'draft',
  view_count integer DEFAULT 0,
  video_url text,
  show_cta boolean DEFAULT false,
  tickers jsonb,
  widget_code text,
  investor_deck_url text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create brief_views table (1:1 replication of article_views)
CREATE TABLE brief_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id uuid REFERENCES briefs(id) ON DELETE CASCADE,
  user_id uuid,
  ip_address inet,
  user_agent text,
  referrer text,
  viewed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_views ENABLE ROW LEVEL SECURITY;

-- Create indexes for brief_views (identical to article_views)
CREATE INDEX idx_brief_views_brief_id ON brief_views USING btree (brief_id);
CREATE INDEX idx_brief_views_viewed_at ON brief_views USING btree (viewed_at DESC);

-- Function to update brief view count (identical to article version)
CREATE OR REPLACE FUNCTION update_brief_view_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE briefs 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = NEW.brief_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update view counts
CREATE TRIGGER update_brief_view_count_trigger
  AFTER INSERT ON brief_views
  FOR EACH ROW
  EXECUTE FUNCTION update_brief_view_count();

-- Function to check if brief view should be counted (deduplication)
CREATE OR REPLACE FUNCTION should_count_brief_view(
  p_brief_id text,
  p_ip_address text,
  p_user_id text DEFAULT NULL,
  p_time_window interval DEFAULT '1 hour'
) RETURNS boolean AS $$
DECLARE
  existing_view_count integer;
BEGIN
  -- Check for existing view within time window for anonymous users
  SELECT COUNT(*) INTO existing_view_count
  FROM brief_views
  WHERE brief_id = p_brief_id
    AND ip_address = p_ip_address::inet
    AND viewed_at > NOW() - p_time_window;
  
  -- If user is authenticated, also check user-based deduplication
  IF p_user_id IS NOT NULL AND p_user_id != '' THEN
    SELECT COUNT(*) INTO existing_view_count
    FROM brief_views
    WHERE brief_id = p_brief_id
      AND user_id = p_user_id::uuid
      AND viewed_at > NOW() - INTERVAL '24 hours';
  END IF;
  
  -- Return true if no existing view found
  RETURN existing_view_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to sync all brief view counts (for manual runs)
CREATE OR REPLACE FUNCTION sync_all_brief_view_counts()
RETURNS void AS $$
BEGIN
  UPDATE briefs 
  SET view_count = (
    SELECT COUNT(*) 
    FROM brief_views 
    WHERE brief_views.brief_id = briefs.id
  );
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for briefs
CREATE POLICY "Published briefs are viewable by everyone"
  ON briefs
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Briefs are manageable by content managers"
  ON briefs
  FOR ALL
  TO authenticated
  USING (user_has_permission(auth.uid(), 'briefs', 'read') OR 
         user_has_permission(auth.uid(), 'briefs', 'update') OR 
         user_has_permission(auth.uid(), 'briefs', 'delete'))
  WITH CHECK (user_has_permission(auth.uid(), 'briefs', 'create') OR 
              user_has_permission(auth.uid(), 'briefs', 'update'));

-- RLS Policies for brief_views (identical to article_views)
CREATE POLICY "Anyone can create brief views"
  ON brief_views
  AS permissive
  FOR insert
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own brief views"
  ON brief_views
  AS permissive
  FOR select
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON briefs TO authenticated;
GRANT ALL ON brief_views TO authenticated;
GRANT SELECT ON briefs TO anon;
GRANT INSERT ON brief_views TO anon; 