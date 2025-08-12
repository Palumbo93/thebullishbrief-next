import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageUpload: (file: File, optimizedUrl: string) => void;
  onImageRemove: () => void;
  disabled?: boolean;
  className?: string;
  maxSize?: number; // in bytes
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  size?: 'small' | 'medium' | 'large'; // for different contexts
}

/**
 * Optimizes an image using Canvas API
 */
const optimizeImage = async (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<{ file: File; url: string }> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with specified quality
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to optimize image'));
            return;
          }

          // Create new file with optimized data
          const optimizedFile = new File([blob], file.name, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          // Create URL for preview
          const url = URL.createObjectURL(blob);
          
          resolve({ file: optimizedFile, url });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  disabled = false,
  className = '',
  maxSize = 2 * 1024 * 1024, // 2MB
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.8,
  size = 'medium',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [showRemoveButton, setShowRemoveButton] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    try {
      setIsUploading(true);
      
      // Optimize the image
      const { file: optimizedFile, url } = await optimizeImage(
        file,
        maxWidth,
        maxHeight,
        quality
      );

      // Update preview
      setPreviewUrl(url);
      
      // Call parent handler
      onImageUpload(optimizedFile, url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsUploading(false);
    }
  }, [maxSize, maxWidth, maxHeight, quality, onImageUpload]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl !== currentImageUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    onImageRemove();
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Size-based dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60, iconSize: 16, fontSize: '10px' };
      case 'large':
        return { width: 120, height: 120, iconSize: 24, fontSize: '12px' };
      default: // medium
        return { width: 80, height: 80, iconSize: 20, fontSize: '11px' };
    }
  };

  const dimensions = getSizeDimensions();

  return (
    <div className={className} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%'
    }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* Image Preview */}
      {previewUrl && (
        <div 
          style={{
            position: 'relative',
            marginBottom: 'var(--space-4)',
            display: 'inline-block'
          }}
          onMouseEnter={() => setShowRemoveButton(true)}
          onMouseLeave={() => setShowRemoveButton(false)}
        >
          <img
            src={previewUrl}
            alt="Profile preview"
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--color-border-primary)',
              cursor: 'pointer',
              transition: 'opacity var(--transition-base)'
            }}
            onClick={() => setShowRemoveButton(!showRemoveButton)}
          />
          {showRemoveButton && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-primary)',
                color: 'var(--color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all var(--transition-base)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isUploading) {
                  e.currentTarget.style.background = 'var(--color-error)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'var(--color-error)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && !isUploading) {
                  e.currentTarget.style.background = 'var(--color-bg-card)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                  e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                }
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!previewUrl && (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border-primary)'}`,
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all var(--transition-base)',
            background: isDragging ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent'
          }}
        >
          {isUploading ? (
            <div style={{
              width: `${dimensions.iconSize}px`,
              height: `${dimensions.iconSize}px`,
              border: '2px solid var(--color-border-primary)',
              borderTop: '2px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <>
              <ImageIcon size={dimensions.iconSize} color="var(--color-text-secondary)" />
              <div style={{
                fontSize: dimensions.fontSize,
                color: 'var(--color-text-secondary)',
                textAlign: 'center',
                marginTop: 'var(--space-1)'
              }}>
                Click or drag
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          color: 'var(--color-error)',
          fontSize: 'var(--text-sm)',
          marginTop: 'var(--space-2)'
        }}>
          {error}
        </div>
      )}

      {/* Help Text */}
      <div style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-tertiary)',
        marginTop: 'var(--space-2)',
        lineHeight: 1.4
      }}>
        Recommended: Square image, max {Math.round(maxSize / 1024 / 1024)}MB
      </div>
    </div>
  );
};
