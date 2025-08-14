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
    const description = brief.subtitle || brief.title;
    
    return {
      title: `${brief.title} - The Bullish Brief`,
      description: description,
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
        publishedTime: brief.created_at || undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: brief.title,
        description: description,
        images: [briefImage],
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

  // Generate JSON-LD schema for NewsArticle
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: rawBrief.title,
    description: rawBrief.subtitle || rawBrief.title,
    image: rawBrief.featured_image_url || 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
    datePublished: rawBrief.created_at,
    dateModified: rawBrief.updated_at || rawBrief.created_at,
    publisher: {
      '@type': 'Organization',
      name: 'The Bullish Brief',
      logo: {
        '@type': 'ImageObject',
        url: 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://bullishbrief.com/briefs/${slug}`,
    },
    url: `https://bullishbrief.com/briefs/${slug}`,
    articleSection: 'Investor Briefs',
    keywords: rawBrief.company_name ? `${rawBrief.company_name}, investor brief, financial analysis, markets` : 'investor brief, financial analysis, markets',
  };
  
  return (
    <>
      <Script
        id="brief-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BriefPageClient briefSlug={slug} />
    </>
  );
}
