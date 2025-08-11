import React from 'react';
import type { Metadata } from 'next';
import { Layout } from '../../../components/Layout';
import { BullRoomPage } from '../../../pages/BullRoomPage';
import { supabase } from '../../../lib/supabase';

interface Props {
  params: { roomSlug: string };
}

async function getRoom(roomSlug: string) {
  const { data: room, error } = await supabase
    .from('bull_rooms')
    .select('*')
    .eq('slug', roomSlug)
    .single();

  if (error || !room) {
    return null;
  }

  return room;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const room = await getRoom(params.roomSlug);
  
  if (!room) {
    return {
      title: 'Room Not Found | Bull Room | The Bullish Brief',
      description: 'The Bull Room you are looking for could not be found.'
    };
  }

  const title = `${room.name} | Bull Room | The Bullish Brief`;
  const description = room.description || `Join the ${room.name} Bull Room for real-time discussions about financial markets and investment opportunities.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/bull-room/${room.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'The Bullish Brief',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/images/logo.png`,
          width: 1200,
          height: 630,
          alt: `${room.name} - Bull Room Community`,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/images/logo.png`],
      creator: '@thebullishbrief',
      site: '@thebullishbrief',
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function BullRoomPageWrapper({ params }: Props) {
  return (
    <Layout>
      <BullRoomPage roomSlug={params.roomSlug} />
    </Layout>
  );
}
