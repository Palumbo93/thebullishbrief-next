import React from 'react';
import { Menu, Search, Bookmark, Share, MessageCircle, MoreHorizontal } from 'lucide-react';
import { MobileHeaderSection } from './MobileHeaderSection';
import { MobileHeaderButton } from './MobileHeaderButton';
import { MobileHeaderLogo } from './MobileHeaderLogo';
import { MobileHeaderBranding } from './MobileHeaderBranding';

interface MobileHeaderAction {
  type: 'search' | 'bookmark' | 'share' | 'comment' | 'more';
  onClick: () => void;
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

interface MobileHeaderConfig {
  leftSection: {
    showMenu: boolean;
    logo?: {
      type: 'main' | 'company';
      src?: string;
      alt?: string;
      fallback?: string;
      onClick?: () => void;
    };
    branding?: {
      companyName?: string;
      companyLogoUrl?: string;
      tickers?: any; // JSON ticker data from database
      fallback?: string;
      onClick?: () => void;
    };
  };
  rightSection: {
    actions: MobileHeaderAction[];
  };
  onMenuClick: () => void;
}

/**
 * MobileHeader - Main mobile header component
 * 
 * Provides a flexible, page-configurable mobile header system.
 * Supports different layouts for Home, Search, Article, and Brief pages.
 */
export const MobileHeader: React.FC<MobileHeaderConfig> = ({
  leftSection,
  rightSection,
  onMenuClick
}) => {
  const getHeaderStyles = () => {
    return {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      background: 'var(--color-bg-primary)',
      borderBottom: '0.5px solid var(--color-border-primary)',
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
      comment: MessageCircle,
      more: MoreHorizontal
    };
    return icons[type];
  };

  const getActionAriaLabel = (type: MobileHeaderAction['type']) => {
    const labels = {
      search: 'Open search',
      bookmark: 'Bookmark this content',
      share: 'Share this content',
      comment: 'Toggle comments',
      more: 'More options'
    };
    return labels[type];
  };

  const getActionVariant = (type: MobileHeaderAction['type'], active?: boolean) => {
    // All action buttons use default variant - we'll handle bookmark state via icon fill
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
          </MobileHeaderSection>

          {/* Center Section (Spacer) */}
          <MobileHeaderSection flex><span style={{ display: 'none' }}>Spacer</span></MobileHeaderSection>

          {/* Right Section */}
          <MobileHeaderSection align="right" gap="sm">
            {rightSection.actions.map((action, index) => (
              <MobileHeaderButton
                key={`${action.type}-${index}`}
                icon={getActionIcon(action.type)}
                onClick={action.onClick}
                ariaLabel={getActionAriaLabel(action.type)}
                variant={getActionVariant(action.type, action.active)}
                active={action.active}
                loading={action.loading}
                disabled={action.disabled}
                iconFill={(action.type === 'bookmark' || action.type === 'comment') && action.active ? 'currentColor' : 'none'}
              />
            ))}
          </MobileHeaderSection>
        </div>
      </header>
    </>
  );
};
