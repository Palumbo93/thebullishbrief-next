"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface AccountSection {
  id: string;
  name: string;
  slug: string;
  active?: boolean;
}

interface AccountPageListProps {
  /**
   * Array of account section objects to display
   */
  accountSections: AccountSection[];
  
  /**
   * Currently active account section slug
   */
  activeSection?: string;
}

const AccountPageList: React.FC<AccountPageListProps> = ({ 
  accountSections,
  activeSection
}) => {
  const router = useRouter();

  const handleSectionClick = (slug: string) => {
    // For account settings, we'll use URL fragments to switch sections
    // This assumes the AccountSettingsPage will handle URL fragments
    if (typeof window !== 'undefined') {
      window.location.hash = slug;
      // Also trigger a custom event for the AccountSettingsPage to listen to
      window.dispatchEvent(new CustomEvent('accountSectionChange', { detail: slug }));
    }
  };

  return (
    <div className="account-page-list">
      <style>{`
        .account-page-list {
          border-top: 0.5px solid var(--color-border-primary);
          padding: var(--space-4) var(--space-6);
          background: var(--color-bg-primary);
          transition: all 0.3s ease;
          opacity: 1;
          max-height: 100px;
          overflow: hidden;
        }
        
        .account-page-list-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          gap: var(--space-2);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .account-page-list-container::-webkit-scrollbar {
          display: none;
        }
        
        .account-page-button {
          font-size: var(--text-sm);
          white-space: nowrap;
          border-radius: var(--radius-full);
          padding: var(--space-2) var(--space-4);
          min-height: 32px;
          border: none;
          cursor: pointer;
          transition: all var(--transition-base);
          background: transparent;
          color: var(--color-text-secondary);
        }
        
        .account-page-button:hover {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }
        
        .account-page-button.active {
          background: var(--color-primary);
          color: white;
        }
        
        .account-page-button.active:hover {
          background: var(--color-primary-hover);
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .account-page-list {
            padding: var(--space-2) var(--space-4);
          }
          
          .account-page-list-container {
            justify-content: flex-start;
          }
          
          .account-page-button {
            font-size: var(--text-xs);
            padding: var(--space-2) var(--space-3);
            min-height: 28px;
          }
        }
        
        /* Tablet Responsive */
        @media (min-width: 769px) and (max-width: 1024px) {
          .account-page-list {
            padding: var(--space-3) var(--space-5);
          }
        }
      `}</style>
      
      <div className="account-page-list-container">
        {accountSections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleSectionClick(section.slug)}
            className={`account-page-button ${
              activeSection === section.slug || section.active ? 'active' : ''
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export { AccountPageList };
export default AccountPageList;
