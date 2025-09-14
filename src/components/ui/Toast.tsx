import React from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isClosing?: boolean;
  onClose: () => void;
  onAnimationEnd?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isClosing, onClose, onAnimationEnd }) => {
  return (
    <div 
      onAnimationEnd={onAnimationEnd}
      style={{
      position: 'relative',
      background: type === 'success' ? '#10b981' : '#ef4444',
      color: 'white',
      padding: 'var(--space-4) var(--space-6)',
      borderRadius: 'var(--radius-xl)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-medium)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      maxWidth: '450px',
      minWidth: '300px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      opacity: 0,
      transform: 'translateY(-20px)',
      animation: isClosing 
        ? 'toastSlideOut 0.3s ease-in forwards' 
        : 'toastSlideIn 0.3s ease-out forwards'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        flex: 1
      }}>
        <span style={{
          lineHeight: '1.4',
          letterSpacing: '0.025em'
        }}>
          {message}
        </span>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          transition: 'all var(--transition-base)',
          flexShrink: 0
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
        aria-label="Close"
      >
        <X style={{ width: '14px', height: '14px' }} />
      </button>
      <style>{`
        @keyframes toastSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes toastSlideOut {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};
