import React from 'react';
import { notFound } from 'next/navigation';
import { BullRoomPage } from '../../../page-components/BullRoomPage';
import { BullRoomLayout } from '../../../components/BullRoom/BullRoomLayout';
import { supabase } from '../../../lib/supabase';

interface Props {
  params: Promise<{ roomSlug: string }>;
}

// Generate static params for all available bull rooms
export async function generateStaticParams() {
  try {
    const { data: rooms, error } = await supabase
      .from('bull_rooms')
      .select('slug')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching bull rooms for static generation:', error);
      return [];
    }

    return rooms?.map((room) => ({
      roomSlug: room.slug,
    })) || [];
  } catch (error) {
    console.error('Error in generateStaticParams for bull rooms:', error);
    return [];
  }
}

export default async function BullRoomPageWrapper({ params }: Props) {
  const { roomSlug } = await params;
  
  // Check if the room exists
  try {
    const { data: room, error } = await supabase
      .from('bull_rooms')
      .select('id, slug, is_active')
      .eq('slug', roomSlug)
      .single();

    if (error || !room || !room.is_active) {
      notFound();
    }
  } catch (error) {
    console.error('Error checking room existence:', error);
    notFound();
  }
  
  return (
    <BullRoomLayout>
      <BullRoomPage roomSlug={roomSlug} />
    </BullRoomLayout>
  );
}
