import React from 'react';
import Link from 'next/link';
import { Hash, Loader2, Settings } from 'lucide-react';
import { BullRoom } from '../../lib/database.aliases';
import { useUserPreferences } from '../../hooks/useUserPreferences';

/**
 * RoomSelector displays a list of rooms and allows the user to select one.
 * Rooms are filtered based on user preferences:
 * - 'general' room is always available
 * - Other rooms are only shown if they match user preferences
 * @param rooms - Array of available rooms from the database (already filtered).
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
  const { data: userPreferences, isLoading: preferencesLoading } = useUserPreferences();

  if (isLoading || preferencesLoading) {
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

  const hasPreferences = userPreferences && userPreferences.onboardingCompleted;
  const generalRoom = rooms.find(room => room.slug === 'general');
  const otherRooms = rooms.filter(room => room.slug !== 'general');

  return (
    <div style={{ 
      position: 'relative', 
      height: '100%'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        overflowY: 'auto',
      }} className="hide-scrollbar">
      
        <div style={{ flexShrink: 0 }}>
          <h2 style={{ 
            fontSize: 'var(--text-sm)', 
            fontWeight: 'var(--font-normal)', 
            color: 'var(--color-text-primary)', 
            fontFamily: 'var(--font-editorial)'
          }}>Rooms</h2>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-1)',
          paddingBottom: '80px' // Space for fixed bottom section
        }}>
        {/* Always show general room */}
        {generalRoom && (
          <button
            key={generalRoom.id}
            onClick={() => onSelectRoom(generalRoom.slug)}
            style={{
              width: '100%',
              padding: 'var(--space-2)',
              textAlign: 'left',
              transition: 'all var(--transition-base)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: selectedRoomId === generalRoom.slug ? 'var(--color-bg-tertiary)' : 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (selectedRoomId !== generalRoom.slug) {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRoomId !== generalRoom.slug) {
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
                background: selectedRoomId === generalRoom.slug ? '#1a1a1a' : 'var(--color-bg-tertiary)',
                color: selectedRoomId === generalRoom.slug ? 'white' : 'var(--color-text-primary)'
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
                }}>{generalRoom.name}</h3>
              </div>
            </div>
          </button>
        )}

        {/* Show other rooms if user has preferences */}
        {hasPreferences && otherRooms.map((room) => (
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
                background: selectedRoomId === room.slug ? '#1a1a1a' : 'var(--color-bg-tertiary)',
                color: selectedRoomId === room.slug ? 'white' : 'var(--color-text-primary)'
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

        {/* Show message if no preferences or no other rooms */}
        {(!hasPreferences || otherRooms.length === 0) && (
          <div style={{
            padding: 'var(--space-3)',
            marginTop: 'var(--space-2)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <Settings style={{ width: '16px', height: '16px', color: 'var(--color-text-muted)' }} />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                Personalized Rooms
              </span>
            </div>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-relaxed)',
              margin: 0
            }}>
              {!hasPreferences 
                ? 'Complete your profile to see rooms tailored to your interests and preferences.'
                : 'Update your preferences to see more rooms that match your interests.'
              }
            </p>
          </div>
        )}
        </div>
      </div>
      
      {/* Bottom text - Fixed at bottom */}
      <div style={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--color-bg-primary)',
      }}>
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--leading-relaxed)',
          margin: 0,
          textAlign: 'center',
          padding: 'var(--space-4)',

        }}>
          Edit your{' '}
          <Link
            href="/account-settings"
            style={{
              color: 'var(--color-brand-primary)',
              textDecoration: 'none',
              fontWeight: 'var(--font-bold)',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            account settings
          </Link>
          {' '}preferences to see rooms for you
        </p>
      </div>
    </div>
  );
}; 