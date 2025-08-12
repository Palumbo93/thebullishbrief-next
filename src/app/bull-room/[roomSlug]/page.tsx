"use client";

import React from 'react';
import { BullRoomPage } from '../../../page-components/BullRoomPage';
import { Layout } from '../../../components/Layout';

interface Props {
  params: Promise<{ roomSlug: string }>;
}

export default function BullRoomPageWrapper({ params }: Props) {
  const [roomSlug, setRoomSlug] = React.useState<string>('');
  
  React.useEffect(() => {
    params.then(({ roomSlug }) => setRoomSlug(roomSlug));
  }, [params]);
  
  if (!roomSlug) return null;
  
  return (
    <Layout>
      <BullRoomPage roomSlug={roomSlug} />
    </Layout>
  );
}
