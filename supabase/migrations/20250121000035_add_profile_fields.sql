-- Add bio, profile_image, and twitter_handle fields to user_profiles table
-- This migration enhances user profiles with personalization features

-- Add new columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN bio TEXT,
ADD COLUMN profile_image TEXT,
ADD COLUMN twitter_handle TEXT;

-- Add constraints for data validation
ALTER TABLE user_profiles 
ADD CONSTRAINT twitter_handle_format 
CHECK (twitter_handle IS NULL OR twitter_handle ~ '^@[a-zA-Z0-9_]{1,15}$');

ALTER TABLE user_profiles 
ADD CONSTRAINT bio_length 
CHECK (bio IS NULL OR length(bio) <= 500);

-- Create profile-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create RLS policies for profile-images bucket
-- Allow users to upload their own profile images
CREATE POLICY "Allow users to upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to profile images
CREATE POLICY "Allow public read access to profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Allow users to update their own profile images
CREATE POLICY "Allow users to update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile images
CREATE POLICY "Allow users to delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
