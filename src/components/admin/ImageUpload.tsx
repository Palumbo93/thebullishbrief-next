"use client";

import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useAdminImageUpload } from '../../hooks/useAdminImageUpload';
import { IMAGE_TYPES } from '../../lib/storage';

interface ImageUploadProps {
  label?: string;
  currentImageUrl?: string;
  onImageUpload: (result: { url: string; path: string }) => void;
  onImageRemove?: () => void;
  type: keyof typeof IMAGE_TYPES;
  entityId: string;
  placeholder?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Upload Image',
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  type,
  entityId,
  placeholder = 'Click to upload or drag and drop',
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const {
    uploading,
    progress,
    error,
    uploadArticleImage,
    uploadAuthorAvatar,
    uploadFeaturedImage,
    reset
  } = useAdminImageUpload({
    onSuccess: (result: { url: string; path: string }) => {
      setPreviewUrl(result.url);
      onImageUpload(result);
    },
    onError: (errorMessage: string) => {
      console.error('Upload error:', errorMessage);
    }
  });

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    try {
      let result;
      
      switch (type) {
        case 'ARTICLE_IMAGE':
          result = await uploadArticleImage(file, entityId);
          break;
        case 'AUTHOR_AVATAR':
          result = await uploadAuthorAvatar(file, entityId);
          break;
        case 'FEATURED_IMAGE':
          result = await uploadFeaturedImage(file, entityId);
          break;
        default:
          throw new Error('Invalid image type');
      }

      if (result) {
        setPreviewUrl(result.url);
        onImageUpload(result);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-3)'
        }}>
          {label}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          border: '2px dashed',
          borderColor: dragActive ? 'var(--color-primary)' : 'var(--color-border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          textAlign: 'center',
          background: dragActive ? 'var(--color-bg-secondary)' : 'var(--color-bg-tertiary)',
          transition: 'all var(--transition-base)',
          cursor: uploading ? 'not-allowed' : 'pointer'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        {previewUrl ? (
          <div style={{ position: 'relative' }}>
            <Image
              src={previewUrl}
              alt="Preview"
              width={400}
              height={200}
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover'
              }}
            />
            {!uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                style={{
                  position: 'absolute',
                  top: 'var(--space-2)',
                  right: 'var(--space-2)',
                  background: 'var(--color-danger)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)'
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>
        ) : (
          <div>
            {uploading ? (
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid var(--color-border-primary)',
                  borderTop: '3px solid var(--color-primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto var(--space-4)'
                }} />
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Uploading... {progress}%
                </div>
                {progress > 0 && (
                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: 'var(--color-primary)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <ImageIcon style={{
                  width: '48px',
                  height: '48px',
                  color: 'var(--color-text-tertiary)',
                  margin: '0 auto var(--space-4)'
                }} />
                <div style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {placeholder}
                </div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-tertiary)'
                }}>
                  {IMAGE_TYPES[type].allowedTypes.join(', ')} up to {IMAGE_TYPES[type].maxSize / (1024 * 1024)}MB
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-sm)'
        }}>
          <AlertCircle style={{ width: '16px', height: '16px' }} />
          {error}
        </div>
      )}
    </div>
  );
}; 