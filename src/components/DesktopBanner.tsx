import React from 'react';
import { ArrowLeft, Share, Bookmark } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DesktopBannerAction {
  type: 'back' | 'share' | 'bookmark';
  onClick: () => void;
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

interface DesktopBannerProps {
  title: string;
  subtitle?: string;
  actions: DesktopBannerAction[];
  isScrolled?: boolean;
  maxWidth?: string;
}

/**
 * DesktopBanner - Desktop-only banner component for article and brief pages
 * 
 * Provides navigation and action buttons in a sticky header format.
 * Hidden on mobile devices where MobileHeader is used instead.
 */
export const DesktopBanner: React.FC<DesktopBannerProps> = ({
  title,
  subtitle,
  actions,
  isScrolled = false,
  maxWidth = 'none'
}) => {
  const { theme } = useTheme();

  const getBannerStyles = () => {


    return {
      display: 'flex',
      alignItems: 'center',
      background: isScrolled ? 'var(--color-bg-primary)' : 'transparent',
      height: '56px',
      position: 'sticky' as const,
      margin: '0 0 0 0',
      top: 0,
      zIndex: 20,
      transition: 'background var(--transition-base)',
    };
  };

  const getContainerStyles = () => {
    return {
      display: 'flex',
      alignItems: 'center',
      color: 'var(--color-text-primary)',
      padding: '0 var(--content-padding)',
      maxWidth: maxWidth,
      width: '100%',
      margin: '0 auto',
    };
  };

  const getTitleStyles = () => {
    return {
      fontWeight: 'bold' as const,
      fontSize: '1.25rem',
      letterSpacing: '-0.01em',
      textAlign: 'left' as const,
      flex: 1,
    };
  };

  const getActionButtonStyles = (action: DesktopBannerAction) => {
    const buttonBackground = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const baseStyles = {
      background: action.type === 'back' ? 'transparent' : buttonBackground,
      border: 'none',
      color: action.active ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
      cursor: action.disabled || action.loading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-lg)',
      transition: 'all var(--transition-base)',
      opacity: action.disabled ? 0.7 : 1,
      backdropFilter: action.type === 'back' ? 'none' : 'blur(10px)',
    };

    if (action.type === 'back') {
      return {
        ...baseStyles,
        width: '40px',
        height: '40px',
        marginRight: 'var(--space-4)',
      };
    }

    return {
      ...baseStyles,
      padding: 'var(--space-2)',
    };
  };

  const getActionIcon = (type: DesktopBannerAction['type']) => {
    const icons = {
      back: ArrowLeft,
      share: Share,
      bookmark: Bookmark
    };
    return icons[type];
  };

  const getActionAriaLabel = (type: DesktopBannerAction['type']) => {
    const labels = {
      back: 'Go back',
      share: 'Share content',
      bookmark: 'Bookmark content'
    };
    return labels[type];
  };

  const handleActionMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, action: DesktopBannerAction) => {
    if (action.disabled || action.loading) return;

    const target = e.currentTarget;
    const hoverColor = theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    const buttonHoverColor = theme === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)';
    
    if (action.type === 'back') {
      target.style.background = hoverColor;
    } else {
      target.style.background = buttonHoverColor;
    }
  };

  const handleActionMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, action: DesktopBannerAction) => {
    if (action.disabled || action.loading) return;

    const target = e.currentTarget;
    const buttonColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    if (action.type === 'back') {
      target.style.background = 'transparent';
    } else {
      target.style.background = buttonColor;
    }
  };

  // Separate back action from other actions
  const backAction = actions.find(action => action.type === 'back');
  const otherActions = actions.filter(action => action.type !== 'back');

  return (
    <>
      <style>{`
        .desktop-banner {
          display: block;
        }
        
        /* Hide on mobile */
        @media (max-width: 768px) {
          .desktop-banner {
            display: none !important;
          }
        }
      `}</style>

      <div className="desktop-banner" style={getBannerStyles()}>
        <div style={getContainerStyles()}>
          {/* Back Button */}
          {backAction && (
            <button
              style={getActionButtonStyles(backAction)}
              onClick={backAction.disabled || backAction.loading ? undefined : backAction.onClick}
              onMouseEnter={(e) => handleActionMouseEnter(e, backAction)}
              onMouseLeave={(e) => handleActionMouseLeave(e, backAction)}
              aria-label={getActionAriaLabel(backAction.type)}
              disabled={backAction.disabled || backAction.loading}
              type="button"
            >
              {backAction.loading ? (
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                React.createElement(getActionIcon(backAction.type), { 
                  style: { width: '24px', height: '24px' } 
                })
              )}
            </button>
          )}

          {/* Title */}
          <div style={getTitleStyles()}>
            {title}
            {subtitle && (
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                fontWeight: 'normal',
                marginTop: '2px'
              }}>
                {subtitle}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {otherActions.map((action, index) => {
              const Icon = getActionIcon(action.type);
              return (
                <button
                  key={`${action.type}-${index}`}
                  style={getActionButtonStyles(action)}
                  onClick={action.disabled || action.loading ? undefined : action.onClick}
                  onMouseEnter={(e) => handleActionMouseEnter(e, action)}
                  onMouseLeave={(e) => handleActionMouseLeave(e, action)}
                  aria-label={getActionAriaLabel(action.type)}
                  disabled={action.disabled || action.loading}
                  type="button"
                  title={action.active && action.type === 'bookmark' ? 'Remove bookmark' : getActionAriaLabel(action.type)}
                >
                  {action.loading ? (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <Icon style={{ 
                      width: '18px', 
                      height: '18px',
                      fill: action.active && action.type === 'bookmark' ? 'currentColor' : 'none'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
