# User Profile Enhancement Design Document

## Problem Statement

The current user profile system lacks personalization features that would enhance user engagement and community building. Users need the ability to:

1. Add a personal bio to share information about themselves
2. Upload and manage a profile image for visual identification
3. Link their Twitter/X handle for social connectivity
4. Have optimized profile images for fast loading and good performance

## Requirements

### Functional Requirements
- Add `bio` (text), `profile_image` (URL), and `twitter_handle` fields to `user_profiles` table
- Create a public storage bucket for profile images with optimization
- Update ProfileSection component to display and edit these new fields
- Implement image upload functionality with client-side optimization
- Add validation for bio length and Twitter handle format
- Ensure proper RLS policies for profile image storage

### Non-Functional Requirements
- Profile images should be optimized (max 2MB, compressed)
- Fast loading times for profile images
- Responsive design for mobile and desktop
- Proper error handling and user feedback
- Type safety throughout the implementation

## Technical Design

### Database Schema Changes

#### 1. User Profiles Table Enhancement
```sql
-- Add new columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN bio TEXT,
ADD COLUMN profile_image TEXT,
ADD COLUMN twitter_handle TEXT;

-- Add constraints
ALTER TABLE user_profiles 
ADD CONSTRAINT twitter_handle_format 
CHECK (twitter_handle IS NULL OR twitter_handle ~ '^@[a-zA-Z0-9_]{1,15}$');

ALTER TABLE user_profiles 
ADD CONSTRAINT bio_length 
CHECK (bio IS NULL OR length(bio) <= 500);
```

#### 2. Profile Images Storage Bucket
```sql
-- Create profile-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- RLS policies for profile-images bucket
CREATE POLICY "Allow users to upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow public read access to profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Allow users to update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Frontend Implementation

#### 1. Type Updates
- Update `UserProfile` interface in `database.aliases.ts`
- Update `ProfileSection.tsx` component types

#### 2. Image Upload Component
- Create reusable `ImageUpload` component for profile images
- Implement client-side image optimization using Canvas API
- Add drag-and-drop functionality
- Show upload progress and preview

#### 3. ProfileSection Component Updates
- Add bio editor with character count
- Add Twitter handle input with validation
- Add profile image upload/management
- Implement proper form validation and error handling

### Image Optimization Strategy

#### Client-Side Optimization
1. **Resize**: Resize images to max 400x400px for profile pictures
2. **Compress**: Use Canvas API to compress images to WebP format
3. **Quality**: Maintain 80% quality for good balance of size/quality
4. **File Size**: Ensure final file is under 500KB

#### Storage Strategy
- Store images in `profile-images/{user_id}/` folder structure
- Use WebP format for better compression
- Generate unique filenames with timestamps

## Implementation Plan

### Phase 1: Database Migration
1. Create migration file for schema changes
2. Add storage bucket and policies
3. Update TypeScript types

### Phase 2: Image Upload Component
1. Create reusable ImageUpload component
2. Implement client-side optimization
3. Add proper error handling and validation

### Phase 3: ProfileSection Enhancement
1. Update ProfileSection component
2. Add bio and Twitter handle editing
3. Integrate image upload functionality
4. Add proper validation and error handling

### Phase 4: Testing and Polish
1. Test image upload and optimization
2. Test form validation
3. Test responsive design
4. Performance testing

## Files to Modify

### New Files
- `supabase/migrations/20250121000035_add_profile_fields.sql`
- `src/components/ui/ImageUpload.tsx`
- `src/hooks/useImageUpload.ts`

### Modified Files
- `src/lib/database.types.ts` (auto-generated)
- `src/lib/database.aliases.ts`
- `src/components/account/ProfileSection.tsx`

## Success Criteria
- Users can successfully upload and manage profile images
- Bio and Twitter handle fields work correctly with validation
- Images are properly optimized and load quickly
- All form validations work as expected
- Responsive design works on all screen sizes
- No performance degradation on profile page

## Risks and Mitigation
- **Risk**: Large image uploads could slow down the app
  - **Mitigation**: Client-side optimization before upload
- **Risk**: Storage costs could increase
  - **Mitigation**: Strict file size limits and optimization
- **Risk**: Twitter handle validation might be too restrictive
  - **Mitigation**: Use standard Twitter handle regex pattern
