# Google Tag Manager & Cookie Consent System Design

## Problem Statement

We need to implement Google Tag Manager (GTM) as our centralized tag management system while maintaining GDPR compliance through proper cookie consent management. The system should allow cookie-free analytics to run without consent while requiring explicit consent for cookie-based tracking technologies.

## Goals

- **Centralized Tag Management**: Implement GTM as the single source for all tracking scripts
- **GDPR Compliance**: Proper cookie consent with granular controls
- **Performance**: Maintain fast page loads while adding consent management
- **Privacy-First**: Continue cookie-free analytics for basic insights
- **User Experience**: Non-intrusive consent interface that respects user choices
- **Developer Experience**: Clean API for managing consent and analytics

## Non-Goals

- Migrating away from Microsoft Clarity (it will move to GTM)
- Changing existing privacy policy substantially (minor updates only)
- Implementing complex consent preferences (keep it simple)

## Architecture

### Tag Management Strategy

**Google Tag Manager Setup:**
- **Container ID**: GTM-XXXXXX (to be created)
- **Environment**: Production, Staging, Development
- **Consent Mode**: Google's advanced consent mode v2 (integrates with Clarity consent)
- **Default State**: Denied for all cookie-based tracking

**Tag Categories (Updated for Clarity Compliance):**
1. **Essential/Functional**: Always allowed (no cookies)
   - Basic page functionality scripts
   - Error monitoring (cookie-free)

2. **Analytics**: Requires consent (analytics_storage)
   - Microsoft Clarity (with cookies when consent granted)
   - Google Analytics 4 (with cookies)
   - Enhanced measurement events
   - Custom events with persistent identifiers

3. **Marketing**: Requires consent (ad_storage)
   - Microsoft Ads integration (via Clarity)
   - Advertising pixels
   - Retargeting tags
   - Social media pixels

**Important Update**: Microsoft Clarity will require consent for cookie-based functionality starting October 31, 2025 for EEA/UK/CH traffic. The cookie-free mode will have limited functionality (no session recordings, funnels, etc.).

### Cookie Consent Implementation

#### 1. Consent Management System
```typescript
// src/contexts/ConsentContext.tsx
interface ConsentState {
  essential: boolean;     // Always true
  analytics: boolean;     // User choice
  marketing: boolean;     // User choice
  initialized: boolean;   // System state
}

interface ConsentContextType {
  consent: ConsentState;
  updateConsent: (category: ConsentCategory, granted: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  showConsentModal: () => void;
}
```

#### 2. GTM + Clarity Consent Integration
```typescript
// src/services/gtm.ts
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    clarity: (...args: any[]) => void;
  }
}

export class GTMService {
  private static instance: GTMService;
  
  constructor(private containerId: string) {
    this.initializeDataLayer();
  }
  
  initializeDataLayer(): void {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    // Set default consent state (denied) - integrates with Clarity
    window.gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'functionality_storage': 'granted', // Essential cookies
      'personalization_storage': 'denied',
      'security_storage': 'granted' // Essential cookies
    });
  }
  
  updateConsent(consentState: ConsentState): void {
    // Update Google Consent Mode
    window.gtag('consent', 'update', {
      'analytics_storage': consentState.analytics ? 'granted' : 'denied',
      'ad_storage': consentState.marketing ? 'granted' : 'denied',
    });
    
    // Update Clarity consent (required for EEA/UK/CH after Oct 31, 2025)
    if (typeof window.clarity !== 'undefined') {
      window.clarity('consent', consentState.analytics);
    }
    
    // Push consent update to dataLayer for GTM triggers
    window.dataLayer.push({
      event: 'consent_update',
      analytics_storage: consentState.analytics ? 'granted' : 'denied',
      ad_storage: consentState.marketing ? 'granted' : 'denied'
    });
  }
  
  trackEvent(eventName: string, parameters?: Record<string, any>): void {
    window.gtag('event', eventName, parameters);
  }
}
```

#### 3. Consent Modal Component
```typescript
// src/components/ConsentModal.tsx
interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConsentModal({ isOpen, onClose }: ConsentModalProps) {
  const { consent, updateConsent, acceptAll, rejectAll } = useConsent();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="consent-modal">
        <h2>Cookie Preferences</h2>
        <p>We use cookies to enhance your experience and analyze site usage.</p>
        
        <div className="consent-categories">
          <ConsentCategory
            title="Essential"
            description="Required for basic site functionality"
            enabled={true}
            disabled={true}
          />
          
          <ConsentCategory
            title="Analytics"
            description="Help us understand how you use our site"
            enabled={consent.analytics}
            onChange={(enabled) => updateConsent('analytics', enabled)}
          />
          
          <ConsentCategory
            title="Marketing"
            description="Used to show you relevant content and ads"
            enabled={consent.marketing}
            onChange={(enabled) => updateConsent('marketing', enabled)}
          />
        </div>
        
        <div className="consent-actions">
          <button onClick={rejectAll}>Reject All</button>
          <button onClick={acceptAll}>Accept All</button>
          <button onClick={onClose}>Save Preferences</button>
        </div>
      </div>
    </Modal>
  );
}
```

### Microsoft Clarity Migration to GTM

#### Current State (Direct Implementation - Needs Update)
```html
<!-- In layout.tsx - Current cookie-free implementation -->
<script>
  (function(c,l,a,r,i,t,y){
    // Direct Clarity implementation
    c[a]('set', 'cookies', false);
  })(window, document, "clarity", "script", "t0h9wf1q4x");
</script>
```

#### Target State (GTM Tag with Consent Management)
```typescript
// GTM Custom HTML Tag for Clarity - Updated for Consent Compliance
Tag Name: Microsoft Clarity
Type: Custom HTML
Trigger: All Pages
Consent Settings: Require analytics_storage consent for full functionality

HTML:
<script>
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    
    // Enable Clarity Consent Mode (required for EEA/UK/CH compliance)
    c[a]('set', 'consentMode', true);
    
    // Set initial consent state based on GTM consent
    var analyticsConsent = {{analytics_storage}} === 'granted';
    c[a]('consent', analyticsConsent);
    
  })(window, document, "clarity", "script", "{{Clarity Project ID}}");
</script>

Variables:
- Clarity Project ID: t0h9wf1q4x
- analytics_storage: Built-in GTM consent variable

Triggers:
- All Pages (with consent check)
- Consent Update (to update Clarity when consent changes)
```

#### Clarity Consent Mode Benefits
According to Microsoft documentation:
- **With Consent**: Full functionality including session recordings, funnels, heatmaps
- **Without Consent**: Limited cookieless data collection only
- **Compliance**: Meets EEA/UK/CH requirements starting October 31, 2025
- **Integration**: Works seamlessly with Google Consent Mode v2

## Implementation Plan

### Phase 1: GTM Foundation Setup
1. **Create GTM Container**: Set up Google Tag Manager account and container
2. **Environment Configuration**: Production, staging, development environments
3. **Consent Mode Setup**: Configure Google Consent Mode v2
4. **Basic Integration**: Add GTM script to layout

### Phase 2: Consent System Implementation
1. **Consent Context**: Create React context for consent management
2. **Storage Service**: Implement localStorage persistence for consent choices
3. **GTM Integration**: Connect consent state to GTM consent mode
4. **Consent Modal**: Build user-friendly consent interface

### Phase 3: Tag Migration
1. **Clarity Migration**: Move Clarity from direct script to GTM tag
2. **Testing**: Verify Clarity continues working cookie-free
3. **Additional Tags**: Set up Google Analytics 4 (with consent requirement)
4. **Event Tracking**: Migrate existing analytics events to GTM

### Phase 4: UI/UX Integration
1. **Consent Banner**: Implement initial consent request
2. **Preference Center**: Allow users to modify consent choices
3. **Privacy Policy**: Update to reflect new cookie usage
4. **Footer Links**: Add cookie preference links

## File Structure

```
src/
├── components/
│   ├── ConsentModal.tsx          # Main consent modal
│   ├── ConsentBanner.tsx         # Initial consent request
│   ├── ConsentCategory.tsx       # Individual category toggle
│   └── ConsentPreferences.tsx    # Preference center page
├── contexts/
│   └── ConsentContext.tsx        # Consent state management
├── services/
│   ├── gtm.ts                   # GTM service and utilities
│   └── consent.ts               # Consent storage and logic
├── hooks/
│   ├── useConsent.ts            # Consent hook
│   └── useGTM.ts                # GTM analytics hook
└── types/
    └── consent.ts               # Consent type definitions
```

## Privacy & Compliance

### GDPR Compliance Strategy

**Legal Basis:**
- **Essential**: Legitimate interest (site functionality)
- **Analytics**: Consent required for cookie-based tracking
- **Marketing**: Explicit consent required

**Data Processing:**
- **Cookie-Free Analytics**: Continue with legitimate interest
- **Cookie-Based Tracking**: Only after explicit consent
- **Data Retention**: 26 months for analytics, configurable per category

**User Rights:**
- **Transparency**: Clear explanation of each category
- **Choice**: Granular control over consent categories
- **Withdrawal**: Easy consent withdrawal mechanism
- **Access**: View and modify consent preferences anytime

### Implementation Details

#### 1. Consent Storage
```typescript
interface StoredConsent {
  version: string;          // Consent version for migration
  timestamp: number;        // When consent was given
  analytics: boolean;       // Analytics consent
  marketing: boolean;       // Marketing consent
  ip?: string;             // IP for legal compliance (hashed)
}
```

#### 2. Consent Versioning
- **Version 1.0**: Initial implementation
- **Future Versions**: When privacy policy changes significantly
- **Migration Logic**: Handle consent version upgrades gracefully

#### 3. Audit Trail
```typescript
interface ConsentAudit {
  userId?: string;          // If authenticated
  sessionId: string;        // Session identifier
  action: 'granted' | 'denied' | 'updated';
  category: ConsentCategory;
  timestamp: number;
  userAgent: string;
  ip: string;              // Hashed for privacy
}
```

## Benefits

### For Users
- **Transparency**: Clear understanding of data collection
- **Control**: Granular choice over tracking categories
- **Performance**: Faster page loads with selective loading
- **Privacy**: Cookie-free analytics option

### For Developers
- **Centralized Management**: All tags managed in GTM
- **Easy Testing**: GTM preview mode for tag debugging
- **Version Control**: Tag versioning and rollback capabilities
- **Clean Code**: Reduced inline scripts in application

### For Business
- **Compliance**: GDPR-ready consent management
- **Insights**: Continued analytics with user consent
- **Flexibility**: Easy addition of new tracking tools
- **Audit Trail**: Complete consent history for legal requirements

## Success Metrics

### Technical Metrics
- **Page Load Time**: No degradation from consent system
- **Consent Rate**: Percentage of users granting analytics consent
- **Tag Performance**: All tags firing correctly based on consent
- **Error Rate**: Minimal errors in consent system

### Compliance Metrics
- **Consent Coverage**: All cookie-based tags respect consent
- **Audit Trail**: Complete consent change history
- **Legal Review**: Privacy policy and implementation approved
- **User Rights**: Preference center functionality working

## Risks & Mitigation

### Technical Risks
- **Performance Impact**: Mitigated by lazy loading and efficient consent checks
- **Browser Compatibility**: Tested across all major browsers
- **Tag Conflicts**: GTM container organization and naming conventions

### Legal Risks
- **Compliance Gaps**: Regular legal review of implementation
- **Data Leakage**: Strict consent enforcement before any tracking
- **User Rights**: Comprehensive preference management system

### Business Risks
- **Analytics Drop**: Cookie-free Clarity maintains basic insights
- **Consent Fatigue**: Simple, non-intrusive consent interface
- **Development Velocity**: GTM reduces need for code deployments

## Future Considerations

### Enhanced Features
- **A/B Testing**: GTM-based consent modal testing
- **Personalization**: Consent-based content customization
- **Advanced Analytics**: Enhanced measurement with consent
- **Marketing Integration**: Retargeting and conversion tracking

### Compliance Evolution
- **Cookie Law Updates**: Adaptable consent system architecture
- **Regional Compliance**: Support for different privacy frameworks
- **Third-Party Integrations**: Consent framework for external tools
- **Data Portability**: Export consent preferences and data
