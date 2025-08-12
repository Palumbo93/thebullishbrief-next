import React from 'react';
import { notFound } from 'next/navigation';
import { BriefPageClient } from '../../../page-components/BriefPageClient';
import { fetchAllBriefSlugs } from '../../../hooks/useBriefs';

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
  
  return <BriefPageClient briefSlug={slug} />;
}
