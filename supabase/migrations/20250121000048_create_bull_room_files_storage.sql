-- Create bull-room-files storage bucket with extensible file type support
-- This bucket will support images (Phase 1) and documents (Future phases)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bull-room-files',
  'bull-room-files',
  true,
  10485760, -- 10MB
  ARRAY[
    -- Images (Phase 1)
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    -- Documents (Future phases)
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for bull-room-files bucket
-- Allow anyone to view bull room files (for public chat access)
CREATE POLICY "Anyone can view bull room files" ON storage.objects
  FOR SELECT USING (bucket_id = 'bull-room-files');

-- Allow authenticated users to upload bull room files
CREATE POLICY "Authenticated users can upload bull room files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bull-room-files' AND auth.role() = 'authenticated');

-- Allow users to update their own bull room files
-- Files are organized as: userId/roomId/filename
CREATE POLICY "Users can update their own bull room files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'bull-room-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own bull room files
-- Files are organized as: userId/roomId/filename
CREATE POLICY "Users can delete their own bull room files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'bull-room-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
