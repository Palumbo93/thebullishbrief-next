import React from 'react';
import type { Metadata } from 'next';
import { Layout } from '../../../components/Layout';
import { AuthorPage } from '../../../pages/AuthorPage';
import { supabase } from '../../../lib/supabase';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getAuthor(slug: string) {
  const { data: author, error } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !author) {
    return null;
  }

  return author;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthor(slug);
  
  if (!author) {
    return {
      title: 'Author Not Found | The Bullish Brief',
      description: 'The author you are looking for could not be found.'
    };
  }

  const title = `${author.name} | The Bullish Brief`;
  const description = author.bio || `Read articles by ${author.name} on The Bullish Brief - Premium financial intelligence and market insights.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/authors/${author.slug}`;

  return {
    title,
    description,
    authors: [{ name: author.name }],
    openGraph: {
      title,
      description,
      url,
      siteName: 'The Bullish Brief',
      images: author.avatar_url ? [
        {
          url: author.avatar_url,
          width: 400,
          height: 400,
          alt: `${author.name} - Author at The Bullish Brief`,
        }
      ] : [],
      locale: 'en_US',
      type: 'profile',
      firstName: author.name.split(' ')[0],
      lastName: author.name.split(' ').slice(1).join(' '),
      username: author.slug,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: author.avatar_url ? [author.avatar_url] : [],
      creator: author.twitter_handle ? `@${author.twitter_handle}` : '@thebullishbrief',
      site: '@thebullishbrief',
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function AuthorPageWrapper({ params }: Props) {
  const { slug } = await params;
  return (
    <AuthorPageClient slug={slug} />
  );
}

// Client component to handle the interactive parts
function AuthorPageClient({ slug }: { slug: string }) {
  'use client';
  
  return (
    <Layout>
      <AuthorPage authorSlug={slug} />
    </Layout>
  );
}
