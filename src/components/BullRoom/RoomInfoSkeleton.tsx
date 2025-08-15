import React from 'react';

/**
 * Skeleton loading component for the Bull Room info sidebar
 */
export const RoomInfoSkeleton: React.FC = () => {
  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      padding: 'var(--space-4)'
    }}>
      {/* Room Header */}
      <div style={{
        marginBottom: 'var(--space-6)',
        paddingBottom: 'var(--space-4)',
        borderBottom: '0.5px solid var(--color-border-primary)'
      }}>
        {/* Room Name */}
        <div style={{
          width: '90%',
          height: '24px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-3)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        
        {/* Room Description */}
        <div style={{
          width: '100%',
          height: '14px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-2)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        <div style={{
          width: '70%',
          height: '14px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
      </div>

      {/* Room Stats */}
      <div style={{
        marginBottom: 'var(--space-6)',
        paddingBottom: 'var(--space-4)',
        borderBottom: '0.5px solid var(--color-border-primary)'
      }}>
        <div style={{
          width: '60px',
          height: '16px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-3)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                width: '80px',
                height: '14px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
              <div style={{
                width: '40px',
                height: '14px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ flex: 1 }}>
        <div style={{
          width: '100px',
          height: '16px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-3)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)'
            }}>
              {/* Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-full)',
                flexShrink: 0,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
              
              {/* Activity Text */}
              <div style={{ flex: 1 }}>
                <div style={{
                  width: '80%',
                  height: '12px',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--space-1)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                <div style={{
                  width: '60%',
                  height: '10px',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  opacity: 0.6,
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
              </div>
            </div>
          ))}
        </div>
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
