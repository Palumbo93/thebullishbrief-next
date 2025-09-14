import { Metadata } from 'next';
import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export const metadata: Metadata = {
  title: 'About | The Bullish Brief',
  description: 'Learn about The Bullish Brief - a modern finance publication delivering sharp, useful insights on markets, companies, and trends for serious investors.',
  keywords: 'about, finance publication, market insights, investment analysis, The Bullish Brief, financial news',
  robots: 'index, follow',
  openGraph: {
    title: 'About | The Bullish Brief',
    description: 'Learn about The Bullish Brief - a modern finance publication delivering sharp, useful insights for serious investors.',
    url: 'https://bullishbrief.com/about',
    siteName: 'The Bullish Brief',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About | The Bullish Brief',
    description: 'Learn about The Bullish Brief - a modern finance publication delivering sharp, useful insights for serious investors.',
  },
};

export default function AboutPage() {
  const doc = getLegalDocument('about');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
