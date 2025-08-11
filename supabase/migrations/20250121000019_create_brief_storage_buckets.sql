-- Create storage buckets for brief images and company logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('brief-images', 'brief-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('company-logos', 'company-logos', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for brief-images bucket
CREATE POLICY "Anyone can view brief images" ON storage.objects
  FOR SELECT USING (bucket_id = 'brief-images');

CREATE POLICY "Authenticated users can upload brief images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brief-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update brief images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brief-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete brief images" ON storage.objects
  FOR DELETE USING (bucket_id = 'brief-images' AND auth.role() = 'authenticated');

-- Set up RLS policies for company-logos bucket
CREATE POLICY "Anyone can view company logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload company logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete company logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated'); 