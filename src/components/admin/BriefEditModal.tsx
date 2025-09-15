"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, Save, Image as ImageIcon, Trash2, Clock, Files, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import { useOnDemandRevalidation } from '../../hooks/useOnDemandRevalidation';
import { RichTextEditor } from './RichTextEditor';
import { StatusSelector } from './StatusSelector';
import { useEditUploadSession } from '../../hooks/useEntityUploadSession';
import { calculateReadingTime, formatReadingTime } from '../../utils/readingTime';
import { validateTickerInput } from '../../utils/tickerUtils';
import { Brief } from '../../lib/database.aliases';

interface BriefEditModalProps {
  onClose: () => void;
  brief: Brief | null;
}

export const BriefEditModal: React.FC<BriefEditModalProps> = ({ onClose, brief }) => {
  const queryClient = useQueryClient();
  const { revalidateBrief, isRevalidating } = useOnDemandRevalidation();
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<{ url: string; alt: string; path?: string } | null>(null);
  const [companyLogo, setCompanyLogo] = useState<{ url: string; alt: string; path?: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { 
    uploadDirect, 
    removeUpload 
  } = useEditUploadSession('brief', brief?.id || '');
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
    popup_featured_image: '',
    reading_time_minutes: 5,
    status: 'draft' as 'draft' | 'published',
    published_at: '',
    video_url: '',
    featured_video_thumbnail: '',
    show_cta: false,
    show_featured_media: true,
    tickers: '',
    featured: false,
    company_name: '',
    company_logo_url: '',
    // Lead generation fields
    mailchimp_audience_tag: '',
    popup_copy: '',
    brokerage_links: '',
    // Additional copy field
    additional_copy: ''
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
        popup_featured_image: brief.popup_featured_image || '',
        reading_time_minutes: brief.reading_time_minutes || 5,
        status: brief.status as 'draft' | 'published' || 'draft',
        published_at: (brief as any).published_at ? new Date((brief as any).published_at).toISOString().slice(0, 16) : '',
        video_url: brief.video_url || '',
        featured_video_thumbnail: (brief as any).featured_video_thumbnail || '',
        show_cta: brief.show_cta || false,
        show_featured_media: (brief as any).show_featured_media !== undefined ? (brief as any).show_featured_media : true,
        tickers: brief.tickers ? JSON.stringify(brief.tickers, null, 2) : '',
        featured: brief.featured || false,
        company_name: brief.company_name || '',
        company_logo_url: brief.company_logo_url || '',
        // Lead generation fields
        mailchimp_audience_tag: brief.mailchimp_audience_tag || '',
        popup_copy: brief.popup_copy ? JSON.stringify(brief.popup_copy, null, 2) : '',
        brokerage_links: brief.brokerage_links ? JSON.stringify(brief.brokerage_links, null, 2) : '',
        // Additional copy field
        additional_copy: (brief as any).additional_copy ? JSON.stringify((brief as any).additional_copy, null, 2) : JSON.stringify({ "featuredVideoTitle": "Featured Video" }, null, 2)
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
            onClose(); // Enterprise-safe: no cleanup for edit modals
          }
        } else {
          onClose(); // Enterprise-safe: no cleanup for edit modals
        }
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmit(e as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, onClose]);

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
      formData.featured_video_thumbnail !== ((brief as any).featured_video_thumbnail || '') ||
      formData.show_cta !== (brief.show_cta || false) ||
      formData.featured !== (brief.featured || false) ||
      formData.company_name !== (brief.company_name || '') ||
      formData.company_logo_url !== (brief.company_logo_url || '') ||
      formData.additional_copy !== ((brief as any).additional_copy ? JSON.stringify((brief as any).additional_copy, null, 2) : JSON.stringify({ "featuredVideoTitle": "Featured Video" }, null, 2)) ||
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
    if (!file) return;

    setUploadingImage(true);
    try {
      // Upload directly to organized final location for existing brief
      const uploadedFile = await uploadDirect(file, 'primary');
      
      setFeaturedImage({
        url: uploadedFile.url,
        alt: file.name,
        path: uploadedFile.finalPath
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
    // For edit modals: only remove from UI state, NEVER delete files from storage
    // Files belong to existing entity and should remain in storage
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
      // Parse and validate tickers JSON
      const tickers = validateTickerInput(formData.tickers);
      if (formData.tickers.trim() && tickers === null) {
        alert('Invalid tickers JSON format. Please use format: [{"CSE":"SONC"},{"OTC":"SONCF"}] or {"CSE":"SONC","OTC":"SONCF"}');
        setIsLoading(false);
        return;
      }

      // Parse and validate popup copy JSON
      let popupCopy = null;
      if (formData.popup_copy.trim()) {
        try {
          popupCopy = JSON.parse(formData.popup_copy);
        } catch (error) {
          alert('Invalid popup copy JSON format. Please check your JSON syntax.');
          setIsLoading(false);
          return;
        }
      }

      // Parse and validate brokerage links JSON
      let brokerageLinks = null;
      if (formData.brokerage_links.trim()) {
        try {
          brokerageLinks = JSON.parse(formData.brokerage_links);
        } catch (error) {
          alert('Invalid brokerage links JSON format. Please check your JSON syntax.');
          setIsLoading(false);
          return;
        }
      }

      // Parse and validate additional copy JSON
      let additionalCopy = null;
      if (formData.additional_copy.trim()) {
        try {
          additionalCopy = JSON.parse(formData.additional_copy);
        } catch (error) {
          alert('Invalid additional copy JSON format. Please check your JSON syntax.');
          setIsLoading(false);
          return;
        }
      }

      // Update brief data
      const { error } = await supabase
        .from('briefs')
        .update({
          ...formData,
          tickers,
          popup_copy: popupCopy,
          brokerage_links: brokerageLinks,
          additional_copy: additionalCopy,
          featured_image_url: featuredImage?.url,
          featured_image_alt: featuredImage?.alt,
          published_at: formData.status === 'published' && formData.published_at ? formData.published_at : null,
        })
        .eq('id', brief.id);

      if (error) {
        console.error('Error updating brief:', error);
        alert('Error updating brief: ' + error.message);
      } else {
        // Note: For edit modals using direct upload, no file moving is needed
        // Files are already uploaded to their final organized locations
        
        // Track if slug changed for build trigger message
        const slugChanged = formData.slug !== (brief.slug || '');
        
        // Invalidate and refetch briefs
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.featured() });
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.detail(brief.slug) });
        
        setHasUnsavedChanges(false);
        
        console.log('✅ Brief updated successfully:', formData.title, '- Triggering on-demand revalidation...');
        
        // Trigger on-demand revalidation for instant updates
        const revalidationResult = await revalidateBrief(formData.slug);
        if (revalidationResult.success) {
          console.log('🔄 Brief page cache updated - changes visible immediately!');
        } else {
          console.warn('⚠️ Revalidation failed, but brief was updated:', revalidationResult.error);
        }
        
        onClose(); // Files already in organized location
      }
    } catch (error) {
      console.error('Error updating brief:', error);
      alert('Error updating brief');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!brief) return;
    
    try {
      // Parse JSON fields before duplicating
      const tickers = validateTickerInput(formData.tickers);
      
      let popupCopy = null;
      if (formData.popup_copy.trim()) {
        try {
          popupCopy = JSON.parse(formData.popup_copy);
        } catch (error) {
          alert('Invalid popup copy JSON format. Please check your JSON syntax.');
          return;
        }
      }

      let brokerageLinks = null;
      if (formData.brokerage_links.trim()) {
        try {
          brokerageLinks = JSON.parse(formData.brokerage_links);
        } catch (error) {
          alert('Invalid brokerage links JSON format. Please check your JSON syntax.');
          return;
        }
      }

      let additionalCopy = null;
      if (formData.additional_copy.trim()) {
        try {
          additionalCopy = JSON.parse(formData.additional_copy);
        } catch (error) {
          alert('Invalid additional copy JSON format. Please check your JSON syntax.');
          return;
        }
      }

      // Create duplicated brief data
      const duplicatedBrief = {
        title: `${formData.title} (Copy)`,
        slug: `${formData.slug}-copy-${Date.now()}`,
        subtitle: formData.subtitle,
        content: formData.content,
        sponsored: formData.sponsored,
        disclaimer: formData.disclaimer,
        featured_image_url: formData.featured_image_url,
        featured_image_alt: formData.featured_image_alt,
        popup_featured_image: formData.popup_featured_image,
        reading_time_minutes: formData.reading_time_minutes,
        status: 'draft', // Always create duplicates as drafts
        published_at: null, // Never auto-publish duplicates
        video_url: formData.video_url,
        featured_video_thumbnail: formData.featured_video_thumbnail,
        show_cta: formData.show_cta,
        tickers,
        featured: false, // Don't duplicate as featured
        company_name: formData.company_name,
        company_logo_url: formData.company_logo_url,
        mailchimp_audience_tag: formData.mailchimp_audience_tag,
        popup_copy: popupCopy,
        brokerage_links: brokerageLinks,
        additional_copy: additionalCopy
      };

      const { data, error } = await supabase
        .from('briefs')
        .insert(duplicatedBrief)
        .select()
        .single();

      if (error) {
        console.error('Error duplicating brief:', error);
        alert('Error duplicating brief: ' + error.message);
      } else {
        // Invalidate and refetch briefs
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.featured() });
        
        alert(`Brief duplicated successfully! New brief created with ID: ${data.id}`);
        onClose();
      }
    } catch (error) {
      console.error('Error duplicating brief:', error);
      alert('Error duplicating brief');
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              flexWrap: 'wrap'
            }}>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-tertiary)',
                margin: 0
              }}>
                ID: {brief.id} • Last updated: {new Date(brief.updated_at || brief.created_at || '').toLocaleDateString()}
              </p>
              {brief.slug && (
                <a
                  href={`/briefs/${brief.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-primary)',
                    transition: 'all var(--transition-base)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                  }}
                  title={brief.status === 'published' ? 'View published brief' : 'Preview draft (admin only)'}
                >
                  <ExternalLink style={{ width: '14px', height: '14px' }} />
                  <span>{brief.status === 'published' ? 'View Live' : 'Preview'}</span>
                </a>
              )}
            </div>
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
              if (confirm('Are you sure you want to duplicate this brief? This will create a new draft copy.')) {
                handleDuplicate();
              }
            }}
            className="btn btn-ghost"
            style={{ 
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)'
            }}
            title="Duplicate Brief"
          >
            <Files style={{ width: '16px', height: '16px' }} />
            <span>Duplicate</span>
          </button>
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
              </div>
            </div>

            {/* ===== COMPANY INFORMATION ===== */}
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
                🏢 Company Information
              </h3>
              
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
                      <Image
                        src={featuredImage.url}
                        alt={featuredImage.alt}
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

                {/* Video Fields */}
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

                  {/* Featured Video Thumbnail */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      Featured Video Thumbnail
                    </label>
                    <input
                      type="url"
                      value={formData.featured_video_thumbnail}
                      onChange={(e) => handleChange('featured_video_thumbnail', e.target.value)}
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
                      placeholder="https://example.com/featured-video-thumb.jpg"
                    />
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-tertiary)',
                      marginTop: 'var(--space-1)'
                    }}>
                      Used for video thumbnail on BriefPage
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== BRIEF SETTINGS ===== */}
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
                ⚙️ Brief Settings
              </h3>
              
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
                    checked={formData.show_featured_media}
                    onChange={(e) => handleChange('show_featured_media', e.target.checked)}
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
                    Show Featured Media
                  </label>
                </div>

                {/* Reading Time */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)'
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
            </div>

            {/* ===== TRADING INFORMATION ===== */}
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
                📈 Trading Information
              </h3>
              
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
            </div>

            {/* ===== ADDITIONAL INFORMATION ===== */}
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
                📋 Additional Information
              </h3>
              
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
            </div>

            {/* Lead Generation Settings */}
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-6)'
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
                📧 Lead Generation Settings
              </h3>

              {/* Popup Featured Image URL Field */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Popup Featured Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.popup_featured_image}
                  onChange={(e) => handleChange('popup_featured_image', e.target.value)}
                  placeholder="https://example.com/popup-image.jpg"
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
                  marginTop: 'var(--space-1)',
                  lineHeight: '1.4'
                }}>
                  Optional dedicated image for the lead generation popup. If not provided, will use the main featured image.
                </p>
              </div>

              {/* Mailchimp Integration */}
              <div style={{
                marginBottom: 'var(--space-4)'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Mailchimp Audience Tag
                </label>
                <input
                  type="text"
                  value={formData.mailchimp_audience_tag}
                  onChange={(e) => handleChange('mailchimp_audience_tag', e.target.value)}
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
                  placeholder="40174992"
                />
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)',
                  marginTop: 'var(--space-1)'
                }}>
                  Mailchimp tag ID for this brief (e.g., 40174992 for Sonic Strategy)
                </p>
              </div>

              {/* Popup Copy Configuration */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-3)'
                }}>
                  <label style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)'
                  }}>
                    Popup Copy Configuration (JSON)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultCopy = {
                        headline: `Get exclusive updates on ${formData.company_name || '[Company Name]'}`,
                        subheadline: "Be the first to know about major developments",
                        submitButton: "Get Updates",
                        thankYouMessage: `You'll receive updates about ${formData.company_name || '[Company Name]'} directly in your inbox.`,
                        showPopup: true,
                        popupScrollPercentage: 70,
                        popupDelay: 2000
                      };
                      handleChange('popup_copy', JSON.stringify(defaultCopy, null, 2));
                    }}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-semibold)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    }}
                  >
                    Use Default
                  </button>
                </div>
                <textarea
                  value={formData.popup_copy}
                  onChange={(e) => handleChange('popup_copy', e.target.value)}
                  rows={8}
                  placeholder={`{
  "headline": "Get exclusive updates on ${formData.company_name || '[Company Name]'}",
  "subheadline": "Be the first to know about major developments",
  "submitButton": "Get Updates",
  "thankYouMessage": "You'll receive updates about ${formData.company_name || '[Company Name]'} directly in your inbox.",
  "showPopup": true,
  "popupScrollPercentage": 70,
  "popupDelay": 2000
}`}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-mono)',
                    transition: 'all var(--transition-base)',
                    resize: 'vertical',
                    minHeight: '200px'
                  }}
                />
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)',
                  marginTop: 'var(--space-1)'
                }}>
                  Leave empty to use default copy. JSON format with headline, subheadline, buttons, and thank you messages.
                </p>
              </div>

              {/* Brokerage Links Configuration */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-3)'
                }}>
                  <label style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)'
                  }}>
                    Brokerage Links (JSON)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultBrokerageLinks = {
                        "questrade": "https://myportal.questrade.com/investing/summary/quote/TICKER",
                        "wealthsimple": "https://www.wealthsimple.com/en-ca/trade/stock/TICKER",
                        "td": "https://webbroker.td.com/waw/brk/quote?symbol=TICKER",
                        "rbc": "https://www1.royalbank.com/cgi-bin/rbaccess/rbunxcgi?F6=1&F7=IB&F21=IB&F22=1&REQUEST=ClientApp&LANGUAGE=ENGLISH&TICKER=TICKER",
                        "cibc": "https://www.investorsedge.cibc.com/ie/showPage.do?page=research&ticker=TICKER",
                        "interactive": "https://www.interactivebrokers.com/en/index.php?f=stocks&p=north_america",
                        "bmo": "https://www.bmoinvestorline.com/SelfDirected/",
                        "scotiabank": "https://www.scotiaitrade.com/"
                      };
                      handleChange('brokerage_links', JSON.stringify(defaultBrokerageLinks, null, 2));
                    }}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-semibold)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    }}
                  >
                    Use Default
                  </button>
                </div>
                <textarea
                  value={formData.brokerage_links}
                  onChange={(e) => handleChange('brokerage_links', e.target.value)}
                  rows={6}
                  placeholder={`{
  "questrade": "https://myportal.questrade.com/investing/summary/quote/TICKER",
  "wealthsimple": "https://www.wealthsimple.com/en-ca/trade/stock/TICKER",
  "td": "https://webbroker.td.com/waw/brk/quote?symbol=TICKER",
  "rbc": "https://www1.royalbank.com/cgi-bin/rbaccess/rbunxcgi?F6=1&F7=IB&F21=IB&F22=1&REQUEST=ClientApp&LANGUAGE=ENGLISH&TICKER=TICKER",
  "cibc": "https://www.investorsedge.cibc.com/ie/showPage.do?page=research&ticker=TICKER",
  "interactive": "https://www.interactivebrokers.com/en/index.php?f=stocks&p=north_america",
  "bmo": "https://www.bmoinvestorline.com/SelfDirected/",
  "scotiabank": "https://www.scotiaitrade.com/"
}`}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-mono)',
                    transition: 'all var(--transition-base)',
                    resize: 'vertical',
                    minHeight: '150px'
                  }}
                />
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)',
                  marginTop: 'var(--space-1)'
                }}>
                  JSON object mapping brokerage IDs to direct links. Replace TICKER with actual ticker symbol.
                </p>
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
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Additional Copy Configuration */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-3)'
                  }}>
                    <label style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)'
                    }}>
                      Additional Copy Configuration (JSON)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultCopy = {
                          "featuredVideoTitle": "Featured Video"
                        };
                        handleChange('additional_copy', JSON.stringify(defaultCopy, null, 2));
                      }}
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-semibold)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      }}
                    >
                      Use Default
                    </button>
                  </div>
                  <textarea
                    value={formData.additional_copy}
                    onChange={(e) => handleChange('additional_copy', e.target.value)}
                    rows={6}
                    placeholder={`{
  "featuredVideoTitle": "Featured Video"
}`}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      background: 'var(--color-bg-tertiary)',
                      border: '0.5px solid var(--color-border-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-mono)',
                      transition: 'all var(--transition-base)',
                      resize: 'vertical',
                      minHeight: '150px'
                    }}
                  />
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-tertiary)',
                    marginTop: 'var(--space-1)'
                  }}>
                    JSON object for storing additional copy/content that can be used flexibly throughout the brief.
                  </p>
                </div>

                {/* Available Inject Keys */}
                <div style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-4)'
                }}>
                  <h4 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    📝 Available Inject Keys
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    <code style={{ 
                      padding: 'var(--space-1) var(--space-2)', 
                      backgroundColor: 'var(--color-bg-secondary)', 
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-primary)'
                    }}>
                      {'{INLINE_CTA}'}
                    </code>
                    <code style={{ 
                      padding: 'var(--space-1) var(--space-2)', 
                      backgroundColor: 'var(--color-bg-secondary)', 
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-primary)'
                    }}>
                      {'{BROKERAGE_LINKS}'}
                    </code>
                    <code style={{ 
                      padding: 'var(--space-1) var(--space-2)', 
                      backgroundColor: 'var(--color-bg-secondary)', 
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-primary)'
                    }}>
                      {'{FEATURED_VIDEO}'}
                    </code>
                    <code style={{ 
                      padding: 'var(--space-1) var(--space-2)', 
                      backgroundColor: 'var(--color-bg-secondary)', 
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-primary)'
                    }}>
                      {'{TRADING_VIEW}'}
                    </code>
                  </div>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-tertiary)',
                    marginTop: 'var(--space-2)',
                    fontStyle: 'italic'
                  }}>
                    Copy and paste these keys into your content where you want dynamic components to appear. {'{INLINE_CTA}'} injects BriefLeadGenWidget, {'{BROKERAGE_LINKS}'} injects BrokerageWidget, {'{FEATURED_VIDEO}'} injects FeaturedVideoWidget, and {'{TRADING_VIEW}'} injects TradingViewWidget (all mobile-only).
                  </p>
                </div>

                {/* Main Content Editor */}
                <div>
                  <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-3)'
                  }}
                  >
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
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
                    placeholder="Start writing your brief content here..."
                    articleId={brief.id}
                    entityType="brief"
                  />
                </div>
              </div>
            </div>


            {/* ===== BRIEF STATISTICS ===== */}
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
                📊 Brief Statistics
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