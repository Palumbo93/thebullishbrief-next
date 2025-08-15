import React from 'react';
import { File as FileIcon } from 'lucide-react';
import { formatFileSize } from './utils/formatters';

/**
 * FilePreview component for displaying file and image previews
 */
export interface FilePreviewProps {
  fileData: {
    name: string;
    url: string;
    size: number;
    type: string;
    preview_url?: string;
  };
  content?: string;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ 
  fileData, 
  content, 
  className = '' 
}) => {
  const isImage = fileData.type.startsWith('image/');
  
  if (isImage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} className={className}>
        <img 
          src={fileData.url} 
          alt={content || fileData.name}
          style={{
            maxWidth: '100%',
            borderRadius: 'var(--radius-xl)',
            maxHeight: '320px',
            objectFit: 'cover',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        />
        {content && (
          <p style={{
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-relaxed)',
            opacity: 0.9
          }}>
            {content}
          </p>
        )}
      </div>
    );
  }
  
  // File preview (non-image)
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        background: 'rgba(20, 20, 20, 0.2)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(31, 31, 31, 0.2)',
        cursor: 'pointer',
        transition: 'all var(--transition-base)'
      }}
      className={className}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(20, 20, 20, 0.3)';
        e.currentTarget.style.borderColor = 'rgba(31, 31, 31, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(20, 20, 20, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(31, 31, 31, 0.2)';
      }}
      onClick={() => {
        // Open file in new tab
        window.open(fileData.url, '_blank', 'noopener,noreferrer');
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <FileIcon style={{ 
          width: '20px', 
          height: '20px', 
          color: 'var(--color-brand-primary)' 
        }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: 'var(--space-1)'
        }}>
          {content || fileData.name}
        </p>
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'rgba(153, 153, 153, 0.7)',
          fontWeight: 'var(--font-medium)'
        }}>
          {formatFileSize(fileData.size)}
        </p>
      </div>
    </div>
  );
};
