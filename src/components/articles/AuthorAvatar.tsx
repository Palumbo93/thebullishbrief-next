import React from 'react';

interface AuthorAvatarProps {
  author: string;
  image?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ 
  author, 
  image, 
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

  if (image) {
    return (
      <img
        src={image}
        alt={author}
        className={`rounded-full object-cover ${getSizeClasses()} ${className}`}
        style={{
          width: size === 'xs' ? '24px' : size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px',
          height: size === 'xs' ? '24px' : size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px',
          borderRadius: 'var(--radius-full)',
          objectFit: 'cover'
        }}
      />
    );
  }

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
      {getInitials(author)}
    </div>
  );
}; 