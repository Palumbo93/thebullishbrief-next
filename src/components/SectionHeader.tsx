import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  showBackButton = false, 
  onBackClick 
}) => {
  return (
    <div style={{
      padding: 'var(--space-4)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
      }}>
        {showBackButton ? (
          <button 
            onClick={onBackClick}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              transition: 'background var(--transition-base), color var(--transition-base)',
              marginRight: 'var(--space-3)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Back"
          >
            <ArrowLeft style={{ width: '24px', height: '24px' }} />
          </button>
        ) : (
          <div style={{
            height: '40px',
          }} />
        )}
        
        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-bold)',
          margin: 0,
          color: 'var(--color-text-primary)',
        }}>
          {title}
        </h2>
      </div>
    </div>
  );
}; 