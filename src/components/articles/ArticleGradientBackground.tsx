"use client";

import React from 'react';
import { ServerArticle } from '../../page-components/ArticlePageServer';

interface ArticleGradientBackgroundProps {
  article: ServerArticle;
}

/**
 * Client component that provides gradient background effects for articles
 * This component can extract colors from featured images and create dynamic backgrounds
 */
export const ArticleGradientBackground: React.FC<ArticleGradientBackgroundProps> = ({
  article
}) => {
  const [gradientColors, setGradientColors] = React.useState<string[]>([]);

  // Extract colors from featured image (placeholder implementation)
  React.useEffect(() => {
    if (article.image) {
      // This is a placeholder - in a real implementation, you might:
      // 1. Use a color extraction library to get dominant colors from the image
      // 2. Set up a gradient based on those colors
      // 3. Apply it as a subtle background effect
      
      // For now, we'll use a default gradient based on category or other article properties
      const defaultGradients = {
        'Finance': ['#0066FF', '#00CCFF'],
        'Markets': ['#FF6B6B', '#FF8E8E'],
        'Technology': ['#4ECDC4', '#44A08D'],
        'Default': ['#667eea', '#764ba2']
      };
      
      const categoryGradient = defaultGradients[article.category as keyof typeof defaultGradients] || defaultGradients.Default;
      setGradientColors(categoryGradient);
    }
  }, [article.image, article.category]);

  if (!gradientColors.length) {
    return null;
  }

  return (
    <>
      <div
        className="article-gradient-background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '100vh',
          background: `linear-gradient(135deg, ${gradientColors[0]}08 0%, ${gradientColors[1]}05 100%)`,
          pointerEvents: 'none',
          zIndex: -1,
          opacity: 0.3,
          willChange: 'auto' // Prevent GPU layer promotion on mobile
        }}
      />
      <style jsx>{`
        /* Disable gradient background on mobile for better performance */
        @media (max-width: 768px) {
          .article-gradient-background {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
