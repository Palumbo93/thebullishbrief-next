import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { Layout } from '../../../components/Layout';
import { CategoryPageClient } from '../../../page-components/CategoryPageClient';
import { fetchCategoryBySlug, fetchAllCategorySlugs, fetchCategoryBySlugForMetadata } from '../../../hooks/useArticles';

// Generate static params for only active categories at build time
// New or less active categories will be generated on-demand via ISR
export async function generateStaticParams() {
  try {
    const slugs = await fetchAllCategorySlugs();
    // Pre-generate all categories at build time since there are typically fewer categories
    return slugs.map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    console.error('Error generating static params for category pages:', error);
    return [];
  }
}

// Enable dynamic params for ISR - allows generating pages on-demand for unknown routes
export const dynamicParams = true;

// Define revalidation settings for ISR
// Disable automatic ISR revalidation - rely on build trigger for all updates
// This makes content updates predictable and controlled via build trigger
export const revalidate = false; // No automatic revalidation - build trigger controls all updates

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    const category = await fetchCategoryBySlugForMetadata(slug);
    
    if (!category) {
      return {
        title: 'Category Not Found',
        description: 'The requested category could not be found.',
      };
    }

    const siteName = 'The Bullish Brief';
    const title = `${category.name} | ${siteName}`;
    const description = category.description || `Read the latest articles in ${category.name} on ${siteName}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for category:', error);
    return {
      title: 'Category | The Bullish Brief',
      description: 'Read the latest financial news and analysis.',
    };
  }
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Verify the category exists on the server side
  const category = await fetchCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }

  return (
    <>
      <Layout>
        <CategoryPageClient params={params} />
      </Layout>
      <Script
        id="category-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: category.name,
            description: category.description || `Read the latest articles in ${category.name}`,
            url: `https://thebullishbrief.com/category/${slug}`,
            mainEntity: {
              '@type': 'ItemList',
              name: `${category.name} Articles`,
            },
          }),
        }}
      />
    </>
  );
}
