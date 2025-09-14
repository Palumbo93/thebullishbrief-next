import { Metadata } from 'next';
import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export const metadata: Metadata = {
  title: 'Terms and Conditions | The Bullish Brief',
  description: 'Terms and conditions for using The Bullish Brief website and services. Learn about our policies, user rights, and legal obligations.',
  keywords: 'terms and conditions, legal, policy, user agreement, The Bullish Brief',
  robots: 'index, follow',
  openGraph: {
    title: 'Terms and Conditions | The Bullish Brief',
    description: 'Terms and conditions for using The Bullish Brief website and services.',
    url: 'https://bullishbrief.com/terms',
    siteName: 'The Bullish Brief',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms and Conditions | The Bullish Brief',
    description: 'Terms and conditions for using The Bullish Brief website and services.',
  },
};

export default function TermsPage() {
  const doc = getLegalDocument('terms');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
