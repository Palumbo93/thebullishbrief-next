import React from 'react';
import { notFound } from 'next/navigation';
import { BriefPageClient } from '../../../page-components/BriefPageClient';

// Force dynamic rendering for all brief pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
