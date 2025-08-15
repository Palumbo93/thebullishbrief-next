import React from 'react';
import { X } from 'lucide-react';
import { RoomInfoSidebar } from './RoomInfoSidebar';
import { BullRoom } from '../../lib/database.aliases';
import { BullRoomMessage } from '../../types/bullRoom.types';

interface BullRoomMobileInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  room: BullRoom;
  messages: BullRoomMessage[];
}

export const BullRoomMobileInfoPanel: React.FC<BullRoomMobileInfoPanelProps> = ({
  isOpen,
  onClose,
  room,
  messages
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-100%',
          width: '100%',
          maxWidth: '400px',
          height: '100vh',
          background: 'var(--color-bg-primary)',
          borderLeft: '1px solid var(--color-border-primary)',
          zIndex: 1001,
          transition: 'right var(--transition-base)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-primary)',
          background: 'var(--color-bg-secondary)'
        }}>
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            margin: 0
          }}>
            Room Info
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: 'none',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
          <RoomInfoSidebar room={room} messages={messages} />
        </div>
      </div>
    </>
  );
};
