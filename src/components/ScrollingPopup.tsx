"use client";

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

interface ScrollingPopupProps {
  children: ReactNode | ((dismissPopup: () => void) => ReactNode);
  triggerScrollPercentage?: number;
  hideAfterScrollPercentage?: number;
  showDelay?: number;
  // Optional tracking props
  onPopupViewed?: () => void;
}

/**
 * ScrollingPopup - A mobile-only popup that appears based on scroll position
 * 
 * Features:
 * - Only visible on mobile devices
 * - Triggers after scrolling past a percentage of content
 * - Auto-hides when user scrolls too far (indicating engagement)
 * - Smooth slide-up animation from bottom
 * - Easy dismissal with close button
 */
export const ScrollingPopup: React.FC<ScrollingPopupProps> = ({
  children,
  triggerScrollPercentage = 30,
  hideAfterScrollPercentage = 70,
  showDelay = 2000,
  onPopupViewed
}) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false); // Controls DOM mounting
  const [isAnimatingVisible, setIsAnimatingVisible] = useState(false); // Controls animation state
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);
  const isVisibleRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    hasTriggeredRef.current = hasTriggered;
  }, [hasTriggered]);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);



  // No persistent dismissal - popup can show on every page load

  // Scroll event handler
  useEffect(() => {
    if (!isMobile || isDismissed) {
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercentage = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

          // Show popup after trigger percentage
          if (scrollPercentage >= triggerScrollPercentage && !hasTriggeredRef.current && !isDismissed) {
            setHasTriggered(true);
            hasTriggeredRef.current = true;
            
            if (showTimeoutRef.current) {
              clearTimeout(showTimeoutRef.current);
            }
            
            const showPopup = () => {
              // First: Mount the component in DOM (invisible)
              setIsVisible(true);
              isVisibleRef.current = true;
              
              // Then: Trigger animation after a tiny delay to ensure DOM is ready
              animationTimeoutRef.current = setTimeout(() => {
                setIsAnimatingVisible(true);
                // Track popup view when it becomes visible to user
                onPopupViewed?.();
              }, 10);
            };
            
            if (showDelay === 0) {
              showPopup();
            } else {
              showTimeoutRef.current = setTimeout(showPopup, showDelay);
            }
          }

          // Hide popup if user scrolls too far (engaged with content)
          if (scrollPercentage >= hideAfterScrollPercentage && isVisibleRef.current) {
            setIsAnimatingVisible(false);
            // Hide from DOM after animation completes
            setTimeout(() => {
              setIsVisible(false);
              isVisibleRef.current = false;
            }, 400); // Match animation duration
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, [isMobile, isDismissed, triggerScrollPercentage, hideAfterScrollPercentage, showDelay]);

  // Handle manual dismissal (only for current page load)
  const handleDismiss = () => {
    setIsAnimatingVisible(false);
    // Hide from DOM after animation completes
    setTimeout(() => {
      setIsVisible(false);
      setIsDismissed(true);
    }, 400); // Match animation duration
  };

  // Don't render anything on desktop/tablet
  if (!isMobile) {
    return null;
  }

  // Don't render if not visible (controls DOM mounting)
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop with fade-in */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(2px)',
          zIndex: 9998,
          opacity: isAnimatingVisible ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
          pointerEvents: 'none'
        }}
      />
      
      {/* Popup with enhanced slide-up animation */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          transform: isAnimatingVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          backgroundColor: 'var(--color-bg-primary)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-primary)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4), 0 -2px 8px rgba(0, 0, 0, 0.1)',
          maxHeight: '80vh',
          overflowY: 'auto',
          paddingBottom: 'env(safe-area-inset-bottom)',
          // Add a subtle scale effect
          scale: isAnimatingVisible ? '1' : '0.95',
          // Smooth opacity transition
          opacity: isAnimatingVisible ? 1 : 0
        }}
      >
        {/* Close Button */}
        <div style={{
          position: 'absolute',
          top: 'var(--space-3)',
          right: 'var(--space-3)',
          zIndex: 1
        }}>
          <button
            onClick={handleDismiss}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              transition: 'all 0.2s ease'
            }}
            aria-label="Close popup"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: 'var(--space-4)'
        }}>
          {typeof children === 'function' ? children(handleDismiss) : children}
        </div>
      </div>
    </>
  );
};

export default ScrollingPopup;
