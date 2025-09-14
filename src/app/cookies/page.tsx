import { Metadata } from 'next';
import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export const metadata: Metadata = {
  title: 'Cookie Policy | The Bullish Brief',
  description: 'Cookie policy for The Bullish Brief. Learn how we use cookies, manage your preferences, and protect your privacy while browsing our site.',
  keywords: 'cookie policy, cookies, privacy, tracking, GDPR, data protection, The Bullish Brief',
  robots: 'index, follow',
  openGraph: {
    title: 'Cookie Policy | The Bullish Brief',
    description: 'Cookie policy for The Bullish Brief. Learn how we use cookies and manage your privacy preferences.',
    url: 'https://bullishbrief.com/cookies',
    siteName: 'The Bullish Brief',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cookie Policy | The Bullish Brief',
    description: 'Cookie policy for The Bullish Brief. Learn how we use cookies and manage your privacy preferences.',
  },
};

export default function CookiesPage() {
  const doc = getLegalDocument('cookies');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
