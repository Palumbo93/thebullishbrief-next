import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to handle Safari mobile bottom browser bar viewport issues.
 * 
 * Safari Mobile includes the bottom browser bar in the 100vh calculation,
 * which can cause layout issues. This hook provides:
 * 1. Dynamic viewport height that updates when the browser bar appears/disappears
 * 2. Support for visual viewport API when available
 * 3. Safe area inset calculations
 * 
 * Based on: https://javascript.plainenglish.io/how-to-fix-the-safari-mobile-bottom-browser-bar-issue-c3387b86542e
 */

export interface ViewportDimensions {
  /** Current viewport height in pixels */
  height: number;
  /** Current viewport width in pixels */
  width: number;
  /** Whether the device is likely Safari mobile */
  isSafariMobile: boolean;
  /** Safe area insets (if supported) */
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Detects if the current browser is Safari Mobile
 */
const isSafariMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isMobile = /iPhone|iPad|iPod/.test(userAgent) || 
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  
  return isSafari && isMobile;
};

/**
 * Gets safe area inset values from CSS environment variables
 */
const getSafeAreaInsets = () => {
  if (typeof window === 'undefined' || !window.CSS?.supports) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const getInsetValue = (property: string): number => {
    try {
      const element = document.createElement('div');
      element.style.position = 'fixed';
      element.style[property as any] = 'env(safe-area-inset-top, 0px)';
      document.body.appendChild(element);
      const computed = window.getComputedStyle(element);
      const value = parseFloat(computed[property as any]) || 0;
      document.body.removeChild(element);
      return value;
    } catch {
      return 0;
    }
  };

  return {
    top: getInsetValue('paddingTop'),
    bottom: getInsetValue('paddingBottom'),
    left: getInsetValue('paddingLeft'),
    right: getInsetValue('paddingRight'),
  };
};

/**
 * Hook for managing viewport dimensions with Safari mobile support
 */
export const useViewportHeight = (): ViewportDimensions => {
  const [dimensions, setDimensions] = useState<ViewportDimensions>(() => ({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isSafariMobile: typeof window !== 'undefined' ? isSafariMobile() : false,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
  }));

  const updateDimensions = useCallback(() => {
    if (typeof window === 'undefined') return;

    const height = window.visualViewport?.height || window.innerHeight;
    const width = window.visualViewport?.width || window.innerWidth;
    const safeAreaInsets = getSafeAreaInsets();

    setDimensions(prev => ({
      ...prev,
      height,
      width,
      safeAreaInsets,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial calculation
    updateDimensions();

    // Standard viewport change listeners
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    // Visual Viewport API support (better for mobile Safari)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateDimensions);
      window.visualViewport.addEventListener('scroll', updateDimensions);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateDimensions);
        window.visualViewport.removeEventListener('scroll', updateDimensions);
      }
    };
  }, [updateDimensions]);

  return dimensions;
};

/**
 * Simplified hook that just returns the current viewport height
 * Useful when you only need height and don't want the full dimensions object
 */
export const useViewportHeightOnly = (): number => {
  const { height } = useViewportHeight();
  return height;
};
