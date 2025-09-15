import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ModalCloseButtonProps {
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
  showText?: boolean;
}

export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClose,
  className,
  style,
  showText = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClose}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{
        position: 'absolute',
        top: 'var(--space-4)',
        right: 'var(--space-4)',
        width: showText ? 'auto' : '32px',
        height: '32px',
        borderRadius: 'var(--radius-lg)',
        background: 'transparent',
        border: 'none',
        color: 'var(--color-text-tertiary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: showText ? 'var(--space-2)' : '0',
        padding: showText ? '0 var(--space-3)' : '0',
        transition: 'all var(--transition-base)',
        zIndex: 10,
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        ...(isHovered && {
          background: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-primary)',
        }),
        ...style,
      }}
    >
      <X style={{ width: '16px', height: '16px' }} />
      {showText && <span>Close</span>}
    </button>
  );
}; 