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
    briefId?: string;
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

  // Prevent body scroll when mobile action panel is open
  React.useEffect(() => {
    if (mobileActionPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileActionPanelOpen]);

  // Determine current location based on route
  const getCurrentLocation = (): 'home' | 'articles' | 'article' | 'authors' | 'bull-room' | 'aivault' | 'alphaarena' | 'admin' | 'account-settings' | 'brief' => {
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
      return 'bull-room';
    }
    if (pathname && pathname.startsWith('/admin/')) {
      return 'admin';
    }
    switch (pathname) {
      case '/':
        return 'home';
      case '/alphaarena':
        return 'alphaarena';
      case '/bull-room':
        return 'bull-room';
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
      { id: 'bull-room', label: 'Bull Room', icon: MessageSquareMoreIcon, path: '/bull-room', active: actualCurrentLocation === 'bull-room' },
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
        /* X-Style Layout System - Page scroll approach */
        .app-container {
          min-height: 100vh;
          max-width: 100vw;
          background: var(--color-bg-primary);
          /* Remove flexbox - let page scroll naturally */
        }

        /* Sidebar - Fixed positioning */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 80.5px; /* need to be 80.5px to account for the border */
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          border-right: 0.5px solid var(--color-border-primary);
          background: var(--color-bg-primary);
          z-index: 100;
          flex-shrink: 0;
          overflow-x: hidden;
        }

        /* Main Content - Offset by sidebar, page scroll */
        .main-content {
          position: relative;
          margin-left: 80px; /* Offset for fixed sidebar */
          border-right: 0.5px solid var(--color-border-primary);
          background: var(--color-bg-primary);
          min-height: 100vh;
          /* Remove flexbox - let page scroll naturally */
        }

        /* Main Content with Right Panel */
        .main-content.with-right-panel {
          margin-right: 400px; /* Offset for fixed right panel */
        }

        /* Right Panel - Fixed positioning */
        .right-panel {
          position: fixed;
          right: 0;
          top: 0;
          width: 400px;
          height: 100vh;
          background: var(--color-bg-primary);
          z-index: 1;
          overflow-y: auto;
        }

        /* Content Area - No scroll, just wrapper */
        .content-area {
          flex: 1;
          padding: 0;
          background: var(--color-bg-primary);
          position: relative;
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

        /* Global scrollbar styling for main page scroll */
        ::-webkit-scrollbar {
          width: 10px; /* Slightly thicker */
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2); /* Light gray for visibility */
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3); /* Lighter on hover */
        }

        /* Firefox global scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent; /* Light gray for visibility */
        }

        /* Custom Scrollbar Styling */
        .sidebar::-webkit-scrollbar,
        .right-panel::-webkit-scrollbar {
          width: 10px; /* Slightly thicker */
          height: 10px;
        }

        .sidebar::-webkit-scrollbar-track,
        .right-panel::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar::-webkit-scrollbar-thumb,
        .right-panel::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2); /* Light gray for visibility */
          border-radius: 5px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover,
        .right-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3); /* Lighter on hover */
        }

        /* Firefox scrollbar */
        .sidebar,
        .right-panel {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent; /* Light gray for visibility */
        }

        /* Mobile Layout */
        @media (max-width: 768px) {
          .app-container {
            padding-top: 56px; /* Account for fixed mobile header */
          }
          
          .sidebar {
            position: fixed;
            left: -80px; /* Hidden off-screen, becomes drawer */
            top: 56px; /* Below mobile header */
            width: 80px;
            height: calc(100vh - 56px);
            transition: left 0.3s ease;
            z-index: 1000;
          }
          
          .sidebar.open {
            left: 0; /* Slide in when open */
          }
          
          .main-content {
            margin-left: 0; /* No offset on mobile */
            margin-right: 0; /* No right panel offset on mobile */
            width: 100%;
          }
          
          .right-panel {
            display: none; /* Hidden on mobile, becomes overlay */
          }
        }

        /* Tablet Layout */
        @media (min-width: 769px) and (max-width: 1024px) {
          .sidebar {
            width: 80px; /* Keep collapsed sidebar on tablet */
          }
          
          .main-content {
            margin-left: 80px; /* Offset for collapsed sidebar */
            margin-right: 0; /* No right panel offset on tablet */
          }
          
          .right-panel {
            display: none; /* Hide right panel on tablet */
          }
        }

        /* Hide ticker on mobile */
        @media (max-width: 768px) {
          .ticker-tape-container {
            display: none;
          }
        }

        /* Mobile overlay styles */
        .mobile-comments-overlay {
          display: none;
          position: fixed;
          top: 56px;
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

        .mobile-action-panel-overlay {
          display: none;
          position: fixed;
          top: 0;
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

        /* Mobile Layout - Show overlays */
        @media (max-width: 768px) {
          .mobile-comments-overlay {
            display: block !important;
          }
          
          .mobile-action-panel-overlay {
            display: block !important;
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
      `}</style>

      {/* Mobile Header (visible only on mobile) */}
      {actualCurrentLocation !== 'bull-room' && (
        <>
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
        </>
      )}

      <div className="app-container">
        {/* Left Navigation Sidebar */}
        <header className="sidebar" role="banner">
          <Sidebar
            navItems={navItems}
            onNavChange={onNavChange}
            onSignInClick={handleSignInClick}
            onSignUpClick={handleSignUpClick}
          />
        </header>

        {/* Main Content Area */}
        <main className={`main-content ${(actualCurrentLocation === 'article' || showActionPanel || actualCurrentLocation === 'home' || (actualCurrentLocation === 'articles' && !pathname?.startsWith('/terms') && !pathname?.startsWith('/privacy') && !pathname?.startsWith('/disclaimer')) || actualCurrentLocation === 'authors' || pathname?.startsWith('/search') || pathname?.startsWith('/explore')) ? 'with-right-panel' : ''}`}>
          <div className="content-area">
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
          </div>
        </main>

        {/* Right Panel - Conditional based on page type */}
        {(actualCurrentLocation === 'article' || showActionPanel || actualCurrentLocation === 'home' || (actualCurrentLocation === 'articles' && !pathname?.startsWith('/terms') && !pathname?.startsWith('/privacy') && !pathname?.startsWith('/disclaimer')) || actualCurrentLocation === 'authors' || pathname?.startsWith('/search') || pathname?.startsWith('/explore')) && (
          <aside className="right-panel">
            {/* Article Comments - Only on Article Pages */}
            {actualCurrentLocation === 'article' && articleId && (
              <ArticleComments 
                articleId={articleId}
                articleTitle={articleTitle || ''}
                isExpanded={articleCommentsExpanded} 
                onToggleExpanded={() => setArticleCommentsExpanded(!articleCommentsExpanded)}
                onCreateAccountClick={handleSignUpClick}
              />
            )}

            {/* Brief Action Panel - Only on Brief Pages */}
            {showActionPanel && actionPanelType === 'brief' && briefActionPanel && (
              <BriefsActionPanel
                briefId={briefActionPanel.briefId}
                onSignUpClick={handleSignUpClick}
                tickerWidget={briefActionPanel.tickerWidget}
                sections={briefActionPanel.sections || []}
                tickers={briefActionPanel.tickers}
                companyName={briefActionPanel.companyName}
                investorDeckUrl={briefActionPanel.investorDeckUrl}
              />
            )}

            {/* Explore Widget - Only on Home, Articles, and Author Pages (not search or explore) */}
            {(actualCurrentLocation === 'home' || (actualCurrentLocation === 'articles' && !pathname?.startsWith('/search') && !pathname?.startsWith('/explore')) || actualCurrentLocation === 'authors') && (
              <ExploreWidget />
            )}
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
        <>
          {/* Backdrop */}
          {mobileActionPanelOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
                backdropFilter: 'blur(4px)'
              }}
              onClick={() => setMobileActionPanelOpen(false)}
            />
          )}
          
          <div className={`mobile-action-panel-overlay ${mobileActionPanelOpen ? 'open' : ''}`}>
          <BriefsActionPanel
            briefId={briefActionPanel.briefId}
            onSignUpClick={handleSignUpClick}
            tickerWidget={briefActionPanel.tickerWidget}
            sections={briefActionPanel.sections || []}
            tickers={briefActionPanel.tickers}
            companyName={briefActionPanel.companyName}
            investorDeckUrl={briefActionPanel.investorDeckUrl}
            isMobileOverlay={true}
            onClose={() => setMobileActionPanelOpen(false)}
          />
          </div>
        </>
      )}
    </>
  );
};