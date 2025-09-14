"use client";

import React from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface FeaturedMediaProps {
  /**
   * Whether to show video as featured media (when true, video replaces image)
   */
  featureFeaturedVideo?: boolean;
  
  /**
   * Video URL for the featured video
   */
  videoUrl?: string;
  
  /**
   * Thumbnail image URL for the video
   */
  videoThumbnail?: string;
  
  /**
   * Featured image URL (fallback when no video or video not featured)
   */
  featuredImageUrl?: string;
  
  /**
   * Alt text for the media
   */
  title?: string;
  
  /**
   * Callback when video is clicked
   */
  onVideoClick?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Custom styles
   */
  style?: React.CSSProperties;
}

/**
 * Featured Media Component
 * 
 * Displays either a featured video (with thumbnail and play button) or featured image
 * based on the featureFeaturedVideo flag and available media URLs.
 */
export const FeaturedMedia: React.FC<FeaturedMediaProps> = ({
  featureFeaturedVideo = false,
  videoUrl,
  videoThumbnail,
  featuredImageUrl,
  title = '',
  onVideoClick,
  className = '',
  style = {}
}) => {
  // Determine what media to show
  const shouldShowVideo = featureFeaturedVideo && videoUrl;
  const shouldShowImage = !shouldShowVideo && featuredImageUrl;
  
  // Don't render anything if no media is available
  if (!shouldShowVideo && !shouldShowImage) {
    return null;
  }

  const defaultStyle: React.CSSProperties = {
    overflow: 'hidden',
    ...style
  };

  if (shouldShowVideo) {
    return (
      <div 
        className={className}
        style={{
          ...defaultStyle,
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-bg-secondary)',
          cursor: 'pointer',
          aspectRatio: '16/9',
          maxWidth: '100%'
        }}
        onClick={onVideoClick}
      >
        {/* Video Thumbnail - Optimized loading */}
        <Image
          src={videoThumbnail || featuredImageUrl || ''}
          alt={`${title} - Video thumbnail`}
          fill
          priority
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: 0,
            borderRadius: 'var(--radius-lg)'
          }}
        />
        
        {/* Play Button Overlay */}
        <button
          onClick={onVideoClick}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            background: 'rgba(0, 0, 0, 0.7)',
            border: 'none',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
          }}
        >
          <Play 
            size={32} 
            color="white" 
            fill="white"
            style={{ marginLeft: '4px' }} 
          />
        </button>
      </div>
    );
  }

  if (shouldShowImage) {
    return (
      <div className={className} style={defaultStyle}>
        <Image
          src={featuredImageUrl!}
          alt={`${title} - Featured image`}
          width={800}
          height={400}
          priority={true}
          quality={85}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 800px"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '400px',
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: 'var(--radius-md)'
          }}
        />
      </div>
    );
  }

  return null;
};

export default FeaturedMedia;
