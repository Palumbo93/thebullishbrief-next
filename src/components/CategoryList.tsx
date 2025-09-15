"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
  active?: boolean;
}

interface CategoryListProps {
  /**
   * Array of category objects to display
   */
  categories: Category[];
  
  /**
   * Currently active category slug
   */
  activeCategory?: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ 
  categories,
  activeCategory
}) => {
  const router = useRouter();

  const handleCategoryClick = (slug: string) => {
    if (slug === 'home' || slug === 'all') {
      router.push('/');
    } else {
      router.push(`/category/${slug}`);
    }
  };

  return (
    <div className="category-list">
      <style>{`
        .category-list {
          border-top: 0.5px solid var(--color-border-primary);
          padding: var(--space-4) var(--space-6);
          background: var(--color-bg-primary);
          transition: all 0.3s ease;
          opacity: 1;
          max-height: 100px;
          overflow: hidden;
        }
        
        .category-list-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          gap: var(--space-2);
          overflowX: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .category-list-container::-webkit-scrollbar {
          display: none;
        }
        
        .category-button {
          fontSize: var(--text-sm);
          whiteSpace: nowrap;
          borderRadius: var(--radius-full);
          padding: var(--space-2) var(--space-4);
          minHeight: 32px;
          border: none;
          cursor: pointer;
          transition: all var(--transition-base);
          background: transparent;
          color: var(--color-text-secondary);
        }
        
        .category-button:hover {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }
        
        .category-button.active {
          background: var(--color-primary);
          color: white;
        }
        
        .category-button.active:hover {
          background: var(--color-primary-hover);
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .category-list {
            padding: var(--space-2) var(--space-4);
          }
          
          .category-list-container {
            justify-content: flex-start;
          }
          
          .category-button {
            fontSize: var(--text-xs);
            padding: var(--space-2) var(--space-3);
            minHeight: 28px;
          }
        }
        
        /* Tablet Responsive */
        @media (min-width: 769px) and (max-width: 1024px) {
          .category-list {
            padding: var(--space-3) var(--space-5);
          }
        }
      `}</style>
      
      <div className="category-list-container">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.slug)}
            className={`category-button ${
              activeCategory === category.slug || category.active ? 'active' : ''
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};
