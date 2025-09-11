/**
 * Consent Context Provider
 * Manages cookie consent state across the application
 * Integrates with GTM and Microsoft Clarity consent systems
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  ConsentState, 
  ConsentContextType, 
  ConsentCategory, 
  ConsentRegion,
  DEFAULT_CONSENT 
} from '../types/consent';
import { ConsentService } from '../services/consent';
import { initConsentDebug } from '../utils/consentDebug';

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

interface ConsentProviderProps {
  children: ReactNode;
}

export const ConsentProvider: React.FC<ConsentProviderProps> = ({ children }) => {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const [userRegion, setUserRegion] = useState<ConsentRegion>('OTHER');
  const [consentRequired, setConsentRequired] = useState(false);
  
  const consentService = ConsentService.getInstance();

  // Initialize consent system
  useEffect(() => {
    const initializeConsent = () => {
      // Detect user region and consent requirements
      const region = consentService.detectUserRegion();
      const required = consentService.isConsentRequired();
      
      setUserRegion(region);
      setConsentRequired(required);

      // Load existing consent
      const savedConsent = consentService.loadConsent();
      setConsent(savedConsent);

      // Initialize GTM with default consent state (denied)
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function(...args) {
          window.dataLayer.push(args);
        };

        // Set default consent state (denied for privacy)
        window.gtag('consent', 'default', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied',
          'functionality_storage': 'granted',
          'personalization_storage': 'denied',
          'security_storage': 'granted'
        });

        // If we have saved consent, update immediately
        if (savedConsent.initialized) {
          consentService.updateAllSystems(savedConsent);
        }
      }

      // Show banner if consent is required and not previously given
      if (required && !consentService.hasConsentHistory()) {
        setShouldShowBanner(true);
      }

      // Mark as initialized
      setConsent(prev => ({ ...prev, initialized: true }));
    };

    // Initialize debug tools in development
    initConsentDebug();

    // Small delay to ensure GTM script is loaded
    setTimeout(initializeConsent, 100);
  }, [consentService]);

  const updateConsent = useCallback((category: ConsentCategory, granted: boolean) => {
    if (category === 'essential') {
      // Essential cookies cannot be disabled
      return;
    }

    setConsent(prev => {
      const newConsent = { ...prev, [category]: granted };
      
      // Update all consent systems
      consentService.updateAllSystems(newConsent);
      
      return newConsent;
    });
  }, [consentService]);

  const acceptAll = useCallback(() => {
    const newConsent: ConsentState = {
      essential: true,
      analytics: true,
      marketing: true,
      initialized: true
    };

    setConsent(newConsent);
    consentService.updateAllSystems(newConsent);
    setShouldShowBanner(false);
    setIsModalVisible(false);
  }, [consentService]);

  const rejectAll = useCallback(() => {
    const newConsent: ConsentState = {
      essential: true,
      analytics: false,
      marketing: false,
      initialized: true
    };

    setConsent(newConsent);
    consentService.updateAllSystems(newConsent);
    setShouldShowBanner(false);
    setIsModalVisible(false);
  }, [consentService]);

  const showConsentModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const hideConsentModal = useCallback(() => {
    setIsModalVisible(false);
    // Note: Don't hide the banner when just closing the modal
    // Banner should only be hidden when user makes an actual consent decision
  }, []);

  const contextValue: ConsentContextType = {
    consent,
    updateConsent,
    acceptAll,
    rejectAll,
    showConsentModal,
    hideConsentModal,
    isModalVisible,
    shouldShowBanner,
    userRegion,
    consentRequired
  };

  return (
    <ConsentContext.Provider value={contextValue}>
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = (): ConsentContextType => {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};
