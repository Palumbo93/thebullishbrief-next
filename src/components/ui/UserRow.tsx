import React from 'react';
import { UserAvatar } from './UserAvatar';

interface UserRowProps {
  user: {
    userId: string;
    username: string;
    profile_image?: string | null;
  };
  messageCount?: number;
  onClick?: (event: React.MouseEvent, user: any) => void;
  size?: 'sm' | 'md' | 'lg';
  showMessageCount?: boolean;
  className?: string;
}

export const UserRow: React.FC<UserRowProps> = ({
  user,
  messageCount,
  onClick,
  size = 'md',
  showMessageCount = false,
  className = ''
}) => {
  const handleClick = (event: React.MouseEvent) => {
    if (onClick) {
      onClick(event, user);
    }
  };

  const isClickable = !!onClick;

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: size === 'sm' ? 'var(--space-2)' : 'var(--space-3)',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(20, 20, 20, 0.2)',
        border: '1px solid rgba(31, 31, 31, 0.3)',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all var(--transition-base)',
        ...(isClickable && {
          ':hover': {
            background: 'rgba(20, 20, 20, 0.3)',
            borderColor: 'rgba(31, 31, 31, 0.5)'
          }
        })
      }}
      className={className}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.background = 'rgba(20, 20, 20, 0.3)';
          e.currentTarget.style.borderColor = 'rgba(31, 31, 31, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.background = 'rgba(20, 20, 20, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(31, 31, 31, 0.3)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <UserAvatar 
          user={{ 
            username: user.username, 
            profile_image: user.profile_image 
          }}
          size={size}
        />
        <span style={{
          fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
          color: 'var(--color-text-primary)',
          fontWeight: isClickable ? 'var(--font-medium)' : 'var(--font-normal)'
        }}>
          {user.username}
        </span>
      </div>
      
      {showMessageCount && messageCount !== undefined && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)'
        }}>
          <span>{messageCount} messages</span>
        </div>
      )}
    </div>
  );
};
