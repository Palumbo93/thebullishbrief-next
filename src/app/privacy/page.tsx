import { Metadata } from 'next';
import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy | The Bullish Brief',
  description: 'Privacy policy for The Bullish Brief. Learn how we collect, use, share, and protect your personal information when using our services.',
  keywords: 'privacy policy, data protection, personal information, cookies, GDPR, The Bullish Brief',
  robots: 'index, follow',
  openGraph: {
    title: 'Privacy Policy | The Bullish Brief',
    description: 'Privacy policy for The Bullish Brief. Learn how we collect, use, and protect your personal information.',
    url: 'https://bullishbrief.com/privacy',
    siteName: 'The Bullish Brief',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | The Bullish Brief',
    description: 'Privacy policy for The Bullish Brief. Learn how we collect, use, and protect your personal information.',
  },
};

export default function PrivacyPage() {
  const doc = getLegalDocument('privacy');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
