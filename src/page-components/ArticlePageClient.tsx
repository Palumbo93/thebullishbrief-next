"use client";

import React from 'react';
import { useArticleBySlugIncludingDrafts } from '../hooks/useArticles';
import { ArticlePage } from './ArticlePage';
import { ArticleSkeleton } from '@/components/ArticleSkeleton';

interface ArticlePageClientProps {
  slug: string;
}

export const ArticlePageClient: React.FC<ArticlePageClientProps> = ({ slug }) => {
  const { data: article, error, isLoading } = useArticleBySlugIncludingDrafts(slug);
  
  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh' }}>
        <ArticleSkeleton />
      </div>
    );
  }
  
  return <ArticlePage articleId={slug} />;
};
