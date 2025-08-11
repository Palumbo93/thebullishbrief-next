import { supabase } from './supabase';

// Storage bucket names
export const STORAGE_BUCKETS = {
  ARTICLE_IMAGES: 'article-images',
  AUTHOR_AVATARS: 'author-avatars',
  FEATURED_IMAGES: 'featured-images',
  BRIEF_IMAGES: 'brief-images',
  COMPANY_LOGOS: 'company-logos'
} as const;

// Image types and their allowed MIME types
export const IMAGE_TYPES = {
  ARTICLE_IMAGE: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    maxWidth: 1920,
    maxHeight: 1080
  },
  AUTHOR_AVATAR: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    maxWidth: 400,
    maxHeight: 400
  },
  FEATURED_IMAGE: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    maxWidth: 1920,
    maxHeight: 1080
  },
  BRIEF_IMAGE: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    maxWidth: 1920,
    maxHeight: 1080
  },
  COMPANY_LOGO: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    maxWidth: 400,
    maxHeight: 400
  }
} as const;

// Storage error types
export class StorageError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'StorageError';
  }
}

// Image validation
export function validateImage(
  file: File, 
  type: keyof typeof IMAGE_TYPES
): { isValid: boolean; error?: string } {
  const config = IMAGE_TYPES[type];
  
  // Check file size
  if (file.size > config.maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${config.maxSize / (1024 * 1024)}MB`
    };
  }
  
  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${config.allowedTypes.join(', ')}`
    };
  }
  
  return { isValid: true };
}

// Generate unique file name
export function generateFileName(
  originalName: string, 
  prefix: string = 'upload'
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${prefix}-${timestamp}-${randomString}.${extension}`;
}

// Upload image to Supabase storage
export async function uploadImage(
  file: File,
  bucket: string,
  path: string,
  options?: {
    cacheControl?: string;
    upsert?: boolean;
  }
): Promise<{ url: string; path: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false
      });

    if (error) {
      throw new StorageError(`Failed to upload image: ${error.message}`, error);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path: data.path
    };
  } catch (error) {
    throw new StorageError('Failed to upload image', error);
  }
}

// Delete image from Supabase storage
export async function deleteImage(
  bucket: string,
  path: string
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new StorageError(`Failed to delete image: ${error.message}`, error);
    }
  } catch (error) {
    throw new StorageError('Failed to delete image', error);
  }
}

// Upload article image
export async function uploadArticleImage(
  file: File,
  articleId: string
): Promise<{ url: string; path: string }> {
  // Validate image
  const validation = validateImage(file, 'ARTICLE_IMAGE');
  if (!validation.isValid) {
    throw new StorageError(validation.error || 'Invalid image file');
  }

  // Generate file path
  const fileName = generateFileName(file.name, 'article');
  const path = `${articleId}/${fileName}`;

  return uploadImage(file, STORAGE_BUCKETS.ARTICLE_IMAGES, path);
}

// Upload author avatar
export async function uploadAuthorAvatar(
  file: File,
  authorId: string
): Promise<{ url: string; path: string }> {
  // Validate image
  const validation = validateImage(file, 'AUTHOR_AVATAR');
  if (!validation.isValid) {
    throw new StorageError(validation.error || 'Invalid image file');
  }

  // Generate file path
  const fileName = generateFileName(file.name, 'avatar');
  const path = `${authorId}/${fileName}`;

  return uploadImage(file, STORAGE_BUCKETS.AUTHOR_AVATARS, path);
}

// Upload featured image
export async function uploadFeaturedImage(
  file: File,
  articleId: string
): Promise<{ url: string; path: string }> {
  // Validate image
  const validation = validateImage(file, 'FEATURED_IMAGE');
  if (!validation.isValid) {
    throw new StorageError(validation.error || 'Invalid image file');
  }

  // Generate file path
  const fileName = generateFileName(file.name, 'featured');
  const path = `${articleId}/${fileName}`;

  return uploadImage(file, STORAGE_BUCKETS.FEATURED_IMAGES, path);
}

// Upload temporary featured image (for article creation flow)
export async function uploadTemporaryFeaturedImage(
  file: File,
  sessionId: string
): Promise<{ url: string; path: string }> {
  // Validate image
  const validation = validateImage(file, 'FEATURED_IMAGE');
  if (!validation.isValid) {
    throw new StorageError(validation.error || 'Invalid image file');
  }

  // Generate file path with session ID
  const fileName = generateFileName(file.name, 'featured');
  const path = `temp/${sessionId}/${fileName}`;

  return uploadImage(file, STORAGE_BUCKETS.FEATURED_IMAGES, path);
}

// Move temporary featured image to permanent location
export async function moveFeaturedImageToArticle(
  tempPath: string,
  articleId: string
): Promise<{ url: string; path: string }> {
  try {
    // Generate new permanent path
    const fileName = tempPath.split('/').pop() || 'featured-image.jpg';
    const newPath = `${articleId}/${fileName}`;

    // Download the temporary file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKETS.FEATURED_IMAGES)
      .download(tempPath);

    if (downloadError || !fileData) {
      throw new StorageError('Failed to download temporary image', downloadError);
    }

    // Upload to new permanent location
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.FEATURED_IMAGES)
      .upload(newPath, fileData, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new StorageError('Failed to move image to permanent location', uploadError);
    }

    // Delete the temporary file
    await deleteImage(STORAGE_BUCKETS.FEATURED_IMAGES, tempPath);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.FEATURED_IMAGES)
      .getPublicUrl(newPath);

    return {
      url: urlData.publicUrl,
      path: newPath
    };
  } catch (error) {
    throw new StorageError('Failed to move featured image', error);
  }
}

// Get image URL from path
export function getImageUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

// Brief-specific upload functions
export async function uploadBriefImage(
  file: File,
  briefId: string
): Promise<{ url: string; path: string }> {
  const fileName = generateFileName(file.name, 'brief');
  const path = `${briefId}/${fileName}`;
  
  return uploadImage(file, STORAGE_BUCKETS.BRIEF_IMAGES, path);
}

export async function uploadTemporaryBriefImage(
  file: File,
  sessionId: string
): Promise<{ url: string; path: string }> {
  const fileName = generateFileName(file.name, 'brief-temp');
  const path = `temp/${sessionId}/${fileName}`;
  
  return uploadImage(file, STORAGE_BUCKETS.BRIEF_IMAGES, path);
}

export async function moveBriefImageToPermanent(
  tempPath: string,
  briefId: string
): Promise<{ url: string; path: string }> {
  const fileName = tempPath.split('/').pop() || 'brief-image.jpg';
  const newPath = `${briefId}/${fileName}`;
  
  try {
    // Copy from temp to permanent location
    const { data: copyData, error: copyError } = await supabase.storage
      .from(STORAGE_BUCKETS.BRIEF_IMAGES)
      .copy(tempPath, newPath);

    if (copyError) {
      throw new StorageError(`Failed to move brief image: ${copyError.message}`, copyError);
    }

    // Delete temp file
    await deleteImage(STORAGE_BUCKETS.BRIEF_IMAGES, tempPath);

    // Get public URL
    const url = getImageUrl(STORAGE_BUCKETS.BRIEF_IMAGES, newPath);
    
    return { url, path: newPath };
  } catch (error) {
    throw new StorageError(`Failed to move brief image: ${error}`, error);
  }
}

// Company logo upload functions
export async function uploadCompanyLogo(
  file: File,
  companyId: string
): Promise<{ url: string; path: string }> {
  const fileName = generateFileName(file.name, 'logo');
  const path = `${companyId}/${fileName}`;
  
  return uploadImage(file, STORAGE_BUCKETS.COMPANY_LOGOS, path);
}

export async function uploadTemporaryCompanyLogo(
  file: File,
  sessionId: string
): Promise<{ url: string; path: string }> {
  const fileName = generateFileName(file.name, 'logo-temp');
  const path = `temp/${sessionId}/${fileName}`;
  
  return uploadImage(file, STORAGE_BUCKETS.COMPANY_LOGOS, path);
}

export async function moveCompanyLogoToPermanent(
  tempPath: string,
  companyId: string
): Promise<{ url: string; path: string }> {
  const fileName = tempPath.split('/').pop() || 'company-logo.jpg';
  const newPath = `${companyId}/${fileName}`;
  
  try {
    // Copy from temp to permanent location
    const { data: copyData, error: copyError } = await supabase.storage
      .from(STORAGE_BUCKETS.COMPANY_LOGOS)
      .copy(tempPath, newPath);

    if (copyError) {
      throw new StorageError(`Failed to move company logo: ${copyError.message}`, copyError);
    }

    // Delete temp file
    await deleteImage(STORAGE_BUCKETS.COMPANY_LOGOS, tempPath);

    // Get public URL
    const url = getImageUrl(STORAGE_BUCKETS.COMPANY_LOGOS, newPath);
    
    return { url, path: newPath };
  } catch (error) {
    throw new StorageError(`Failed to move company logo: ${error}`, error);
  }
}

// Storage buckets are created via migration - no need to check or create them client-side
export async function ensureStorageBuckets(): Promise<void> {
  // Storage buckets are created via Supabase migration
  // No client-side bucket creation needed
  console.log('Storage buckets are managed via Supabase migration');
} 