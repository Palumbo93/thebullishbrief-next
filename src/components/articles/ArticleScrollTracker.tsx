"use client";

import React from 'react';
import { ServerArticle } from '../../page-components/ArticlePageServer';
import { ArticleAccessResult } from '../../lib/serverAccessControl';

interface ArticleScrollTrackerProps {
  article: ServerArticle;
  accessResult: ArticleAccessResult;
  slug: string;
  children: React.ReactNode;
}

/**
 * Client component wrapper for article content
 * Simplified - no desktop banner
 */
export const ArticleScrollTracker: React.FC<ArticleScrollTrackerProps> = ({
  article,
  accessResult,
  slug,
  children
}) => {
  return (
    <>
      {/* Main Content */}
      {children}
    </>
  );
};
