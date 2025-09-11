/**
 * Consent Debug Utilities
 * Helper functions for testing consent system in development
 */

import { ConsentService } from '../services/consent';

declare global {
  interface Window {
    consentDebug: {
      clearConsent: () => void;
      showBanner: () => void;
      checkRegion: () => string;
      getConsentState: () => any;
    };
  }
}

/**
 * Initialize debug helpers in development
 * Add to window object for easy console access
 */
export const initConsentDebug = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const consentService = ConsentService.getInstance();
    
    window.consentDebug = {
      /**
       * Clear all consent data and reload page
       */
      clearConsent: () => {
        localStorage.removeItem('cookie-consent');
        console.log('✅ Consent data cleared. Reloading page...');
        window.location.reload();
      },
      
      /**
       * Force show consent banner
       */
      showBanner: () => {
        localStorage.removeItem('cookie-consent');
        console.log('✅ Consent cleared. Refresh page to see banner.');
      },
      
      /**
       * Check detected region
       */
      checkRegion: () => {
        const region = consentService.detectUserRegion();
        const required = consentService.isConsentRequired();
        console.log(`Region: ${region}, Consent Required: ${required}`);
        return region;
      },
      
      /**
       * Get current consent state
       */
      getConsentState: () => {
        const consent = consentService.loadConsent();
        console.log('Current consent:', consent);
        return consent;
      }
    };
    
    console.log('🍪 Consent Debug Tools Available:');
    console.log('  consentDebug.clearConsent() - Clear consent and reload');
    console.log('  consentDebug.showBanner() - Clear consent data');
    console.log('  consentDebug.checkRegion() - Check detected region');
    console.log('  consentDebug.getConsentState() - View current consent');
  }
};
