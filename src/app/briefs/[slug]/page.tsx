import React from 'react';
import type { Metadata } from 'next';
import { BriefPage } from '../../../pages/BriefPage';
import { supabase } from '../../../lib/supabase';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBrief(slug: string) {
  const { data: brief, error } = await supabase
    .from('briefs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !brief) {
    return null;
  }

  return brief;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brief = await getBrief(slug);
  
  if (!brief) {
    return {
      title: 'Brief Not Found | The Bullish Brief',
      description: 'The brief you are looking for could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${brief.title} | The Bullish Brief`;
  const description = brief.subtitle || `${brief.title} - Exclusive brief from The Bullish Brief.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: brief.featured_image_url ? [
        {
          url: brief.featured_image_url,
          width: 1200,
          height: 630,
          alt: brief.title,
        }
      ] : [],
      type: 'article',
      siteName: 'The Bullish Brief',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: brief.featured_image_url ? [brief.featured_image_url] : [],
      site: '@thebullishbrief',
    },
    robots: {
      index: false, // Don't let robots crawl brief pages
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  };
}

export default async function BriefPageWrapper({ params }: Props) {
  const { slug } = await params;
  return (
    <BriefPageClient slug={slug} />
  );
}

// Client component to handle the interactive parts
function BriefPageClient({ slug }: { slug: string }) {
  'use client';
  
  return (
    <BriefPage briefSlug={slug} />
  );
}
