"use client";

import React from 'react';
import Image from 'next/image';
import { useTheme } from '../../contexts/ThemeContext';

interface BullLogoProps {
  /** Width of the logo */
  width?: number;
  /** Height of the logo */
  height?: number;
  /** Additional CSS classes */
  className?: string;
  /** Alt text for the logo */
  alt?: string;
  /** Logo variant override (if you want to force a specific logo regardless of theme) */
  variant?: 'light' | 'dark' | 'auto';
  /** Priority loading for above-the-fold logos */
  priority?: boolean;
  /** Custom sizes attribute for responsive images */
  sizes?: string;
}

/**
 * BullLogo component that automatically switches between light and dark logo variants
 * based on the current theme, or allows manual variant selection.
 */
export const BullLogo: React.FC<BullLogoProps> = ({
  width = 40,
  height = 40,
  className = '',
  alt = 'The Bullish Brief',
  variant = 'auto',
  priority = false,
  sizes,
}) => {
  const { theme } = useTheme();

  // Determine which logo to use based on theme and variant prop
  const getLogoSrc = (): string => {
    if (variant === 'light') {
      return '/images/logo.png'; // Original white/light logo
    }
    if (variant === 'dark') {
      return '/images/logo-black.png'; // New black logo
    }
    
    // Auto mode: switch based on theme
    return theme === 'light' ? '/images/logo-black.png' : '/images/logo.png';
  };

  const logoSrc = getLogoSrc();

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      style={{
        width: 'auto',
        height: 'auto',
        maxWidth: `${width}px`,
        maxHeight: `${height}px`,
      }}
    />
  );
};

/**
 * BullLogoImg component - fallback for cases where Next.js Image component
 * can't be used (like in email templates or certain server contexts)
 */
export const BullLogoImg: React.FC<BullLogoProps> = ({
  width = 40,
  height = 40,
  className = '',
  alt = 'The Bullish Brief',
  variant = 'auto',
}) => {
  const { theme } = useTheme();

  // Determine which logo to use based on theme and variant prop
  const getLogoSrc = (): string => {
    if (variant === 'light') {
      return '/images/logo.png'; // Original white/light logo
    }
    if (variant === 'dark') {
      return '/images/logo-black.png'; // New black logo
    }
    
    // Auto mode: switch based on theme
    return theme === 'light' ? '/images/logo-black.png' : '/images/logo.png';
  };

  const logoSrc = getLogoSrc();

  return (
    <img
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        width: 'auto',
        height: 'auto',
        maxWidth: `${width}px`,
        maxHeight: `${height}px`,
        objectFit: 'contain',
      }}
    />
  );
};
