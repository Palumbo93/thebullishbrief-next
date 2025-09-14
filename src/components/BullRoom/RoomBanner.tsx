import React from 'react';
import { Users } from 'lucide-react';
import { BullRoom } from '../../lib/database.aliases';

/**
 * RoomBanner displays the current room's name, topic, and status.
 * @param room - The room object from the database containing name, topic, and status info.
 */
export interface RoomBannerProps {
  room: BullRoom;
}

export const RoomBanner: React.FC<RoomBannerProps> = ({ room }) => {
  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div style={{
      position: 'relative',
      height: '50px',
      background: 'var(--color-bg-secondary)',
      overflow: 'hidden',
      borderBottom: '0.5px solid var(--color-border-primary)'
    }}>
      {/* Subtle pattern overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 1px, transparent 1px),
          radial-gradient(circle at 75% 75%, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '8px 8px, 8px 8px',
        backgroundPosition: '0 0, 4px 4px',
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex: 0
      }} />
      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 var(--content-padding)',
      }}>
        <div>
          <p style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-primary)',
            color: 'var(--color-text-tertiary)',
            lineHeight: 'var(--leading-relaxed)',
            fontWeight: 'var(--font-bold)',
          }}>
            {room.topic}
          </p>
        </div>
        {/* Right side - Status info */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--space-4)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)'
            }}>
              <Users style={{ width: '16px', height: '16px' }} />
              <span>{room.message_count} messages</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)'
            }}>
              <span>•</span>
              <span>Last activity {formatLastActivity(room.last_activity_at || '')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 