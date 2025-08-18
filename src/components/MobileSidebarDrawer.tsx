"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, LogIn, UserPlus, LogOut, Bookmark, Settings, ChevronRight } from 'lucide-react';
import { useViewportHeightOnly } from '../hooks/useViewportHeight';
import { FULL_HEIGHT_BACKDROP_CSS, FULL_HEIGHT_DRAWER_CSS } from '../utils/viewportUtils';
import { BullLogoImg } from './ui/BullLogo';

/**
 * MobileSidebarDrawer component for mobile navigation.
 * Slides in from the left with a modern app-like design.
 * Only visible on mobile devices.
 */
export interface MobileSidebarDrawerNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  active?: boolean;
}

interface MobileSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  navItems: MobileSidebarDrawerNavItem[];
  user?: { initials: string; username?: string } | null;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  onLogoutClick?: () => void;
}

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  open,
  onClose,
  navItems,
  user,
  onSignInClick,
  onSignUpClick,
  onLogoutClick,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const viewportHeight = useViewportHeightOnly();
  const [isClient, setIsClient] = React.useState(false);

  // Prevent hydration mismatch by only applying viewport height after mount
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Close on ESC key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Trap focus when open
  useEffect(() => {
    if (!open || !drawerRef.current) return;
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
  }, [open]);

  return (
    <>
      <style>{`
        .mobile-sidebar-backdrop {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-sidebar-backdrop {
            display: ${open ? 'block' : 'none'};
            ${FULL_HEIGHT_BACKDROP_CSS}
            background: rgba(0, 0, 0, 0.3);
            transition: opacity 0.2s ease-out;
            opacity: ${open ? '1' : '0'};
            backdrop-filter: blur(2px);
          }
          .mobile-sidebar-drawer {
            ${FULL_HEIGHT_DRAWER_CSS}
            top: 0;
            left: 0;
            width: 85vw;
            max-width: 320px;
            background: var(--color-bg-primary);
            box-shadow: var(--shadow-xl);
            z-index: calc(var(--z-modal) + 1);
            transform: translateX(${open ? '0' : '-100%'});
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            border-right: 0.5px solid var(--color-border-primary);
          }
          .mobile-sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 60px;
            padding: 0 var(--space-4);
            border-bottom: 0.5px solid var(--color-border-primary);
          }
          .mobile-sidebar-logo {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            height: 32px;
          }
          .mobile-sidebar-logo img {
            height: 24px;
            width: auto;
            object-fit: contain;
          }
          .mobile-sidebar-logo-text {
            font-family: 'var(--font-editorial)';
            font-weight: 'var(--font-normal)',
            font-size: var(--text-base);
            color: var(--color-text-primary);
            letter-spacing: -0.005em;
          }
          .mobile-sidebar-close {
            background: transparent;
            border: none;
            padding: var(--space-2);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: var(--radius-lg);
            color: var(--color-text-secondary);
            transition: all var(--transition-base);
            width: 32px;
            height: 32px;
          }
          .mobile-sidebar-close:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--color-text-primary);
            transform: translateY(-1px);
          }
          .mobile-sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: var(--space-1);
            padding: var(--space-4);
            flex: 1;
            overflow-y: auto;
          }
          .mobile-sidebar-section-title {
            font-size: var(--text-xs);
            font-weight: var(--font-medium);
            color: var(--color-text-tertiary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: var(--space-3) 0 var(--space-2) var(--space-1);
          }
          .mobile-sidebar-section-title:first-child {
            margin-top: 0;
          }
          .mobile-sidebar-nav-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--space-3);
            padding: var(--space-3);
            border-radius: var(--radius-lg);
            color: var(--color-text-secondary);
            text-decoration: none;
            font-size: var(--text-sm);
            font-weight: var(--font-medium);
            background: transparent;
            border: none;
            transition: all var(--transition-base);
            cursor: pointer;
            width: 100%;
            text-align: left;
            position: relative;
          }
          .mobile-sidebar-nav-link:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--color-text-primary);
            transform: translateY(-1px);
          }
          .mobile-sidebar-nav-link.active {
            background: rgba(255, 255, 255, 0.08);
            color: var(--color-text-primary);
          }
          .mobile-sidebar-nav-link.active::before {
            content: '';
            position: absolute;
            left: -16px;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 20px;
            background: var(--color-text-primary);
            border-radius: 0 2px 2px 0;
          }
          .mobile-sidebar-nav-link-content {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            flex: 1;
          }
          .mobile-sidebar-nav-link-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
          }
          .mobile-sidebar-nav-link-arrow {
            width: 14px;
            height: 14px;
            opacity: 0.3;
            transition: all var(--transition-base);
          }
          .mobile-sidebar-nav-link:hover .mobile-sidebar-nav-link-arrow {
            opacity: 0.6;
            transform: translateX(1px);
          }
          .mobile-sidebar-auth {
            padding: var(--space-4);
            border-top: 0.5px solid var(--color-border-primary);
            margin-top: auto;
          }
          .mobile-sidebar-user-section {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            padding: var(--space-3);
            background: rgba(255, 255, 255, 0.02);
            border: 0.5px solid var(--color-border-secondary);
            border-radius: var(--radius-lg);
            margin-bottom: var(--space-3);
          }
          .mobile-sidebar-user-avatar {
            width: 36px;
            height: 36px;
            border-radius: var(--radius-lg);
            background: var(--color-bg-tertiary);
            border: 1px solid var(--color-border-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: var(--font-bold);
            font-size: var(--text-sm);
            color: var(--color-text-primary);
            flex-shrink: 0;
          }
          .mobile-sidebar-user-info {
            flex: 1;
            min-width: 0;
          }
          .mobile-sidebar-user-name {
            font-size: var(--text-sm);
            font-weight: var(--font-medium);
            color: var(--color-text-primary);
            margin-bottom: 2px;
          }
          .mobile-sidebar-user-email {
            font-size: var(--text-xs);
            color: var(--color-text-tertiary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .mobile-sidebar-auth-buttons {
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
          }
          .mobile-sidebar-auth-button {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            padding: var(--space-3);
            border-radius: var(--radius-lg);
            font-size: var(--text-sm);
            font-weight: var(--font-medium);
            transition: all var(--transition-base);
            cursor: pointer;
            border: none;
            text-decoration: none;
            width: 100%;
            text-align: left;
          }
          .mobile-sidebar-auth-button.primary {
            background: rgba(255, 255, 255, 0.1);
            color: var(--color-text-primary);
          }
          .mobile-sidebar-auth-button.primary:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
          }
          .mobile-sidebar-auth-button.secondary {
            background: transparent;
            color: var(--color-text-secondary);
            border: 0.5px solid var(--color-border-secondary);
          }
          .mobile-sidebar-auth-button.secondary:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--color-text-primary);
            border-color: var(--color-border-tertiary);
          }
          .mobile-sidebar-auth-button.danger {
            background: transparent;
            color: var(--color-text-secondary);
          }
          .mobile-sidebar-auth-button.danger:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--color-error);
          }
        }
      `}</style>
      {/* Backdrop */}
      <div
        className="mobile-sidebar-backdrop"
        onClick={onClose}
        aria-hidden={!open}
        tabIndex={-1}
        style={{
          // Use JavaScript-calculated height as fallback for Safari
          height: isClient ? `${viewportHeight}px` : '100vh'
        }}
      />
      
      {/* Drawer */}
      <nav
        className="mobile-sidebar-drawer"
        ref={drawerRef}
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        style={{ 
          pointerEvents: open ? 'auto' : 'none',
          // Use JavaScript-calculated height as fallback for Safari
          height: isClient ? `${viewportHeight}px` : '100vh'
        }}
      >
        {/* Header */}
        <div className="mobile-sidebar-header">
          <div className="mobile-sidebar-logo">
            <BullLogoImg width={32} height={32} alt="Logo" />
            <div className="mobile-sidebar-logo-text">
              The Bullish Brief
            </div>
          </div>
          <button
            className="mobile-sidebar-close"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="mobile-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`mobile-sidebar-nav-link${item.active ? ' active' : ''}`}
                onClick={onClose}
              >
                <div className="mobile-sidebar-nav-link-content">
                  <Icon className="mobile-sidebar-nav-link-icon" size={16} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="mobile-sidebar-nav-link-arrow" size={14} />
              </Link>
            );
          })}
          
          {/* User-specific navigation when logged in */}
          {user && (
            <>
              <div className="mobile-sidebar-section-title">My Account</div>
              <Link 
                href="/bookmarks" 
                className="mobile-sidebar-nav-link" 
                onClick={onClose}
              >
                <div className="mobile-sidebar-nav-link-content">
                  <Bookmark className="mobile-sidebar-nav-link-icon" size={16} />
                  <span>Bookmarks</span>
                </div>
                <ChevronRight className="mobile-sidebar-nav-link-arrow" size={14} />
              </Link>
              <Link 
                href="/account-settings" 
                className="mobile-sidebar-nav-link" 
                onClick={onClose}
              >
                <div className="mobile-sidebar-nav-link-content">
                  <Settings className="mobile-sidebar-nav-link-icon" />
                  <span>Settings</span>
                </div>
                <ChevronRight className="mobile-sidebar-nav-link-arrow" />
              </Link>
            </>
          )}
        </div>

        {/* Auth Section */}
        <div className="mobile-sidebar-auth">
          {user ? (
            <>
              <div className="mobile-sidebar-user-section">
                <div className="mobile-sidebar-user-avatar">{user.initials}</div>
                <div className="mobile-sidebar-user-info">
                  <div className="mobile-sidebar-user-name">
                    {user.username || 'User'}
                  </div>
                  <div className="mobile-sidebar-user-email">
                    Signed in
                  </div>
                </div>
              </div>
              <div className="mobile-sidebar-auth-buttons">
                <button 
                  className="mobile-sidebar-auth-button danger" 
                  onClick={onLogoutClick}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="mobile-sidebar-auth-buttons">
              <button 
                className="mobile-sidebar-auth-button primary" 
                onClick={() => {
                  onClose();
                  onSignUpClick?.();
                }}
              >
                <UserPlus size={16} />
                <span>Sign Up</span>
              </button>
              <button 
                className="mobile-sidebar-auth-button secondary" 
                onClick={() => {
                  onClose();
                  onSignInClick?.();
                }}
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}; 