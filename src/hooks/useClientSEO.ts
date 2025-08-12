"use client";

import { useEffect } from 'react';
import { generateMetaDescription, generateMetaKeywords, generateArticleStructuredData } from '../utils/seoUtils';
import { Article } from '../hooks/useArticles';

/**
 * Client-side SEO hook for updating meta tags after hydration
 * This is a temporary solution for client-side rendering
 * Later we can move to proper SSR with Next.js metadata API
 */

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  article?: Article;
  noIndex?: boolean;
}

export const useClientSEO = (config: SEOConfig) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const { title, description, keywords, image, url, type = 'website', article, noIndex } = config;

    // Update document title
    if (title) {
      document.title = title.includes('The Bullish Brief') ? title : `${title} | The Bullish Brief`;
    }

    // Helper function to update or create meta tag
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      if (!content) return;
      
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Helper function to update or create link tag
    const updateLinkTag = (rel: string, href: string) => {
      if (!href) return;
      
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', href);
    };

    // Basic meta tags
    updateMetaTag('description', description || 'Premium financial intelligence and market insights delivered daily.');
    updateMetaTag('keywords', keywords || 'financial news, market insights, bullish brief, finance, investing, stocks, trading');
    
    // Robots meta tag
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    // Open Graph tags
    updateMetaTag('og:title', title || 'The Bullish Brief', true);
    updateMetaTag('og:description', description || 'Premium financial intelligence and market insights delivered daily.', true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'The Bullish Brief', true);
    
    if (image) {
      updateMetaTag('og:image', image, true);
      updateMetaTag('og:image:width', '1200', true);
      updateMetaTag('og:image:height', '630', true);
    }
    
    if (url) {
      updateMetaTag('og:url', url, true);
      updateLinkTag('canonical', url);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@thebullishbrief');
    updateMetaTag('twitter:title', title || 'The Bullish Brief');
    updateMetaTag('twitter:description', description || 'Premium financial intelligence and market insights delivered daily.');
    
    if (image) {
      updateMetaTag('twitter:image', image);
    }

    // Article-specific meta tags
    if (article) {
      updateMetaTag('article:author', article.author, true);
      updateMetaTag('article:published_time', new Date(article.date).toISOString(), true);
      updateMetaTag('article:section', article.category, true);
      
      if (article.tags) {
        article.tags.forEach(tag => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:tag');
          meta.setAttribute('content', tag);
          document.head.appendChild(meta);
        });
      }

      // Add structured data for articles
      const baseUrl = window.location.origin;
      const structuredData = generateArticleStructuredData(article, baseUrl);
      
      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      
      scriptTag.textContent = JSON.stringify(structuredData);
    }

  }, [config.title, config.description, config.keywords, config.image, config.url, config.type, config.article, config.noIndex]);
};

/**
 * Hook for article SEO - generates SEO config from article data
 */
export const useArticleSEO = (article: Article | null, viewCount?: number) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  const seoConfig: SEOConfig = article ? {
    title: article.title,
    description: generateMetaDescription(article),
    keywords: generateMetaKeywords(article),
    image: article.image,
    url: `${baseUrl}/articles/${article.slug || article.id}`,
    type: 'article',
    article,
  } : {};

  useClientSEO(seoConfig);
};

/**
 * Hook for page SEO - for non-article pages
 */
export const usePageSEO = (title: string, description?: string, noIndex?: boolean) => {
  const seoConfig: SEOConfig = {
    title,
    description,
    noIndex,
    type: 'website',
  };

  useClientSEO(seoConfig);
};
