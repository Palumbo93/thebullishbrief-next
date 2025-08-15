import React from 'react';
import { MessageSquare } from 'lucide-react';

/**
 * EmptyState component displayed when there are no messages in a room
 */
export interface EmptyStateProps {
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ className = '' }) => {
  return (
    <div 
      style={{ 
        textAlign: 'center', 
        padding: 'var(--space-12)', 
        color: 'var(--color-text-tertiary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        height: '100%',
        minHeight: '400px'
      }}
      className={className}
    >
      <div style={{
        width: '48px',
        height: '48px',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-2)'
      }}>
        <MessageSquare 
          style={{ 
            width: '20px', 
            height: '20px', 
            color: 'var(--color-text-muted)' 
          }} 
        />
      </div>
      
      <div style={{ 
        fontFamily: 'var(--font-editorial)', 
        fontSize: 'var(--text-lg)', 
        fontWeight: 'var(--font-normal)', 
        color: 'var(--color-text-secondary)', 
        marginBottom: 'var(--space-2)' 
      }}>
        No messages yet
      </div>
      
      <p style={{ 
        fontSize: 'var(--text-sm)', 
        color: 'var(--color-text-muted)', 
        maxWidth: '200px' 
      }}>
        Be the first to start the conversation in this room
      </p>
      
      <p style={{ 
        fontSize: 'var(--text-xs)', 
        color: 'var(--color-text-muted)', 
        marginTop: 'var(--space-2)' 
      }}>
        Messages disappear after 48 hours
      </p>
    </div>
  );
};
