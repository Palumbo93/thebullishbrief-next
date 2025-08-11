import { useState, useCallback } from 'react';
import {
  uploadArticleImage,
  uploadAuthorAvatar,
  uploadFeaturedImage,
  validateImage,
  StorageError,
  IMAGE_TYPES
} from '../lib/storage';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseImageUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: { url: string; path: string }) => void;
  onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadArticleImageWithProgress = useCallback(async (
    file: File,
    articleId: string
  ): Promise<{ url: string; path: string } | null> => {
    try {
      setUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      // Validate image first
      const validation = validateImage(file, 'ARTICLE_IMAGE');
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid image file');
      }

      // Simulate progress (since Supabase doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (!prev) return prev;
          const newLoaded = Math.min(prev.loaded + file.size / 10, file.size);
          const newPercentage = Math.round((newLoaded / file.size) * 100);
          const newProgress = { loaded: newLoaded, total: file.size, percentage: newPercentage };
          options.onProgress?.(newProgress);
          return newProgress;
        });
      }, 100);

      const result = await uploadArticleImage(file, articleId);
      
      clearInterval(progressInterval);
      setProgress({ loaded: file.size, total: file.size, percentage: 100 });
      options.onSuccess?.(result);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof StorageError ? err.message : 'Upload failed';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  }, [options]);

  const uploadAuthorAvatarWithProgress = useCallback(async (
    file: File,
    authorId: string
  ): Promise<{ url: string; path: string } | null> => {
    try {
      setUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      // Validate image first
      const validation = validateImage(file, 'AUTHOR_AVATAR');
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid image file');
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (!prev) return prev;
          const newLoaded = Math.min(prev.loaded + file.size / 10, file.size);
          const newPercentage = Math.round((newLoaded / file.size) * 100);
          const newProgress = { loaded: newLoaded, total: file.size, percentage: newPercentage };
          options.onProgress?.(newProgress);
          return newProgress;
        });
      }, 100);

      const result = await uploadAuthorAvatar(file, authorId);
      
      clearInterval(progressInterval);
      setProgress({ loaded: file.size, total: file.size, percentage: 100 });
      options.onSuccess?.(result);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof StorageError ? err.message : 'Upload failed';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  }, [options]);

  const uploadFeaturedImageWithProgress = useCallback(async (
    file: File,
    articleId: string
  ): Promise<{ url: string; path: string } | null> => {
    try {
      setUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      // Validate image first
      const validation = validateImage(file, 'FEATURED_IMAGE');
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid image file');
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (!prev) return prev;
          const newLoaded = Math.min(prev.loaded + file.size / 10, file.size);
          const newPercentage = Math.round((newLoaded / file.size) * 100);
          const newProgress = { loaded: newLoaded, total: file.size, percentage: newPercentage };
          options.onProgress?.(newProgress);
          return newProgress;
        });
      }, 100);

      const result = await uploadFeaturedImage(file, articleId);
      
      clearInterval(progressInterval);
      setProgress({ loaded: file.size, total: file.size, percentage: 100 });
      options.onSuccess?.(result);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof StorageError ? err.message : 'Upload failed';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadArticleImage: uploadArticleImageWithProgress,
    uploadAuthorAvatar: uploadAuthorAvatarWithProgress,
    uploadFeaturedImage: uploadFeaturedImageWithProgress,
    reset
  };
}

// Utility hook for image validation
export function useImageValidation() {
  const validateFile = useCallback((file: File, type: keyof typeof IMAGE_TYPES) => {
    return validateImage(file, type);
  }, []);

  return { validateFile };
} 