import React from 'react';
import { Menu, Search, Bookmark, Share, MoreHorizontal, UserPlus } from 'lucide-react';
import { MobileHeaderSection } from './MobileHeaderSection';
import { MobileHeaderButton } from './MobileHeaderButton';
import { MobileHeaderLogo } from './MobileHeaderLogo';
import { MobileHeaderBranding } from './MobileHeaderBranding';
import { MobileHeaderTypeLogo } from './MobileHeaderTypeLogo';
import { MobileHeaderAction, MobileHeaderConfig } from '../../utils/mobileHeaderConfigs';

interface MobileHeaderProps extends MobileHeaderConfig {
  user?: any; // User authentication state
}


/**
 * MobileHeader - Main mobile header component
 * 
 * Provides a flexible, page-configurable mobile header system.
 * Supports different layouts for Home, Search, Article, and Brief pages.
 */
export const MobileHeader: React.FC<MobileHeaderProps> = ({
  leftSection,
  rightSection,
  onMenuClick,
  user
}) => {
  const getHeaderStyles = () => {
    return {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      background: 'var(--color-text-primary)',
      borderBottom: '0.5px solid var(--color-text-secondary)',
      backdropFilter: 'blur(10px)',
      zIndex: 'var(--z-fixed)',
      display: 'none', // Hidden by default, shown only on mobile
    };
  };

  const getContainerStyles = () => {
    return {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center',
      height: '100%',
      padding: '0 var(--content-padding)',
      maxWidth: '100%',
      gap: 'var(--space-3)',
    };
  };

  const getActionIcon = (type: MobileHeaderAction['type']) => {
    const icons = {
      search: Search,
      bookmark: Bookmark,
      share: Share,
      more: MoreHorizontal,
      subscribe: UserPlus
    };
    return icons[type];
  };

  const getActionAriaLabel = (type: MobileHeaderAction['type']) => {
    const labels = {
      search: 'Open search',
      bookmark: 'Bookmark this content',
      share: 'Share this content',
      more: 'More options',
      subscribe: 'Subscribe'
    };
    return labels[type];
  };

  const getActionVariant = (type: MobileHeaderAction['type'], active?: boolean) => {
    // Subscribe button should use primary variant, others use default
    if (type === 'subscribe') {
      return 'primary' as const;
    }
    return 'default' as const;
  };

  return (
    <>
      <style>{`
        /* Mobile Header Styles */
        @media (max-width: 768px) {
          .mobile-header-root {
            display: block !important;
          }
          
          /* Ensure content doesn't overlap with fixed header */
          .mobile-content-offset {
            padding-top: 56px;
          }
        }
      `}</style>
      
      <header 
        className="mobile-header-root"
        style={getHeaderStyles()}
        role="banner"
      >
        <div style={getContainerStyles()}>
          {/* Left Section */}
          <MobileHeaderSection align="left" gap="md">
            {/* Menu Button */}
            {leftSection.showMenu && (
              <MobileHeaderButton
                icon={Menu}
                onClick={onMenuClick}
                ariaLabel="Open menu"
                variant="ghost"
              />
            )}

            {/* Logo */}
            {leftSection.logo && (
              <MobileHeaderLogo
                type={leftSection.logo.type}
                src={leftSection.logo.src}
                alt={leftSection.logo.alt}
                fallback={leftSection.logo.fallback}
                onClick={leftSection.logo.onClick}
                size="md"
              />
            )}

            {/* Company Branding */}
            {leftSection.branding && (
              <MobileHeaderBranding
                companyName={leftSection.branding.companyName}
                tickers={leftSection.branding.tickers}
                onClick={leftSection.branding.onClick}
              />
            )}

            {/* Type Logo */}
            {leftSection.typeLogo && (
              <MobileHeaderTypeLogo
                size={leftSection.typeLogo.size}
                onClick={leftSection.typeLogo.onClick}
              />
            )}
          </MobileHeaderSection>

          {/* Center Section (Spacer) */}
          <MobileHeaderSection flex><span style={{ display: 'none' }}>Spacer</span></MobileHeaderSection>

          {/* Right Section */}
          <MobileHeaderSection align="right" gap="sm">
            {!user ? (
              // Not logged in - show only subscribe button if available
              rightSection.actions
                .filter(action => action.type === 'subscribe')
                .map((action, index) => (
                  <button
                    key={`subscribe-button-${index}`}
                    onClick={action.onClick}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      background: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-text-primary)';
                      e.currentTarget.style.color = 'var(--color-bg-primary)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--color-primary)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Subscribe
                  </button>
                ))
            ) : (
              // Logged in - show all action buttons except subscribe
              rightSection.actions
                .filter(action => action.type !== 'subscribe')
                .map((action, index) => (
                  <MobileHeaderButton
                    key={`${action.type}-${index}`}
                    icon={getActionIcon(action.type)}
                    onClick={action.onClick}
                    ariaLabel={getActionAriaLabel(action.type)}
                    variant={getActionVariant(action.type, action.active)}
                    active={action.active}
                    loading={action.loading}
                    disabled={action.disabled}
                    iconFill={action.type === 'bookmark' && action.active ? 'currentColor' : 'none'}
                  />
                ))
            )}
          </MobileHeaderSection>
        </div>
      </header>
    </>
  );
};
