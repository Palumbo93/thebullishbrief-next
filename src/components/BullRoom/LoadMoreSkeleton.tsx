import React from 'react';

/**
 * Skeleton loading component for infinite scroll loading state
 * Shows a preview of incoming messages while loading more
 */
export const LoadMoreSkeleton: React.FC = () => {
  return (
    <div style={{ 
      padding: '0 var(--space-6) var(--space-3) var(--space-6)',
      borderBottom: '1px solid var(--color-border-subtle)',
      background: 'linear-gradient(180deg, var(--color-bg-secondary) 0%, transparent 100%)',
      marginBottom: '0'
    }}>
      {/* Loading skeleton messages */}
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`loading-skeleton-${index}`}
          style={{
            padding: 'var(--space-2) 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
            marginBottom: index < 3 ? 'var(--space-4)' : 'var(--space-2)',
            opacity: 1 - (index * 0.15) // Fade out each subsequent skeleton
          }}
        >
          {/* Message Header Skeleton */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-1)'
          }}>
            {/* Username with varied lengths */}
            <div style={{
              width: index === 0 ? '140px' : index === 1 ? '90px' : index === 2 ? '110px' : '85px',
              height: '13px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              animation: 'loadMorePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              animationDelay: `${index * 0.15}s`
            }} />
            {/* Timestamp */}
            <div style={{
              width: '45px',
              height: '11px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              opacity: 0.6,
              animation: 'loadMorePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              animationDelay: `${index * 0.15 + 0.1}s`
            }} />
          </div>
          
          {/* Message Content Skeleton with realistic patterns */}
          <div style={{
            maxWidth: index === 0 ? '85%' : index === 1 ? '60%' : index === 2 ? '75%' : '50%'
          }}>
            {/* First line - always present */}
            <div style={{
              width: '100%',
              height: '15px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              animation: 'loadMorePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              animationDelay: `${index * 0.15 + 0.2}s`,
              marginBottom: 'var(--space-1)'
            }} />
            
            {/* Second line - for longer messages */}
            {(index === 0 || index === 2) && (
              <div style={{
                width: index === 0 ? '65%' : '45%',
                height: '15px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                animation: 'loadMorePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                animationDelay: `${index * 0.15 + 0.3}s`
              }} />
            )}
          </div>
        </div>
      ))}
      
      {/* Centered loading spinner */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-3) 0 var(--space-2) 0'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid var(--color-bg-tertiary)',
          borderTop: '2px solid var(--color-accent)',
          borderRadius: '50%',
          animation: 'loadMoreSpin 1s linear infinite'
        }} />
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes loadMorePulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        
        @keyframes loadMoreSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
