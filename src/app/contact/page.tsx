import { Metadata } from 'next';
import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export const metadata: Metadata = {
  title: 'Contact Us | The Bullish Brief',
  description: 'Get in touch with The Bullish Brief team. Contact us for questions, feedback, or support. We typically respond within 48 hours.',
  keywords: 'contact, support, feedback, email, The Bullish Brief',
  robots: 'index, follow',
  openGraph: {
    title: 'Contact Us | The Bullish Brief',
    description: 'Get in touch with The Bullish Brief team for questions, feedback, or support.',
    url: 'https://bullishbrief.com/contact',
    siteName: 'The Bullish Brief',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us | The Bullish Brief',
    description: 'Get in touch with The Bullish Brief team for questions, feedback, or support.',
  },
};

export default function ContactPage() {
  const doc = getLegalDocument('contact');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
