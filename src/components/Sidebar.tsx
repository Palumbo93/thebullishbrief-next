"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, UserPlus, LogOut, Brain, Bookmark } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { HomeIcon } from './ui/home';
import { SearchIcon } from './ui/search';
import { MessageSquareMoreIcon } from './ui/message-square-more';
import { FoldersIcon } from './ui/folders';
import { ShieldCheckIcon } from './ui/shield-check';

interface SidebarProps {
  navItems?: Array<{ id: string; label: string; icon: any; active?: boolean }>;
  onNavChange?: (tabId: string) => void;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems = [],
  onNavChange,
  onSignInClick,
  onSignUpClick,
}) => {
  // Debug logging
  const { user, signOut } = useAuth();
  const toast = useToast();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ bottom: 0, left: 0 });
  const userMenuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  // Generate navigation items based on current route and user permissions
  const getNavItems = () => {
    const items = [
      { id: 'home', label: 'Home', icon: HomeIcon, path: '/' },
      { id: 'search', label: 'Explore', icon: SearchIcon, path: '/explore' },
      { id: 'bullroom', label: 'Bull Room', icon: MessageSquareMoreIcon, path: '/bull-room' },
      { id: 'aivault', label: 'AI Prompts', icon: FoldersIcon, path: '/aivault' },
    ];

    // Add admin item if user is admin
    if (user?.isAdmin) {
      items.push({ id: 'admin', label: 'Admin', icon: ShieldCheckIcon, path: '/admin' });
    }

    return items.map(item => ({
      ...item,
      active: pathname === item.path || 
              (item.path === '/' && pathname === '/') ||
              (item.path !== '/' && pathname && pathname.startsWith(item.path)) ||
              (item.path === '/explore' && (pathname === '/explore' || pathname === '/search'))
    }));
  };

  const currentNavItems = getNavItems();



  // Calculate menu position based on avatar position
  const calculateMenuPosition = () => {
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      
      // Position above the avatar, left-aligned with it
      // bottom: 48px (avatar height) + 1rem (padding) + 16px (gap) = 48px + 16px + 16px = 80px from bottom
      const bottom = 70;
      const left = 16; // 16px from left edge of sidebar
      
      setMenuPosition({ 
        bottom: bottom,
        left: left 
      });
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
          avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update menu position when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (showUserMenu) {
        calculateMenuPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      toast.success('Successfully signed out');
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.username) {
      return user.user_metadata.username.charAt(0).toUpperCase() + user.user_metadata.username.charAt(1).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase() + user.email.charAt(1).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <style>{`
        .nav-left {
          background: var(--color-bg-primary);
          border-right: 0.5px solid var(--color-border-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-4) 0;
          width: 80px;
          height: 100%;
          position: relative;
          z-index: 100;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          // margin-bottom: var(--space-8);
          width: 100%;
        }

        .nav-logo-link {
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .nav-logo-link img {
          height: 40px;
          width: auto;
          object-fit: contain;
        }

        .nav-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          flex: 1;
          gap: var(--space-2);
          width: 100%;
          padding-top: var(--space-4);
        }

        .nav-button {
          width: 56px;
          height: 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all var(--transition-base);
          position: relative;
          padding: 0;
          color: var(--color-text-tertiary);
          gap: var(--space-1);
        }

        .nav-button:hover {
          /* background: rgba(255, 255, 255, 0.05); */
          color: var(--color-text-primary);
          transform: translateY(-1px);
        }

        .nav-button:hover::after {
          content: attr(data-label);
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: var(--space-3);
          /* background: var(--color-bg-card); */
          color: var(--color-text-primary);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-lg);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          white-space: nowrap;
          z-index: 10001;
          border: 0.5px solid var(--color-border-primary);
          box-shadow: var(--shadow-lg);
          opacity: 0;
          animation: fadeIn 0.2s ease forwards;
        }

        .nav-button.active {
          color: var(--color-text-primary);
          /* background: rgba(255, 255, 255, 0.08); */
        }

        .nav-button.active::before {
          content: '';
          position: absolute;
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: var(--color-text-primary);
          border-radius: 0 2px 2px 0;
        }

        .nav-button-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-button-label {
          font-size: 9px;
          font-weight: var(--font-medium);
          color: var(--color-text-secondary);
          text-align: center;
          line-height: 1;
          opacity: 0.8;
          transition: all var(--transition-base);
        }

        .nav-button:hover .nav-button-label {
          color: var(--color-text-primary);
          font-weight: var(--font-bold);
        }

        .nav-button.active .nav-button-label {
          color: var(--color-text-primary);
          font-weight: var(--font-bold);
        }

        .auth-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          margin-top: auto;
          padding-top: var(--space-6);
        }

        .auth-divider {
          width: 32px;
          height: 1px;
          background: var(--color-border-secondary);
          margin: var(--space-4) 0;
        }

        .auth-button {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          font-family: var(--font-primary);
        }

        .auth-button:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text-primary);
          transform: translateY(-1px);
        }

        .auth-button.signup {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-text-primary);
        }

        .auth-button.signup:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }

        .user-avatar-container {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-primary);
          font-weight: var(--font-bold);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-base);
          border: 1px solid var(--color-border-secondary);
        }

        .user-avatar:hover {
          transform: translateY(-1px);
          border-color: var(--color-border-tertiary);
          background: var(--color-bg-card);
        }

        .user-avatar.active {
          background: var(--color-bg-card);
          border-color: var(--color-border-tertiary);
        }

        .user-menu {
          position: fixed;
          background: var(--color-bg-card);
          border: 0.5px solid var(--color-border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          min-width: 180px;
          z-index: 10000;
          opacity: 0;
          visibility: hidden;
          transition: all var(--transition-base);
          transform: translateY(-4px);
        }

        .user-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          color: var(--color-text-secondary);
          text-decoration: none;
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all var(--transition-base);
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }

        .user-menu-item:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }

        .user-menu-item:first-child {
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }

        .user-menu-item:last-child {
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
        }

        .user-menu-item-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        /* Tablet Layout */
        @media (max-width: 1024px) {
          .nav-left {
            width: 80px;
            padding: var(--space-4) 0;
          }
          
          .nav-button {
            width: 44px;
            height: 56px;
          }
          
          .nav-button-icon {
            width: 18px;
            height: 18px;
          }

          .nav-button-label {
            font-size: 10px;
          }

          .auth-button {
            width: 44px;
            height: 44px;
          }

          .user-avatar {
            width: 44px;
            height: 44px;
            font-size: var(--text-xs);
          }
        }

        /* Mobile Layout */
        @media (max-width: 768px) {
          .nav-left {
            display: none;
          }
          
          .nav-content {
            flex-direction: row;
            gap: var(--space-4);
            flex: 1;
            justify-content: space-around;
            max-width: 400px;
          }
          
          .nav-button {
            width: 48px;
            height: 48px;
          }
          
          .nav-button-icon {
            width: 20px;
            height: 20px;
          }

          .nav-button-label {
            display: none;
          }
          
          .auth-section {
            display: none;
          }

          .auth-divider {
            display: none;
          }

          .user-avatar {
            width: 48px;
            height: 48px;
            font-size: var(--text-sm);
          }





        /* Mobile Layout - Hide legal links on mobile */
        @media (max-width: 768px) {
          .legal-section {
            display: none;
          }
        }
      }
    `}</style>

      <aside className="nav-left">
        {/* Logo - Desktop Only */}
        <div className="nav-logo">
          <Link href="/" className="nav-logo-link" aria-label="Home">
            <img src="/images/logo.png" alt="Logo" />
          </Link>
        </div>

        {/* Centered Navigation Content */}
        <div className="nav-content">
          {/* Navigation Icons */}
          {currentNavItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.path}
                className={`nav-button ${item.active ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                data-label={item.label}
              >
                <div className="nav-button-icon">
                  <Icon size={24} />
                </div>
                <span className="nav-button-label">{item.label}</span>
              </Link>
            );
          })}
        </div>


        {/* Authentication Section */}
        {user ? (
          /* User Avatar with Dropdown Menu */
          <div className="user-avatar-container">
            <button
              ref={avatarRef}
              className={`user-avatar ${showUserMenu ? 'active' : ''}`}
              onClick={() => {
                if (!showUserMenu) {
                  calculateMenuPosition();
                }
                setShowUserMenu(!showUserMenu);
              }}
              aria-label="User menu"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              {getUserInitials()}
            </button>
          </div>
        ) : (
          /* Sign In/Sign Up Buttons */
          <div className="auth-section">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Sidebar Sign In clicked');
                onSignInClick?.();
              }}
              className="auth-button"
              style={{ position: 'relative', zIndex: 1001 }}
            >
              <LogIn style={{ width: '18px', height: '18px' }} />
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Sidebar Sign Up clicked');
                onSignUpClick?.();
              }}
              className="auth-button signup"
              style={{ position: 'relative', zIndex: 1001 }}
            >
              <UserPlus style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        )}



        
      </aside>

      {/* Portal-rendered User Menu */}
      {showUserMenu && typeof window !== 'undefined' && createPortal(
        <div 
          ref={userMenuRef}
          className={`user-menu ${showUserMenu ? 'show' : ''}`}
          style={{
            bottom: `${menuPosition.bottom}px`,
            left: `${menuPosition.left}px`
          }}
        >
          <Link
            href="/account-settings"
            className="user-menu-item"
            onClick={() => setShowUserMenu(false)}
          >
            <UserPlus className="user-menu-item-icon" />
            Account Settings
          </Link>
          <Link
            href="/bookmarks"
            className="user-menu-item"
            onClick={() => setShowUserMenu(false)}
          >
            <Bookmark className="user-menu-item-icon" />
            Bookmarks
          </Link>
          <button
            className="user-menu-item"
            onClick={handleLogout}
          >
            <LogOut className="user-menu-item-icon" />
            Log Out
          </button>
        </div>,
        document.body
      )}
    </>
  );
}; 