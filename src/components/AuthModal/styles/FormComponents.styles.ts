import { CSSProperties } from 'react';
import { COMPONENT_SIZES } from '../utils/constants';

// Form field styles
export const fieldContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
};

export const fieldLabel: CSSProperties = {
  display: 'block',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-3)',
};

export const fieldInputContainer: CSSProperties = {
  position: 'relative',
};

export const fieldIcon: CSSProperties = {
  position: 'absolute',
  left: 'var(--space-4)',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '20px',
  height: '20px',
  color: 'var(--color-text-tertiary)',
};

export const fieldInput: CSSProperties = {
  width: '100%',
  height: COMPONENT_SIZES.INPUT_HEIGHT,
  padding: '0 var(--space-4) 0 52px',
  background: 'var(--color-bg-tertiary)',
  border: '2px solid var(--color-border-primary)',
  borderRadius: 'var(--radius-xl)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-base)',
  fontFamily: 'var(--font-primary)',
  transition: 'all var(--transition-base)',
  outline: 'none',
};

export const fieldInputPassword: CSSProperties = {
  ...fieldInput,
  padding: '0 52px 0 52px',
};

export const fieldInputNoPadding: CSSProperties = {
  ...fieldInput,
  padding: '0 var(--space-4)',
};

export const fieldInputFocus: CSSProperties = {
  borderColor: 'var(--color-brand-primary)',
  boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.1)',
};

export const fieldInputError: CSSProperties = {
  borderColor: 'var(--color-error)',
  boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
};

export const passwordToggle: CSSProperties = {
  position: 'absolute',
  right: 'var(--space-4)',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--color-text-tertiary)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 'var(--space-1)',
  borderRadius: 'var(--radius-base)',
  transition: 'all var(--transition-base)',
};

export const passwordToggleHover: CSSProperties = {
  color: 'var(--color-text-primary)',
  background: 'var(--color-bg-secondary)',
};

// Auth button styles
export const authButton = (variant: 'primary' | 'secondary' | 'ghost' = 'primary', loading = false): CSSProperties => {
  const baseStyles: CSSProperties = {
    height: COMPONENT_SIZES.BUTTON_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-3)',
    border: 'none',
    borderRadius: 'var(--radius-xl)',
    fontSize: 'var(--text-base)',
    fontWeight: 'var(--font-semibold)',
    fontFamily: 'var(--font-primary)',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    marginTop: 'var(--space-8)',
    marginBottom: 'var(--space-6)',
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        background: loading 
          ? 'var(--color-bg-tertiary)' 
          : 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
        color: loading ? 'var(--color-text-muted)' : 'var(--color-text-inverse)',
        boxShadow: loading ? 'none' : '0 4px 12px rgba(255, 255, 255, 0.15)',
      };
    case 'secondary':
      return {
        ...baseStyles,
        background: 'var(--color-bg-tertiary)',
        color: 'var(--color-text-primary)',
        border: '2px solid var(--color-border-primary)',
      };
    case 'ghost':
      return {
        ...baseStyles,
        background: 'transparent',
        color: 'var(--color-text-secondary)',
        border: 'none',
      };
    default:
      return baseStyles;
  }
};

export const authButtonFlex: CSSProperties = {
  flex: 1,
};

export const authButtonFullWidth: CSSProperties = {
  width: '100%',
};

export const authButtonHover: CSSProperties = {
  transform: 'translateY(-1px)',
  boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)',
};

export const authButtonSecondaryHover: CSSProperties = {
  background: 'var(--color-bg-secondary)',
  borderColor: 'var(--color-brand-primary)',
};

export const authButtonGhostHover: CSSProperties = {
  background: 'var(--color-bg-tertiary)',
  color: 'var(--color-text-primary)',
};

// Loading spinner styles
export const loadingSpinner: CSSProperties = {
  width: '20px',
  height: '20px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTop: '2px solid white',
  borderRadius: 'var(--radius-full)',
  animation: 'spin 1s linear infinite',
};

// Enhanced validation message styles
export const validationMessage = (type: 'error' | 'success' | 'warning' | 'info'): CSSProperties => {
  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
        };
      case 'success':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.08)',
          borderColor: 'rgba(34, 197, 94, 0.2)',
          color: '#22c55e',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(251, 191, 36, 0.08)',
          borderColor: 'rgba(251, 191, 36, 0.2)',
          color: '#fbbf24',
        };
      case 'info':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          borderColor: 'rgba(59, 130, 246, 0.2)',
          color: '#3b82f6',
        };
      default:
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return {
    padding: 'var(--space-4)',
    backgroundColor: typeStyles.backgroundColor,
    border: `1px solid ${typeStyles.borderColor}`,
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-3)',
    position: 'relative',
    animation: 'fadeSlideIn 0.3s ease-out',
    transition: 'all var(--transition-base)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  };
};

export const validationIcon = (type: 'error' | 'success' | 'warning' | 'info'): CSSProperties => {
  const getIconColor = () => {
    switch (type) {
      case 'error':
        return '#ef4444';
      case 'success':
        return '#22c55e';
      case 'warning':
        return '#fbbf24';
      case 'info':
        return '#3b82f6';
      default:
        return '#ef4444';
    }
  };

  return {
    width: '20px',
    height: '20px',
    color: getIconColor(),
    flexShrink: 0,
    marginTop: '2px', // Align with text baseline
  };
};

export const validationContent: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
  flex: 1,
};

export const validationTitle = (type: 'error' | 'success' | 'warning' | 'info'): CSSProperties => {
  const getTitleColor = () => {
    switch (type) {
      case 'error':
        return '#dc2626';
      case 'success':
        return '#16a34a';
      case 'warning':
        return '#d97706';
      case 'info':
        return '#2563eb';
      default:
        return '#dc2626';
    }
  };

  return {
    color: getTitleColor(),
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-semibold)',
    margin: 0,
    lineHeight: 1.4,
  };
};

export const validationText = (type: 'error' | 'success' | 'warning' | 'info'): CSSProperties => {
  const getTextColor = () => {
    switch (type) {
      case 'error':
        return '#991b1b';
      case 'success':
        return '#15803d';
      case 'warning':
        return '#92400e';
      case 'info':
        return '#1d4ed8';
      default:
        return '#991b1b';
    }
  };

  return {
    color: getTextColor(),
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    margin: 0,
    lineHeight: 1.5,
  };
};

export const validationActions: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  marginLeft: 'auto',
  flexShrink: 0,
};

export const validationActionButton = (type: 'error' | 'success' | 'warning' | 'info'): CSSProperties => {
  const getButtonStyles = () => {
    switch (type) {
      case 'error':
        return {
          color: '#dc2626',
          borderColor: '#dc2626',
          hoverBg: 'rgba(239, 68, 68, 0.1)',
        };
      case 'success':
        return {
          color: '#16a34a',
          borderColor: '#16a34a',
          hoverBg: 'rgba(34, 197, 94, 0.1)',
        };
      case 'warning':
        return {
          color: '#d97706',
          borderColor: '#d97706',
          hoverBg: 'rgba(251, 191, 36, 0.1)',
        };
      case 'info':
        return {
          color: '#2563eb',
          borderColor: '#2563eb',
          hoverBg: 'rgba(59, 130, 246, 0.1)',
        };
      default:
        return {
          color: '#dc2626',
          borderColor: '#dc2626',
          hoverBg: 'rgba(239, 68, 68, 0.1)',
        };
    }
  };

  const buttonStyles = getButtonStyles();

  return {
    padding: 'var(--space-1) var(--space-3)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-medium)',
    color: buttonStyles.color,
    backgroundColor: 'transparent',
    border: `1px solid ${buttonStyles.borderColor}`,
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
    fontFamily: 'var(--font-primary)',
  };
};

export const validationDismissButton: CSSProperties = {
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
  transition: 'all var(--transition-base)',
  padding: 0,
  marginLeft: 'var(--space-2)',
};

// Add keyframe animations
export const validationAnimations = `
  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeSlideOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-8px);
    }
  }
`;

// Field error message styles
export const fieldError: CSSProperties = {
  color: 'var(--color-error)',
  fontSize: 'var(--text-sm)',
  marginTop: 'var(--space-2)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
};

export const fieldErrorIcon: CSSProperties = {
  width: '16px',
  height: '16px',
  flexShrink: 0,
}; 