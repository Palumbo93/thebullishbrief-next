"use client";

import React, { Suspense } from 'react';
import { Layout } from '../../components/Layout';
import { SearchPage } from '../../page-components/SearchPage';
import { LoadingScreen } from '../../components/LoadingScreen';

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
    <Suspense fallback={<LoadingScreen onComplete={() => {}} />}>
      <ExplorePageContent />
    </Suspense>
  );
}
