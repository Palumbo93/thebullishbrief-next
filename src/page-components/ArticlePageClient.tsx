"use client";

import React from 'react';
import { useArticleBySlug } from '../hooks/useArticles';
import { ArticlePage } from './ArticlePage';
import { ArticleSkeleton } from '@/components/ArticleSkeleton';

interface ArticlePageClientProps {
  slug: string;
}

export const ArticlePageClient: React.FC<ArticlePageClientProps> = ({ slug }) => {
  const { data: article, error, isLoading } = useArticleBySlug(slug);
  
  // Debug logging
  React.useEffect(() => {
    console.log('ArticlePageClient Debug:', {
      slug,
      article: article ? { id: article.id, title: article.title } : null,
      error: error ? { message: error.message } : null,
      isLoading,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }, [slug, article, error, isLoading]);
  
  
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <ArticleSkeleton />
      </div>
    );
  }
  
  return <ArticlePage articleId={slug} />;
};
