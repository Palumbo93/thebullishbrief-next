import React, { useEffect } from 'react';
import { useToastContext } from '../contexts/ToastContext';
import { Toast } from './ui/Toast';

/**
 * Container component that renders all active toasts
 * Handles positioning, stacking, and auto-dismiss functionality
 */
export const ToastContainer: React.FC = () => {
  const { toasts, startClosingToast, removeToast } = useToastContext();

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    const timers = toasts
      .filter(toast => !toast.isClosing) // Only set timers for toasts that aren't already closing
      .map(toast => {
        return setTimeout(() => {
          startClosingToast(toast.id);
        }, 3000);
      });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, startClosingToast]);

  // Handle manual close with animation
  const handleClose = (toastId: string) => {
    startClosingToast(toastId);
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 'var(--space-4)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        pointerEvents: 'none', // Allow clicks to pass through container
      }}
    >
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto', // Re-enable pointer events for individual toasts
            // Add slight delay to animation based on position in stack
            animationDelay: `${index * 100}ms`,
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            isClosing={toast.isClosing}
            onClose={() => handleClose(toast.id)}
            onAnimationEnd={() => {
              if (toast.isClosing) {
                removeToast(toast.id);
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};
