import React from 'react';
import { createPortal } from 'react-dom';
import { Download, ExternalLink, X } from 'lucide-react';
import Image from 'next/image';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt?: string;
  imageName?: string;
}

/**
 * Reusable Image Zoom Modal Component
 * 
 * Features:
 * - Full screen image viewing with zoom capability
 * - Download and open in new tab functionality
 * - Keyboard navigation (ESC to close)
 * - Click outside to close
 * - Mobile-optimized sizing
 */
export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageAlt = 'Image',
  imageName
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Handle keyboard events
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset loaded state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsLoaded(false);
    }
  }, [isOpen, imageUrl]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (isDownloading) return; // Prevent multiple simultaneous downloads
    
    setIsDownloading(true);
    try {
      // For cross-origin images, we need to fetch the image as a blob
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from URL or use provided name
      let filename = imageName || 'image';
      if (!filename.includes('.')) {
        // Try to get extension from the original URL
        const urlPath = imageUrl.split('?')[0]; // Remove query params
        const extension = urlPath.split('.').pop()?.toLowerCase();
        if (extension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
          filename = `${filename}.${extension}`;
        } else {
          // Default to jpg if we can't determine the type
          filename = `${filename}.jpg`;
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: try opening in new tab
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <>
      {/* CSS Animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000000,
          padding: 'var(--space-4)',
          cursor: 'pointer'
        }}
        onClick={handleBackdropClick}
      >
      {/* Action Dock Container */}
      <div style={{
        position: 'absolute',
        top: 'var(--space-4)',
        left: 'var(--space-4)',
        right: 'var(--space-4)',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        {/* Action Dock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          background: 'rgba(20, 20, 20, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-1) var(--space-1)',
          backdropFilter: 'blur(12px)',
          transition: 'all var(--transition-base)'
        }}>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              color: isDownloading ? 'rgba(255, 255, 255, 0.5)' : 'white',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              if (!isDownloading) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title={isDownloading ? "Downloading..." : "Download image"}
          >
            {isDownloading ? (
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <Download style={{ width: '18px', height: '18px' }} />
            )}
          </button>
          
          <button
            onClick={handleOpenInNewTab}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="Open in new tab"
          >
            <ExternalLink style={{ width: '18px', height: '18px' }} />
          </button>
          
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="Close"
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: 'var(--text-sm)'
        }}>
          Loading...
        </div>
      )}

      {/* Image Container */}
      <div style={{
        position: 'relative',
        maxWidth: typeof window !== 'undefined' && window.innerWidth <= 768 ? '95vw' : '90vw',
        maxHeight: typeof window !== 'undefined' && window.innerWidth <= 768 ? '80vh' : '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default'
      }}>
        <Image
          src={imageUrl}
          alt={imageAlt || ''}
          fill
          style={{
            objectFit: 'contain',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity var(--transition-base)'
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)} // Show even if error occurs
        />
      </div>
      </div>
    </>,
    document.body
  );
};
