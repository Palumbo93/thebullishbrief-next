"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu } from 'lucide-react';
import { TypeLogo } from './ui/TypeLogo';
import { CategoryList } from './CategoryList';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useAuth } from '../contexts/AuthContext';
import dynamic from 'next/dynamic';
import LegalPageList from './LegalPageList';
import AccountPageList from './AccountPageList';

// Lazy load TickerTapeWidget to reduce initial bundle size
const TickerTapeWidget = dynamic(() => import('./TickerTapeWidget').then(mod => ({ default: mod.TickerTapeWidget })), {
  loading: () => (
    <div style={{
      width: '100%',
      height: '40px',
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-text-tertiary)',
      fontSize: 'var(--text-xs)'
    }}>
      Loading ticker...
    </div>
  ),
  ssr: false
});

interface PublicationHeaderProps {
  /**
   * Header variant:
   * - 'full': Full header layout with categories
   * - 'condensed': Single line header (for article/brief pages)
   */
  variant?: 'full' | 'condensed';
  
  /**
   * List type to determine which navigation component to render:
   * - 'publication': CategoryList for categories
   * - 'legal': LegalPageList for legal pages
   * - 'account': AccountPageList for account settings
   */
  listType?: 'publication' | 'legal' | 'account';
  
  /**
   * Categories to display in full header (for publication type)
   */
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    active?: boolean;
  }>;
  
  /**
   * Legal pages to display (for legal type)
   */
  legalPages?: Array<{
    id: string;
    name: string;
    slug: string;
    active?: boolean;
  }>;
  
  /**
   * Account sections to display (for account type)
   */
  accountSections?: Array<{
    id: string;
    name: string;
    slug: string;
    active?: boolean;
  }>;
  
  /**
   * Currently active item slug
   */
  activeItem?: string;
  
  /**
   * Show ticker tape widget above header
   */
  showTicker?: boolean;
  
  /**
   * Mobile menu handler (for condensed header on mobile)
   */
  onMobileMenuClick?: () => void;
  
  /**
   * Subscribe button click handler
   */
  onSubscribeClick?: () => void;
}

export const PublicationHeader: React.FC<PublicationHeaderProps> = ({
  variant = 'full',
  listType = 'publication',
  categories = [],
  legalPages = [],
  accountSections = [],
  activeItem,
  showTicker = true,
  onMobileMenuClick,
  onSubscribeClick
}) => {
  const router = useRouter();
  const { handleSignUpClick } = useAuthModal();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY.current;
          
          
          // Determine if header should be condensed (after 100px)
          setIsScrolled(currentScrollY > 100);
          
          // Simple logic: 
          // - Always show when scrolling up (any amount)
          // - Hide when scrolling down past 150px
          // - Always show when near top (< 100px)
          
          if (currentScrollY <= 100) {
            setIsVisible(true);
          } else if (scrollDelta < 0) {
            // Scrolling up
            setIsVisible(true);
          } else if (scrollDelta > 0 && currentScrollY > 150) {
            // Scrolling down and past threshold
            setIsVisible(false);
          }
          
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchClick = () => {
    router.push('/search?focus=true');
  };

  const handleLogoClick = () => {
    router.push('/');
  };


  const handleSubscribe = () => {
    if (onSubscribeClick) {
      onSubscribeClick();
    } else {
      handleSignUpClick();
    }
  };


  return (
    <header className={`publication-header ${isScrolled ? 'condensed' : ''} ${!isVisible ? 'hidden' : ''}`}>
      <style>{`
        .publication-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: var(--color-bg-primary);
          border-bottom: 1px solid var(--color-border-primary);
          transition: top 0.3s ease;
        }

        .publication-header.condensed {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .publication-header.hidden {
          top: -200px !important;
        }

        /* Ticker Tape Styles */
        .ticker-tape-container {
          border-bottom: 0.5px solid var(--color-border-primary);
          transition: all 0.3s ease;
          opacity: 1;
          max-height: 100px;
          overflow: hidden;
        }

        .publication-header.condensed .ticker-tape-container {
          opacity: 0;
          max-height: 0;
          padding: 0;
          border-bottom: none;
        }

        .ticker-tape-container .tradingview-widget-container {
          height: 40px;
          overflow: hidden;
        }

        .ticker-tape-container .tradingview-widget-copyright {
          display: none;
        }

        /* Header Main Styles */
        .header-main {
          background: var(--color-bg-primary);
          padding: var(--space-4) var(--space-6);
          transition: all 0.3s ease;
        }

        .publication-header.condensed .header-main {
          padding: var(--space-2) var(--space-6);
        }

        /* Category List Wrapper */
        .category-list-wrapper {
          transition: all 0.3s ease;
          opacity: 1;
          max-height: 200px;
          overflow: hidden;
        }

        .category-list-wrapper.hidden {
          opacity: 0;
          max-height: 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }

        /* Full Header Layout */
        .header-content.full {
          justify-content: center;
          position: relative;
        }

        .header-left {
          display: flex;
          align-items: center;
          position: absolute;
          left: 0;
          width: 100px;
        }

        .header-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          position: absolute;
          right: 0;
          width: 100px;
        }

        /* Condensed Header Layout */
        .header-content.condensed {
          justify-content: space-between;
        }

        .header-content.condensed .header-left {
          position: static;
          gap: var(--space-4);
        }

        .header-content.condensed .header-center {
          flex: 1;
          justify-content: center;
        }

        .header-content.condensed .header-right {
          position: static;
        }

        /* Search Button */
        .search-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .search-button:hover {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }

        /* Menu Button (for condensed header) */
        .menu-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .menu-button:hover {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }

        /* Subscribe Button */
        .subscribe-button {
          padding: var(--space-2) var(--space-4);
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-sm);
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
        }

        .subscribe-button:hover {
          background: var(--color-text-primary);
          color: var(--color-bg-primary);
          transform: translateY(-1px);
        }


        /* Mobile Responsive */
        @media (max-width: 768px) {

          .ticker-tape-container {
            display: none; /* Hide ticker on mobile */
          }

          .header-main {
            padding: var(--space-3) var(--space-4);
          }

          .header-content {
            height: 56px; /* Standard mobile header height */
          }


          .header-left {
            gap: var(--space-3);
          }

          .subscribe-button {
            padding: var(--space-2) var(--space-3);
            font-size: var(--text-xs);
          }

        }

        /* Tablet Responsive */
        @media (min-width: 769px) and (max-width: 1024px) {
          .header-main {
            padding: var(--space-4) var(--space-5);
          }

        }
      `}</style>

      {/* Ticker Tape Widget */}
      {showTicker && (
        <div className="ticker-tape-container">
          <TickerTapeWidget />
        </div>
      )}

      {/* Main Header */}
      <div className="header-main">
        <div className={`header-content ${variant}`}>
          {/* Left Section */}
          <div className="header-left">
            <button
              className="menu-button"
              onClick={onMobileMenuClick}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <button
              className="search-button"
              onClick={handleSearchClick}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Center Section - Logo */}
          <div className="header-center">
            <TypeLogo 
              height={32}
              width={240}
              onClick={handleLogoClick}
            />
          </div>

          {/* Right Section */}
          <div className="header-right">
            {!user && (
              <button
                className="subscribe-button"
                onClick={handleSubscribe}
              >
                Subscribe
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation List (Full Header Only) */}
      {variant === 'full' && (
        <div className={`category-list-wrapper ${isScrolled ? 'hidden' : ''}`}>
          {listType === 'publication' && categories.length > 0 && (
            <CategoryList 
              categories={categories}
              activeCategory={activeItem}
            />
          )}
          {listType === 'legal' && legalPages.length > 0 && (
            <LegalPageList 
              legalPages={legalPages}
              activePage={activeItem}
            />
          )}
          {listType === 'account' && accountSections.length > 0 && (
            <AccountPageList 
              accountSections={accountSections}
              activeSection={activeItem}
            />
          )}
        </div>
      )}

    </header>
  );
};
