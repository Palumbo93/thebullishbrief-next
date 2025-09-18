import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { ArticlePageClient } from '../../../page-components/ArticlePageClient';
import { fetchArticleBySlug, fetchArticleBySlugIncludingDrafts, fetchAllArticleSlugs, fetchArticleBySlugForMetadata } from '../../../hooks/useArticles';

/**
 * Extracts a clean meta description from HTML content
 * @param htmlContent - The HTML content to extract text from
 * @param maxLength - Maximum length of the description (default: 155)
 * @returns Clean text suitable for meta description
 */
function extractMetaDescription(htmlContent: string, maxLength: number = 155): string {
  if (!htmlContent) return '';
  
  // Remove HTML tags
  const textContent = htmlContent
    .replace(/<[^>]*>/g, ' ') // Remove all HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // If content is short enough, return as is
  if (textContent.length <= maxLength) {
    return textContent;
  }
  
  // Try to get as close to 155 characters as possible while ending at a complete word
  const truncated = textContent.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  // If we can find a word boundary reasonably close to the target length, use it
  if (lastSpaceIndex > maxLength * 0.85) {
    return textContent.substring(0, lastSpaceIndex).trim() + '...';
  }
  
  // Otherwise, try to find a sentence ending within a reasonable range
  const extendedTruncated = textContent.substring(0, maxLength + 30); // Look a bit further
  const lastSentenceEnd = Math.max(
    extendedTruncated.lastIndexOf('.'),
    extendedTruncated.lastIndexOf('!'),
    extendedTruncated.lastIndexOf('?')
  );
  
  // If we found a sentence ending within reasonable range, use that
  if (lastSentenceEnd >= maxLength * 0.7 && lastSentenceEnd <= maxLength + 25) {
    return textContent.substring(0, lastSentenceEnd + 1).trim();
  }
  
  // Fallback: use the word boundary or hard truncate with ellipsis
  if (lastSpaceIndex > maxLength * 0.7) {
    return textContent.substring(0, lastSpaceIndex).trim() + '...';
  }
  
  // Final fallback: hard truncate with ellipsis
  return truncated.trim() + '...';
}

// Generate static params for only the most recent/popular articles at build time
// New articles will be generated on-demand via ISR
export async function generateStaticParams() {
  try {
    const slugs = await fetchAllArticleSlugs();
    // Only pre-generate the first 10 articles at build time to speed up builds
    // The rest will be generated on-demand when first requested
    return slugs.slice(0, 10).map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    console.error('Error generating static params for articles:', error);
    return [];
  }
}

// Enable dynamic params for ISR - allows generating pages on-demand for unknown routes
export const dynamicParams = true;

// Generate metadata for each article
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const article = await fetchArticleBySlugForMetadata(slug);
    
    if (!article) {
      return {
        title: 'Article Not Found - The Bullish Brief',
        description: 'The requested article could not be found.',
      };
    }

    const articleUrl = `https://bullishbrief.com/articles/${slug}`;
    const articleImage = article.featured_image_url || 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png';
    const description = article.content ? extractMetaDescription(article.content) : article.subtitle || article.title;
    
    return {
      title: `${article.title} | The Bullish Brief`,
      description: description,
      keywords: article.tags?.map((tag: any) => tag.tag.name).join(', ') || 'finance, markets, investing, news',
      authors: article.author ? [article.author.name] : undefined,
      category: article.category?.name || 'Finance',
      openGraph: {
        title: article.title,
        description: description,
        url: articleUrl,
        siteName: 'The Bullish Brief',
        images: [
          {
            url: articleImage,
            width: 1200,
            height: 630,
            alt: article.featured_image_alt || article.title,
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: article.published_at || undefined,
        modifiedTime: article.updated_at || article.published_at,
        authors: article.author ? [article.author.name] : undefined,
        section: article.category?.name || 'Finance',
        tags: article.tags?.map((tag: any) => tag.tag.name) || ['finance', 'markets'],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: description,
        images: [articleImage],
        creator: '@thebullishbrief',
        site: '@thebullishbrief',
      },
      alternates: {
        canonical: articleUrl,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      other: {
        'article:published_time': article.published_at || '',
        'article:modified_time': article.updated_at || article.published_at || '',
        'article:author': article.author?.name || '',
        'article:section': article.category?.name || 'Finance',
        'article:tag': article.tags?.map((tag: any) => tag.tag.name).join(', ') || 'finance, markets, investing',
      },
    };
  } catch (error) {
    console.error('Error generating metadata for article:', error);
    return {
      title: 'Article - The Bullish Brief',
      description: 'Independent market intelligence for investors. News, deep dives, and opinions on market trends and company developments.',
    };
  }
}

// Disable automatic ISR revalidation - rely on build trigger for all updates
// This makes content updates predictable and controlled via build trigger
export const revalidate = false; // No automatic revalidation - build trigger controls all updates

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePageWrapper({ params }: Props) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }
  
  // Fetch article data on the server for the Layout and schema (including drafts)
  let article;
  let rawArticle;
  try {
    article = await fetchArticleBySlugIncludingDrafts(slug);
    rawArticle = await fetchArticleBySlugForMetadata(slug);
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }

  // Generate enhanced JSON-LD schema for NewsArticle
  const description = rawArticle.content ? extractMetaDescription(rawArticle.content) : rawArticle.subtitle || rawArticle.title;
  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: rawArticle.title,
    description: description,
    image: {
      '@type': 'ImageObject',
      url: rawArticle.featured_image_url || 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
      width: 1200,
      height: 630,
      alt: rawArticle.featured_image_alt || rawArticle.title,
    },
    datePublished: rawArticle.published_at,
    dateModified: rawArticle.updated_at || rawArticle.published_at,
    author: rawArticle.author ? {
      '@type': 'Person',
      name: rawArticle.author.name,
      url: rawArticle.author.website_url || undefined,
      sameAs: rawArticle.author.website_url || undefined,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'The Bullish Brief',
      url: 'https://bullishbrief.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
        width: 512,
        height: 512,
      },
      sameAs: [
        'https://twitter.com/thebullishbrief',
        'https://linkedin.com/company/thebullishbrief'
      ],
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://bullishbrief.com/articles/${slug}`,
    },
    url: `https://bullishbrief.com/articles/${slug}`,
    articleSection: rawArticle.category?.name || 'Finance',
    keywords: rawArticle.tags?.map((tag: any) => tag.tag.name).join(', ') || 'finance, markets, investing',
    wordCount: rawArticle.content?.length || 0,
    articleBody: rawArticle.content || '',
    isAccessibleForFree: true,
    isPartOf: {
      '@type': 'CreativeWork',
      name: 'The Bullish Brief',
    },
  };

  // Generate BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://bullishbrief.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles',
        item: 'https://bullishbrief.com/articles',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: rawArticle.title,
        item: `https://bullishbrief.com/articles/${slug}`,
      },
    ],
  };

  // Generate Organization schema for better publisher information
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Bullish Brief',
    url: 'https://bullishbrief.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
      width: 512,
      height: 512,
    },
    sameAs: [
      'https://twitter.com/thebullishbrief',
      'https://linkedin.com/company/thebullishbrief'
    ],
    description: 'Independent market intelligence for investors. News, deep dives, and opinions on market trends, company developments, and economic shifts.',
    foundingDate: '2025',
    areaServed: 'Worldwide',
    knowsAbout: ['Finance', 'Markets', 'Investing', 'Trading', 'Cryptocurrency', 'Stocks'],
  };
  
  return (
    <>
      <Script
        id="news-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <ArticlePageClient slug={slug} />
    </>
  );
}
