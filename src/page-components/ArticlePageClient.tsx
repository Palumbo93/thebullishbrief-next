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
  
  
  
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <ArticleSkeleton />
      </div>
    );
  }
  
  return <ArticlePage articleId={slug} />;
};
