import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UseImageUploadOptions {
  bucket: string;
  folder?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string | null>;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for uploading images to Supabase storage
 */
export const useImageUpload = ({
  bucket,
  folder = '',
  onSuccess,
  onError,
}: UseImageUploadOptions): UseImageUploadReturn => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!user) {
        const errorMsg = 'User not authenticated';
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }

      try {
        setIsUploading(true);
        setError(null);

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop() || 'webp';
        const fileName = `${timestamp}.${fileExtension}`;
        
        // Create file path
        const filePath = folder ? `${folder}/${user.id}/${fileName}` : `${user.id}/${fileName}`;

        // Upload file to Supabase storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        onSuccess?.(publicUrl);
        return publicUrl;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to upload image';
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [user, bucket, folder, onSuccess, onError]
  );

  return {
    uploadImage,
    isUploading,
    error,
    clearError,
  };
}; 