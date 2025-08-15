import React from 'react';

/**
 * Skeleton loading component for the Bull Room chat area
 */
export const ChatAreaSkeleton: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      padding: 'var(--space-6) 0',
      paddingBottom: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column-reverse'
    }} className="hide-scrollbar">
      {/* Message Skeletons */}
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          style={{
            padding: 'var(--space-2) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)'
          }}
        >
          {/* Message Header Skeleton */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-1)'
          }}>
            {/* Username */}
            <div style={{
              width: index % 3 === 0 ? '120px' : '100px',
              height: '14px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            {/* Timestamp */}
            <div style={{
              width: '60px',
              height: '12px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              opacity: 0.6,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
          </div>
          
          {/* Message Content Skeleton */}
          <div style={{
            maxWidth: index % 2 === 0 ? '70%' : '85%',
            marginLeft: index % 3 === 0 ? '0' : 'var(--space-4)'
          }}>
            {/* First line */}
            <div style={{
              width: '100%',
              height: '16px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-1)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            {/* Second line (sometimes) */}
            {index % 2 === 0 && (
              <div style={{
                width: '60%',
                height: '16px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
            )}
          </div>
        </div>
      ))}
      
      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
};
