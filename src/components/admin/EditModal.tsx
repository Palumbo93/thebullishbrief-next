import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { generateSlug } from '../../lib/utils';
import { useEditUploadSession } from '../../hooks/useEntityUploadSession';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox';
  defaultValue?: string | boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export interface EditModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  item: T | null;
  fields: FormField[];
  onSave: (id: string, data: Partial<T>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (item: T) => Promise<void>;
  getItemId: (item: T) => string;
  loading?: boolean;
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

export function EditModal<T>({
  isOpen,
  onClose,
  title,
  subtitle,
  item,
  fields,
  onSave,
  onDelete,
  onDuplicate,
  getItemId,
  loading = false,
  imageUpload,
  bannerUpload
}: EditModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{ url: string; alt: string; path?: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedBanner, setUploadedBanner] = useState<{ url: string; alt: string; path?: string } | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const { 
    uploadDirect, 
    removeUpload 
  } = useEditUploadSession('author', item ? getItemId(item) : '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        let value = field.defaultValue ?? (item as any)[field.key] ?? '';
        
        // Convert boolean values to strings for select fields
        if (field.type === 'select' && typeof value === 'boolean') {
          value = value.toString();
        }
        
        initialData[field.key] = value;
      });
      setFormData(initialData);
      
      // Initialize uploaded image if imageUpload is configured
      if (imageUpload && (item as any)[imageUpload.fieldKey]) {
        setUploadedImage({
          url: (item as any)[imageUpload.fieldKey],
          alt: 'Uploaded image'
        });
      } else {
        setUploadedImage(null);
      }

      // Initialize uploaded banner if bannerUpload is configured
      if (bannerUpload && (item as any)[bannerUpload.fieldKey]) {
        setUploadedBanner({
          url: (item as any)[bannerUpload.fieldKey],
          alt: 'Uploaded banner'
        });
      } else {
        setUploadedBanner(null);
      }
    }
  }, [item, fields, imageUpload, bannerUpload]);

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

  // Handle save
  const handleSave = async () => {
    if (!item) return;
    
    setIsSaving(true);
    try {
      await onSave(getItemId(item), formData as Partial<T>);
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!item) return;
    
    setIsDeleting(true);
    try {
      await onDelete(getItemId(item));
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Image upload functions
  const handleFileUpload = async (file: File) => {
    if (!file || !imageUpload) return;

    setUploadingImage(true);
    try {
      // Upload directly to organized final location for existing author (avatar/primary image)
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

  const removeUploadedImage = () => {
    // For edit modals: only remove from UI state, NEVER delete files from storage
    // Files belong to existing entity and should remain in storage
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
    if (!file || !bannerUpload) return;

    setUploadingBanner(true);
    try {
      // Upload directly to organized final location for existing author (banner/secondary image)
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

  const removeUploadedBanner = () => {
    // For edit modals: only remove from UI state, NEVER delete files from storage
    // Files belong to existing entity and should remain in storage
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

  // Handle duplicate
  const handleDuplicate = async () => {
    if (!item) return;
    
    setIsDuplicating(true);
    try {
      await onDuplicate(item);
      onClose();
    } catch (error) {
      console.error('Error duplicating item:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, formData]);

  if (!isOpen || !item) return null;

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
      zIndex: 1000
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
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
            {subtitle && (
              <p style={{
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-sm)'
              }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
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
                    <img
                      src={uploadedImage.url}
                      alt={uploadedImage.alt}
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
                    <img
                      src={uploadedBanner.url}
                      alt={uploadedBanner.alt}
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
          justifyContent: 'space-between',
          gap: 'var(--space-3)'
        }}>
          <div style={{
            display: 'flex',
            gap: 'var(--space-3)'
          }}>
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating || isSaving || isDeleting}
              className="btn btn-secondary"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              <Copy style={{ width: '16px', height: '16px' }} />
              <span>{isDuplicating ? 'Duplicating...' : 'Duplicate'}</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || isSaving || isDuplicating}
              className="btn btn-error"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              <Trash2 style={{ width: '16px', height: '16px' }} />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
          <div style={{
            display: 'flex',
            gap: 'var(--space-3)'
          }}>
            <button
              onClick={onClose}
              disabled={isSaving || isDeleting || isDuplicating}
              className="btn btn-secondary"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isDeleting || isDuplicating}
              className="btn btn-primary"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 