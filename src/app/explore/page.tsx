import React from 'react';
import type { Metadata } from 'next';
import { Layout } from '../../components/Layout';
import { SearchPage } from '../../pages/SearchPage';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  await searchParams; // await but don't use
  const title = 'Explore - The Bullish Brief';
  const description = 'Discover trending topics, popular authors, and the latest financial insights. Explore The Bullish Brief\'s comprehensive collection of market analysis and investment intelligence.';
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/explore`;

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

export default async function ExplorePageWrapper({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  return (
    <ExplorePageClient searchParams={resolvedSearchParams} />
  );
}

// Client component to handle the interactive parts
function ExplorePageClient({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  'use client';
  
  return (
    <Layout>
      <SearchPage />
    </Layout>
  );
}
