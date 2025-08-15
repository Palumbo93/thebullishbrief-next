import { supabase } from '../lib/supabase';
import { STORAGE_BUCKETS } from '../lib/storage';

export interface FileUploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
  preview_url?: string;
  preview_type: 'thumbnail' | 'icon';
}

export class BullRoomFileUploadService {
  private static readonly BUCKET_NAME = STORAGE_BUCKETS.BULL_ROOM_FILES;
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  // File type configurations for extensibility
  private static readonly FILE_TYPE_CONFIGS = {
    // Images (Phase 1)
    images: {
      mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      maxSize: 10 * 1024 * 1024, // 10MB
      previewType: 'thumbnail' as const,
      allowedInPhase: 1
    },
    // Documents (Future phases)
    documents: {
      mimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ],
      maxSize: 5 * 1024 * 1024, // 5MB
      previewType: 'icon' as const,
      allowedInPhase: 2
    }
  };

  // Current implementation phase (can be increased to enable more file types)
  private static readonly CURRENT_PHASE = 1;

  /**
   * Get allowed file types for current phase
   */
  private static getAllowedMimeTypes(): string[] {
    return Object.values(this.FILE_TYPE_CONFIGS)
      .filter(config => config.allowedInPhase <= this.CURRENT_PHASE)
      .flatMap(config => config.mimeTypes);
  }

  /**
   * Get file type configuration
   */
  private static getFileTypeConfig(file: File) {
    return Object.entries(this.FILE_TYPE_CONFIGS).find(([_, config]) =>
      config.mimeTypes.includes(file.type)
    )?.[1];
  }

  /**
   * Validate file for upload
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        error: `File size must be less than ${Math.round(this.MAX_FILE_SIZE / 1024 / 1024)}MB` 
      };
    }

    // Check if file type is allowed in current phase
    const fileTypeConfig = this.getFileTypeConfig(file);
    if (!fileTypeConfig) {
      return { 
        isValid: false, 
        error: 'File type not supported in current phase' 
      };
    }

    // Check phase-specific file size limits
    if (file.size > fileTypeConfig.maxSize) {
      return { 
        isValid: false, 
        error: `File size must be less than ${Math.round(fileTypeConfig.maxSize / 1024 / 1024)}MB for this file type` 
      };
    }

    return { isValid: true };
  }

  /**
   * Upload file to bull-room-files bucket
   */
  static async uploadFile(
    file: File, 
    roomId: string, 
    userId: string
  ): Promise<FileUploadResult> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Get file type configuration
    const fileTypeConfig = this.getFileTypeConfig(file);
    if (!fileTypeConfig) {
      throw new Error('File type not supported');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${userId}/${roomId}/${timestamp}-${randomString}.${fileExt}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName);

    // Generate preview URL based on file type
    let previewUrl: string | undefined;
    if (fileTypeConfig.previewType === 'thumbnail' && file.type.startsWith('image/')) {
      previewUrl = publicUrl; // For images, preview URL is the same as the file URL
    }

    return {
      url: publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      preview_url: previewUrl,
      preview_type: fileTypeConfig.previewType
    };
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    const path = fileUrl.split('/').pop();
    if (!path) return;

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get current phase
   */
  static getCurrentPhase(): number {
    return this.CURRENT_PHASE;
  }

  /**
   * Get allowed file types for current phase
   */
  static getAllowedFileTypes(): string[] {
    return this.getAllowedMimeTypes();
  }

  /**
   * Check if file type is supported in current phase
   */
  static isFileTypeSupported(fileType: string): boolean {
    return this.getAllowedMimeTypes().includes(fileType);
  }
}
