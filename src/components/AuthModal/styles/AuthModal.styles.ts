import { CSSProperties } from 'react';
import { COMPONENT_SIZES, ANIMATIONS } from '../utils/constants';

// Modal container styles
export const modalBackdrop: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(8px)',
  zIndex: 'var(--z-modal)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-4)',
};

export const modalContainer = (isSignUp: boolean): CSSProperties => ({
  backgroundColor: 'var(--color-bg-secondary)',
  border: '0.5px solid var(--color-border-primary)',
  borderRadius: 'var(--radius-2xl)',
  width: '100%',
  maxWidth: isSignUp ? COMPONENT_SIZES.MODAL_MAX_WIDTH_SIGNUP : COMPONENT_SIZES.MODAL_MAX_WIDTH_SIGNIN,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
  display: isSignUp ? 'grid' : 'block',
  gridTemplateColumns: isSignUp ? '1fr 1fr' : 'none',
});

// Close button styles
export const closeButton: CSSProperties = {
  position: 'absolute',
  top: 'var(--space-6)',
  right: 'var(--space-6)',
  color: 'var(--color-text-tertiary)',
  background: 'transparent',
  border: 'none',
  padding: 'var(--space-2)',
  cursor: 'pointer',
  borderRadius: 'var(--radius-lg)',
  transition: `all var(--transition-base)`,
  zIndex: 10,
};

export const closeButtonHover: CSSProperties = {
  color: 'var(--color-text-primary)',
  background: 'var(--color-bg-tertiary)',
};

// Branding section styles
export const brandingSection: CSSProperties = {
  position: 'relative',
  background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
  padding: 'var(--space-8)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  borderRight: '0.5px solid var(--color-border-primary)',
};

export const brandingContainer: CSSProperties = {
  marginBottom: 'var(--space-6)',
};

export const logoContainer = (size: string): CSSProperties => ({
  width: size,
  height: size,
  objectFit: 'contain',
  margin: '0 auto',
});

export const logoFallback = (size: string): CSSProperties => ({
  width: size,
  height: size,
  margin: '0 auto',
  background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
  borderRadius: 'var(--radius-2xl)',
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

export const logoPulse: CSSProperties = {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  width: '20px',
  height: '20px',
  backgroundColor: 'var(--color-success)',
  borderRadius: 'var(--radius-full)',
  border: '3px solid var(--color-bg-secondary)',
};

export const brandTitle: CSSProperties = {
  fontSize: 'var(--text-3xl)',
  fontFamily: 'var(--font-editorial)',
  marginBottom: 'var(--space-4)',
  fontWeight: 'var(--font-normal)',
  color: 'var(--color-text-primary)',
  letterSpacing: '-0.01em',
  fontStyle: 'italic',
  lineHeight: 'var(--leading-tight)',
};

export const brandTitleSignIn: CSSProperties = {
  fontSize: 'var(--text-2xl)',
  fontWeight: 'var(--font-normal)',
  fontFamily: 'var(--font-editorial)',
  marginBottom: 'var(--space-2)',
  color: 'var(--color-text-primary)',
  letterSpacing: '-0.01em',
  fontStyle: 'italic',
};

export const brandSubtitle: CSSProperties = {
  fontSize: 'var(--text-lg)',
  fontFamily: 'var(--font-editorial)',
  fontWeight: 'var(--font-normal)',
  color: 'var(--color-text-secondary)',
  lineHeight: 'var(--leading-relaxed)',
  marginBottom: 'var(--space-4)',
};

export const brandSubtitleSignIn: CSSProperties = {
  fontSize: 'var(--text-base)',
  fontFamily: 'var(--font-editorial)',
  color: 'var(--color-text-secondary)',
  lineHeight: 'var(--leading-relaxed)',
  fontWeight: 'var(--font-normal)',
};

// Features list styles
export const featuresContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  textAlign: 'left',
};

export const featureItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-tertiary)',
};

export const featureDot: CSSProperties = {
  width: '6px',
  height: '6px',
  backgroundColor: 'var(--color-brand-primary)',
  borderRadius: 'var(--radius-full)',
};

// Social proof styles
export const socialProof: CSSProperties = {
  padding: 'var(--space-4)',
  background: 'var(--color-bg-tertiary)',
  borderRadius: 'var(--radius-xl)',
  border: '0.5px solid var(--color-border-primary)',
};

export const socialProofText: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-2)',
  fontWeight: 'var(--font-medium)',
};

export const socialProofStars: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 'var(--space-1)',
};

// Form container styles
export const formContainer: CSSProperties = {
  padding: 'var(--space-8)',
  position: 'relative',
};

export const formContainerSignIn: CSSProperties = {
  position: 'relative',
  padding: 'var(--space-8)',
  background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
  borderRadius: 'var(--radius-2xl)',
};

export const formHeader: CSSProperties = {
  marginBottom: 'var(--space-6)',
};

export const formHeaderSignIn: CSSProperties = {
  textAlign: 'center',
  marginBottom: 'var(--space-8)',
};

export const formTitle: CSSProperties = {
  fontSize: 'var(--text-2xl)',
  fontWeight: 'var(--font-bold)',
  marginBottom: 'var(--space-2)',
  color: 'var(--color-text-primary)',
};

// Form fields container
export const formFieldsContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-5)',
};

// Navigation buttons container
export const navigationButtonsContainer: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-4)',
  marginTop: 'var(--space-6)',
};

export const backButton: CSSProperties = {
  height: COMPONENT_SIZES.BUTTON_HEIGHT,
  padding: '0 var(--space-6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  background: 'var(--color-bg-tertiary)',
  color: 'var(--color-text-primary)',
  border: '2px solid var(--color-border-primary)',
  borderRadius: 'var(--radius-xl)',
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-semibold)',
  fontFamily: 'var(--font-primary)',
  cursor: 'pointer',
  transition: `all var(--transition-base)`,
};

export const backButtonHover: CSSProperties = {
  background: 'var(--color-bg-secondary)',
  borderColor: 'var(--color-brand-primary)',
};

// Switch mode container
export const switchModeContainer: CSSProperties = {
  textAlign: 'center',
  marginTop: 'var(--space-2)',
};

export const switchModeContainerSignIn: CSSProperties = {
  textAlign: 'center',
  marginTop: 'var(--space-4)',
};

export const switchModeText: CSSProperties = {
  color: 'var(--color-text-tertiary)',
  fontSize: 'var(--text-sm)',
  marginBottom: 'var(--space-1)',
};

export const switchModeTextSignIn: CSSProperties = {
  color: 'var(--color-text-tertiary)',
  fontSize: 'var(--text-sm)',
  marginBottom: 'var(--space-2)',
};

export const switchModeButton: CSSProperties = {
  color: 'var(--color-brand-primary)',
  background: 'transparent',
  border: 'none',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-semibold)',
  cursor: 'pointer',
  padding: 'var(--space-1) var(--space-3)',
  borderRadius: 'var(--radius-lg)',
  transition: `all var(--transition-base)`,
};

export const switchModeButtonSignIn: CSSProperties = {
  color: 'var(--color-brand-primary)',
  background: 'transparent',
  border: 'none',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-semibold)',
  cursor: 'pointer',
  padding: 'var(--space-2) var(--space-4)',
  borderRadius: 'var(--radius-lg)',
  transition: `all var(--transition-base)`,
};

export const switchModeButtonHover: CSSProperties = {
  background: 'var(--color-bg-tertiary)',
  color: 'var(--color-text-primary)',
};

// Terms container
export const termsContainer: CSSProperties = {
  marginTop: 'var(--space-2)',
  textAlign: 'center',
};

export const termsText: CSSProperties = {
  fontSize: '9px',
  color: 'var(--color-text-muted)',
  lineHeight: '1.3',
};

export const termsLink: CSSProperties = {
  color: 'var(--color-brand-primary)',
  fontWeight: 'var(--font-medium)',
}; 