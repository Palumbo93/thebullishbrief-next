import React from 'react';
import type { Metadata } from 'next';
import { Layout } from '../../components/Layout';
import { SearchPage } from '../../pages/SearchPage';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
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

export default function ExplorePageWrapper({ searchParams }: Props) {
  return (
    <ExplorePageClient searchParams={searchParams} />
  );
}

// Client component to handle the interactive parts
function ExplorePageClient({ searchParams }: { searchParams: Props['searchParams'] }) {
  'use client';
  
  return (
    <Layout>
      <SearchPage />
    </Layout>
  );
}
