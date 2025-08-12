import { useState, useCallback } from 'react';
import { 
  uploadArticleImage, 
  uploadAuthorAvatar, 
  uploadFeaturedImage 
} from '../lib/storage';

interface UseAdminImageUploadOptions {
  onSuccess?: (result: { url: string; path: string }) => void;
  onError?: (errorMessage: string) => void;
}

interface UseAdminImageUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadArticleImage: (file: File, entityId: string) => Promise<{ url: string; path: string } | null>;
  uploadAuthorAvatar: (file: File, entityId: string) => Promise<{ url: string; path: string } | null>;
  uploadFeaturedImage: (file: File, entityId: string) => Promise<{ url: string; path: string } | null>;
  reset: () => void;
}

/**
 * Custom hook for admin image uploads with progress tracking
 */
export const useAdminImageUpload = ({
  onSuccess,
  onError,
}: UseAdminImageUploadOptions = {}): UseAdminImageUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const uploadWithProgress = useCallback(async (
    uploadFunction: (file: File, entityId: string) => Promise<{ url: string; path: string }>,
    file: File,
    entityId: string
  ): Promise<{ url: string; path: string } | null> => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // Simulate progress (since storage upload doesn't provide progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await uploadFunction(file, entityId);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setUploading(false);
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 1000);
    }
  }, [onSuccess, onError]);

  const uploadArticleImageWithProgress = useCallback(
    (file: File, entityId: string) => uploadWithProgress(uploadArticleImage, file, entityId),
    [uploadWithProgress]
  );

  const uploadAuthorAvatarWithProgress = useCallback(
    (file: File, entityId: string) => uploadWithProgress(uploadAuthorAvatar, file, entityId),
    [uploadWithProgress]
  );

  const uploadFeaturedImageWithProgress = useCallback(
    (file: File, entityId: string) => uploadWithProgress(uploadFeaturedImage, file, entityId),
    [uploadWithProgress]
  );

  return {
    uploading,
    progress,
    error,
    uploadArticleImage: uploadArticleImageWithProgress,
    uploadAuthorAvatar: uploadAuthorAvatarWithProgress,
    uploadFeaturedImage: uploadFeaturedImageWithProgress,
    reset,
  };
};
