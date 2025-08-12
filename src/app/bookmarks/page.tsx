"use client";

import dynamic from 'next/dynamic';

const BookmarksPage = dynamic(() => import('../../page-components/BookmarksPage').then(mod => ({ default: mod.BookmarksPage })), {
  ssr: false,
});

const Layout = dynamic(() => import('../../components/Layout').then(mod => ({ default: mod.Layout })), {
  ssr: false,
});

export default function BookmarksPageClient() {
  return (
    <Layout>
      <BookmarksPage />
    </Layout>
  );
}
