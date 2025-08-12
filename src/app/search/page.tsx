"use client";

import React, { Suspense } from 'react';
import { Layout } from '../../components/Layout';
import { SearchPage } from '../../page-components/SearchPage';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function SearchPageContent() {
  return (
    <Layout>
      <SearchPage />
    </Layout>
  );
}

export default function SearchPageWrapper({ searchParams }: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
