"use client";

import React, { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { ArticleComments } from './articles/ArticleComments';
import { ExploreWidget } from './ExploreWidget';
import BriefsActionPanel from './briefs/BriefsActionPanel';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './mobile/MobileHeader';
import { MobileSidebarDrawer } from './MobileSidebarDrawer';
import { TickerTapeWidget } from './TickerTapeWidget';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { getMobileHeaderConfigForRoute, MobileHeaderFactoryProps } from '../utils/mobileHeaderConfigs';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import { HomeIcon } from './ui/home';
import { SearchIcon } from './ui/search';
import { MessageSquareMoreIcon } from './ui/message-square-more';
import { FoldersIcon } from './ui/folders';
import { ShieldCheckIcon } from './ui/shield-check';

interface LayoutProps {
  children: ReactNode;
  navItems?: Array<{ id: string; label: string; icon: any; active?: boolean }>;
  onNavChange?: (tabId: string) => void;
  articleTitle?: string;
  articleId?: string;
  
  // Brief action panel props
  showActionPanel?: boolean;
  actionPanelType?: 'brief';
  briefActionPanel?: {
    tickerWidget?: ReactNode;
    sections?: Array<{ id: string; label: string; level: number }>;
    tickers?: any;
    companyName?: string;
    companyLogoUrl?: string;
    investorDeckUrl?: string;
  };
  
  // Mobile header specific props
  mobileHeader?: {
    // Article/Brief specific
    isBookmarked?: boolean;
    onBookmarkClick?: () => void;
    onShareClick?: () => void;
    bookmarkLoading?: boolean;
    
    // Brief specific
    companyName?: string;
    companyLogoUrl?: string;
    tickers?: string[];
  };
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  navItems = [],
  onNavChange,
  articleTitle,
  articleId,
  showActionPanel = false,
  actionPanelType,
  briefActionPanel,
  mobileHeader
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const { handleSignInClick, handleSignUpClick } = useAuthModal();
  const { config: mobileHeaderOverride } = useMobileHeader();

  // Temporary chat state for ArticleComments only
  const [articleCommentsExpanded, setArticleCommentsExpanded] = React.useState(true);
  // Mobile comments state - separate from desktop sidebar
  const [mobileCommentsOpen, setMobileCommentsOpen] = React.useState(false);
  // Mobile action panel state for brief pages
  const [mobileActionPanelOpen, setMobileActionPanelOpen] = React.useState(false);

  // Determine current location based on route
  const getCurrentLocation = (): 'home' | 'articles' | 'article' | 'authors' | 'bullroom' | 'aivault' | 'alphaarena' | 'admin' | 'account-settings' | 'brief' => {
    if (pathname && pathname.startsWith('/articles/')) {
      return 'article';
    }
    if (pathname && pathname.startsWith('/authors/')) {
      return 'authors';
    }
    if (pathname && pathname.startsWith('/briefs/')) {
      return 'brief';
    }
    if (pathname && pathname.startsWith('/bull-room/')) {
      return 'bullroom';
    }
    if (pathname && pathname.startsWith('/admin/')) {
      return 'admin';
    }
    switch (pathname) {
      case '/':
        return 'home';
      case '/aivault':
        return 'aivault';
      case '/alphaarena':
        return 'alphaarena';
      case '/admin':
        return 'admin';
      case '/account-settings':
        return 'account-settings';
      default:
        return 'articles'; // Changed from 'home' to 'articles' to prevent ticker from showing on unknown routes
    }
  };

  const actualCurrentLocation = getCurrentLocation();

  // Generate navigation items for mobile sidebar (matches Sidebar.tsx exactly)
  const getMobileNavItems = () => {
    return [
      { id: 'home', label: 'Home', icon: HomeIcon, path: '/', active: actualCurrentLocation === 'home' },
      { id: 'search', label: 'Search', icon: SearchIcon, path: '/search', active: false },
      { id: 'bullroom', label: 'Bull Room', icon: MessageSquareMoreIcon, path: '/bull-room', active: actualCurrentLocation === 'bullroom' },
      { id: 'aivault', label: 'AI Vault', icon: FoldersIcon, path: '/aivault', active: actualCurrentLocation === 'aivault' },
    ];
  };

  const mobileNavItems = getMobileNavItems();

  const getUserInitials = () => {
    if (!user) return '';
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
    return username.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const getMobileHeaderConfig = () => {
    if (mobileHeaderOverride) {
      // Override key handlers to use Layout's handlers while preserving page-specific config
      const updatedConfig = {
        ...mobileHeaderOverride,
        onMenuClick: () => setIsMobileSidebarOpen(true)
      };
      
      // For article pages, ensure comment functionality is properly wired
      if (actualCurrentLocation === 'article') {
        updatedConfig.rightSection = {
          ...updatedConfig.rightSection,
          actions: updatedConfig.rightSection.actions.map(action => {
            if (action.type === 'comment') {
              return {
                ...action,
                onClick: () => setMobileCommentsOpen(true), // Only open, don't toggle
                active: false // Never show active state since there's a close button
              };
            }
            return action;
          })
        };
      }
      
      // For brief pages, ensure action panel functionality is properly wired
      if (actualCurrentLocation === 'brief') {
        updatedConfig.rightSection = {
          ...updatedConfig.rightSection,
          actions: updatedConfig.rightSection.actions.map(action => {
            if (action.type === 'more') {
              return {
                ...action,
                onClick: () => setMobileActionPanelOpen(true), // Only open, don't toggle
                active: false // Never show active state since there's a close button
              };
            }
            return action;
          })
        };
      }
      
      return updatedConfig;
    }

    // Otherwise use route-based configuration
    const baseProps: MobileHeaderFactoryProps = {
      onMenuClick: () => setIsMobileSidebarOpen(true),
      onSearchClick: (path?: string) => router.push(path || '/search'),
      onLogoClick: () => router.push('/'),
      
      // Article/Brief specific props from mobileHeader prop
      isBookmarked: mobileHeader?.isBookmarked,
      onBookmarkClick: mobileHeader?.onBookmarkClick,
      onShareClick: mobileHeader?.onShareClick,
      bookmarkLoading: mobileHeader?.bookmarkLoading,
      
      // Comment functionality for article pages
      onCommentClick: actualCurrentLocation === 'article' ? () => setMobileCommentsOpen(true) : undefined,
      commentsActive: false, // Never show active state since there's a close button
      
      // Brief specific props
      companyName: mobileHeader?.companyName,
      companyLogoUrl: mobileHeader?.companyLogoUrl,
      tickers: mobileHeader?.tickers,
      
      // Brief action panel functionality
      onMoreClick: actualCurrentLocation === 'brief' ? () => setMobileActionPanelOpen(true) : undefined,
      moreActive: false, // Never show active state since there's a close button
    };

    return getMobileHeaderConfigForRoute(pathname || '', baseProps);
  };

  return (
    <>
      <style>{`
        .shell {
          display: grid;
          grid-template-columns: 80px 1fr ${articleCommentsExpanded && actualCurrentLocation === 'article' ? '400px' : '0px'} ${showActionPanel && actionPanelType === 'brief' ? '340px' : '0px'} ${(actualCurrentLocation === 'home' || actualCurrentLocation === 'authors') ? '400px' : '0px'};
          height: 100vh;
          transition: grid-template-columns var(--transition-base);
        }

        /* Tablet Layout */
        @media (max-width: 1024px) {
          .shell {
            grid-template-columns: 100px 1fr ${articleCommentsExpanded && actualCurrentLocation === 'article' ? '400px' : '0px'} ${showActionPanel && actionPanelType === 'brief' ? '340px' : '0px'} ${(actualCurrentLocation === 'home' || actualCurrentLocation === 'authors') ? '400px' : '0px'};
          }
        }

        .canvas {
          overflow-y: auto;
          padding: 0;
          background: var(--color-bg-primary);
        }

        /* Base styles - hide mobile comments by default */
        .mobile-comments-overlay {
          display: none;
          position: fixed;
          top: 56px; /* Below mobile header */
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--color-bg-primary);
          z-index: 1000;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        
        .mobile-comments-overlay.open {
          transform: translateY(0);
        }

        /* Base styles - hide mobile action panel by default */
        .mobile-action-panel-overlay {
          display: none;
          position: fixed;
          top: 56px; /* Below mobile header */
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--color-bg-primary);
          z-index: 1000;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        
        .mobile-action-panel-overlay.open {
          transform: translateY(0);
        }

        /* Mobile Layout */
        @media (max-width: 768px) {
          .shell {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            padding-top: 56px; /* Account for fixed mobile header */
          }
          
          .chat-sidebar {
            display: none;
          }
          
          .explore-sidebar {
            display: none;
          }
          
          .canvas {
            padding-bottom: 80px;
          }
          
          .mobile-comments-overlay {
            display: block !important; /* Override base display: none on mobile */
          }
          
          .mobile-action-panel-overlay {
            display: block !important; /* Override base display: none on mobile */
          }
        }
        
        /* Desktop - ensure mobile overlays are hidden */
        @media (min-width: 769px) {
          .mobile-comments-overlay {
            display: none !important;
          }
          
          .mobile-action-panel-overlay {
            display: none !important;
          }
        }

        /* Ticker tape styles */
        .ticker-tape-container {
          position: sticky;
          top: 0;
          z-index: 10;
          background: var(--color-bg-primary);
          border-bottom: 0.5px solid var(--color-border-primary);
        }

        .ticker-tape-container .tradingview-widget-container {
          height: 40px;
          overflow: hidden;
        }

        .ticker-tape-container .tradingview-widget-copyright {
          display: none;
        }

        /* Hide ticker on mobile */
        @media (max-width: 768px) {
          .ticker-tape-container {
            display: none;
          }
        }

        /* Explore sidebar styles */
        .explore-sidebar {
          border-left: 0.5px solid var(--color-border-primary);
          background: var(--color-bg-primary);
          overflow-y: auto;
          width: 400px;
          min-width: 400px;
        }

        /* Chat sidebar styles */
        .chat-sidebar {
          border-left: 0.5px solid var(--color-border-primary);
          background: var(--color-bg-primary);
          overflow-y: auto;
          width: 400px;
          min-width: 400px;
          z-index: 1;
        }

        /* Brief action panel styles - Hidden on mobile */
        .brief-action-panel {
          border-left: 0.5px solid var(--color-border-primary);
          background: var(--color-bg-primary);
          overflow-y: auto;
          width: 340px;
          min-width: 340px;
          z-index: 1;
        }
        
        /* Hide brief action panel on mobile and tablet */
        @media (max-width: 1024px) {
          .brief-action-panel {
            display: none;
          }
        }
      `}</style>

      {/* Mobile Header (visible only on mobile) */}
      <MobileHeader {...getMobileHeaderConfig()} />
      {/* Mobile Sidebar Drawer */}
      <MobileSidebarDrawer
        open={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        navItems={mobileNavItems}
        user={user ? { 
          initials: getUserInitials(),
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'User'
        } : null}
        onSignInClick={handleSignInClick}
        onSignUpClick={handleSignUpClick}
        onLogoutClick={handleLogout}
      />

      <div className="shell">
        {/* Left Navigation Sidebar */}
        <Sidebar
          navItems={navItems}
          onNavChange={onNavChange}
          onSignInClick={handleSignInClick}
          onSignUpClick={handleSignUpClick}
        />

        {/* Main Canvas */}
        <main className="canvas">
          {/* Ticker Tape Widget - Only on Home Page */}
          {actualCurrentLocation === 'home' && (
            <div className="ticker-tape-container">
              <TickerTapeWidget />
            </div>
          )}
          
          {/* Scrollable Content Area */}
          <div>
            {children}
          </div>
        </main>

        {/* Article Comments Sidebar - Only on Article Pages */}
        {actualCurrentLocation === 'article' && articleId && (
          <aside className="chat-sidebar">
            <ArticleComments 
              articleId={articleId}
              articleTitle={articleTitle || ''}
              isExpanded={articleCommentsExpanded} 
              onToggleExpanded={() => setArticleCommentsExpanded(!articleCommentsExpanded)}
              onCreateAccountClick={handleSignUpClick}
            />
          </aside>
        )}

        {/* Brief Action Panel - Only on Brief Pages */}
        {showActionPanel && actionPanelType === 'brief' && briefActionPanel && (
          <aside className="brief-action-panel">
            <BriefsActionPanel
              onSignUpClick={handleSignUpClick}
              tickerWidget={briefActionPanel.tickerWidget}
              sections={briefActionPanel.sections || []}
              tickers={briefActionPanel.tickers}
              companyName={briefActionPanel.companyName}
              investorDeckUrl={briefActionPanel.investorDeckUrl}
            />
          </aside>
        )}

        {/* Explore Widget Sidebar - Only on Home, Articles, and Author Pages */}
        {(actualCurrentLocation === 'home' || actualCurrentLocation === 'articles' || actualCurrentLocation === 'authors') && (
          <aside className="explore-sidebar">
            <ExploreWidget />
          </aside>
        )}
      </div>

      {/* Mobile Comments Overlay - Only on Article Pages */}
      {actualCurrentLocation === 'article' && articleId && (
        <div className={`mobile-comments-overlay ${mobileCommentsOpen ? 'open' : ''}`}>
          <ArticleComments 
            articleId={articleId}
            articleTitle={articleTitle || ''}
            isExpanded={true} 
            onToggleExpanded={() => setMobileCommentsOpen(false)}
            onCreateAccountClick={handleSignUpClick}
          />
        </div>
      )}

      {/* Mobile Action Panel Overlay - Only on Brief Pages */}
      {showActionPanel && actionPanelType === 'brief' && briefActionPanel && (
        <div className={`mobile-action-panel-overlay ${mobileActionPanelOpen ? 'open' : ''}`}>
          <BriefsActionPanel
            onSignUpClick={handleSignUpClick}
            tickerWidget={briefActionPanel.tickerWidget}
            sections={briefActionPanel.sections || []}
            tickers={briefActionPanel.tickers}
            companyName={briefActionPanel.companyName}
            investorDeckUrl={briefActionPanel.investorDeckUrl}
            isMobileOverlay={true}
          />
          {/* Close button for mobile overlay */}
          <button
            onClick={() => setMobileActionPanelOpen(false)}
            style={{
              position: 'fixed',
              top: '16px',
              right: '16px',
              zIndex: 1001,
              background: 'var(--color-bg-card)',
              border: '0.5px solid var(--color-border-primary)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-card-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-card)';
            }}
            aria-label="Close action panel"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};