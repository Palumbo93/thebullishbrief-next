-- Create author-banners storage bucket for author banner images
-- This bucket will store banner images for author profiles

-- Create the author-banners bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'author-banners',
  'author-banners',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Enable RLS on the bucket
CREATE POLICY "Author banners are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'author-banners');

-- Allow authenticated users to upload author banners
CREATE POLICY "Authenticated users can upload author banners" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'author-banners' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update author banners
CREATE POLICY "Authenticated users can update author banners" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'author-banners' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete author banners
CREATE POLICY "Authenticated users can delete author banners" ON storage.objects
FOR DELETE USING (
  bucket_id = 'author-banners' 
  AND auth.role() = 'authenticated'
);
