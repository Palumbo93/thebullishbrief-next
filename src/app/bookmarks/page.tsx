import type { Metadata } from 'next';
import { BookmarksPage } from '../../pages/BookmarksPage';
import { Layout } from '../../components/Layout';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Bookmarks - The Bullish Brief',
    description: 'View and manage your saved articles and bookmarks.',
    robots: {
      index: false, // Don't index user bookmark pages
      follow: false,
    },
  };
}

function BookmarksPageClient() {
  return (
    <Layout>
      <BookmarksPage />
    </Layout>
  );
}

export default BookmarksPageClient;
