"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ArticleActionPanel from './ArticleActionPanel';
import { ServerArticle } from '../../page-components/ArticlePageServer';
import { TOCSection } from '../../utils/tocParser';

interface ArticleActionPanelWrapperProps {
  article: ServerArticle;
  tocSections: TOCSection[];
  relatedArticles: ServerArticle[];
}

/**
 * Client wrapper for ArticleActionPanel to handle navigation and interactivity
 */
export const ArticleActionPanelWrapper: React.FC<ArticleActionPanelWrapperProps> = ({
  article,
  tocSections,
  relatedArticles
}) => {
  const router = useRouter();

  return (
    <ArticleActionPanel
      articleId={article.id}
      sections={tocSections}
      tags={article.tags || []}
      relatedArticles={relatedArticles.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        category: a.category,
        date: a.date,
        author: a.author,
        image: a.image
      }))}
      onTagClick={(tag) => {
        router.push(`/search?tags=${encodeURIComponent(tag)}`);
      }}
      onRelatedArticleClick={(articleId, articleTitle) => {
        const relatedArticle = relatedArticles.find(a => a.id === articleId);
        router.push(`/articles/${relatedArticle?.slug || articleId}`);
      }}
    />
  );
};
