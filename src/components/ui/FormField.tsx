import React, { useState, useRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { FormFieldProps } from './types/ui.types';

export const FormField: React.FC<FormFieldProps> = ({
  type,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  showPasswordToggle = false,
  disabled = false,
  className = '',
  style = {},
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordToggleHovered, setPasswordToggleHovered] = useState(false);
  const inputId = useRef(`input-${Math.random().toString(36).substr(2, 9)}`).current;

  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;
  const hasValue = value && value.length > 0;

  // Floating label logic - positioned very close to top when floating
  const labelFloated = focused || hasValue;
  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    left: '20px',
    top: labelFloated ? '8px' : '50%',
    transform: labelFloated ? 'translateY(0)' : 'translateY(-50%)',
    fontSize: labelFloated ? '11px' : '14px',
    color: error
      ? 'var(--color-error)'
      : 'var(--color-text-secondary)',
    fontWeight: 400,
    background: 'transparent',
    pointerEvents: 'none',
    transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
    zIndex: 2,
    lineHeight: 1,
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      width: '100%',
      ...style,
    }} className={className}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* Floating Label */}
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>

        {/* Input */}
        <input
          id={inputId}
          type={actualType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: '58px',
            padding: '1.25rem 20px 15px',
            backgroundColor: 'var(--color-bg-tertiary)',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-secondary)'}`,
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-text-primary)',
            fontSize: '16px',
            fontWeight: 600,
            transition: 'all var(--transition-base)',
            outline: 'transparent solid 2px',
            boxShadow: 'none',
            ...(disabled && {
              opacity: 0.5,
              cursor: 'not-allowed',
            }),
          }}
          placeholder=""
          required={required}
          disabled={disabled}
          minLength={type === 'password' ? 6 : undefined}
          autoComplete={type === 'password' ? 'new-password' : 'off'}
        />

        {/* Password Toggle (only for password fields) */}
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            onMouseEnter={() => setPasswordToggleHovered(true)}
            onMouseLeave={() => setPasswordToggleHovered(false)}
            style={{
              position: 'absolute',
              right: '12px',
              width: '24px',
              height: '24px',
              background: 'var(--color-bg-tertiary)',
              border: 'none',
              color: passwordToggleHovered ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--transition-base)',
              zIndex: 2,
            }}
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff style={{ width: '18px', height: '18px' }} />
            ) : (
              <Eye style={{ width: '18px', height: '18px' }} />
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          color: 'var(--color-error)',
          fontSize: 'var(--text-xs)',
        }}>
          <AlertCircle style={{ width: '12px', height: '12px' }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}; 