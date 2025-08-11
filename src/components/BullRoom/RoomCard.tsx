import React from 'react';
import { TrendingUp, TrendingDown, Minus, Users, Activity, Hash } from 'lucide-react';
import { Room } from '../../types/room.types';

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
  onSelect: (room: Room) => void;
  isSelected?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ 
  room, 
  onJoin, 
  onSelect, 
  isSelected = false 
}) => {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--color-success)' }} />;
      case 'bearish':
        return <TrendingDown style={{ width: '16px', height: '16px', color: 'var(--color-error)' }} />;
      default:
        return <Minus style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />;
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 20) return 'var(--color-success)';
    if (score < -20) return 'var(--color-error)';
    return 'var(--color-text-tertiary)';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div
      style={{
        background: isSelected ? 'var(--color-bg-card-hover)' : 'var(--color-bg-card)',
        border: `1px solid ${isSelected ? 'var(--color-border-secondary)' : 'var(--color-border-primary)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => onSelect(room)}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'var(--color-bg-card-hover)';
          e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'var(--color-bg-card)';
          e.currentTarget.style.borderColor = 'var(--color-border-primary)';
        }
      }}
    >
      {/* Sentiment Indicator Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: room.sentiment === 'bullish' ? 'var(--color-success)' :
                   room.sentiment === 'bearish' ? 'var(--color-error)' : 'var(--color-text-tertiary)',
        opacity: 0.8
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {getSentimentIcon(room.sentiment)}
          <div>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)'
            }}>
              {room.displayName}
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <Hash style={{ width: '12px', height: '12px' }} />
              {room.topic}
            </p>
          </div>
        </div>
        
        <div style={{
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-base)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-medium)',
          backgroundColor: room.sentiment === 'bullish' ? 'var(--color-success-bg)' :
                         room.sentiment === 'bearish' ? 'var(--color-error-bg)' : 'var(--color-bg-tertiary)',
          color: room.sentiment === 'bullish' ? 'var(--color-success)' :
                 room.sentiment === 'bearish' ? 'var(--color-error)' : 'var(--color-text-tertiary)',
          border: `1px solid ${room.sentiment === 'bullish' ? 'var(--color-success-border)' :
                              room.sentiment === 'bearish' ? 'var(--color-error-border)' : 'var(--color-border-secondary)'}`
        }}>
          {room.sentiment === 'bullish' ? '🐂' : room.sentiment === 'bearish' ? '🐻' : '⚖️'} {room.sentiment}
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
        lineHeight: 'var(--leading-relaxed)',
        marginBottom: 'var(--space-4)'
      }}>
        {room.description}
      </p>

      {/* Stats Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Users style={{ width: '14px', height: '14px', color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {room.memberCount.toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Activity style={{ width: '14px', height: '14px', color: 'var(--color-success)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {room.onlineCount} online
            </span>
          </div>
        </div>
        
        <div style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-bold)',
          color: getSentimentColor(room.sentimentScore)
        }}>
          {room.sentimentScore > 0 ? '+' : ''}{room.sentimentScore}
        </div>
      </div>

      {/* Sentiment Change */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <span style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          24h Change
        </span>
        <span style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          color: room.sentimentChange24h >= 0 ? 'var(--color-success)' : 'var(--color-error)'
        }}>
          {room.sentimentChange24h > 0 ? '+' : ''}{room.sentimentChange24h}%
        </span>
      </div>

      {/* Last Activity */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <span style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)'
        }}>
          Last activity {formatTimeAgo(room.lastActivity)}
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onJoin(room.id);
        }}
        style={{
          width: '100%',
          padding: 'var(--space-3)',
          background: room.isJoined ? 'var(--color-bg-tertiary)' : 'var(--color-text-primary)',
          color: room.isJoined ? 'var(--color-text-primary)' : 'var(--color-text-inverse)',
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          cursor: 'pointer',
          transition: 'all var(--transition-base)'
        }}
        onMouseEnter={(e) => {
          if (room.isJoined) {
            e.currentTarget.style.background = 'var(--color-border-secondary)';
          } else {
            e.currentTarget.style.background = 'var(--color-text-secondary)';
          }
        }}
        onMouseLeave={(e) => {
          if (room.isJoined) {
            e.currentTarget.style.background = 'var(--color-bg-tertiary)';
          } else {
            e.currentTarget.style.background = 'var(--color-text-primary)';
          }
        }}
      >
        {room.isJoined ? 'Joined' : 'Join Room'}
      </button>
    </div>
  );
}; 