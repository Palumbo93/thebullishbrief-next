import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { BriefPageClient } from '../../../page-components/BriefPageClient';
import { fetchAllBriefSlugs, fetchBriefBySlugForMetadata } from '../../../hooks/useBriefs';

// Generate static params for all known briefs
export async function generateStaticParams() {
  try {
    const slugs = await fetchAllBriefSlugs();
    return slugs.map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    console.error('Error generating static params for briefs:', error);
    return [];
  }
}

// Generate metadata for each brief
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const brief = await fetchBriefBySlugForMetadata(slug);
    
    if (!brief) {
      return {
        title: 'Brief Not Found - The Bullish Brief',
        description: 'The requested brief could not be found.',
      };
    }

    const briefUrl = `https://bullishbrief.com/briefs/${slug}`;
    const briefImage = brief.featured_image_url || 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png';
    const description = brief.subtitle || brief.disclaimer || `${brief.title} - Comprehensive investor brief and financial analysis from The Bullish Brief.`;
    
    // Generate keywords from company name, tickers, and brief content
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
    ].filter(Boolean).join(', ');
    
    return {
      title: `${brief.title} - The Bullish Brief`,
      description: description,
      keywords: keywords,
      openGraph: {
        title: brief.title,
        description: description,
        url: briefUrl,
        siteName: 'The Bullish Brief',
        images: [
          {
            url: briefImage,
            width: 1200,
            height: 630,
            alt: brief.featured_image_alt || brief.title,
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: brief.published_at || brief.created_at || undefined,
        modifiedTime: brief.updated_at || brief.created_at || undefined,
        section: 'Investor Briefs',
        tags: Array.isArray(brief.tickers) ? brief.tickers : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: brief.title,
        description: description,
        images: [briefImage],
        creator: '@thebullishbrief',
        site: '@thebullishbrief',
      },
      alternates: {
        canonical: briefUrl,
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
        'article:published_time': brief.published_at || brief.created_at || '',
        'article:modified_time': brief.updated_at || brief.created_at || '',
        'article:section': 'Investor Briefs',
        'article:tag': keywords,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for brief:', error);
    return {
      title: 'Brief - The Bullish Brief',
      description: 'Your daily dose of bullish market insights and financial analysis',
    };
  }
}

// Enable static generation with revalidation
export const revalidate = 3600; // Revalidate every hour

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BriefPageWrapper({ params }: Props) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }
  
  // Fetch brief data for schema
  let rawBrief;
  try {
    rawBrief = await fetchBriefBySlugForMetadata(slug);
  } catch (error) {
    console.error('Error fetching brief:', error);
    notFound();
  }

  // Generate enhanced JSON-LD schema for NewsArticle
  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: rawBrief.title,
    description: rawBrief.subtitle || rawBrief.disclaimer || rawBrief.title,
    image: {
      '@type': 'ImageObject',
      url: rawBrief.featured_image_url || 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
      width: 1200,
      height: 630,
      alt: rawBrief.featured_image_alt || rawBrief.title,
    },
    datePublished: rawBrief.published_at || rawBrief.created_at,
    dateModified: rawBrief.updated_at || rawBrief.created_at,
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
      '@id': `https://bullishbrief.com/briefs/${slug}`,
    },
    url: `https://bullishbrief.com/briefs/${slug}`,
    articleSection: 'Investor Briefs',
    keywords: [
      rawBrief.company_name,
      ...(Array.isArray(rawBrief.tickers) ? rawBrief.tickers : []),
      'investor brief',
      'financial analysis',
      'market insights'
    ].filter(Boolean).join(', '),
    wordCount: rawBrief.content?.length || 0,
    articleBody: rawBrief.content || '',
    isAccessibleForFree: true,
    isPartOf: {
      '@type': 'CreativeWork',
      name: 'The Bullish Brief',
      url: 'https://bullishbrief.com',
    },
    about: rawBrief.company_name ? {
      '@type': 'Corporation',
      name: rawBrief.company_name,
      tickerSymbol: Array.isArray(rawBrief.tickers) ? rawBrief.tickers[0] : undefined,
    } : undefined,
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
        name: 'Investor Briefs',
        item: 'https://bullishbrief.com/briefs',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: rawBrief.title,
        item: `https://bullishbrief.com/briefs/${slug}`,
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
    description: 'Premium financial intelligence and investor briefs delivered daily. Stay ahead of the market with The Bullish Brief.',
    foundingDate: '2025',
    areaServed: 'Worldwide',
    knowsAbout: ['Finance', 'Markets', 'Investing', 'Trading', 'Cryptocurrency', 'Stocks', 'Investor Relations'],
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
      <BriefPageClient briefSlug={slug} />
    </>
  );
}
