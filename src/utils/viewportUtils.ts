/**
 * Utility functions for handling Safari mobile viewport issues.
 * 
 * These utilities help with:
 * 1. Generating CSS that handles Safari's bottom browser bar
 * 2. Safe area inset calculations
 * 3. Dynamic viewport height styles
 */

export interface ViewportStyleOptions {
  /** Whether to include fallbacks for older browsers */
  includeFallbacks?: boolean;
  /** Whether to include safe area inset padding */
  includeSafeAreaInsets?: boolean;
  /** Custom height value to use instead of viewport units */
  customHeight?: number;
}

/**
 * Generates CSS height value that handles Safari mobile bottom bar issues
 */
export const getViewportAwareHeight = (options: ViewportStyleOptions = {}): string => {
  const { includeFallbacks = true, customHeight } = options;
  
  if (customHeight) {
    return `${customHeight}px`;
  }
  
  if (includeFallbacks) {
    // Use both 100vh as fallback and 100dvh for modern browsers
    return '100vh; height: 100dvh';
  }
  
  return '100dvh';
};

/**
 * Generates CSS safe area inset padding
 */
export const getSafeAreaInsetPadding = (): Record<string, string> => ({
  paddingTop: 'env(safe-area-inset-top, 0)',
  paddingBottom: 'env(safe-area-inset-bottom, 0)',
  paddingLeft: 'env(safe-area-inset-left, 0)',
  paddingRight: 'env(safe-area-inset-right, 0)',
});

/**
 * Generates CSS safe area inset margins
 */
export const getSafeAreaInsetMargin = (): Record<string, string> => ({
  marginTop: 'env(safe-area-inset-top, 0)',
  marginBottom: 'env(safe-area-inset-bottom, 0)',
  marginLeft: 'env(safe-area-inset-left, 0)',
  marginRight: 'env(safe-area-inset-right, 0)',
});

/**
 * Generates a complete style object for full-height containers with Safari support
 */
export const getFullHeightStyles = (options: ViewportStyleOptions = {}): Record<string, string> => {
  const { includeSafeAreaInsets = false, customHeight } = options;
  
  const baseStyles: Record<string, string> = {
    height: getViewportAwareHeight(options),
    minHeight: customHeight ? `${customHeight}px` : '100dvh',
  };
  
  if (includeSafeAreaInsets) {
    return {
      ...baseStyles,
      ...getSafeAreaInsetPadding(),
    };
  }
  
  return baseStyles;
};

/**
 * Generates CSS string for full-height containers
 */
export const generateFullHeightCSS = (
  selector: string, 
  options: ViewportStyleOptions = {}
): string => {
  const styles = getFullHeightStyles(options);
  const cssProperties = Object.entries(styles)
    .map(([prop, value]) => `  ${kebabCase(prop)}: ${value};`)
    .join('\n');
    
  return `${selector} {\n${cssProperties}\n}`;
};

/**
 * Converts camelCase to kebab-case for CSS properties
 */
const kebabCase = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * CSS template string for common full-height backdrop
 */
export const FULL_HEIGHT_BACKDROP_CSS = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  z-index: var(--z-modal, 1000);
`;

/**
 * CSS template string for common full-height drawer/modal
 */
export const FULL_HEIGHT_DRAWER_CSS = `
  position: fixed;
  height: 100vh;
  height: 100dvh;
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
`;

/**
 * Detects if safe area insets are supported
 */
export const supportsSafeAreaInsets = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    return window.CSS?.supports?.('padding-top', 'env(safe-area-inset-top)') || false;
  } catch {
    return false;
  }
};

/**
 * Detects if dynamic viewport units are supported
 */
export const supportsDynamicViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    return window.CSS?.supports?.('height', '100dvh') || false;
  } catch {
    return false;
  }
};
