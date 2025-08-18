"use client";

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useTheme } from '../../contexts/ThemeContext';
import { HomeIcon } from '../ui/home';
import { SearchIcon } from '../ui/search';
import { MessageSquareMoreIcon } from '../ui/message-square-more';
import { FoldersIcon } from '../ui/folders';

interface BullRoomLayoutProps {
  children: ReactNode;
}

export const BullRoomLayout: React.FC<BullRoomLayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { handleSignInClick, handleSignUpClick } = useAuthModal();

  // Generate navigation items for BullRoom (matches Sidebar.tsx exactly)
  const getBullRoomNavItems = () => {
    return [
      { id: 'home', label: 'Home', icon: HomeIcon, path: '/', active: false },
      { id: 'search', label: 'Search', icon: SearchIcon, path: '/search', active: false },
      { id: 'bull-room', label: 'Bull Room', icon: MessageSquareMoreIcon, path: '/bull-room', active: true },
      { id: 'aivault', label: 'AI Vault', icon: FoldersIcon, path: '/aivault', active: false },
    ];
  };

  const bullRoomNavItems = getBullRoomNavItems();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Theme-aware scrollbar colors
  const scrollbarThumbColor = theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
  const scrollbarThumbHoverColor = theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';

  return (
    <>
      <style>{`
        /* BullRoom Layout System - Independent styles */
        .bullroom-app-container {
          background: var(--color-bg-primary);
          display: flex;
        }

        /* Sidebar - Fixed positioning */
        .bullroom-sidebar {
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

        /* Main Content - Offset by sidebar */
        .bullroom-main-content {
          position: relative;
          margin-left: 80px; /* Offset for fixed sidebar */
          background: var(--color-bg-primary);
          flex: 1;
          width: calc(100vw - 80.5px);
        }

        /* Content Area */
        .bullroom-content-area {
          padding: 0;
          background: var(--color-bg-primary);
          position: relative;
        }

        /* Custom Scrollbar Styling for Sidebar */
        .bullroom-sidebar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .bullroom-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .bullroom-sidebar::-webkit-scrollbar-thumb {
          background: ${scrollbarThumbColor};
          border-radius: 5px;
        }

        .bullroom-sidebar::-webkit-scrollbar-thumb:hover {
          background: ${scrollbarThumbHoverColor};
        }

        /* Firefox scrollbar */
        .bullroom-sidebar {
          scrollbar-width: thin;
          scrollbar-color: ${scrollbarThumbColor} transparent;
        }

        /* Mobile Layout - Hide sidebar on mobile */
        @media (max-width: 768px) {
          .bullroom-sidebar {
            display: none;
          }
          
          .bullroom-main-content {
            margin-left: 0;
            width: 100vw;
          }
        }

        /* Tablet Layout */
        @media (min-width: 769px) and (max-width: 1024px) {
          .bullroom-sidebar {
            width: 80px;
          }
          
          .bullroom-main-content {
            margin-left: 80px;
            width: calc(100vw - 80px);
          }
        }
      `}</style>

      <div className="bullroom-app-container">
        {/* Left Navigation Sidebar */}
        <header className="bullroom-sidebar" role="banner">
          <Sidebar
            navItems={bullRoomNavItems}
            onNavChange={(tabId) => {
              const navItem = bullRoomNavItems.find(item => item.id === tabId);
              if (navItem?.path) {
                router.push(navItem.path);
              }
            }}
            onSignInClick={handleSignInClick}
            onSignUpClick={handleSignUpClick}
          />
        </header>

        {/* Main Content Area */}
        <main className="bullroom-main-content">
          <div className="bullroom-content-area">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};
