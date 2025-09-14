"use client";

import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { FormField } from './EditModal';
import { generateSlug } from '../../lib/utils';
import { useCreateUploadSession } from '../../hooks/useEntityUploadSession';

export interface CreateModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  onCreate: (data: Partial<T> & { id?: string }) => Promise<void>;
  imageUpload?: {
    fieldKey: string;
    bucket: string;
    placeholder?: string;
  };
  bannerUpload?: {
    fieldKey: string;
    bucket: string;
    placeholder?: string;
  };
}

export function CreateModal<T>({
  isOpen,
  onClose,
  title,
  fields,
  onCreate,
  imageUpload,
  bannerUpload
}: CreateModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{ url: string; alt: string; path?: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedBanner, setUploadedBanner] = useState<{ url: string; alt: string; path?: string } | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const { 
    entityId, 
    initializeSession, 
    uploadDirect, 
    removeUpload, 
    commitCreate 
  } = useCreateUploadSession('author');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Initialize upload session
  const initializeRef = useRef(false);
  React.useEffect(() => {
    if (isOpen && !initializeRef.current) {
      initializeRef.current = true;
      initializeSession();
    }
  }, [isOpen]);

  // Initialize form data only once when modal first opens
  React.useEffect(() => {
    if (isOpen && !hasInitialized) {
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        let value = field.defaultValue ?? '';
        
        // Convert boolean values to strings for select fields
        if (field.type === 'select' && typeof value === 'boolean') {
          value = value.toString();
        }
        
        initialData[field.key] = value;
      });
      setFormData(initialData);
      setHasInitialized(true);
    }
  }, [isOpen, fields, hasInitialized]);

  // Reset initialization flag when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false);
    }
  }, [isOpen]);

  // Handle form field changes
  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [key]: value
      };

      // Auto-generate slug when name/title changes
      if (key === 'name' || key === 'title') {
        const slugField = fields.find(field => field.key === 'slug');
        if (slugField && value) {
          newData.slug = generateSlug(value);
        }
      }

      return newData;
    });
  };

  // Image upload functions
  const handleFileUpload = async (file: File) => {
    if (!file || !entityId || !imageUpload) return;

    setUploadingImage(true);
    try {
      // Upload directly to organized final location (avatar/primary image)
      const uploadedFile = await uploadDirect(file, 'primary');
      
      setUploadedImage({
        url: uploadedFile.url,
        alt: file.name,
        path: uploadedFile.finalPath
      });
      
      // Update form data with the image URL
      setFormData(prev => ({
        ...prev,
        [imageUpload.fieldKey]: uploadedFile.url
      }));
    } catch (error) {
      console.error('Failed to upload image:', error);
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

  const removeUploadedImage = async () => {
    if (uploadedImage?.url) {
      try {
        await removeUpload(uploadedImage.url);
      } catch (error) {
        console.error('Failed to remove uploaded image from storage:', error);
      }
    }
    
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clear the image URL from form data
    if (imageUpload) {
      setFormData(prev => ({
        ...prev,
        [imageUpload.fieldKey]: ''
      }));
    }
  };

  // Banner upload functions
  const handleBannerUpload = async (file: File) => {
    if (!file || !entityId || !bannerUpload) return;

    setUploadingBanner(true);
    try {
      // Upload directly to organized final location (banner/secondary image)
      const uploadedFile = await uploadDirect(file, 'secondary');
      
      setUploadedBanner({
        url: uploadedFile.url,
        alt: file.name,
        path: uploadedFile.finalPath
      });
      
      // Update form data with the banner URL
      setFormData(prev => ({
        ...prev,
        [bannerUpload.fieldKey]: uploadedFile.url
      }));
    } catch (error) {
      console.error('Failed to upload banner:', error);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleBannerUpload(file);
    }
  };

  const handleBannerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)';
    (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-tertiary)';
  };

  const handleBannerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-primary)';
    (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-secondary)';
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-primary)';
    (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-secondary)';
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleBannerUpload(file);
    }
  };

  const removeUploadedBanner = async () => {
    if (uploadedBanner?.url) {
      try {
        await removeUpload(uploadedBanner.url);
      } catch (error) {
        console.error('Failed to remove uploaded banner from storage:', error);
      }
    }
    
    setUploadedBanner(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }
    // Clear the banner URL from form data
    if (bannerUpload) {
      setFormData(prev => ({
        ...prev,
        [bannerUpload.fieldKey]: ''
      }));
    }
  };

  // Handle create
  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // Create author with pre-generated UUID (files already in organized location)
      const finalData = { 
        ...formData,
        ...(entityId && { id: entityId }) // Use pre-generated UUID if available
      } as Partial<T> & { id?: string };
      await onCreate(finalData);
      
      // Clear form data after successful creation
      setFormData({});
      setHasInitialized(false);
      setUploadedImage(null);
      setUploadedBanner(null);
      commitCreate(); // Commit the session - files are now permanent
      onClose();
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    // Enterprise-safe: no immediate cleanup for create modals
    onClose();
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleCreate();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, formData]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 'var(--z-modal-overlay)'
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        // Clear form data when clicking backdrop
        setFormData({});
        setHasInitialized(false);
        onClose();
      }
    }}
    >
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-6)',
          borderBottom: '0.5px solid var(--color-border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)'
            }}>
              {title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-ghost"
            style={{
              padding: 'var(--space-2)',
              fontSize: 'var(--text-sm)'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: 'var(--space-6)',
          flex: 1,
          overflow: 'auto'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-6)'
          }}>
            {/* Image Upload Section */}
            {imageUpload && (
              <div style={{ width: '100%' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {imageUpload.placeholder || 'Upload Image'}
                </label>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {uploadedImage ? (
                  /* Image Preview */
                  <div style={{
                    position: 'relative',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    background: 'var(--color-bg-secondary)'
                  }}>
                    <Image
                      src={uploadedImage.url}
                      alt={uploadedImage.alt}
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
                      onClick={removeUploadedImage}
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
                          Uploading image...
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
                            Drag and drop an image here, or click to browse.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Banner Upload Section */}
            {bannerUpload && (
              <div style={{ width: '100%' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {bannerUpload.placeholder || 'Upload Banner'}
                </label>
                
                {/* Hidden file input */}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileSelect}
                  style={{ display: 'none' }}
                />

                {uploadedBanner ? (
                  /* Banner Preview */
                  <div style={{
                    position: 'relative',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    background: 'var(--color-bg-secondary)'
                  }}>
                    <Image
                      src={uploadedBanner.url}
                      alt={uploadedBanner.alt}
                      width={400}
                      height={150}
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeUploadedBanner}
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
                  /* Banner Upload Area */
                  <div
                    onClick={() => bannerInputRef.current?.click()}
                    onDragOver={handleBannerDragOver}
                    onDragLeave={handleBannerDragLeave}
                    onDrop={handleBannerDrop}
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
                    {uploadingBanner ? (
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
                          Uploading banner...
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
                            Upload Banner
                          </p>
                          <p style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-tertiary)',
                            lineHeight: '1.4'
                          }}>
                            Drag and drop a banner image here, or click to browse. Recommended: 1500x500px.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Regular fields in grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-6)'
            }}>
              {fields.filter(field => field.type !== 'textarea').map((field) => (
                <div key={field.key}>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    {field.label}
                    {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      style={{
                        width: '100%',
                        height: 'var(--input-height)',
                        padding: '0 var(--space-3)',
                        background: 'var(--color-bg-tertiary)',
                        border: '0.5px solid var(--color-border-primary)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--text-base)'
                      }}
                    >
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={formData[field.key] || false}
                      onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px',
                        marginRight: 'var(--space-2)'
                      }}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%',
                        height: 'var(--input-height)',
                        padding: '0 var(--space-3)',
                        background: 'var(--color-bg-tertiary)',
                        border: '0.5px solid var(--color-border-primary)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--text-base)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Textarea fields on their own lines */}
            {fields.filter(field => field.type === 'textarea').map((field) => (
              <div key={field.key} style={{ width: '100%' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {field.label}
                  {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
                </label>
                
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.rows || 4}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    resize: 'vertical'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: 'var(--space-6)',
          borderTop: '0.5px solid var(--color-border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 'var(--space-3)'
        }}>
          <button
            onClick={() => {
              // Clear form data when canceling
              setFormData({});
              setHasInitialized(false);
              onClose();
            }}
            disabled={isCreating}
            className="btn btn-secondary"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="btn btn-primary"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
} 