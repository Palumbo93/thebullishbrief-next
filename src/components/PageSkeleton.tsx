import React from 'react';

interface PageSkeletonProps {
  type?: 'article' | 'brief' | 'list' | 'search';
  className?: string;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ 
  type = 'list', 
  className = '' 
}) => {
  const renderArticleSkeleton = () => (
    <div className="animate-pulse">
      {/* Article Header Skeleton */}
      <div style={{
        position: 'relative',
        backgroundColor: 'var(--color-bg-secondary)',
        marginBottom: 'var(--space-4)',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        <div style={{
          position: 'relative',
          zIndex: 3,
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'var(--space-16) var(--content-padding) 0 var(--content-padding)',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <div style={{
            height: '48px',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
            width: '80%'
          }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-full)'
            }} />
            <div style={{
              height: '16px',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              width: '120px'
            }} />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 var(--content-padding)'
      }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            height: '16px',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-3)',
            width: i % 2 === 0 ? '100%' : '90%'
          }} />
        ))}
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="animate-pulse" style={{ padding: 'var(--space-6) var(--content-padding)' }}>
      {/* Header */}
      <div style={{
        height: '32px',
        backgroundColor: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-6)',
        width: '60%'
      }} />
      
      {/* List Items */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-4)',
          border: '1px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-bg-primary)'
        }}>
          <div style={{
            height: '24px',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-3)',
            width: '80%'
          }} />
          <div style={{
            height: '16px',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-2)',
            width: '60%'
          }} />
          <div style={{
            height: '16px',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            width: '40%'
          }} />
        </div>
      ))}
    </div>
  );

  const renderSearchSkeleton = () => (
    <div className="animate-pulse" style={{ padding: 'var(--space-6) var(--content-padding)' }}>
      {/* Search Bar */}
      <div style={{
        height: '48px',
        backgroundColor: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-6)',
        width: '100%'
      }} />
      
      {/* Results */}
      {renderListSkeleton()}
    </div>
  );

  const renderBriefSkeleton = () => (
    <div className="animate-pulse">
      {/* Brief Header */}
      <div style={{
        backgroundColor: 'var(--color-bg-secondary)',
        padding: 'var(--space-8) var(--content-padding)',
        marginBottom: 'var(--space-6)'
      }}>
        <div style={{
          height: '40px',
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-4)',
          width: '70%'
        }} />
        <div style={{
          height: '20px',
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-3)',
          width: '50%'
        }} />
      </div>

      {/* Brief Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 var(--content-padding)'
      }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            height: '16px',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-3)',
            width: i % 3 === 0 ? '100%' : i % 3 === 1 ? '85%' : '95%'
          }} />
        ))}
      </div>
    </div>
  );

  const skeletons = {
    article: renderArticleSkeleton,
    brief: renderBriefSkeleton,
    list: renderListSkeleton,
    search: renderSearchSkeleton
  };

  return (
    <div className={className}>
      {skeletons[type]()}
    </div>
  );
};
