import { Metadata } from 'next';
import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export const metadata: Metadata = {
  title: 'Disclaimer | The Bullish Brief',
  description: 'Important disclaimers for The Bullish Brief. Learn about investment risks, information accuracy, and legal limitations of our financial content.',
  keywords: 'disclaimer, investment risk, financial advice, legal notice, The Bullish Brief',
  robots: 'index, follow',
  openGraph: {
    title: 'Disclaimer | The Bullish Brief',
    description: 'Important disclaimers for The Bullish Brief regarding investment risks and content accuracy.',
    url: 'https://bullishbrief.com/disclaimer',
    siteName: 'The Bullish Brief',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Disclaimer | The Bullish Brief',
    description: 'Important disclaimers for The Bullish Brief regarding investment risks and content accuracy.',
  },
};

export default function DisclaimerPage() {
  const doc = getLegalDocument('disclaimer');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
