"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '../components/Layout';
import { ArticlesList } from '../components/articles/ArticlesList';
import { LegalFooter } from '../components/LegalFooter';
import { useArticlesByCategory, useCategories, Article } from '../hooks/useArticles';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get category from URL parameters
  const categoryFromUrl = searchParams.get('category');
  
  // Initialize activeFilter from URL or default to 'All'
  const [activeFilter, setActiveFilter] = useState<string>(categoryFromUrl || 'All');
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
  // Use the new cached hooks
  const { data: articles = [], isLoading: categoryLoading } = useArticlesByCategory(activeFilter);
  const { data: categories = [] } = useCategories();

  // Handle filter changes with loading state and URL updates
  const handleFilterChange = (filter: string) => {
    setIsFilterLoading(true);
    setActiveFilter(filter);
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (filter === 'All') {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', filter);
    }
    
    // Update URL without page reload
    const newUrl = newSearchParams.toString() 
      ? `/?${newSearchParams.toString()}` 
      : '/';
    router.push(newUrl, { scroll: false });
  };

  // Sync URL parameter with active filter
  useEffect(() => {
    if (categoryFromUrl && categoryFromUrl !== activeFilter) {
      setActiveFilter(categoryFromUrl);
    } else if (!categoryFromUrl && activeFilter !== 'All') {
      // If no category in URL but activeFilter is not 'All', reset to 'All'
      setActiveFilter('All');
    }
  }, [categoryFromUrl, activeFilter]);

  // Reset loading state when articles are loaded
  useEffect(() => {
    if (!categoryLoading && isFilterLoading) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsFilterLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [categoryLoading, isFilterLoading]);

  const handleArticleClick = (articleId: number | string, articleTitle: string, slug?: string) => {
    // Navigate to article page using slug if available, otherwise use ID
    const routeId = slug || articleId;
    router.push(`/articles/${routeId}`);
  };

  // Get category names for filter
  const categoryNames = ['All', ...categories.map(cat => cat.name)];
  
  // Determine if we should show loading in ArticlesList
  // Show loading during filter changes OR during initial category loading
  const shouldShowArticlesLoading = isFilterLoading || categoryLoading;

  return (
    <Layout>
      <div style={{ minHeight: '100vh' }}>
        <ArticlesList 
          articles={articles}
          categories={categoryNames}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          onArticleClick={(articleId, articleTitle) => {
            const article = articles.find((a: Article) => a.id === articleId);
            handleArticleClick(articleId, articleTitle, article?.slug);
          }}
          isLoading={shouldShowArticlesLoading}
        />
      </div>
      
      <LegalFooter />
    </Layout>
  );
}
