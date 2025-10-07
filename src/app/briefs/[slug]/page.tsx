import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { BriefPageServer, ServerBrief } from '../../../page-components/BriefPageServer';
import { BriefInteractiveShell } from '../../../components/briefs/BriefInteractiveShell';
import { Layout } from '../../../components/Layout';
import { LegalFooter } from '../../../components/LegalFooter';
import { fetchAllBriefSlugs, fetchBriefBySlugForMetadata, fetchBriefBySlugIncludingDrafts } from '../../../hooks/useBriefs';
import { determineBriefAccess } from '../../../lib/serverAccessControl';
import { parseTOCFromContent, getFirstTickerSymbol, getCountryAppropriateTickerSymbol } from '../../../utils/tocParser';
// BriefsActionPanel will be handled by the client component

// Generate static params for ALL briefs at build time
export async function generateStaticParams() {
  try {
    const slugs = await fetchAllBriefSlugs();
    // Pre-generate ALL briefs at build time to prevent 404s
    console.log(`📄 Generating static params for ${slugs.length} briefs`);
    return slugs.map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    console.error('Error generating static params for briefs:', error);
    return [];
  }
}

// Enable dynamic params for ISR - allows generating pages on-demand for unknown routes
export const dynamicParams = true;

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

// Disable automatic ISR revalidation - rely on build trigger for all updates
// This makes content updates predictable and controlled via build trigger
export const revalidate = false; // No automatic revalidation - build trigger controls all updates

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BriefPageWrapper({ params }: Props) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }
  
  // Fetch brief data for server-side rendering
  let rawBrief;
  let brief;
  try {
    rawBrief = await fetchBriefBySlugForMetadata(slug);
    brief = await fetchBriefBySlugIncludingDrafts(slug);
  } catch (error) {
    console.error('Error fetching brief:', error);
    notFound();
  }

  // Determine brief access server-side
  const accessResult = await determineBriefAccess({
    id: String(brief.id),
    title: brief.title,
    premium: false, // Briefs are typically free
    status: 'published', // Default to published
    content: brief.content,
    preview: brief.content?.substring(0, 1000) // Generate preview
  });

  // Transform brief data for server component
  const serverBrief: ServerBrief = {
    id: String(brief.id),
    title: brief.title,
    slug: brief.slug || slug,
    subtitle: brief.subtitle || undefined,
    content: brief.content || '',
    disclaimer: brief.disclaimer ?? undefined,
    company_name: brief.company_name ?? undefined,
    tickers: Array.isArray(brief.tickers) ? brief.tickers as string[] : undefined,
    brokerage_links: brief.brokerage_links as { [key: string]: string } | null | undefined,
    featured_image_url: brief.featured_image_url ?? undefined,
    featured_image_alt: brief.featured_image_alt ?? undefined,
    video_url: brief.video_url ?? undefined,
    featured_video_thumbnail: brief.featured_video_thumbnail ?? undefined,
    feature_featured_video: brief.feature_featured_video,
    show_featured_media: brief.show_featured_media,
    published_at: brief.published_at ?? undefined,
    created_at: brief.created_at ?? undefined,
    reading_time_minutes: brief.reading_time_minutes ?? undefined,
    additional_copy: brief.additional_copy,
    popup_copy: brief.popup_copy
  };

  // Parse TOC sections for action panel
  const tocSections = brief.content ? parseTOCFromContent(brief.content) : [];
  
  // Debug: Log the ticker data to see what we're dealing with
  console.log('Brief tickers:', brief.tickers, 'Type:', typeof brief.tickers);

  // Generate ticker widget for action panel
  const firstTickerSymbol = brief.tickers ? getFirstTickerSymbol(brief.tickers) : null;
  
  // Convert tickers to safe string array
  const safeTickers = (() => {
    if (!brief.tickers) return undefined;
    if (Array.isArray(brief.tickers)) {
      return brief.tickers.filter(ticker => typeof ticker === 'string');
    }
    // If it's an object like {CSE: "SONC"} or {CSE}, convert to array
    if (typeof brief.tickers === 'object') {
      return Object.keys(brief.tickers);
    }
    return undefined;
  })();

  // Action panel will be handled by client component

  const mobileHeaderProps = {
    companyName: brief.company_name || undefined,
    tickers: Array.isArray(brief.tickers) ? brief.tickers as string[] : undefined,
    // Note: onShareClick will be handled by client component
  };

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
    datePublished: rawBrief.published_at || rawBrief.created_at || new Date().toISOString(),
    dateModified: rawBrief.updated_at || rawBrief.created_at || new Date().toISOString(),
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
      
      <Layout
        mobileHeader={mobileHeaderProps}
        actionPanel={null}
      >
        <BriefInteractiveShell
          brief={serverBrief}
          slug={slug}
        >
          <BriefPageServer
            brief={serverBrief}
            slug={slug}
          />
        </BriefInteractiveShell>
      </Layout>
      
      {/* Legal Footer - Full bleed outside container */}
      <div style={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        marginTop: 'var(--space-16)'
      }}>
        <LegalFooter />
      </div>
    </>
  );
}
