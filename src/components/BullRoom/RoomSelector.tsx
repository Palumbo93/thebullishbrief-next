import React from 'react';
import { Users, Hash, Loader2 } from 'lucide-react';
import { BullRoom } from '../../lib/database.aliases';

/**
 * RoomSelector displays a list of rooms and allows the user to select one.
 * @param rooms - Array of available rooms from the database.
 * @param selectedRoomId - The currently selected room slug.
 * @param onSelectRoom - Callback when a room is selected.
 * @param isLoading - Whether the rooms are being loaded.
 * @param error - Error message if loading failed.
 */
export interface RoomSelectorProps {
  rooms: BullRoom[];
  selectedRoomId: string;
  onSelectRoom: (roomSlug: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({ 
  rooms, 
  selectedRoomId, 
  onSelectRoom, 
  isLoading = false,
  error = null 
}) => {
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 'var(--space-4)' 
      }}>
        <Loader2 style={{ 
          width: '20px', 
          height: '20px', 
          color: 'var(--color-text-muted)',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ 
          marginLeft: 'var(--space-2)', 
          fontSize: 'var(--text-sm)', 
          color: 'var(--color-text-muted)' 
        }}>Loading rooms...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: 'var(--space-4)', 
        textAlign: 'center' 
      }}>
        <p style={{ 
          fontSize: 'var(--text-sm)', 
          color: 'var(--color-error)', 
          marginBottom: 'var(--space-2)' 
        }}>Failed to load rooms</p>
        <p style={{ 
          fontSize: 'var(--text-xs)', 
          color: 'var(--color-text-muted)' 
        }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <h2 style={{ 
          fontSize: 'var(--text-sm)', 
          fontWeight: 'var(--font-semibold)', 
          color: 'var(--color-text-primary)', 
          marginBottom: 'var(--space-1)' 
        }}>Rooms</h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-1)', 
          fontSize: 'var(--text-xs)', 
          color: 'var(--color-text-muted)' 
        }}>
          <Users style={{ width: '12px', height: '12px' }} />
          <span>{rooms.length} active</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room.slug)}
            style={{
              width: '100%',
              padding: 'var(--space-2)',
              textAlign: 'left',
              transition: 'all var(--transition-base)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: selectedRoomId === room.slug ? 'var(--color-bg-tertiary)' : 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (selectedRoomId !== room.slug) {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRoomId !== room.slug) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: selectedRoomId === room.slug ? 'var(--color-brand-primary)' : 'var(--color-bg-tertiary)',
                color: selectedRoomId === room.slug ? 'var(--color-text-inverse)' : 'var(--color-text-primary)'
              }}>
                <Hash style={{ width: '12px', height: '12px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 'var(--font-medium)', 
                  color: 'var(--color-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{room.name}</h3>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}; 