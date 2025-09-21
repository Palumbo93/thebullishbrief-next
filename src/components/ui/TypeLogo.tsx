"use client";

import React from 'react';
import Image from 'next/image';
import { useTheme } from '../../contexts/ThemeContext';

interface TypeLogoProps {
  height?: number;
  width?: number;
  alt?: string;
  className?: string;
  onClick?: () => void;
  variant?: 'dark' | 'light' | 'auto';
}

/**
 * TypeLogo - The Bullish Brief type logo component
 * 
 * Displays the text-based logo with theme-aware image selection.
 * Uses type-logo.png for light theme and type-logo-black.png for dark theme.
 */
export const TypeLogo: React.FC<TypeLogoProps> = ({
  height = 32,
  width = 160,
  alt = 'The Bullish Brief',
  className = '',
  onClick,
  variant = 'auto'
}) => {
  const { theme } = useTheme();
  
  // Select the appropriate logo based on theme
  const themeLogoSrc = theme === 'dark' ? '/images/type-logo.png' : '/images/type-logo-black.png';
  
  const logoSrc = variant === 'auto' ? themeLogoSrc : variant === 'dark' ? '/images/type-logo-black.png' : '/images/type-logo.png';

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: `${height}px`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'opacity var(--transition-base)',
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.opacity = '0.8';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.opacity = '1';
    }
  };

  return (
    <div
      style={containerStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={alt}
      className={className}
    >
      <Image
        src={logoSrc}
        alt={alt}
        width={width}
        height={height}
        style={{
          objectFit: 'contain',
          maxWidth: '100%',
          height: 'auto',
        }}
        priority
      />
    </div>
  );
};
