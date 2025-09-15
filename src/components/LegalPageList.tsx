"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface LegalPage {
  id: string;
  name: string;
  slug: string;
  active?: boolean;
}

interface LegalPageListProps {
  /**
   * Array of legal page objects to display
   */
  legalPages: LegalPage[];
  
  /**
   * Currently active legal page slug
   */
  activePage?: string;
}

const LegalPageList: React.FC<LegalPageListProps> = ({ 
  legalPages,
  activePage
}) => {
  const router = useRouter();

  const handlePageClick = (slug: string) => {
    router.push(`/${slug}`);
  };

  return (
    <div className="legal-page-list">
      <style>{`
        .legal-page-list {
          border-top: 0.5px solid var(--color-border-primary);
          padding: var(--space-4) var(--space-6);
          background: var(--color-bg-primary);
          transition: all 0.3s ease;
          opacity: 1;
          max-height: 100px;
          overflow: hidden;
        }
        
        .legal-page-list-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          gap: var(--space-2);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .legal-page-list-container::-webkit-scrollbar {
          display: none;
        }
        
        .legal-page-button {
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
        
        .legal-page-button:hover {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }
        
        .legal-page-button.active {
          background: var(--color-primary);
          color: white;
        }
        
        .legal-page-button.active:hover {
          background: var(--color-primary-hover);
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .legal-page-list {
            padding: var(--space-2) var(--space-4);
          }
          
          .legal-page-list-container {
            justify-content: flex-start;
          }
          
          .legal-page-button {
            font-size: var(--text-xs);
            padding: var(--space-2) var(--space-3);
            min-height: 28px;
          }
        }
        
        /* Tablet Responsive */
        @media (min-width: 769px) and (max-width: 1024px) {
          .legal-page-list {
            padding: var(--space-3) var(--space-5);
          }
        }
      `}</style>
      
      <div className="legal-page-list-container">
        {legalPages.map((page) => (
          <button
            key={page.id}
            onClick={() => handlePageClick(page.slug)}
            className={`legal-page-button ${
              activePage === page.slug || page.active ? 'active' : ''
            }`}
          >
            {page.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export { LegalPageList };
export default LegalPageList;
