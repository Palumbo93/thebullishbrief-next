import React, { useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { useConfirmContext } from '../contexts/ConfirmContext';

/**
 * Container component that renders all active confirmation dialogs
 * Uses similar styling to Toast but as a modal overlay
 */
export const ConfirmModal: React.FC = () => {
  const { confirms, removeConfirm } = useConfirmContext();
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirms.length > 0) {
        const latestConfirm = confirms[confirms.length - 1];
        latestConfirm.onCancel?.();
        removeConfirm(latestConfirm.id);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [confirms, removeConfirm]);

  if (confirms.length === 0) {
    return null;
  }

  // Only show the latest confirmation (single modal at a time)
  const currentConfirm = confirms[confirms.length - 1];

  const handleConfirm = async () => {
    if (isLoading) return; // Prevent multiple clicks while loading
    
    setIsLoading(true);
    try {
      await currentConfirm.onConfirm();
    } catch (error) {
      console.error('Error in confirmation handler:', error);
    } finally {
      setIsLoading(false);
      removeConfirm(currentConfirm.id);
    }
  };

  const handleCancel = () => {
    currentConfirm.onCancel?.();
    removeConfirm(currentConfirm.id);
  };

  const getVariantStyles = () => {
    switch (currentConfirm.variant) {
      case 'danger':
        return {
          iconColor: '#ef4444',
          icon: AlertTriangle,
          confirmButtonBg: '#ef4444',
        };
      case 'warning':
        return {
          iconColor: '#f59e0b',
          icon: AlertCircle,
          confirmButtonBg: '#f59e0b',
        };
      default:
        return {
          iconColor: '#3b82f6',
          icon: Info,
          confirmButtonBg: '#3b82f6',
        };
    }
  };

  const { iconColor, icon: IconComponent, confirmButtonBg } = getVariantStyles();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 15000, // Higher than toasts
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out forwards',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          maxWidth: '480px',
          width: '90%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'modalSlideIn 0.3s ease-out forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-4)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            background: `${iconColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IconComponent style={{ 
              width: '24px', 
              height: '24px', 
              color: iconColor 
            }} />
          </div>
          
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
              lineHeight: 1.3,
            }}>
              {currentConfirm.title}
            </h3>
            
            <div style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              margin: 0,
              whiteSpace: 'pre-line',
            }}>
              {currentConfirm.message}
            </div>
          </div>

          <button
            onClick={handleCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-base)',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-tertiary)';
            }}
            aria-label="Close"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'flex-end',
          marginTop: 'var(--space-6)',
        }}>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border-primary)',
              color: isLoading ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-base)',
              minWidth: '80px',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              if (!isLoading) {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              }
            }}
            onMouseLeave={e => {
              if (!isLoading) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {currentConfirm.cancelText}
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            style={{
              background: confirmButtonBg,
              border: 'none',
              color: 'white',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-base)',
              minWidth: '80px',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
            }}
            onMouseEnter={e => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={e => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {isLoading && (
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            )}
            {isLoading ? 'Loading...' : currentConfirm.confirmText}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes modalSlideIn {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
