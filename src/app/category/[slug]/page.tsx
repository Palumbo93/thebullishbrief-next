"use client";

import React, { Suspense } from 'react';
import { Layout } from '../../../components/Layout';
import { CategoryPageClient } from '../../../page-components/CategoryPageClient';
import { PageSkeleton } from '@/components/PageSkeleton';

interface Props {
  params: Promise<{ slug: string }>;
}

function CategoryPageContent({ params }: Props) {
  return (
    <Layout>
      <CategoryPageClient params={params} />
    </Layout>
  );
}

export default function CategoryPageWrapper({ params }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoryPageContent params={params} />
    </Suspense>
  );
}
