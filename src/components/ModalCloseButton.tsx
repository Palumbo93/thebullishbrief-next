import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ModalCloseButtonProps {
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClose,
  className,
  style,
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
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius-lg)',
        background: 'transparent',
        border: 'none',
        color: 'var(--color-text-tertiary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all var(--transition-base)',
        zIndex: 10,
        ...(isHovered && {
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'var(--color-text-primary)',
        }),
        ...style,
      }}
    >
      <X style={{ width: '16px', height: '16px' }} />
    </button>
  );
}; 