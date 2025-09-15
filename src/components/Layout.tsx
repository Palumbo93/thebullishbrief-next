"use client";

import React, { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { MobileHeader } from './mobile/MobileHeader';
import { SidebarDrawer } from './SidebarDrawer';
import { PublicationHeader } from './PublicationHeader';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useCategories } from '../hooks/useArticles';
import { getMobileHeaderConfigForRoute, MobileHeaderFactoryProps } from '../utils/mobileHeaderConfigs';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import { HomeIcon } from './ui/home';
import { SearchIcon } from './ui/search';
import { MessageSquareMoreIcon } from './ui/message-square-more';
import { FoldersIcon } from './ui/folders';
import { ShieldCheckIcon } from './ui/shield-check';

interface LayoutProps {
  children: ReactNode;
  
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
  
  // Action panel for desktop layout (e.g., brief pages)
  actionPanel?: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  mobileHeader,
  actionPanel
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const { handleSignInClick, handleSignUpClick } = useAuthModal();
  const { config: mobileHeaderOverride } = useMobileHeader();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  // Determine current location based on route
  const getCurrentLocation = (): 'home' | 'articles' | 'article' | 'authors' | 'aivault' | 'alphaarena' | 'admin' | 'account-settings' | 'brief' => {
    if (pathname && pathname.startsWith('/articles/')) {
      return 'article';
    }
    if (pathname && pathname.startsWith('/authors/')) {
      return 'authors';
    }
    if (pathname && pathname.startsWith('/briefs/')) {
      return 'brief';
    }
    if (pathname && pathname.startsWith('/admin/')) {
      return 'admin';
    }
    
    // Check for root-level author pages (e.g., /GTAD)
    if (pathname && pathname !== '/' && !pathname.includes('/')) {
      // This is likely a root-level author page, treat as authors section
      return 'authors';
    }
    
    switch (pathname) {
      case '/':
        return 'home';
      case '/alphaarena':
        return 'alphaarena';
      case '/aivault':
        return 'aivault';
      case '/alphaarena':
        return 'alphaarena';
      case '/admin':
        return 'admin';
      case '/account-settings':
        return 'account-settings';
      case '/articles':
        return 'articles';
      case '/authors':
        return 'authors';
      case '/explore':
        return 'articles';
      case '/search':
        return 'articles';
      case '/bookmarks':
        return 'articles';
      case '/contact':
        return 'articles';
      case '/about':
        return 'articles';
      case '/privacy':
        return 'articles';
      case '/cookies':
        return 'articles';
      case '/terms':
        return 'articles';
      case '/disclaimer':
        return 'articles';
      default:
        return 'articles'; // Changed from 'home' to 'articles' to prevent ticker from showing on unknown routes
    }
  };

  const actualCurrentLocation = getCurrentLocation();

  const getActiveCategory = (): string | undefined => {
    // Check if we're on a category page
    if (pathname?.startsWith('/category/')) {
      const categorySlug = pathname.replace('/category/', '');
      return categorySlug;
    }
    
    // No active category for other pages (including home)
    return undefined;
  };

  // Generate navigation items for sidebar with category-based navigation
  const getSidebarNavItems = () => {
    const items = [
      { id: 'home', label: 'Home', path: '/', active: actualCurrentLocation === 'home' },
    ];

    // Add category-based navigation
    if (categoriesData && categoriesData.length > 0) {
      categoriesData.forEach(category => {
        items.push({
          id: `category-${category.id}`,
          label: category.name,
          path: `/category/${category.slug}`,
          active: getActiveCategory() === category.slug
        });
      });
    }

    return items;
  };

  const sidebarNavItems = getSidebarNavItems();

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
        onMenuClick: () => setIsSidebarOpen(true),
        onLogoClick: () => router.push('/')
      };
      
      return updatedConfig;
    }

    // Otherwise use route-based configuration
    const baseProps: MobileHeaderFactoryProps = {
      onMenuClick: () => setIsSidebarOpen(true),
      onSearchClick: (path?: string) => router.push(path || '/search'),
      onLogoClick: () => router.push('/'),
      
      // Article/Brief specific props from mobileHeader prop
      isBookmarked: mobileHeader?.isBookmarked,
      onBookmarkClick: mobileHeader?.onBookmarkClick,
      onShareClick: mobileHeader?.onShareClick,
      bookmarkLoading: mobileHeader?.bookmarkLoading,
      
      // Brief specific props
      companyName: mobileHeader?.companyName,
      tickers: mobileHeader?.tickers,
      
      // Subscribe functionality - only show when user is not authenticated
      showSubscribe: !user,
      onSubscribeClick: () => handleSignUpClick(),
    };

    return getMobileHeaderConfigForRoute(pathname || '', baseProps);
  };

  const getHeaderVariant = (): 'full' | 'condensed' => {
    // Use condensed header for article and brief pages
    if (actualCurrentLocation === 'article' || actualCurrentLocation === 'brief') {
      return 'condensed';
    }
    return 'full';
  };

  return (
    <>
      <style>{`
        /* Publication Layout System - Clean and simple */
        .app-container {
          min-height: 100vh;
          max-width: 100vw;
          background: var(--color-bg-primary);
        }

        /* Main Content - Full width, no sidebars on desktop */
        .main-content {
          position: relative;
          background: var(--color-bg-primary);
          min-height: 100vh;
          width: 100%;
        }

        /* Content Area - Clean wrapper */
        .content-area {
          background: var(--color-bg-primary);
          position: relative;
        }

        /* Global scrollbar styling */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }

        /* Desktop Layout - Account for fixed publication header */
        @media (min-width: 769px) {
          .app-container {
            padding-top: 160px; /* Header without ticker: 60px main + 100px buffer */
          }
          
          /* With ticker tape widget */
          .app-container.with-ticker {
            padding-top: 200px; /* Header with ticker: 40px ticker + 60px main + 100px buffer */
          }
          
          /* Condensed header spacing for article/brief pages */
          .app-container.condensed-header {
            padding-top: 92px; /* Condensed: 60px main + 60px buffer */
          }
          
          /* Action panel layout */
          .app-container.with-action-panel {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: var(--space-8);
            margin: 0 auto;
            padding-left: var(--content-padding);
          }
          
          .main-content.with-action-panel {
            min-width: 0; /* Allow content to shrink */
          }
          
          .action-panel-container {
            border-left: 1px solid var(--color-border-primary);
          }
        }

        /* Mobile Layout - Keep existing mobile sidebar pattern */
        @media (max-width: 768px) {
          .publication-header {
            display: none; /* Hide publication header on mobile */
          }
          
          .app-container {
            padding-top: 56px; /* Account for mobile header */
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
      <MobileHeader {...getMobileHeaderConfig()} />

      {/* Publication Header (visible only on desktop) */}
      <PublicationHeader
        variant={getHeaderVariant()}
        categories={categoriesData?.map(category => ({
          id: category.id,
          name: category.name,
          slug: category.slug
        })) || []}
        showTicker={actualCurrentLocation === 'home'}
        onMobileMenuClick={() => setIsSidebarOpen(true)}
      />

      {/* Sidebar Drawer (available for both mobile and desktop) */}
      <SidebarDrawer
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navItems={sidebarNavItems}
        user={user ? { 
          initials: getUserInitials(),
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
          isAdmin: user.isAdmin
        } : null}
        onSignInClick={handleSignInClick}
        onSignUpClick={handleSignUpClick}
        onLogoutClick={handleLogout}
      />

      <div className={`app-container ${getHeaderVariant() === 'condensed' ? 'condensed-header' : ''} ${actualCurrentLocation === 'home' ? 'with-ticker' : ''} ${actionPanel ? 'with-action-panel' : ''}`}>
        {/* Main Content Area */}
        <main className={`main-content ${actionPanel ? 'with-action-panel' : ''}`}>
          <div className="content-area">
            {children}
          </div>
        </main>
        
        {/* Action Panel (Desktop only) */}
        {actionPanel && (
          <aside className="action-panel-container desktop-only">
            {actionPanel}
          </aside>
        )}
      </div>

    </>
  );
};