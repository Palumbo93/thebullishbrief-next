import { Article } from '../hooks/useArticles';
import { Brief } from '../lib/database.aliases';

/**
 * SEO utility functions for generating sitemaps, RSS feeds, and meta tags
 */

/**
 * Generate XML sitemap content
 */
export const generateSitemap = (articles: Article[], baseUrl: string): string => {
  const currentDate = new Date().toISOString();
  
  const urlEntries = articles.map(article => {
    const articleUrl = `${baseUrl}/articles/${article.slug || article.id}`;
    const lastMod = new Date(article.date).toISOString();
    
    return `  <url>
    <loc>${articleUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <news:news>
      <news:publication>
        <news:name>The Bullish Brief</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${lastMod}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
      <news:keywords>${escapeXml((article.tags || []).join(', '))}</news:keywords>
    </news:news>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Articles -->
${urlEntries}
</urlset>`;
};

/**
 * Generate RSS feed content
 */
export const generateRSSFeed = (articles: Article[], baseUrl: string): string => {
  const currentDate = new Date().toUTCString();
  const siteTitle = 'The Bullish Brief';
  const siteDescription = 'Premium financial intelligence and market insights delivered daily. Stay ahead of the market with The Bullish Brief.';
  
  const items = articles.slice(0, 20).map(article => {
    const articleUrl = `${baseUrl}/articles/${article.slug || article.id}`;
    const pubDate = new Date(article.date).toUTCString();
    const description = article.subtitle || 'Read this article on The Bullish Brief';
    const categories = [article.category, ...(article.tags || [])];
    
    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid>${articleUrl}</guid>
      <description>${escapeXml(description)}</description>
      <author>noreply@bullishbrief.com (${escapeXml(article.author)})</author>
      <pubDate>${pubDate}</pubDate>
      ${categories.map(cat => `<category>${escapeXml(cat)}</category>`).join('\n      ')}
      <enclosure url="${article.image}" type="image/jpeg" />
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}</title>
    <link>${baseUrl}</link>
    <description>${siteDescription}</description>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/images/logo.png</url>
      <title>${siteTitle}</title>
      <link>${baseUrl}</link>
    </image>
${items}
  </channel>
</rss>`;
};

/**
 * Escape XML special characters
 */
const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Generate meta keywords from article tags and category
 */
export const generateMetaKeywords = (article: Article): string => {
  const keywords = [
    article.category,
    ...(article.tags || []),
    'financial news',
    'market insights',
    'bullish brief',
    'finance',
    'investing',
    'stocks',
    'trading'
  ].filter(Boolean);
  
  return keywords.join(', ');
};

/**
 * Generate article excerpt for meta description
 */
export const generateMetaDescription = (article: Article, maxLength: number = 160): string => {
  if (article.subtitle && article.subtitle.length <= maxLength) {
    return article.subtitle;
  }
  
  if (article.content) {
    const textContent = article.content.replace(/<[^>]*>/g, '').trim();
    if (textContent.length <= maxLength) {
      return textContent;
    }
    return textContent.substring(0, maxLength - 3) + '...';
  }
  
  return `Read ${article.title} on The Bullish Brief - Premium financial intelligence and market insights.`;
};

/**
 * Generate canonical URL for article
 */
export const generateCanonicalUrl = (article: Article, baseUrl: string): string => {
  return `${baseUrl}/articles/${article.slug || article.id}`;
};

/**
 * Generate structured data for article
 */
export const generateArticleStructuredData = (article: Article, baseUrl: string, viewCount?: number) => {
  const articleUrl = generateCanonicalUrl(article, baseUrl);
  
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": generateMetaDescription(article),
    "image": {
      "@type": "ImageObject",
      "url": article.image,
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Person",
      "name": article.author,
      "url": article.authorSlug ? `${baseUrl}/authors/${article.authorSlug}` : undefined
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Bullish Brief",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`,
        "width": 200,
        "height": 60
      }
    },
    "datePublished": new Date(article.date).toISOString(),
    "dateModified": new Date(article.date).toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "url": articleUrl,
    "articleSection": article.category,
    "keywords": generateMetaKeywords(article),
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ReadAction",
        "userInteractionCount": viewCount || parseInt(article.views.replace(/,/g, '')) || 0
      },
      {
        "@type": "InteractionCounter", 
        "interactionType": "https://schema.org/CommentAction",
        "userInteractionCount": article.comment_count || 0
      }
    ],
    "about": article.tags?.map(tag => ({
      "@type": "Thing",
      "name": tag
    }))
  };
};

/**
 * BRIEF-SPECIFIC SEO UTILITIES
 */

/**
 * Generate meta keywords from brief tickers, company name, and content
 */
export const generateBriefMetaKeywords = (brief: Brief): string => {
  const keywords = [
    brief.company_name,
    ...(Array.isArray(brief.tickers) ? brief.tickers : []),
    'investor brief',
    'financial analysis',
    'market insights',
    'bullish brief',
    'finance',
    'investing',
    'stocks',
    'trading'
  ].filter(Boolean);
  
  return keywords.join(', ');
};

/**
 * Generate brief excerpt for meta description
 */
export const generateBriefMetaDescription = (brief: Brief, maxLength: number = 160): string => {
  if (brief.subtitle && brief.subtitle.length <= maxLength) {
    return brief.subtitle;
  }
  
  if (brief.disclaimer && brief.disclaimer.length <= maxLength) {
    return brief.disclaimer;
  }
  
  if (brief.content) {
    const textContent = brief.content.replace(/<[^>]*>/g, '').trim();
    if (textContent.length <= maxLength) {
      return textContent;
    }
    return textContent.substring(0, maxLength - 3) + '...';
  }
  
  return `${brief.title} - Comprehensive investor brief and financial analysis from The Bullish Brief.`;
};

/**
 * Generate canonical URL for brief
 */
export const generateBriefCanonicalUrl = (brief: Brief, baseUrl: string): string => {
  return `${baseUrl}/briefs/${brief.slug || brief.id}`;
};

/**
 * Generate structured data for brief
 */
export const generateBriefStructuredData = (brief: Brief, baseUrl: string, viewCount?: number) => {
  const briefUrl = generateBriefCanonicalUrl(brief, baseUrl);
  
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": brief.title,
    "description": generateBriefMetaDescription(brief),
    "image": {
      "@type": "ImageObject",
      "url": brief.featured_image_url || `${baseUrl}/images/logo.png`,
      "width": 1200,
      "height": 630,
      "alt": brief.featured_image_alt || brief.title
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Bullish Brief",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`,
        "width": 200,
        "height": 60
      },
      "sameAs": [
        "https://twitter.com/thebullishbrief",
        "https://linkedin.com/company/thebullishbrief"
      ]
    },
    "datePublished": new Date(brief.published_at || brief.created_at || new Date()).toISOString(),
    "dateModified": new Date(brief.updated_at || brief.created_at || new Date()).toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": briefUrl
    },
    "url": briefUrl,
    "articleSection": "Investor Briefs",
    "keywords": generateBriefMetaKeywords(brief),
    "wordCount": brief.content?.length || 0,
    "articleBody": brief.content || "",
    "isAccessibleForFree": true,
    "isPartOf": {
      "@type": "CreativeWork",
      "name": "The Bullish Brief",
      "url": baseUrl
    },
    "about": brief.company_name ? {
      "@type": "Corporation",
      "name": brief.company_name,
      "tickerSymbol": Array.isArray(brief.tickers) ? brief.tickers[0] : undefined
    } : undefined,
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ReadAction",
        "userInteractionCount": viewCount || brief.view_count || 0
      }
    ]
  };
};

/**
 * Generate breadcrumb structured data for brief
 */
export const generateBriefBreadcrumbData = (brief: Brief, baseUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Investor Briefs",
        "item": `${baseUrl}/briefs`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": brief.title,
        "item": generateBriefCanonicalUrl(brief, baseUrl)
      }
    ]
  };
};
