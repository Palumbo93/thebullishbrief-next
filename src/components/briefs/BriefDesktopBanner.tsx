import React from 'react';
import { ArrowLeft, Share, Bookmark } from 'lucide-react';
import { getTickers } from '../../utils/tickerUtils';
import { CompanyLogoImage } from '../ui/OptimizedImage';

interface BriefDesktopBannerAction {
  type: 'back' | 'share' | 'bookmark';
  onClick: () => void;
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

interface BriefDesktopBannerProps {
  companyName?: string;
  companyLogoUrl?: string;
  tickers?: any;
  actions: BriefDesktopBannerAction[];
  isScrolled?: boolean;
}

/**
 * BriefDesktopBanner - Desktop-only banner component specifically for brief pages
 * 
 * Displays company branding (logo, name, ticker badges) and action buttons.
 * Matches the mobile header branding design but in a desktop banner format.
 * Hidden on mobile devices where MobileHeader is used instead.
 */
export const BriefDesktopBanner: React.FC<BriefDesktopBannerProps> = ({
  companyName,
  companyLogoUrl,
  tickers,
  actions,
  isScrolled = false
}) => {
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
      backdropFilter: 'blur(10px)',
      transition: 'background var(--transition-base)',
    };
  };

  const getContainerStyles = () => {
    return {
      display: 'flex',
      alignItems: 'center',
      color: 'var(--color-text-primary)',
      padding: '0 var(--content-padding)',
      maxWidth: '800px',
      width: '100%',
      margin: '0 auto',
    };
  };

  const getCompanyInfoStyles = () => {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      flex: 1
    };
  };

  const getCompanyNameStyles = () => {
    return {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-medium)',
      color: 'var(--color-text-primary)'
    };
  };

  const getTickersContainerStyles = () => {
    return {
      fontSize: 'var(--text-xs)',
      color: 'var(--color-text-tertiary)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      flexWrap: 'wrap' as const
    };
  };

  const getTickerBadgeStyles = () => {
    return {
      background: 'var(--color-bg-tertiary)',
      padding: '2px 6px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.7rem',
      fontWeight: 'var(--font-medium)',
      color: 'var(--color-text-secondary)'
    };
  };

  const getBackButtonStyles = () => {
    return {
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
      marginRight: 'var(--space-4)',
    };
  };

  const getActionButtonStyles = () => {
    return {
      background: 'var(--color-bg-tertiary)',
      border: 'none',
      color: 'var(--color-text-primary)',
      padding: 'var(--space-2)',
      borderRadius: 'var(--radius-lg)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(10px)',
      transition: 'background var(--transition-base)'
    };
  };

  const getActionIcon = (type: BriefDesktopBannerAction['type']) => {
    const icons = {
      back: ArrowLeft,
      share: Share,
      bookmark: Bookmark
    };
    return icons[type];
  };

  const getActionAriaLabel = (type: BriefDesktopBannerAction['type']) => {
    const labels = {
      back: 'Go back',
      share: 'Share brief',
      bookmark: 'Bookmark brief'
    };
    return labels[type];
  };

  const handleBackButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'var(--color-bg-tertiary)';
  };

  const handleBackButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'transparent';
  };

  const handleActionButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'var(--color-bg-card-hover)';
  };

  const handleActionButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'var(--color-bg-tertiary)';
  };

  // Parse tickers
  const parsedTickers = React.useMemo(() => {
    if (!tickers) return [];
    const tickerData = getTickers(tickers);
    return tickerData || [];
  }, [tickers]);

  // Separate back action from other actions
  const backAction = actions.find(action => action.type === 'back');
  const otherActions = actions.filter(action => action.type !== 'back');

  return (
    <>
      <style>{`
        .brief-desktop-banner {
          display: block;
        }
        
        /* Hide on mobile */
        @media (max-width: 768px) {
          .brief-desktop-banner {
            display: none !important;
          }
        }
      `}</style>

      <div className="brief-desktop-banner" style={getBannerStyles()}>
        <div style={getContainerStyles()}>
          {/* Back Arrow Button */}
          {backAction && (
            <button 
              onClick={backAction.onClick}
              style={getBackButtonStyles()}
              onMouseEnter={handleBackButtonMouseEnter}
              onMouseLeave={handleBackButtonMouseLeave}
              aria-label="Back to Briefs"
            >
              <ArrowLeft style={{ width: '24px', height: '24px' }} />
            </button>
          )}
          
          {/* Company Info */}
          <div style={getCompanyInfoStyles()}>
            {companyLogoUrl && (
              <CompanyLogoImage
                src={companyLogoUrl}
                alt={`${companyName} Logo`}
                size="md"
              />
            )}
            <div>
              <div style={getCompanyNameStyles()}>
                {companyName || 'Brief'}
              </div>
              {parsedTickers.length > 0 && (
                <div style={getTickersContainerStyles()}>
                  {parsedTickers.map((ticker, index) => (
                    <span
                      key={`${ticker?.exchange}-${ticker?.symbol}-${index}`}
                      style={getTickerBadgeStyles()}
                    >
                      {ticker?.exchange}:{ticker?.symbol}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {otherActions.map((action, index) => {
              const Icon = getActionIcon(action.type);
              return (
                <button 
                  key={`${action.type}-${index}`}
                  onClick={action.onClick}
                  style={getActionButtonStyles()} 
                  onMouseEnter={handleActionButtonMouseEnter} 
                  onMouseLeave={handleActionButtonMouseLeave}
                  aria-label={getActionAriaLabel(action.type)}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
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
