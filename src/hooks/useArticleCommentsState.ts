import { useState, useEffect } from 'react';

const COMMENTS_STATE_KEY = 'article-comments-expanded';

/**
 * Hook for managing persistent article comments expanded state
 * Uses localStorage to remember user preference across sessions
 */
export const useArticleCommentsState = () => {
  // Initialize with default expanded state (true) - this prevents hydration mismatch
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);
  const [shouldShowSpace, setShouldShowSpace] = useState<boolean>(true);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMMENTS_STATE_KEY);
      if (stored !== null) {
        const savedState = JSON.parse(stored);
        setIsExpanded(savedState);
      }
    } catch (error) {
      console.warn('Failed to load article comments state from localStorage:', error);
      // Keep default state (true) if localStorage fails
    } finally {
      setIsLoaded(true);
      
      // Mark as hydrated after a small delay to prevent layout flash
      setTimeout(() => {
        setHasHydrated(true);
      }, 0);
      
      // If comments should be closed, show empty space briefly then animate closed
      setTimeout(() => {
        const stored = localStorage.getItem(COMMENTS_STATE_KEY);
        const savedState = stored ? JSON.parse(stored) : true;
        if (!savedState) {
          // Show empty space for a moment before animating closed
          setTimeout(() => {
            setShouldShowSpace(false);
          }, 0); // 400ms delay to show empty sidebar
        }
      }, 100); // Small delay to ensure hydration is complete
    }
  }, []);

  // Update localStorage when state changes (only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      localStorage.setItem(COMMENTS_STATE_KEY, JSON.stringify(isExpanded));
    } catch (error) {
      console.warn('Failed to save article comments state to localStorage:', error);
    }
  }, [isExpanded, isLoaded]);

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const newValue = !prev;
      // When manually toggling, immediately update space visibility
      setShouldShowSpace(newValue);
      return newValue;
    });
  };

  return {
    isExpanded,
    setIsExpanded,
    toggleExpanded,
    isLoaded, // Can be used to prevent layout shifts during hydration
    hasHydrated, // Use this for enabling transitions
    shouldShowSpace // Use this for delayed space animation
  };
};
