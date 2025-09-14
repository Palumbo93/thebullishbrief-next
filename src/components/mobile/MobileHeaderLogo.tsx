"use client";

import React from 'react';
import { BullLogoImg } from '../ui/BullLogo';
import Image from 'next/image';

interface MobileHeaderLogoProps {
  type: 'main' | 'company';
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

/**
 * MobileHeaderLogo - Logo component for mobile headers
 * 
 * Handles both main logo and company logos with fallback support.
 * Optimized for mobile display with appropriate sizing.
 */
export const MobileHeaderLogo: React.FC<MobileHeaderLogoProps> = ({
  type,
  src,
  alt,
  fallback,
  size = 'md',
  onClick
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getSizeStyles = () => {
    const sizes = {
      sm: {
        height: '24px',
        width: 'auto',
        maxWidth: '120px'
      },
      md: {
        height: '32px',
        width: 'auto',
        maxWidth: '160px'
      },
      lg: {
        height: '40px',
        width: 'auto',
        maxWidth: '200px'
      }
    };
    return sizes[size];
  };

  const getContainerStyles = () => {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '40px',
      cursor: onClick ? 'pointer' : 'default',
    };
  };

  const getImageStyles = () => {
    return {
      ...getSizeStyles(),
      objectFit: 'contain' as const,
    };
  };

  const getFallbackStyles = () => {
    return {
      ...getSizeStyles(),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: type === 'company' ? '#f3f4f6' : '#000',
      color: type === 'company' ? '#374151' : 'white',
      borderRadius: type === 'company' ? '50%' : '4px',
      fontSize: size === 'sm' ? '12px' : '14px',
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    };
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Determine what to show
  const shouldShowImage = src && !imageError;
  const shouldShowFallback = !shouldShowImage && fallback;

  // Default fallback content
  const getDefaultFallback = () => {
    if (type === 'main') {
      return 'TB'; // The Bullish Brief
    }
    return '?'; // Unknown company
  };

  const fallbackContent = fallback || getDefaultFallback();

  return (
    <div
      style={getContainerStyles()}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={alt || `${type} logo`}
    >
      {type === 'main' ? (
        <BullLogoImg
          height={getSizeStyles().height === '24px' ? 24 : getSizeStyles().height === '32px' ? 32 : 40}
          width={getSizeStyles().height === '24px' ? 120 : getSizeStyles().height === '32px' ? 160 : 200}
          alt={alt || 'The Bullish Brief Logo'}
          className="mobile-header-logo"
        />
      ) : shouldShowImage ? (
        <Image
          src={src || ''}
          alt={alt || `${type} logo`}
          width={120}
          height={40}
          style={getImageStyles()}
          onError={handleImageError}
        />
      ) : shouldShowFallback ? (
        <div style={getFallbackStyles()}>
          {fallbackContent}
        </div>
      ) : null}
    </div>
  );
};
