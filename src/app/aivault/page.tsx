import React from 'react';
import type { Metadata } from 'next';
import { Layout } from '../../components/Layout';
import { AIVault } from '../../pages/AIVault';

export const metadata: Metadata = {
  title: 'AI Vault | The Bullish Brief',
  description: 'Discover and use powerful AI prompts for financial analysis, market research, and investment strategies. Premium curated prompts for professional traders and analysts.',
  keywords: ['AI prompts', 'financial analysis', 'trading prompts', 'investment AI', 'market research', 'financial AI tools'],
  openGraph: {
    title: 'AI Vault | The Bullish Brief',
    description: 'Discover and use powerful AI prompts for financial analysis, market research, and investment strategies. Premium curated prompts for professional traders and analysts.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/aivault`,
    siteName: 'The Bullish Brief',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: 'AI Vault - Premium Financial AI Prompts',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Vault | The Bullish Brief',
    description: 'Discover and use powerful AI prompts for financial analysis, market research, and investment strategies.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/images/logo.png`],
    creator: '@thebullishbrief',
    site: '@thebullishbrief',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/aivault`,
  },
};

export default function AIVaultPageWrapper() {
  return (
    <Layout>
      <AIVault />
    </Layout>
  );
}
