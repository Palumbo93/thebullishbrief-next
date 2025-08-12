import React from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onError?: () => void;
  onLoad?: () => void;
}

/**
 * Optimized Image Component for Next.js
 * Handles different image types with proper optimization
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  quality = 85,
  className = '',
  style,
  fill = false,
  placeholder = 'empty',
  blurDataURL,
  onError,
  onLoad
}) => {
  // Handle external URLs (like Supabase storage)
  const isExternalUrl = src.startsWith('http') && !src.includes('localhost');
  
  // For external URLs, we need to configure them in next.config.js
  // For now, we'll use a regular img tag for external URLs
  if (isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        onError={onError}
        onLoad={onLoad}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  // For local images, use Next.js Image optimization
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className}
      style={style}
      fill={fill}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onError={onError}
      onLoad={onLoad}
    />
  );
};

/**
 * Article Card Image Component
 * Optimized for article cards with proper sizing
 */
export const ArticleCardImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={150}
    height={150}
    sizes="150px"
    className={className}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 'var(--radius-lg)'
    }}
  />
);

/**
 * Article Hero Image Component
 * Optimized for article hero sections
 */
export const ArticleHeroImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    fill
    sizes="(max-width: 768px) 100vw, 800px"
    priority
    className={className}
    style={{
      objectFit: 'cover',
      objectPosition: 'center'
    }}
  />
);

/**
 * Author Avatar Component
 * Optimized for author avatars with different sizes
 */
export const AuthorAvatarImage: React.FC<{
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ src, alt, size = 'md', className = '' }) => {
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizeMap[size]}
      height={sizeMap[size]}
      sizes={`${sizeMap[size]}px`}
      className={className}
      style={{
        borderRadius: 'var(--radius-full)',
        objectFit: 'cover'
      }}
    />
  );
};

/**
 * Brief Card Image Component
 * Optimized for brief cards
 */
export const BriefCardImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={220}
    height={140}
    sizes="(max-width: 768px) 100vw, 220px"
    className={className}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 'var(--radius-sm)'
    }}
  />
);

/**
 * Brief Hero Image Component
 * Optimized for brief hero sections
 */
export const BriefHeroImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    fill
    sizes="(max-width: 768px) 100vw, 800px"
    priority
    className={className}
    style={{
      objectFit: 'cover',
      objectPosition: 'center'
    }}
  />
);

/**
 * Company Logo Component
 * Optimized for company logos
 */
export const CompanyLogoImage: React.FC<{
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ src, alt, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizeMap[size]}
      height={sizeMap[size]}
      sizes={`${sizeMap[size]}px`}
      className={className}
      style={{
        borderRadius: 'var(--radius-full)',
        objectFit: 'contain',
        padding: '2px',
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-secondary)'
      }}
    />
  );
};
