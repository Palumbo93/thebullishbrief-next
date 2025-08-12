"use client";

import React from 'react';
import { useArticleBySlug } from '../hooks/useArticles';
import { ArticlePage } from './ArticlePage';
import { LoadingScreen } from '@/components/LoadingScreen';

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
  
  if (error) {
    console.error('Article error:', error);
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Article Not Found</h1>
        <p>The article "{slug}" could not be found.</p>
        <p>Error: {error.message}</p>
        <p>Environment: {process.env.NODE_ENV}</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <LoadingScreen onComplete={() => {}} />
      </div>
    );
  }
  
  return <ArticlePage articleId={slug} />;
};
