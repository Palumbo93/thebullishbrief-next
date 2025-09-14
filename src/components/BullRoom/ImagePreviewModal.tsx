import React from 'react';
import { createPortal } from 'react-dom';
import { Download, ExternalLink, X } from 'lucide-react';
import Image from 'next/image';
import { ActionButton } from './ActionButton';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName;
    link.click();
  };

  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--color-bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000000,
      padding: 'var(--space-4)'
    }}>
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
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-1) var(--space-1)',
          backdropFilter: 'blur(8px)',
          transition: 'all var(--transition-base)'
        }}>
          <ActionButton
            icon={Download}
            label="Download"
            variant="secondary"
            onClick={handleDownload}
          />
          <ActionButton
            icon={ExternalLink}
            label="Open in new tab"
            variant="secondary"
            onClick={handleOpenInNewTab}
          />
          <ActionButton
            icon={X}
            label="Close"
            variant="secondary"
            onClick={onClose}
          />
        </div>
      </div>

      <div style={{
        position: 'relative',
        maxWidth: window.innerWidth <= 768 ? '95vw' : '60vw',
        maxHeight: window.innerWidth <= 768 ? '80vh' : '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Image
          src={imageUrl}
          alt={imageName}
          fill
          style={{
            objectFit: 'contain',
            borderRadius: 'var(--radius-lg)',
          }}
        />
      </div>
    </div>,
    document.body
  );
};
