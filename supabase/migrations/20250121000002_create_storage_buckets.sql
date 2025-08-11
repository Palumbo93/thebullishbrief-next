-- Create storage buckets for article images, author avatars, and featured images
-- This migration sets up the storage buckets with proper security policies

-- Create article-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create author-avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'author-avatars',
  'author-avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create featured-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'featured-images',
  'featured-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create RLS policies for article-images bucket
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads to article-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to article images
CREATE POLICY "Allow public read access to article-images" ON storage.objects
FOR SELECT USING (bucket_id = 'article-images');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated updates to article-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated deletes to article-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);

-- Create RLS policies for author-avatars bucket
-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated uploads to author-avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'author-avatars' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to author avatars
CREATE POLICY "Allow public read access to author-avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'author-avatars');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated updates to author-avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'author-avatars' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated deletes to author-avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'author-avatars' 
  AND auth.role() = 'authenticated'
);

-- Create RLS policies for featured-images bucket
-- Allow authenticated users to upload featured images
CREATE POLICY "Allow authenticated uploads to featured-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'featured-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to featured images
CREATE POLICY "Allow public read access to featured-images" ON storage.objects
FOR SELECT USING (bucket_id = 'featured-images');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated updates to featured-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'featured-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated deletes to featured-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'featured-images' 
  AND auth.role() = 'authenticated'
); 