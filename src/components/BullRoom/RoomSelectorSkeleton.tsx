import React from 'react';

/**
 * Skeleton loading component for the Bull Room selector
 */
export const RoomSelectorSkeleton: React.FC = () => {
  return (
    <div style={{ padding: 'var(--space-4)' }}>
      {/* Header */}
      <div style={{
        marginBottom: 'var(--space-6)',
        paddingBottom: 'var(--space-4)',
        borderBottom: '0.5px solid var(--color-border-primary)'
      }}>
        <div style={{
          width: '80%',
          height: '20px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-2)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        <div style={{
          width: '60%',
          height: '14px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          opacity: 0.6,
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
      </div>

      {/* Room List Skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              background: index === 0 ? 'var(--color-bg-secondary)' : 'transparent',
              border: index === 0 ? '0.5px solid var(--color-border-primary)' : 'none'
            }}
          >
            {/* Room Name */}
            <div style={{
              width: index % 2 === 0 ? '90%' : '75%',
              height: '16px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-2)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            
            {/* Room Description */}
            <div style={{
              width: '60%',
              height: '12px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              opacity: 0.6,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            
            {/* Room Stats */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)'
            }}>
              <div style={{
                width: '40px',
                height: '12px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                opacity: 0.5,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
              <div style={{
                width: '30px',
                height: '12px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                opacity: 0.5,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
            </div>
          </div>
        ))}
      </div>
      
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
