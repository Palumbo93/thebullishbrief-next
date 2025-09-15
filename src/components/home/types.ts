/**
 * Shared types and utilities for home page components
 */

import { Article } from '../../hooks/useArticles';
import { Brief } from '../../lib/database.aliases';

export type HeroContent = (Article | Brief) & { date?: string };

export interface HomeComponentProps {
  onArticleClick: (articleId: number | string, articleTitle: string, slug?: string) => void;
  onBriefClick: (briefId: number | string, briefTitle: string, slug?: string) => void;
}

export interface HeroSectionProps extends HomeComponentProps {
  heroContent: HeroContent | null;
}

export interface FeaturedStoriesGridProps {
  articles: Article[];
  title: string;
  onArticleClick: (articleId: number | string, articleTitle: string, slug?: string) => void;
}

export interface LatestNewsGridProps {
  articles: Article[];
  title: string;
  maxItems?: number;
  onArticleClick: (articleId: number | string, articleTitle: string, slug?: string) => void;
}

/**
 * Helper function to format metadata with proper dot display logic
 * Only shows dots between non-empty values
 */
export const formatMetadata = (items: (string | null | undefined)[]): string => {
  return items.filter(Boolean).join(' • ');
};

/**
 * Check if content should show date based on type and context
 */
export const shouldShowDate = (content: HeroContent, isHero: boolean): boolean => {
  // Briefs should not show date
  if ('company_name' in content) return false;
  
  // Featured articles in hero should show date
  // Regular articles should always show date
  return true;
};

/**
 * Check if content is a brief
 */
export const isBrief = (content: HeroContent): content is Brief & { date?: string } => {
  return 'company_name' in content;
};

/**
 * Get formatted author display for metadata
 */
export const getAuthorDisplay = (author?: string): string | null => {
  return author && author.trim() ? author.trim() : null;
};

/**
 * Generate clickable metadata string with proper formatting
 */
export const generateMetadata = (
  author?: string, 
  time?: string, 
  date?: string,
  showDate: boolean = true
): string => {
  const authorDisplay = getAuthorDisplay(author);
  const metadataItems: string[] = [];
  
  if (authorDisplay) {
    metadataItems.push(`By ${authorDisplay}`);
  }
  
  if (showDate && date) {
    metadataItems.push(date);
  }
  
  if (time) {
    metadataItems.push(time);
  }
  
  return formatMetadata(metadataItems);
};
