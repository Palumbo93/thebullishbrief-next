import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  checked, 
  onChange, 
  label, 
  disabled = false 
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      cursor: disabled ? 'not-allowed' : 'pointer'
    }}>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        style={{
          position: 'relative',
          width: '44px',
          height: '24px',
          background: checked ? 'var(--color-brand-primary)' : 'var(--color-bg-tertiary)',
          border: '1px solid',
          borderColor: checked ? 'var(--color-brand-primary)' : 'var(--color-border-primary)',
          borderRadius: 'var(--radius-full)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-base)',
          outline: 'none',
          padding: 0
        }}
      >
        <div style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          width: '18px',
          height: '18px',
          background: 'white',
          borderRadius: 'var(--radius-full)',
          transition: 'all var(--transition-base)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }} />
      </button>
      <label style={{
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none'
      }}>
        {label}
      </label>
    </div>
  );
}; 