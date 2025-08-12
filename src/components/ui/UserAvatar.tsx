import React from 'react';
import { AuthorAvatarImage } from './OptimizedImage';

interface UserAvatarProps {
  user: {
    username: string;
    profile_image?: string | null;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6 text-xs';
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'lg':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-base';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // If user has a profile image, display it
  if (user.profile_image) {
    return (
      <AuthorAvatarImage
        src={user.profile_image}
        alt={user.username}
        size={size}
        className={className}
      />
    );
  }

  // Fall back to initials avatar
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-primary bg-tertiary ${getSizeClasses()} ${className}`}
      style={{
        width: size === 'xs' ? '24px' : size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px',
        height: size === 'xs' ? '24px' : size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-bg-tertiary)',
        color: 'var(--color-text-primary)',
        fontWeight: 'var(--font-bold)',
        fontSize: size === 'sm' ? 'var(--text-sm)' : size === 'lg' ? 'var(--text-lg)' : 'var(--text-base)'
      }}
    >
      {getInitials(user.username)}
    </div>
  );
};
