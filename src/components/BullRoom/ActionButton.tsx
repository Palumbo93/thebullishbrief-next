import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

/**
 * ActionButton component for message action buttons
 */
export interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Button variants
const BUTTON_VARIANTS = {
  primary: {
    background: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-primary)',
    hover: {
      background: 'var(--color-bg-tertiary)',
    }
  },
  secondary: {
    background: 'transparent',
    color: 'var(--color-text-muted)',
    border: '1px solid transparent',
    hover: {
      background: 'var(--color-bg-tertiary)',
      color: 'var(--color-text-primary)',
    }
  },
  danger: {
    background: 'transparent',
    color: 'var(--color-error)',
    border: '1px solid transparent',
    hover: {
      background: 'var(--color-error)',
      color: 'white',
    }
  }
} as const;

// Base button styles
const BUTTON_STYLES = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  padding: 'calc(var(--space-2) * 0.8) calc(var(--space-3) * 0.8)',
  borderRadius: 'var(--radius-lg)',
  fontSize: 'calc(var(--text-sm) * 0.8)',
  fontWeight: 'var(--font-semibold)',
  border: 'none',
  cursor: 'pointer',
  transition: 'all var(--transition-base)',
  minHeight: '29px', // 36px * 0.8
  minWidth: '29px' // 36px * 0.8
} as const;

// Mobile-optimized styles
const MOBILE_STYLES = {
  minHeight: '35px', // 44px * 0.8
  minWidth: '35px', // 44px * 0.8
  padding: 'calc(var(--space-3) * 0.8) calc(var(--space-4) * 0.8)',
  fontSize: 'calc(var(--text-base) * 0.8)'
} as const;

// Icon size mapping
const ICON_SIZES = { sm: 13, md: 14, lg: 16 } as const; // Reduced by 20%

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  variant,
  onClick,
  disabled = false,
  size = 'md',
  className = ''
}) => {
  const isMobile = useIsMobile();
  const styles = BUTTON_VARIANTS[variant];
  const iconSize = ICON_SIZES[size];
  
  // Apply mobile styles if on mobile
  const buttonStyles = {
    ...BUTTON_STYLES,
    ...(isMobile && MOBILE_STYLES)
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) {
        onClick();
      }
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      aria-label={`${label} message`}
      title={label}
      style={{
        ...buttonStyles,
        ...styles,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, styles.hover);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, styles);
        }
      }}
    >
      <Icon size={iconSize} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};
