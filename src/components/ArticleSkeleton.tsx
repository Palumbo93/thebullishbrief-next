import React from 'react';

interface ArticleSkeletonProps {
  className?: string;
}

export const ArticleSkeleton: React.FC<ArticleSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Article Header Skeleton */}
      <div style={{
        position: 'relative',
        backgroundColor: 'var(--color-bg-secondary)',
        marginBottom: 'var(--space-4)',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 3,
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'var(--space-16) var(--content-padding) 0 var(--content-padding)',
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
        }}>
          {/* Title Skeleton */}
          <div style={{
            height: '64px',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-6)',
            width: '85%',
            opacity: 0.6
          }} />
          
          {/* Meta Info Skeleton */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-full)',
              opacity: 0.5
            }} />
            <div style={{
              height: '20px',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              width: '140px',
              opacity: 0.5
            }} />
            <div style={{
              height: '20px',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              width: '100px',
              opacity: 0.5
            }} />
          </div>
        </div>
      </div>

      {/* Article Content Skeleton */}
      <div style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        padding: '0 var(--content-padding)'
      }}>
        {/* Content Paragraphs */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            height: '20px',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
            width: i % 2 === 0 ? '100%' : '92%',
            opacity: 0.4
          }} />
        ))}
        
        {/* Spacing */}
        <div style={{ height: 'var(--space-8)' }} />
        
        {/* More paragraphs */}
        {[...Array(4)].map((_, i) => (
          <div key={i + 6} style={{
            height: '20px',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
            width: i % 3 === 0 ? '100%' : i % 3 === 1 ? '88%' : '96%',
            opacity: 0.4
          }} />
        ))}
      </div>
    </div>
  );
};
