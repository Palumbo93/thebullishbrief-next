"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { EntityImageStorageService } from '../../lib/storage';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (imageUrl: string, altText: string, figcaption?: string, width?: string, height?: string) => void;
  initialImageUrl?: string;
  initialUrl?: string; // Keep for backwards compatibility
  initialAltText?: string;
  initialFigcaption?: string;
  initialWidth?: string;
  initialHeight?: string;
  articleId?: string;
  entityType?: 'article' | 'brief'; // Add entity type to determine storage bucket
  zIndex?: number;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialImageUrl,
  initialUrl = '',
  initialAltText = '',
  initialFigcaption = '',
  initialWidth = '',
  initialHeight = '',
  articleId,
  entityType = 'article', // Default to article for backwards compatibility
  zIndex
}) => {
  const [altText, setAltText] = useState(initialAltText);
  const [figcaption, setFigcaption] = useState(initialFigcaption);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState(initialImageUrl || initialUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAltText(initialAltText);
      setFigcaption(initialFigcaption);
      setWidth(initialWidth);
      setHeight(initialHeight);
      setExistingImageUrl(initialImageUrl || initialUrl);
      setError('');
      setUploadedFile(null);
    }
  }, [isOpen, initialAltText, initialFigcaption, initialWidth, initialHeight, initialImageUrl, initialUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedFile) {
      // Upload file to Supabase storage using organized system
      setIsLoading(true);
      try {
        if (!articleId) {
          throw new Error('Entity ID is required for image upload');
        }
        
        // Use new organized upload system for content images
        const result = await EntityImageStorageService.uploadDirectToEntity(
          uploadedFile,
          entityType, // Use the entityType passed from the parent modal
          articleId, // Use the entityId passed from the parent modal
          'secondary' // Content images are secondary (not featured)
        );
        
        setIsLoading(false);
        onSubmit(result.url, altText.trim() || 'Image', figcaption.trim() || undefined, width.trim() || undefined, height.trim() || undefined);
        onClose();
      } catch (error) {
        setIsLoading(false);
        setError(error instanceof Error ? error.message : 'Failed to upload image');
      }
    } else if (existingImageUrl) {
      // Use existing image URL (for editing)
      onSubmit(existingImageUrl, altText.trim() || 'Image', figcaption.trim() || undefined, width.trim() || undefined, height.trim() || undefined);
      onClose();
    } else {
      setError('Please upload an image file');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploadingImage(true);
    try {
      setUploadedFile(file);
    } catch (error) {
      console.error('Failed to process image:', error);
      setError('Failed to process image file');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)';
    (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-tertiary)';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-primary)';
    (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-secondary)';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-primary)';
    (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-secondary)';
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent clicks on the modal backdrop from bubbling up to parent forms
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: zIndex || 'var(--z-modal)',
        padding: 'var(--space-4)'
      }}
      onClick={handleModalClick}
    >
      <div style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-primary)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-primary)',
          background: 'var(--color-bg-secondary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <ImageIcon style={{
              width: '20px',
              height: '20px',
              color: 'var(--color-primary)'
            }} />
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0
            }}>
              Insert Image
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-base)'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <div 
          style={{ padding: 'var(--space-4)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Image Upload Area */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}>
                Upload Image
              </label>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {uploadedFile ? (
                /* Image Preview */
                <div style={{
                  position: 'relative',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  background: 'var(--color-bg-secondary)'
                }}>
                  <Image
                    src={URL.createObjectURL(uploadedFile)}
                    alt="Preview"
                    width={400}
                    height={200}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeUploadedFile}
                    style={{
                      position: 'absolute',
                      top: 'var(--space-2)',
                      right: 'var(--space-2)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
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
                </div>
              ) : (
                /* Upload Area */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: '2px dashed var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-6)',
                    textAlign: 'center',
                    background: 'var(--color-bg-secondary)',
                    transition: 'all var(--transition-base)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {uploadingImage ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--space-3)'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        border: '3px solid var(--color-border-primary)',
                        borderTop: '3px solid var(--color-primary)',
                        borderRadius: 'var(--radius-full)',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)'
                      }}>
                        Processing image...
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--space-3)'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ImageIcon style={{ width: '24px', height: '24px', color: 'var(--color-text-tertiary)' }} />
                      </div>
                      <div>
                        <p style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--color-text-primary)',
                          marginBottom: 'var(--space-1)'
                        }}>
                          Upload Image
                        </p>
                        <p style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-tertiary)',
                          lineHeight: '1.4'
                        }}>
                          Drag and drop an image here, or click to browse. Supported formats: JPG, PNG, WebP.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Alt Text Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Alt Text
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Description of the image"
                style={{
                  width: '100%',
                  height: 'var(--input-height)',
                  padding: '0 var(--input-padding-x)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
                  transition: 'all var(--transition-base)'
                }}
                onKeyDown={handleKeyDown}
              />
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--space-1)'
              }}>
                Important for accessibility and SEO
              </div>
            </div>

            {/* Figcaption Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Caption (Optional)
              </label>
              <textarea
                value={figcaption}
                onChange={(e) => setFigcaption(e.target.value)}
                placeholder="Add a caption that will appear below the image"
                rows={3}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
                  transition: 'all var(--transition-base)',
                  resize: 'vertical',
                  minHeight: '80px',
                  fontFamily: 'inherit'
                }}
                onKeyDown={handleKeyDown}
              />
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--space-1)'
              }}>
                This text will appear as a caption below the image
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)'
              }}>
                {error}
              </div>
            )}


          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border-primary)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'transparent',
                border: '1px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: isLoading ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                color: 'white',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-base)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Loading...
                </>
              ) : (
                'Insert Image'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 