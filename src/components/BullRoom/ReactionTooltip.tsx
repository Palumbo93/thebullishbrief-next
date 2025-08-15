import React, { useEffect, useRef } from 'react';

interface ReactionTooltipProps {
  emoji: string;
  userIds: string[];
  userMap: Record<string, string>; // userId -> username
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ReactionTooltip: React.FC<ReactionTooltipProps> = ({
  emoji,
  userIds,
  userMap,
  isVisible,
  position,
  onClose
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Close tooltip on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

  if (!isVisible || userIds.length === 0) return null;

  // Get usernames, fallback to user ID if username not available
  const usernames = userIds.map(userId => userMap[userId] || `User ${userId.slice(0, 8)}`);

  const handleTooltipMouseEnter = () => {
    // Keep tooltip visible when hovering over it
    // This prevents the tooltip from disappearing when moving mouse to it
  };

  const handleTooltipMouseLeave = () => {
    // Hide tooltip when leaving it
    onClose();
  };

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: 'var(--space-3)',
        maxWidth: '280px',
        zIndex: 'var(--z-tooltip)',
        opacity: 0,
        animation: 'tooltipFadeIn 0.2s ease-out forwards',
        pointerEvents: 'auto'
      }}
      className="animate-tooltip-fade-in"
      role="tooltip"
      aria-label={`Users who reacted with ${emoji}`}
      onMouseEnter={handleTooltipMouseEnter}
      onMouseLeave={handleTooltipMouseLeave}
    >
      {/* Arrow pointing down */}
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid var(--color-bg-card)',
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-text-primary)'
        }}
      >
        <span style={{ fontSize: 'var(--text-base)' }}>{emoji}</span>
        <span>Reacted by</span>
      </div>

      {/* User list as comma-separated */}
      <div
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--leading-relaxed)',
          wordBreak: 'break-word'
        }}
      >
        {usernames.join(', ')}
      </div>

      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
