"use client";

import { BullRoomPage } from '../../page-components/BullRoomPage';
import { BullRoomLayout } from '../../components/BullRoom/BullRoomLayout';

export default function BullRoomPageWrapper() {
  return (
    <BullRoomLayout>
      <BullRoomPage />
    </BullRoomLayout>
  );
}
