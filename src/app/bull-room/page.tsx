import React from 'react';
import type { Metadata } from 'next';
import { Layout } from '../../components/Layout';
import { BullRoomPage } from '../../pages/BullRoomPage';

export const metadata: Metadata = {
  title: 'Bull Room | The Bullish Brief',
  description: 'Join the Bull Room community - real-time chat and discussions about the latest financial markets and investment opportunities.',
  openGraph: {
    title: 'Bull Room | The Bullish Brief',
    description: 'Join the Bull Room community - real-time chat and discussions about the latest financial markets and investment opportunities.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/bull-room`,
    siteName: 'The Bullish Brief',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: 'Bull Room - The Bullish Brief Community',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bull Room | The Bullish Brief',
    description: 'Join the Bull Room community - real-time chat and discussions about the latest financial markets and investment opportunities.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/images/logo.png`],
    creator: '@thebullishbrief',
    site: '@thebullishbrief',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/bull-room`,
  },
};

export default function BullRoomPageWrapper() {
  return (
    <Layout>
      <BullRoomPage />
    </Layout>
  );
}
