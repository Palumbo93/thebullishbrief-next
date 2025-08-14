import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { Layout } from '../../../components/Layout';
import { AuthorPageClient } from '../../../page-components/AuthorPageClient';
import { fetchAuthorBySlug, fetchAllAuthorSlugs, fetchAuthorBySlugForMetadata } from '../../../hooks/useArticles';

// Generate static params for all known authors
export async function generateStaticParams() {
  try {
    const slugs = await fetchAllAuthorSlugs();
    return slugs.map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    console.error('Error generating static params for authors:', error);
    return [];
  }
}

// Generate metadata for each author
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const author = await fetchAuthorBySlugForMetadata(slug);
    
    if (!author) {
      return {
        title: 'Author Not Found - The Bullish Brief',
        description: 'The requested author could not be found.',
      };
    }

    const authorUrl = `https://bullishbrief.com/authors/${slug}`;
    const authorImage = author.avatar_url || 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png';
    const description = author.bio || `Read articles by ${author.name} on The Bullish Brief`;
    
    return {
      title: `${author.name} - Author - The Bullish Brief`,
      description: description,
      openGraph: {
        title: `${author.name} - Author`,
        description: description,
        url: authorUrl,
        siteName: 'The Bullish Brief',
        images: [
          {
            url: authorImage,
            width: 1200,
            height: 630,
            alt: author.name,
          },
        ],
        locale: 'en_US',
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${author.name} - Author`,
        description: description,
        images: [authorImage],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for author:', error);
    return {
      title: 'Author - The Bullish Brief',
      description: 'Your daily dose of bullish market insights and financial analysis',
    };
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AuthorPageWrapper({ params }: Props) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }
  
  // Fetch author data on the server for the Layout and schema
  let author;
  let rawAuthor;
  try {
    author = await fetchAuthorBySlug(slug);
    rawAuthor = await fetchAuthorBySlugForMetadata(slug);
  } catch (error) {
    console.error('Error fetching author:', error);
    notFound();
  }

  // Generate JSON-LD schema for Person
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: rawAuthor.name,
    description: rawAuthor.bio || `Author at The Bullish Brief`,
    image: rawAuthor.avatar_url || 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
    url: `https://bullishbrief.com/authors/${slug}`,
    sameAs: [
      ...(rawAuthor.website_url ? [rawAuthor.website_url] : []),
      ...(rawAuthor.linkedin_url ? [rawAuthor.linkedin_url] : []),
      ...(rawAuthor.twitter_handle ? [`https://twitter.com/${rawAuthor.twitter_handle}`] : [])
    ].filter(Boolean),
    worksFor: {
      '@type': 'Organization',
      name: 'The Bullish Brief',
      url: 'https://bullishbrief.com'
    }
  };
  
  return (
    <>
      <Script
        id="author-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout>
        <AuthorPageClient slug={slug} />
      </Layout>
    </>
  );
}
