"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Edit, ArrowLeft, Upload, Image as ImageIcon, Trash2, Copy, Clock, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import { RichTextEditor } from './RichTextEditor';
import { StatusSelector } from './StatusSelector';
import { ToggleSwitch } from './ToggleSwitch';
import { useUploadSession } from '../../hooks/useUploadSession';
import { uploadTemporaryFeaturedImage, uploadTemporaryCompanyLogo, moveFeaturedImageToArticle, STORAGE_BUCKETS } from '../../lib/storage';
import { calculateReadingTime, formatReadingTime } from '../../utils/readingTime';
import { validateTickerInput } from '../../utils/tickerUtils';
import { Brief } from '../../hooks/useBriefs';

interface BriefEditModalProps {
  onClose: () => void;
  brief: Brief | null;
}

export const BriefEditModal: React.FC<BriefEditModalProps> = ({ onClose, brief }) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<{ url: string; alt: string; tempPath?: string } | null>(null);
  const [companyLogo, setCompanyLogo] = useState<{ url: string; alt: string; tempPath?: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    video_url: '',
    show_cta: false,
    tickers: '',
    widget_code: '',
    investor_deck_url: '',
    featured: false,
    company_name: '',
    company_logo_url: '',
  });

  // Load brief data when modal opens
  useEffect(() => {
    if (brief) {
      setFormData({
        title: brief.title || '',
        slug: brief.slug || '',
        subtitle: brief.subtitle || '',
        content: brief.content || '',
        sponsored: brief.sponsored || false,
        disclaimer: brief.disclaimer || '',
        featured_image_url: brief.featured_image_url || '',
        featured_image_alt: brief.featured_image_alt || '',
        reading_time_minutes: brief.reading_time_minutes || 5,
        status: brief.status || 'draft',
        video_url: brief.video_url || '',
        show_cta: brief.show_cta || false,
        tickers: brief.tickers ? JSON.stringify(brief.tickers, null, 2) : '',
        widget_code: brief.widget_code || '',
        investor_deck_url: brief.investor_deck_url || '',
        featured: brief.featured || false,
        company_name: brief.company_name || '',
        company_logo_url: brief.company_logo_url || '',
      });

      // Load featured image if it exists
      if (brief.featured_image_url) {
        setFeaturedImage({
          url: brief.featured_image_url,
          alt: brief.featured_image_alt || 'Featured image'
        });
      } else {
        setFeaturedImage(null);
      }
    }
  }, [brief]);

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
    if (!brief) return;

    // Check if featured image has changed
    const originalImage = brief.featured_image_url ? {
      url: brief.featured_image_url,
      alt: brief.featured_image_alt || 'Featured image'
    } : null;
    
    const featuredImageChanged = JSON.stringify(featuredImage) !== JSON.stringify(originalImage);
    
    const hasChanges = 
      formData.title !== brief.title ||
      formData.subtitle !== (brief.subtitle || '') ||
      formData.content !== brief.content ||
      formData.status !== (brief.status || 'draft') ||
      formData.slug !== (brief.slug || '') ||
      formData.sponsored !== (brief.sponsored || false) ||
      formData.disclaimer !== (brief.disclaimer || '') ||
      formData.video_url !== (brief.video_url || '') ||
      formData.show_cta !== (brief.show_cta || false) ||
      formData.widget_code !== (brief.widget_code || '') ||
      formData.investor_deck_url !== (brief.investor_deck_url || '') ||
      formData.featured !== (brief.featured || false) ||
      formData.company_name !== (brief.company_name || '') ||
      formData.company_logo_url !== (brief.company_logo_url || '') ||
      featuredImageChanged;
    setHasUnsavedChanges(hasChanges);
  }, [formData, brief, featuredImage]);

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
    e.currentTarget.style.borderColor = 'var(--color-primary)';
    e.currentTarget.style.background = 'var(--color-bg-tertiary)';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--color-border-primary)';
    e.currentTarget.style.background = 'var(--color-bg-secondary)';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--color-border-primary)';
    e.currentTarget.style.background = 'var(--color-bg-secondary)';
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief) return;
    
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

      // Update brief data
      const { error } = await supabase
        .from('briefs')
        .update({
          ...formData,
          tickers,
          reading_time_minutes: readingTimeMinutes,
          featured_image_url: featuredImage?.url,
          featured_image_alt: featuredImage?.alt,
        })
        .eq('id', brief.id);

      if (error) {
        console.error('Error updating brief:', error);
        alert('Error updating brief: ' + error.message);
      } else {
        // If there's a temporary featured image, move it to the permanent location
        if (featuredImage?.tempPath) {
          try {
            await moveFeaturedImageToArticle(featuredImage.tempPath, brief.id);
            // Update the brief with the new image URL
            await supabase
              .from('briefs')
              .update({
                featured_image_url: featuredImage.url,
                featured_image_alt: featuredImage.alt
              })
              .eq('id', brief.id);
          } catch (error) {
            console.error('Failed to move featured image:', error);
          }
        }
        
        // Invalidate and refetch briefs
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.featured() });
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.detail(brief.slug) });
        
        setHasUnsavedChanges(false);
        commitSession(); // Commit the session - files are now permanent
        onClose();
      }
    } catch (error) {
      console.error('Error updating brief:', error);
      alert('Error updating brief');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!brief) return;
    
    try {
      const { error } = await supabase
        .from('briefs')
        .delete()
        .eq('id', brief.id);

      if (error) {
        console.error('Error deleting brief:', error);
        alert('Error deleting brief: ' + error.message);
      } else {
        // Invalidate and refetch briefs
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.featured() });
        onClose();
      }
    } catch (error) {
      console.error('Error deleting brief:', error);
      alert('Error deleting brief');
    }
  };

  if (!brief) return null;

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
              Edit Brief
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)'
            }}>
              ID: {brief.id} • Last updated: {new Date(brief.updated_at || brief.created_at || '').toLocaleDateString()}
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
            onClick={() => {
              if (confirm('Are you sure you want to delete this brief?')) {
                handleDelete();
              }
            }}
            className="btn btn-ghost"
            style={{ 
              fontSize: 'var(--text-sm)',
              color: 'var(--color-danger)'
            }}
            title="Delete Brief"
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
            <span>Delete</span>
          </button>
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
            form="brief-edit-form"
            disabled={isLoading || !formData.title.trim()}
            className="btn btn-primary"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <Save style={{ width: '16px', height: '16px' }} />
            <span>{isLoading ? 'Updating...' : 'Update Brief'}</span>
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

        <form id="brief-edit-form" onSubmit={handleSubmit}>
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

              {/* Company Logo URL */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Company Logo URL
                </label>
                <input
                  type="url"
                  value={formData.company_logo_url}
                  onChange={(e) => handleChange('company_logo_url', e.target.value)}
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
                  placeholder="https://example.com/logo.png"
                />
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
              gridTemplateColumns: '1fr 1fr 1fr',
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

              {/* Reading Time */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Reading Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.reading_time_minutes}
                  onChange={(e) => handleChange('reading_time_minutes', parseInt(e.target.value))}
                  min="1"
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <input
                  type="checkbox"
                  checked={formData.sponsored}
                  onChange={(e) => handleChange('sponsored', e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px'
                  }}
                />
                <label style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Sponsored Content
                </label>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <input
                  type="checkbox"
                  checked={formData.show_cta}
                  onChange={(e) => handleChange('show_cta', e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px'
                  }}
                />
                <label style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Show CTA
                </label>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleChange('featured', e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px'
                  }}
                />
                <label style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Featured Brief
                </label>
              </div>
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
                articleId={brief.id}
              />
            </div>

            {/* Brief Stats */}
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '0.5px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)'
            }}>
              <h3 style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}>
                Brief Statistics
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 'var(--space-4)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-tertiary)'
              }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>Views</div>
                  <div>{brief.view_count || 0}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>Reading Time</div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)'
                  }}>
                    <Clock style={{ width: '12px', height: '12px' }} />
                    {formatReadingTime(calculateReadingTime(formData.content))}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>Created</div>
                  <div>{new Date(brief.created_at || '').toLocaleDateString()}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>Last Updated</div>
                  <div>{new Date(brief.updated_at || brief.created_at || '').toLocaleDateString()}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>Status</div>
                  <div style={{ 
                    color: brief.status === 'published' ? 'var(--color-success)' : 
                           brief.status === 'draft' ? 'var(--color-warning)' : 
                           'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    fontWeight: 'var(--font-medium)'
                  }}>
                    {brief.status || 'draft'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}; 