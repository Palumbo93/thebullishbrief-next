import { supabase } from './supabase';

// Storage bucket names
export const STORAGE_BUCKETS = {
  ARTICLE_IMAGES: 'article-images', // Now shared: /article/{uuid} and /brief/{uuid}
  AUTHOR_AVATARS: 'author-avatars',
  AUTHOR_BANNERS: 'author-banners',
  FEATURED_IMAGES: 'featured-images',
  COMPANY_LOGOS: 'company-logos',
  BULL_ROOM_FILES: 'bull-room-files'
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
  AUTHOR_BANNER: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    maxWidth: 1500,
    maxHeight: 500
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
  if (!config.allowedTypes.includes(file.type as any)) {
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

// Upload author banner
export async function uploadAuthorBanner(
  file: File,
  authorId: string
): Promise<{ url: string; path: string }> {
  // Validate image
  const validation = validateImage(file, 'AUTHOR_BANNER');
  if (!validation.isValid) {
    throw new StorageError(validation.error || 'Invalid image file');
  }

  // Generate file path
  const fileName = generateFileName(file.name, 'banner');
  const path = `${authorId}/${fileName}`;

  return uploadImage(file, STORAGE_BUCKETS.AUTHOR_BANNERS, path);
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
  
  return uploadImage(file, STORAGE_BUCKETS.ARTICLE_IMAGES, path);
}

export async function uploadTemporaryBriefImage(
  file: File,
  sessionId: string
): Promise<{ url: string; path: string }> {
  const fileName = generateFileName(file.name, 'brief-temp');
  const path = `temp/${sessionId}/${fileName}`;
  
  return uploadImage(file, STORAGE_BUCKETS.ARTICLE_IMAGES, path);
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
      .from(STORAGE_BUCKETS.ARTICLE_IMAGES)
      .copy(tempPath, newPath);

    if (copyError) {
      throw new StorageError(`Failed to move brief image: ${copyError.message}`, copyError);
    }

    // Delete temp file
    await deleteImage(STORAGE_BUCKETS.ARTICLE_IMAGES, tempPath);

    // Get public URL
    const url = getImageUrl(STORAGE_BUCKETS.ARTICLE_IMAGES, newPath);
    
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
}

// =============================================================================
// ENHANCED ENTITY-BASED IMAGE STORAGE SYSTEM
// =============================================================================

/**
 * Entity upload configuration for organizing images by entity type
 */
interface EntityUploadConfig {
  entityType: 'article' | 'author' | 'brief' | 'company';
  buckets: {
    primary?: string;     // Main image (featured/avatar)
    secondary?: string;   // Additional images (banner/content)
    tertiary?: string;    // Company logos (for briefs)
  };
  folderStructure: string; // For shared buckets: e.g., 'articles/{entityId}'
  dedicatedBucketStructure: string; // For dedicated buckets: e.g., '{entityId}'
}

/**
 * Configuration for each entity type's image storage
 */
export const ENTITY_UPLOAD_CONFIGS: Record<string, EntityUploadConfig> = {
  article: {
    entityType: 'article',
    buckets: {
      primary: STORAGE_BUCKETS.FEATURED_IMAGES,
      secondary: STORAGE_BUCKETS.ARTICLE_IMAGES
    },
    folderStructure: 'articles/{entityId}', // Used for shared buckets like featured-images
    dedicatedBucketStructure: 'articles/{entityId}' // Used for article-images: /article/{uuid}
  },
  author: {
    entityType: 'author', 
    buckets: {
      primary: STORAGE_BUCKETS.AUTHOR_AVATARS,
      secondary: STORAGE_BUCKETS.AUTHOR_BANNERS
    },
    folderStructure: 'authors/{entityId}', // Not used since both buckets are dedicated
    dedicatedBucketStructure: '{entityId}' // Used for both avatar and banner buckets
  },
  brief: {
    entityType: 'brief',
    buckets: {
      primary: STORAGE_BUCKETS.FEATURED_IMAGES,
      secondary: STORAGE_BUCKETS.ARTICLE_IMAGES, // Now shared with articles
      tertiary: STORAGE_BUCKETS.COMPANY_LOGOS // Add company logos for briefs
    },
    folderStructure: 'briefs/{entityId}', // Used for shared buckets
    dedicatedBucketStructure: 'briefs/{entityId}' // Used for article-images: /brief/{uuid}
  },
  company: {
    entityType: 'company',
    buckets: {
      primary: STORAGE_BUCKETS.COMPANY_LOGOS,
      secondary: undefined // Companies only have logos for now
    },
    folderStructure: 'companies/{entityId}', // Not used since bucket is dedicated
    dedicatedBucketStructure: '{entityId}' // Used for dedicated company-logos bucket
  }
};

/**
 * Enhanced image storage service for entity-based organization
 * Supports direct upload to final organized locations (no temp files or moving)
 */
export class EntityImageStorageService {
  
  /**
   * Determine if a bucket is shared (used by multiple entity types) or dedicated
   */
  private static isSharedBucket(bucketName: string): boolean {
    // featured-images and article-images are shared by articles and briefs
    return bucketName === STORAGE_BUCKETS.FEATURED_IMAGES || 
           bucketName === STORAGE_BUCKETS.ARTICLE_IMAGES;
  }

  /**
   * Upload image directly to organized entity folder
   * @param file - Image file to upload
   * @param entityType - Type of entity (article, author, brief, company)
   * @param entityId - UUID of the entity (pre-generated for creates, existing for edits)
   * @param fileType - Whether this is primary (featured/avatar) or secondary (banner/content) image
   * @returns Upload result with URL and organized path
   */
  static async uploadDirectToEntity(
    file: File,
    entityType: string,
    entityId: string,
    fileType: 'primary' | 'secondary' | 'tertiary'
  ): Promise<{ url: string; path: string }> {
    const config = ENTITY_UPLOAD_CONFIGS[entityType];
    if (!config) {
      throw new StorageError(`Unknown entity type: ${entityType}`);
    }

    // Get the appropriate bucket for the file type
    const bucketName = fileType === 'primary' ? config.buckets.primary : 
                      fileType === 'secondary' ? config.buckets.secondary :
                      config.buckets.tertiary;
    if (!bucketName) {
      throw new StorageError(`No ${fileType} bucket configured for entity type: ${entityType}`);
    }

    // Validate image based on entity and file type
    const imageType = this.getImageValidationType(entityType, fileType);
    const validation = validateImage(file, imageType);
    if (!validation.isValid) {
      throw new StorageError(validation.error || 'Invalid image file');
    }

    // Generate organized file path based on bucket type
    const fileName = generateFileName(file.name, `${entityType}-${fileType}`);
    
    // Use appropriate folder structure:
    // - Shared buckets (like featured-images): articles/{entityId}/
    // - Dedicated buckets (like article-images): {entityId}/
    const folderStructure = this.isSharedBucket(bucketName) 
      ? config.folderStructure 
      : config.dedicatedBucketStructure;
    
    const folderPath = folderStructure.replace('{entityId}', entityId);
    const finalPath = `${folderPath}/${fileName}`;

    // Upload directly to final organized location
    return uploadImage(file, bucketName, finalPath);
  }

  /**
   * Clean up entire entity folder (only for CREATE modals when cancelled)
   * @param entityType - Type of entity
   * @param entityId - UUID of the entity
   */
  static async cleanupEntityFolder(
    entityType: string,
    entityId: string
  ): Promise<void> {
    const config = ENTITY_UPLOAD_CONFIGS[entityType];
    if (!config) {
      console.error(`Unknown entity type for cleanup: ${entityType}`);
      return;
    }

    // Get all buckets that might contain files for this entity
    const buckets = [config.buckets.primary, config.buckets.secondary].filter(Boolean) as string[];
    
    for (const bucket of buckets) {
      try {
        const folderPath = config.folderStructure.replace('{entityId}', entityId);
        
        // List all files in entity folder
        const { data: files, error } = await supabase.storage
          .from(bucket)
          .list(folderPath);
        
        if (error || !files || files.length === 0) continue;
        
        // Delete all files in the entity folder
        const filePaths = files.map(file => `${folderPath}/${file.name}`);
        if (filePaths.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove(filePaths);
            
          if (deleteError) {
            console.error(`Failed to delete files in ${bucket}/${folderPath}:`, deleteError);
          }
        }
      } catch (error) {
        console.error(`Failed to cleanup entity folder ${entityType}s/${entityId} in ${bucket}:`, error);
      }
    }
  }

  /**
   * Delete a specific image (for individual image removal in edit flows)
   * @param bucketName - Storage bucket name
   * @param imagePath - Full path to the image
   */
  static async deleteSpecificImage(
    bucketName: string,
    imagePath: string
  ): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([imagePath]);
        
      if (error) {
        throw new StorageError(`Failed to delete image: ${error.message}`, error);
      }
    } catch (error) {
      console.error(`Failed to delete image ${imagePath} from ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Generate organized entity path
   * @param entityType - Type of entity  
   * @param entityId - UUID of the entity
   * @param fileName - Name of the file
   * @returns Organized path string
   */
  static generateEntityPath(
    entityType: string,
    entityId: string,
    fileName: string
  ): string {
    const config = ENTITY_UPLOAD_CONFIGS[entityType];
    if (!config) {
      throw new StorageError(`Unknown entity type: ${entityType}`);
    }
    
    const folderPath = config.folderStructure.replace('{entityId}', entityId);
    return `${folderPath}/${fileName}`;
  }

  /**
   * Get the appropriate image validation type based on entity and file type
   * @param entityType - Type of entity
   * @param fileType - Whether primary, secondary, or tertiary image
   * @returns Image validation type key
   */
  private static getImageValidationType(
    entityType: string, 
    fileType: 'primary' | 'secondary' | 'tertiary'
  ): keyof typeof IMAGE_TYPES {
    switch (entityType) {
      case 'article':
        return fileType === 'primary' ? 'FEATURED_IMAGE' : 'ARTICLE_IMAGE';
      case 'author':
        return fileType === 'primary' ? 'AUTHOR_AVATAR' : 'AUTHOR_BANNER';
      case 'brief':
        return fileType === 'primary' ? 'FEATURED_IMAGE' : 'BRIEF_IMAGE';
      case 'company':
        return 'COMPANY_LOGO';
      default:
        throw new StorageError(`Unknown entity type: ${entityType}`);
    }
  }

  /**
   * Get entity configuration
   * @param entityType - Type of entity
   * @returns Entity upload configuration
   */
  static getEntityConfig(entityType: string): EntityUploadConfig {
    const config = ENTITY_UPLOAD_CONFIGS[entityType];
    if (!config) {
      throw new StorageError(`Unknown entity type: ${entityType}`);
    }
    return config;
  }

  /**
   * List all images for an entity (useful for admin management)
   * @param entityType - Type of entity
   * @param entityId - UUID of the entity
   * @returns List of all images for the entity across all buckets
   */
  static async listEntityImages(
    entityType: string,
    entityId: string
  ): Promise<Array<{ bucket: string; path: string; url: string }>> {
    const config = ENTITY_UPLOAD_CONFIGS[entityType];
    if (!config) {
      throw new StorageError(`Unknown entity type: ${entityType}`);
    }

    const results: Array<{ bucket: string; path: string; url: string }> = [];
    const buckets = [config.buckets.primary, config.buckets.secondary].filter(Boolean) as string[];
    const folderPath = config.folderStructure.replace('{entityId}', entityId);

    for (const bucket of buckets) {
      try {
        const { data: files, error } = await supabase.storage
          .from(bucket)
          .list(folderPath);
        
        if (error || !files) continue;
        
        for (const file of files) {
          const fullPath = `${folderPath}/${file.name}`;
          const url = getImageUrl(bucket, fullPath);
          results.push({ bucket, path: fullPath, url });
        }
      } catch (error) {
        console.error(`Failed to list images in ${bucket}/${folderPath}:`, error);
      }
    }

    return results;
  }
} 