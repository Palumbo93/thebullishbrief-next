import React, { useState } from 'react';
import { ButtonProps } from './types/ui.types';

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  onClick,
  icon: Icon,
  iconSide = 'left',
  fullWidth = true,
  form,
  className = '',
  style = {},
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const isDisabled = disabled || loading;

  // Map variant/size to design system classes
  const baseClass = 'btn';
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
      ? 'btn-secondary'
      : 'btn-ghost';
  const sizeClass =
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  // Animation/transform styles
  const getButtonStyles = () => {
    return {
      width: fullWidth ? '100%' : 'auto',
      height: '58px',
      borderRadius: 'var(--radius-full)', // Capsule shape
      transition:
        'background 0.18s cubic-bezier(.4,0,.2,1), box-shadow 0.18s cubic-bezier(.4,0,.2,1), transform 0.13s cubic-bezier(.4,0,.2,1), color 0.18s cubic-bezier(.4,0,.2,1)',
      transform: isActive && !isDisabled
        ? 'scale(0.97)'
        : isHovered && !isDisabled
        ? 'scale(1.025)'
        : 'scale(1)',
      boxShadow:
        isHovered && !isDisabled && variant === 'primary'
          ? '0 4px 18px 0 rgba(255,255,255,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.10)'
          : '0 1.5px 6px 0 rgba(0,0,0,0.08)',
      filter: isHovered && !isDisabled && variant === 'primary' ? 'brightness(0.97)' : 'none',
      zIndex: isHovered || isActive ? 2 : 1,
      outline: 'none',
      ...style,
    };
  };

  const handleMouseEnter = () => {
    if (!isDisabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
  };

  const handleMouseDown = () => {
    if (!isDisabled) {
      setIsActive(true);
    }
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={[baseClass, variantClass, sizeClass, className].filter(Boolean).join(' ')}
      style={getButtonStyles()}
      form={form}
    >
      {loading ? (
        <>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2.5px solid rgba(255,255,255,0.18)',
            borderTop: '2.5px solid currentColor',
            borderRadius: 'var(--radius-full)',
            marginRight: 'var(--space-2)',
            animation: 'spin 0.7s linear infinite',
          }} />
          <span style={{ fontWeight: 500 }}>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconSide === 'left' && <Icon style={{ marginRight: 'var(--space-2)' }} />}
          <span>{children}</span>
          {Icon && iconSide === 'right' && <Icon style={{ marginLeft: 'var(--space-2)' }} />}
        </>
      )}
      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}; 