import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MobileHeaderButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  ariaLabel: string;
  active?: boolean;
  loading?: boolean;
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  iconFill?: string;
}

/**
 * MobileHeaderButton - Reusable button component for mobile headers
 * 
 * Provides consistent styling and behavior for action buttons in mobile headers.
 * Supports different variants, states, and accessibility features.
 */
export const MobileHeaderButton: React.FC<MobileHeaderButtonProps> = ({
  icon: Icon,
  onClick,
  ariaLabel,
  active = false,
  loading = false,
  variant = 'default',
  size = 'md',
  disabled = false,
  iconFill = 'none'
}) => {
  const getVariantStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-md)',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'all var(--transition-base)',
      outline: 'none',
      opacity: disabled ? 0.5 : 1,
    };

    const sizeStyles = {
      sm: {
        width: '36px',
        height: '36px',
        padding: 'var(--space-2)',
      },
      md: {
        width: '40px',
        height: '40px',
        padding: 'var(--space-2)',
      }
    };

    const variantStyles = {
      default: {
        background: 'var(--color-bg-tertiary)',
        border: '0.5px solid var(--color-border-primary)',
        color: 'var(--color-text-primary)',
      },
      primary: {
        background: active ? 'var(--color-brand-primary)' : 'var(--color-bg-tertiary)',
        border: active ? '0.5px solid var(--color-brand-primary)' : '0.5px solid var(--color-border-primary)',
        color: active ? 'white' : 'var(--color-text-primary)',
      },
      ghost: {
        background: 'transparent',
        border: 'none',
        color: 'var(--color-text-primary)',
      }
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant]
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    const target = e.currentTarget;
    if (variant === 'default') {
      target.style.background = 'var(--color-bg-card-hover)';
    } else if (variant === 'primary') {
      target.style.background = active 
        ? 'var(--color-brand-secondary)' 
        : 'var(--color-bg-card-hover)';
    } else if (variant === 'ghost') {
      target.style.background = 'var(--color-bg-tertiary)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    const target = e.currentTarget;
    if (variant === 'default') {
      target.style.background = 'var(--color-bg-tertiary)';
    } else if (variant === 'primary') {
      target.style.background = active 
        ? 'var(--color-brand-primary)' 
        : 'var(--color-bg-tertiary)';
    } else if (variant === 'ghost') {
      target.style.background = 'transparent';
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-brand-primary)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = 'none';
  };

  const iconSize = size === 'sm' ? 16 : 18;

  return (
    <button
      style={getVariantStyles()}
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      type="button"
    >
      {loading ? (
        <div
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      ) : (
        <Icon size={iconSize} fill={iconFill} />
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
