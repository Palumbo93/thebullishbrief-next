import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { Layout } from '../../components/Layout';
import { AuthorPageClient } from '../../page-components/AuthorPageClient';
import { fetchAuthorBySlug, fetchAllAuthorSlugs, fetchAuthorBySlugForMetadata } from '../../hooks/useArticles';

// Generate static params for only active authors at root level at build time
// New or less active authors will be generated on-demand via ISR
export async function generateStaticParams() {
  try {
    const slugs = await fetchAllAuthorSlugs();
    // Only pre-generate the first 5 authors at build time (usually main authors)
    // The rest will be generated on-demand when first requested
    return slugs.slice(0, 5).map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    console.error('Error generating static params for root author pages:', error);
    return [];
  }
}

// Enable dynamic params for ISR - allows generating pages on-demand for unknown routes
export const dynamicParams = true;

// Enable static generation with revalidation
export const revalidate = 3600; // Revalidate every hour

// Generate metadata for each author at root level
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    // First check if this slug corresponds to an author
    const author = await fetchAuthorBySlugForMetadata(slug);
    
    if (!author) {
      return {
        title: 'Page Not Found - The Bullish Brief',
        description: 'The requested page could not be found.',
      };
    }

    const authorUrl = `https://bullishbrief.com/${slug}`;
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
      alternates: {
        canonical: authorUrl,
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
    };
  } catch (error) {
    console.error('Error generating metadata for root author page:', error);
    return {
      title: 'Page Not Found - The Bullish Brief',
      description: 'The requested page could not be found.',
    };
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RootAuthorPageWrapper({ params }: Props) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }
  
  // Check if this slug corresponds to an author
  let author;
  let rawAuthor;
  try {
    author = await fetchAuthorBySlug(slug);
    rawAuthor = await fetchAuthorBySlugForMetadata(slug);
    
    // If no author found, return 404
    if (!author || !rawAuthor) {
      notFound();
    }
  } catch (error) {
    console.error('Error fetching author at root level:', error);
    notFound();
  }

  // Generate JSON-LD schema for Person
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: rawAuthor.name,
    description: rawAuthor.bio || `Author at The Bullish Brief`,
    image: rawAuthor.avatar_url || 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
    url: `https://bullishbrief.com/${slug}`,
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
        name: rawAuthor.name,
        item: `https://bullishbrief.com/${slug}`,
      },
    ],
  };
  
  return (
    <>
      <Script
        id="author-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Layout>
        <AuthorPageClient slug={slug} />
      </Layout>
    </>
  );
}
