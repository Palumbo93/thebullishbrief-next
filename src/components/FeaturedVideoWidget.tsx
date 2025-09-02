"use client";

import React from 'react';

interface FeaturedVideoWidgetProps {
  videoUrl: string;
  videoThumbnail: string;
  videoTitle?: string;
  onVideoClick: () => void;
  className?: string;
}

export const FeaturedVideoWidget: React.FC<FeaturedVideoWidgetProps> = ({
  videoUrl,
  videoThumbnail,
  videoTitle = 'Featured Video',
  onVideoClick,
  className = ''
}) => {
  if (!videoUrl || !videoThumbnail) {
    return null;
  }

  return (
    <div className={`featured-video-widget ${className}`}>
      <h3 className="briefs-section-title">{videoTitle}</h3>
      <div 
        className="briefs-video-thumbnail"
        onClick={onVideoClick}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-bg-secondary)',
          cursor: 'pointer',
          aspectRatio: '16/9',
        }}
      >
        {/* Video Thumbnail */}
        <img
          src={videoThumbnail}
          alt={videoTitle || 'Video thumbnail'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: 'var(--radius-md)'
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
            width: '60px',
            height: '60px',
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
