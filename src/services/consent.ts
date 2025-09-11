/**
 * Cookie consent service
 * Handles consent storage, validation, and integration with GTM and Clarity
 */

import { 
  ConsentState, 
  StoredConsent, 
  ConsentAuditEvent,
  ConsentAction,
  ConsentCategory,
  ConsentRegion,
  GTMConsentConfig,
  DEFAULT_CONSENT,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  CONSENT_EXPIRY_MONTHS
} from '../types/consent';

export class ConsentService {
  private static instance: ConsentService;
  private auditTrail: ConsentAuditEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): ConsentService {
    if (!ConsentService.instance) {
      ConsentService.instance = new ConsentService();
    }
    return ConsentService.instance;
  }

  /**
   * Load consent from localStorage
   */
  loadConsent(): ConsentState {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) {
        return { ...DEFAULT_CONSENT };
      }

      const parsed: StoredConsent = JSON.parse(stored);
      
      // Check if consent has expired (13 months per Microsoft requirements)
      const expiryDate = new Date(parsed.timestamp);
      expiryDate.setMonth(expiryDate.getMonth() + CONSENT_EXPIRY_MONTHS);
      
      if (new Date() > expiryDate || parsed.version !== CONSENT_VERSION) {
        this.clearConsent();
        return { ...DEFAULT_CONSENT };
      }

      return {
        essential: true, // Always true
        analytics: parsed.analytics,
        marketing: parsed.marketing,
        initialized: true
      };
    } catch (error) {
      console.warn('Failed to load consent from storage:', error);
      return { ...DEFAULT_CONSENT };
    }
  }

  /**
   * Save consent to localStorage
   */
  saveConsent(consent: ConsentState): void {
    try {
      const stored: StoredConsent = {
        version: CONSENT_VERSION,
        timestamp: Date.now(),
        analytics: consent.analytics,
        marketing: consent.marketing,
        ipHash: this.hashIP(this.getClientIP()),
        userAgent: navigator.userAgent
      };

      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
      
      // Log audit event
      this.logConsentAction('updated', 'analytics', consent.analytics);
      this.logConsentAction('updated', 'marketing', consent.marketing);
      
    } catch (error) {
      console.error('Failed to save consent:', error);
    }
  }

  /**
   * Clear all consent data
   */
  clearConsent(): void {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      this.logConsentAction('withdrawn', 'analytics', false);
      this.logConsentAction('withdrawn', 'marketing', false);
    } catch (error) {
      console.error('Failed to clear consent:', error);
    }
  }

  /**
   * Check if consent has been previously given
   */
  hasConsentHistory(): boolean {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      return stored !== null;
    } catch {
      return false;
    }
  }

  /**
   * Detect user's region for consent requirements
   */
  detectUserRegion(): ConsentRegion {
    // In production, this would use geolocation API or server-side detection
    // For now, we'll default to requiring consent for safety
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Canadian timezones
      const canadianTimezones = [
        'America/Toronto', 'America/Vancouver', 'America/Montreal', 
        'America/Halifax', 'America/Winnipeg', 'America/Edmonton',
        'America/St_Johns', 'America/Regina'
      ];
      
      // European timezones (simplified check)
      const europeanTimezones = [
        'Europe/', 'GMT', 'UTC', 'Atlantic/Azores', 'Atlantic/Madeira'
      ];
      
      const isCanadian = canadianTimezones.some(tz => timezone.includes(tz));
      const isEuropean = europeanTimezones.some(tz => timezone.includes(tz));
      
      if (isCanadian) {
        return 'CA'; // Canada requires consent for PIPEDA compliance
      }
      
      if (isEuropean) {
        return 'EEA'; // Assume EEA for European timezones
      }
      
      return 'OTHER';
    } catch {
      return 'EEA'; // Default to requiring consent for safety
    }
  }

  /**
   * Check if consent is required for the user's region
   */
  isConsentRequired(): boolean {
    // Development override: always show consent banner in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return true;
    }
    
    const region = this.detectUserRegion();
    // Canada also requires consent for cookie-based tracking (PIPEDA compliance)
    // Plus EEA, UK, CH for GDPR compliance
    return ['EEA', 'UK', 'CH', 'CA'].includes(region);
  }

  /**
   * Convert consent state to GTM consent configuration
   */
  toGTMConsent(consent: ConsentState): GTMConsentConfig {
    return {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
      functionality_storage: 'granted', // Essential always granted
      personalization_storage: consent.marketing ? 'granted' : 'denied',
      security_storage: 'granted' // Essential always granted
    };
  }

  /**
   * Update GTM consent mode
   */
  updateGTMConsent(consent: ConsentState): void {
    if (typeof window !== 'undefined' && window.gtag) {
      const gtmConsent = this.toGTMConsent(consent);
      
      window.gtag('consent', 'update', gtmConsent);
      
      // Push consent update event to dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'consent_update',
        consent_state: gtmConsent
      });
    }
  }

  /**
   * Update Microsoft Clarity consent
   */
  updateClarityConsent(analyticsConsent: boolean): void {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('consent', analyticsConsent);
    }
  }

  /**
   * Update all consent systems
   */
  updateAllSystems(consent: ConsentState): void {
    this.updateGTMConsent(consent);
    this.updateClarityConsent(consent.analytics);
    this.saveConsent(consent);
  }

  /**
   * Log consent action for audit trail
   */
  private logConsentAction(
    action: ConsentAction, 
    category: ConsentCategory, 
    granted: boolean
  ): void {
    const auditEvent: ConsentAuditEvent = {
      sessionId: this.sessionId,
      action,
      category,
      timestamp: Date.now(),
      ipHash: this.hashIP(this.getClientIP()),
      userAgent: navigator.userAgent
    };

    this.auditTrail.push(auditEvent);
    
    // In production, send to analytics or logging service
    console.log('Consent audit:', auditEvent);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Get client IP (placeholder - would be implemented server-side)
   */
  private getClientIP(): string {
    // In production, this would be provided by server or geolocation service
    return '0.0.0.0';
  }

  /**
   * Hash IP for privacy compliance
   */
  private hashIP(ip: string): string {
    // Simple hash for privacy - in production use proper crypto
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Get audit trail (for compliance reporting)
   */
  getAuditTrail(): ConsentAuditEvent[] {
    return [...this.auditTrail];
  }
}

// Global type augmentation for GTM
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
