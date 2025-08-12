import React from 'react';
import type { Metadata } from 'next';
import { Layout } from '../../components/Layout';
import { SearchPage } from '../../pages/SearchPage';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q as string;
  const tags = resolvedSearchParams.tags as string;
  
  let title = 'Search | The Bullish Brief';
  let description = 'Search through The Bullish Brief\'s comprehensive collection of financial articles, market analysis, and investment insights.';
  
  if (query) {
    title = `Search: "${query}" | The Bullish Brief`;
    description = `Search results for "${query}" - Find relevant articles, analysis, and insights from The Bullish Brief.`;
  } else if (tags) {
    const tagList = tags.split(',');
    title = `Tagged: ${tagList.join(', ')} | The Bullish Brief`;
    description = `Articles tagged with ${tagList.join(', ')} - Explore related content on The Bullish Brief.`;
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/search`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'The Bullish Brief',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      site: '@thebullishbrief',
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SearchPageWrapper({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  return (
    <SearchPageClient searchParams={resolvedSearchParams} />
  );
}

// Client component to handle the interactive parts
function SearchPageClient({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  'use client';
  
  return (
    <Layout>
      <SearchPage />
    </Layout>
  );
}
