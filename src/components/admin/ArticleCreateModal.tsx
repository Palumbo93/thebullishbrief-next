"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, FileText, ArrowLeft, Upload, Image as ImageIcon, Clock } from 'lucide-react';
import { useCategories } from '../../hooks/useDatabase';
import { useAuthors } from '../../hooks/useDatabase';
import { TagSelectorButton } from './TagSelectorButton';
import { RichTextEditor } from './RichTextEditor';
import { StatusSelector } from './StatusSelector';
import { useUploadSession } from '../../hooks/useUploadSession';
import { uploadTemporaryFeaturedImage, moveFeaturedImageToArticle, STORAGE_BUCKETS } from '../../lib/storage';
import { calculateReadingTime, formatReadingTime } from '../../utils/readingTime';

interface Article {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  author: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  view_count: number;
  slug?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
}

interface ModalArticle {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  author: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  tags?: string[];
  reading_time_minutes?: number;
}

interface ArticleCreateModalProps {
  onClose: () => void;
  onCreate: (data: Partial<ModalArticle>) => Promise<void>;
}

export const ArticleCreateModal: React.FC<ArticleCreateModalProps> = ({ onClose, onCreate }) => {
  // Fetch categories and authors for dropdowns
  const { data: categories } = useCategories();
  const { data: authors } = useAuthors();
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    author: '',
    category: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    published_at: new Date().toISOString().slice(0, 16), // Default to today
    slug: '',
    featured_image_url: '',
    featured_image_alt: ''
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<{ url: string; alt: string; tempPath?: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { sessionId, trackUpload, commitSession, cleanupSession } = useUploadSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      formData.author !== '' ||
      formData.category !== '' ||
      formData.published_at !== '' ||
      formData.slug !== '' ||
      featuredImage !== null ||
      selectedTags.length > 0;
    setHasUnsavedChanges(hasChanges);
  }, [formData, selectedTags, featuredImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate reading time based on content
      const readingTimeMinutes = calculateReadingTime(formData.content);
      
      const articleData = {
        ...formData,
        tags: selectedTags,
        featured_image_url: featuredImage?.url,
        featured_image_alt: featuredImage?.alt,
        reading_time_minutes: readingTimeMinutes
      };
      await onCreate(articleData);
      setHasUnsavedChanges(false);
      commitSession(); // Commit the session - files are now permanent
    } catch (error) {
      console.error('Error creating article:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = {
      ...prev,
      [field]: value
      };

      // Auto-generate slug when title changes
      if (field === 'title' && value) {
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
              Create New Article
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)'
            }}>
              Write and publish your next article
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
            form="article-form"
            disabled={loading || !formData.title.trim()}
            className="btn btn-primary"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <Save style={{ width: '16px', height: '16px' }} />
            <span>{loading ? 'Creating...' : 'Create Article'}</span>
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
        <form id="article-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            
            {/* ===== PUBLISHING SETTINGS ===== */}
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                📝 Publishing Settings
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-tertiary)',
                    marginTop: 'var(--space-1)'
                  }}>
                    Leave empty to use current date/time
                  </p>
                </div>
              </div>
            </div>

            {/* ===== BASIC INFORMATION ===== */}
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                📄 Basic Information
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                    placeholder="Enter your article title..."
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
                    placeholder="Enter article subtitle..."
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
                    placeholder="article-slug-url"
                  />
                </div>
              </div>
            </div>

            {/* ===== MEDIA ASSETS ===== */}
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                🎬 Media Assets
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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

              </div>
            </div>

            {/* ===== ARTICLE METADATA ===== */}
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                📊 Article Metadata
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Author and Category Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-4)'
                }}>
                  {/* Author */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      Author *
                    </label>
                    <select
                      value={formData.author}
                      onChange={(e) => handleChange('author', e.target.value)}
                      required
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
                    >
                      <option value="">Select an author...</option>
                      {authors?.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      required
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
                    >
                      <option value="">Select a category...</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-3)'
                  }}>
                    Tags
                  </label>
                  <TagSelectorButton
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                    placeholder="Select tags for this article..."
                    maxTags={5}
                  />
                </div>
              </div>
            </div>

            {/* ===== CONTENT ===== */}
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-4)'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}>
                  ✏️ Content *
                </h3>
              </div>
              
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
                    Main Content *
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
                  placeholder="Start writing your article content here..."
                  articleId={undefined}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}; 