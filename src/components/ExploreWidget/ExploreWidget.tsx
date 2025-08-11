"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFeaturedBrief } from '../../hooks/useBriefs';
import { useArticles, useTags } from '../../hooks/useArticles';
import { CompactSearchBar } from './CompactSearchBar';
import { CondensedBriefCard } from './CondensedBriefCard';
import { TopicFlexList } from './TopicFlexList';
import { AuthorList } from './AuthorList';

interface ExploreWidgetProps {
  onCreateAccountClick?: () => void;
  onArticleSelect?: (articleId: number | string, articleTitle: string) => void;
}

export const ExploreWidget: React.FC<ExploreWidgetProps> = ({
  onCreateAccountClick,
  onArticleSelect
}) => {
  const router = useRouter();
  
  // Data fetching hooks
  const { data: brief, isLoading: briefLoading } = useFeaturedBrief();
  const { data: tagsData, isLoading: tagsLoading } = useTags();
  const { data: articlesData, isLoading: articlesLoading } = useArticles();
  
  // Get unique authors from articles
  const authors = React.useMemo(() => {
    if (!articlesData) return [];
    const allArticles = [...articlesData.featuredArticles, ...articlesData.articles];
    const authorMap = new Map<string, { count: number; avatar?: string; slug?: string }>();
    
    allArticles.forEach(article => {
      const author = article.author;
      const existing = authorMap.get(author);
      if (existing) {
        existing.count += 1;
        if (!existing.avatar && article.authorAvatar) {
          existing.avatar = article.authorAvatar;
        }
        if (!existing.slug && article.authorSlug) {
          existing.slug = article.authorSlug;
        }
      } else {
        authorMap.set(author, { 
          count: 1, 
          avatar: article.authorAvatar,
          slug: article.authorSlug
        });
      }
    });
    
    return Array.from(authorMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Limit to top 8 authors
  }, [articlesData]);
  
  // Navigation handlers
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };
  
  const handleTopicClick = (tag: string) => {
          router.push(`/search?tags=${encodeURIComponent(tag)}`);
  };
  
  const handleAuthorClick = (authorName: string, authorSlug?: string) => {
    if (authorSlug) {
      router.push(`/authors/${authorSlug}`);
    } else {
              router.push(`/search?author=${encodeURIComponent(authorName)}`);
    }
  };
  
  const handleBriefClick = (briefSlug: string) => {
          router.push(`/briefs/${briefSlug}`);
  };
  

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      height: '100%',
      padding: 'var(--space-4)',
      overflowY: 'auto',
      minHeight: '100%',
      width: '100%'
    }}>
      {/* Search Bar */}
      <CompactSearchBar onSearch={handleSearch} />
      
      {/* Sponsored Brief */}
      <CondensedBriefCard 
        brief={brief} 
        onBriefClick={handleBriefClick}
        isLoading={briefLoading}
      />
      
      {/* Trending Topics */}
      <TopicFlexList 
        tags={tagsData || []} 
        onTopicClick={handleTopicClick}
        isLoading={tagsLoading}
      />
      
      {/* Popular Authors */}
      <AuthorList 
        authors={authors} 
        onAuthorClick={handleAuthorClick}
        isLoading={articlesLoading}
      />
    </div>
  );
};
