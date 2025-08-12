"use client";

import React, { Suspense } from 'react';
import { Layout } from '../../components/Layout';
import { SearchPage } from '../../page-components/SearchPage';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function ExplorePageContent() {
  return (
    <Layout>
      <SearchPage />
    </Layout>
  );
}

export default function ExplorePageWrapper({ searchParams }: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExplorePageContent />
    </Suspense>
  );
}
