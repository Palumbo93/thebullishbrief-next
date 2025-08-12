"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Upload, Image as ImageIcon, Clock, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import { RichTextEditor } from './RichTextEditor';
import { StatusSelector } from './StatusSelector';
import { ToggleSwitch } from './ToggleSwitch';
import { useUploadSession } from '../../hooks/useUploadSession';
import { uploadTemporaryFeaturedImage, uploadTemporaryCompanyLogo, STORAGE_BUCKETS } from '../../lib/storage';
import { calculateReadingTime, formatReadingTime } from '../../utils/readingTime';
import { validateTickerInput } from '../../utils/tickerUtils';

interface BriefCreateModalProps {
  onClose: () => void;
}

export const BriefCreateModal: React.FC<BriefCreateModalProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<{ url: string; alt: string; tempPath?: string } | null>(null);
  const [companyLogo, setCompanyLogo] = useState<{ url: string; alt: string; tempPath?: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { sessionId, trackUpload, commitSession, cleanupSession } = useUploadSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    content: '',
    sponsored: false,
    disclaimer: '',
    featured_image_url: '',
    featured_image_alt: '',
    reading_time_minutes: 5,
    status: 'draft' as 'draft' | 'published',
    published_at: '',
    video_url: '',
    show_cta: false,
    tickers: '',
    widget_code: '',
    investor_deck_url: '',
    featured: false,
    company_name: '',
    company_logo_url: '',
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hasUnsavedChanges) {
          if (confirm('You have unsaved changes. Are you sure you want to close?')) {
            cleanupSession(); // Clean up uploaded files
            onClose();
          }
        } else {
          cleanupSession(); // Clean up uploaded files
          onClose();
        }
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmit(e as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, onClose, cleanupSession]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = 
      formData.title !== '' ||
      formData.subtitle !== '' ||
      formData.content !== '' ||
      formData.company_name !== '' ||
      formData.slug !== '' ||
      featuredImage !== null;
    setHasUnsavedChanges(hasChanges);
  }, [formData, featuredImage]);

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Auto-generate slug when title changes
      if (field === 'title' && typeof value === 'string' && value) {
        newData.slug = generateSlug(value);
      }

      return newData;
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !sessionId) return;

    setUploadingImage(true);
    try {
      const result = await uploadTemporaryFeaturedImage(file, sessionId);
      
      // Track the upload for cleanup
      trackUpload(STORAGE_BUCKETS.FEATURED_IMAGES, result.path);
      
      setFeaturedImage({
        url: result.url,
        alt: file.name,
        tempPath: result.path
      });
    } catch (error) {
      console.error('Failed to upload featured image:', error);
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

  const removeFeaturedImage = () => {
    setFeaturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!file || !sessionId) return;

    setUploadingLogo(true);
    try {
      const result = await uploadTemporaryCompanyLogo(file, sessionId);
      
      // Track the upload for cleanup
      trackUpload(STORAGE_BUCKETS.COMPANY_LOGOS, result.path);
      
      setCompanyLogo({
        url: result.url,
        alt: file.name,
        tempPath: result.path
      });
    } catch (error) {
      console.error('Failed to upload company logo:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const removeCompanyLogo = () => {
    setCompanyLogo(null);
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate reading time based on content
      const readingTimeMinutes = calculateReadingTime(formData.content);
      
      // Parse and validate tickers JSON
      const tickers = validateTickerInput(formData.tickers);
      if (formData.tickers.trim() && tickers === null) {
        alert('Invalid tickers JSON format. Please use format: [{"CSE":"SONC"},{"OTC":"SONCF"}] or {"CSE":"SONC","OTC":"SONCF"}');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from('briefs')
        .insert({
          ...formData,
          tickers,
          reading_time_minutes: readingTimeMinutes,
          featured_image_url: featuredImage?.url,
          featured_image_alt: featuredImage?.alt,
          company_logo_url: companyLogo?.url,
          published_at: formData.status === 'published' && formData.published_at ? formData.published_at : null,
        });

      if (error) {
        console.error('Error creating brief:', error);
        alert('Error creating brief: ' + error.message);
      } else {
        // Invalidate and refetch briefs
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.featured() });
        
        setHasUnsavedChanges(false);
        commitSession(); // Commit the session - files are now permanent
        onClose();
      }
    } catch (error) {
      console.error('Error creating brief:', error);
      alert('Error creating brief');
    } finally {
      setIsLoading(false);
    }
  };



  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--color-bg-primary)',
      zIndex: 'var(--z-modal)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderBottom: '0.5px solid var(--color-border-primary)',
        padding: 'var(--space-4) var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '80px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)'
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)'
            }}>
              Create New Brief
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)'
            }}>
              Write and publish your next investor brief
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}>
          {hasUnsavedChanges && (
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-warning)',
              fontStyle: 'italic'
            }}>
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            form="brief-form"
            disabled={isLoading || !formData.title.trim()}
            className="btn btn-primary"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <Save style={{ width: '16px', height: '16px' }} />
            <span>{isLoading ? 'Creating...' : 'Create Brief'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="modal-content"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 'var(--space-6)',
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-border-primary) transparent'
        }}
      >
        <style>{`
          .modal-content::-webkit-scrollbar {
            width: 8px;
          }
          .modal-content::-webkit-scrollbar-track {
            background: transparent;
          }
          .modal-content::-webkit-scrollbar-thumb {
            background: var(--color-border-primary);
            border-radius: 4px;
          }
          .modal-content::-webkit-scrollbar-thumb:hover {
            background: var(--color-border-secondary);
          }
        `}</style>
        <form id="brief-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Status */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}>
                Status
              </label>
              <StatusSelector
                value={formData.status}
                onChange={(status) => handleChange('status', status)}
              />
            </div>

            {/* Published Date */}
            {formData.status === 'published' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Published Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.published_at}
                  onChange={(e) => handleChange('published_at', e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    padding: '0 var(--space-4)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--transition-base)'
                  }}
                />
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)',
                  marginTop: 'var(--space-1)'
                }}>
                  Leave empty to publish immediately
                </p>
              </div>
            )}

            {/* Title */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '60px',
                  padding: '0 var(--space-4)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-semibold)',
                  transition: 'all var(--transition-base)'
                }}
                placeholder="Enter your brief title..."
              />
            </div>

            {/* Subtitle */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}>
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                style={{
                  width: '100%',
                  height: '50px',
                  padding: '0 var(--space-4)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-lg)',
                  transition: 'all var(--transition-base)'
                }}
                placeholder="Enter brief subtitle..."
              />
            </div>

            {/* Slug */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}>
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '50px',
                  padding: '0 var(--space-4)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
                  transition: 'all var(--transition-base)'
                }}
                placeholder="brief-slug-url"
              />
            </div>

            {/* Company Information */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)'
            }}>
              {/* Company Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
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
                  placeholder="Enter company name..."
                />
              </div>

              {/* Company Logo */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Company Logo
                </label>
                
                {/* Hidden file input for logo */}
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  style={{ display: 'none' }}
                />

                {companyLogo ? (
                  /* Logo Preview */
                  <div style={{
                    position: 'relative',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    background: 'var(--color-bg-secondary)',
                    width: '100px',
                    height: '100px'
                  }}>
                    <img
                      src={companyLogo.url}
                      alt={companyLogo.alt}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeCompanyLogo}
                      style={{
                        position: 'absolute',
                        top: 'var(--space-1)',
                        right: 'var(--space-1)',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 'var(--text-xs)'
                      }}
                    >
                      <X style={{ width: '12px', height: '12px' }} />
                    </button>
                  </div>
                ) : (
                  /* Upload Area for Logo */
                  <div
                    onClick={() => logoFileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--color-border-primary)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-4)',
                      textAlign: 'center',
                      background: 'var(--color-bg-secondary)',
                      transition: 'all var(--transition-base)',
                      cursor: 'pointer',
                      width: '100px',
                      height: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {uploadingLogo ? (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid var(--color-border-primary)',
                        borderTop: '3px solid var(--color-primary)',
                        borderRadius: 'var(--radius-full)',
                        animation: 'spin 1s linear infinite'
                      }} />
                    ) : (
                      <ImageIcon style={{ width: '24px', height: '24px', color: 'var(--color-text-tertiary)' }} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}>
                Featured Image
              </label>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {featuredImage ? (
                /* Image Preview */
                <div style={{
                  position: 'relative',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  background: 'var(--color-bg-secondary)'
                }}>
                  <img
                    src={featuredImage.url}
                    alt={featuredImage.alt}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeFeaturedImage}
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
                          Upload Featured Image
                        </p>
                        <p style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-tertiary)',
                          lineHeight: '1.4'
                        }}>
                          Drag and drop an image here, or click to browse. Recommended size: 1200x630px.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Brief Options */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)'
            }}>
              {/* Video URL */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Video URL
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleChange('video_url', e.target.value)}
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
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              {/* Investor Deck URL */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Investor Deck URL
                </label>
                <input
                  type="url"
                  value={formData.investor_deck_url}
                  onChange={(e) => handleChange('investor_deck_url', e.target.value)}
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
                  placeholder="https://example.com/deck.pdf"
                />
              </div>


            </div>

            {/* Tickers and Widget */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)'
            }}>
              {/* Tickers */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Tickers (JSON format)
                </label>
                <textarea
                  value={formData.tickers}
                  onChange={(e) => handleChange('tickers', e.target.value)}
                  rows={3}
                  placeholder='[{"CSE":"SONC"},{"OTC":"SONCF"}]'
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--transition-base)',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Widget Code */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Widget Code
                </label>
                <textarea
                  value={formData.widget_code}
                  onChange={(e) => handleChange('widget_code', e.target.value)}
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
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Disclaimer */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}>
                Disclaimer
              </label>
              <textarea
                value={formData.disclaimer}
                onChange={(e) => handleChange('disclaimer', e.target.value)}
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
                  resize: 'vertical'
                }}
                placeholder="Enter disclaimer text..."
              />
            </div>

            {/* Brief Flags */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)'
            }}>
              <ToggleSwitch
                checked={formData.sponsored}
                onChange={(checked) => handleChange('sponsored', checked)}
                label="Sponsored Content"
              />
              
              <ToggleSwitch
                checked={formData.show_cta}
                onChange={(checked) => handleChange('show_cta', checked)}
                label="Show CTA"
              />
              
              <ToggleSwitch
                checked={formData.featured}
                onChange={(checked) => handleChange('featured', checked)}
                label="Featured Brief"
              />
            </div>

            {/* Content Editor */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-3)'
              }}>
                <label style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)'
                }}>
                  Content *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)'
                }}>
                  <span>Word count: {formData.content.split(/\s+/).filter(word => word.length > 0).length}</span>
                  <span>•</span>
                  <span>Characters: {formData.content.length}</span>
                  <span>•</span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    color: 'var(--color-text-secondary)'
                  }}>
                    <Clock style={{ width: '12px', height: '12px' }} />
                    {formatReadingTime(calculateReadingTime(formData.content))}
                  </span>
                </div>
              </div>
              
              <RichTextEditor
                content={formData.content}
                onChange={(content) => handleChange('content', content)}
                placeholder="Start writing your brief content here..."
                articleId={undefined}
              />
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}; 