/**
 * Cookie consent type definitions
 * Implements Google Consent Mode v2 and Microsoft Clarity consent requirements
 */

export type ConsentCategory = 'essential' | 'analytics' | 'marketing';

export interface ConsentState {
  /** Essential cookies - always granted (functionality_storage) */
  essential: boolean;
  
  /** Analytics consent - affects analytics_storage in GTM and Clarity consent */
  analytics: boolean;
  
  /** Marketing consent - affects ad_storage in GTM and Clarity ad sharing */
  marketing: boolean;
  
  /** Whether the consent system has been initialized */
  initialized: boolean;
}

export interface StoredConsent {
  /** Consent version for migration handling */
  version: string;
  
  /** When consent was last updated */
  timestamp: number;
  
  /** Analytics consent state */
  analytics: boolean;
  
  /** Marketing consent state */
  marketing: boolean;
  
  /** User's IP (hashed) for legal compliance */
  ipHash?: string;
  
  /** User agent for audit trail */
  userAgent?: string;
}

export type ConsentAction = 'granted' | 'denied' | 'updated' | 'withdrawn';

export interface ConsentAuditEvent {
  /** Unique session identifier */
  sessionId: string;
  
  /** User ID if authenticated */
  userId?: string;
  
  /** Action performed */
  action: ConsentAction;
  
  /** Category affected */
  category: ConsentCategory;
  
  /** Timestamp of action */
  timestamp: number;
  
  /** Hashed IP for privacy */
  ipHash: string;
  
  /** User agent */
  userAgent: string;
}

/** Google Consent Mode v2 consent types */
export type GTMConsentType = 
  | 'analytics_storage'
  | 'ad_storage'
  | 'functionality_storage'
  | 'personalization_storage'
  | 'security_storage';

export type GTMConsentState = 'granted' | 'denied';

export interface GTMConsentConfig {
  analytics_storage: GTMConsentState;
  ad_storage: GTMConsentState;
  functionality_storage: GTMConsentState;
  personalization_storage: GTMConsentState;
  security_storage: GTMConsentState;
}

/** Regions requiring consent (EEA, UK, Switzerland, Canada) */
export type ConsentRegion = 'EEA' | 'UK' | 'CH' | 'CA' | 'OTHER';

export interface ConsentContextType {
  /** Current consent state */
  consent: ConsentState;
  
  /** Update consent for a specific category */
  updateConsent: (category: ConsentCategory, granted: boolean) => void;
  
  /** Accept all non-essential categories */
  acceptAll: () => void;
  
  /** Reject all non-essential categories */
  rejectAll: () => void;
  
  /** Show consent modal */
  showConsentModal: () => void;
  
  /** Hide consent modal */
  hideConsentModal: () => void;
  
  /** Whether consent modal is visible */
  isModalVisible: boolean;
  
  /** Whether initial consent banner should be shown */
  shouldShowBanner: boolean;
  
  /** User's detected region for consent requirements */
  userRegion: ConsentRegion;
  
  /** Whether consent is required for this user */
  consentRequired: boolean;
}

/** Configuration for consent categories */
export interface ConsentCategoryConfig {
  id: ConsentCategory;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
  gtmTypes: GTMConsentType[];
}

export const CONSENT_CATEGORIES: ConsentCategoryConfig[] = [
  {
    id: 'essential',
    name: 'Essential',
    description: 'Required for basic site functionality and security',
    required: true,
    enabled: true,
    gtmTypes: ['functionality_storage', 'security_storage']
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Help us understand how you use our site with cookies and session recordings',
    required: false,
    enabled: false,
    gtmTypes: ['analytics_storage']
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Used to show you relevant content and advertisements',
    required: false,
    enabled: false,
    gtmTypes: ['ad_storage', 'personalization_storage']
  }
];

/** Default consent state */
export const DEFAULT_CONSENT: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
  initialized: false
};

/** Consent storage keys */
export const CONSENT_STORAGE_KEY = 'cookie-consent';
export const CONSENT_VERSION = '1.0';
export const CONSENT_EXPIRY_MONTHS = 13; // Microsoft Clarity requirement
