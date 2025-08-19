import { countries } from 'countries-list';

// TypeScript interfaces for preference options
interface PreferenceOption {
  id: string;
  label: string;
  desc?: string;
}

interface OnboardingOptions {
  investorType: PreferenceOption[];
  experience: PreferenceOption[];
  riskTolerance: PreferenceOption[];
  interests: PreferenceOption[];
  country: PreferenceOption[];
}

// Single source of truth for all preference options
export const ONBOARDING_OPTIONS: OnboardingOptions = {
  investorType: [
    { id: 'day-trader', label: 'Day Trader', desc: 'Active daily trading' },
    { id: 'swing-trader', label: 'Swing Trader', desc: 'Short to medium term' },
    { id: 'long-term', label: 'Long-term Investor', desc: 'Buy and hold strategy' },
    { id: 'diversified', label: 'Diversified Portfolio', desc: 'Mix of strategies' }
  ],
  experience: [
    { id: 'beginner', label: 'Just starting', desc: 'Less than 1 year' },
    { id: 'intermediate', label: 'Getting serious', desc: '1-3 years' },
    { id: 'experienced', label: 'Experienced', desc: '3-10 years' },
    { id: 'veteran', label: 'Market veteran', desc: '10+ years' }
  ],
  riskTolerance: [
    { id: 'conservative', label: 'Conservative', desc: 'Steady, low-risk returns' },
    { id: 'moderate', label: 'Moderate', desc: 'Balanced risk and reward' },
    { id: 'aggressive', label: 'Aggressive', desc: 'Higher risk for growth' },
    { id: 'speculative', label: 'Speculative', desc: 'Maximum growth potential' }
  ],
  interests: [
    // Market Intelligence
    { id: 'hot-tickers', label: 'Hot Tickers' },
    { id: 'insider-tracking', label: 'Insider Tracking' },
    { id: 'earnings-catalysts', label: 'Earnings & Catalysts' },
  
    // Speculative Plays
    { id: 'degen-plays', label: 'Degen Plays' },
    { id: 'crypto', label: 'Crypto' },
  
    // Sector Focus
    { id: 'tech', label: 'Tech' },
    { id: 'mining-commodities-energy', label: 'Mining, Commodities & Energy' },
  ],
  country: [
    { id: 'us', label: 'United States', desc: 'US markets & regulations' },
    { id: 'ca', label: 'Canada', desc: 'TSX & Canadian markets' },
    { id: 'uk', label: 'United Kingdom', desc: 'LSE & UK markets' },
    { id: 'au', label: 'Australia', desc: 'ASX & Australian markets' },
    { id: 'de', label: 'Germany', desc: 'DAX & European markets' },
    { id: 'fr', label: 'France', desc: 'CAC 40 & European markets' },
    { id: 'jp', label: 'Japan', desc: 'Nikkei & Asian markets' },
    { id: 'sg', label: 'Singapore', desc: 'SGX & Southeast Asian markets' },
    { id: 'hk', label: 'Hong Kong', desc: 'HKEX & Greater China markets' },
    { id: 'in', label: 'India', desc: 'BSE/NSE & Indian markets' },
    { id: 'br', label: 'Brazil', desc: 'B3 & Latin American markets' },
    { id: 'mx', label: 'Mexico', desc: 'BMV & Mexican markets' },
    { id: 'other', label: 'Other', desc: 'Global markets focus' }
  ]
};

// Helper function to create mapping objects from ONBOARDING_OPTIONS
const createMappingFromOptions = (options: PreferenceOption[]): Record<string, string> => {
  return options.reduce((acc, option) => {
    acc[option.id] = option.label;
    return acc;
  }, {} as Record<string, string>);
};

// Derived mapping objects from ONBOARDING_OPTIONS
export const INVESTOR_TYPE_MAP: Record<string, string> = createMappingFromOptions(ONBOARDING_OPTIONS.investorType);

export const EXPERIENCE_MAP: Record<string, string> = createMappingFromOptions(ONBOARDING_OPTIONS.experience);

export const RISK_TOLERANCE_MAP: Record<string, string> = createMappingFromOptions(ONBOARDING_OPTIONS.riskTolerance);

export const INTERESTS_MAP: Record<string, string> = createMappingFromOptions(ONBOARDING_OPTIONS.interests);

// Country mappings with fallback to countries-list for countries not in ONBOARDING_OPTIONS
const createCountryMap = (): Record<string, string> => {
  // Start with onboarding country options
  const onboardingCountryMap = createMappingFromOptions(ONBOARDING_OPTIONS.country);
  
  // Add all countries from countries-list as fallback
  const countriesListMap = Object.entries(countries).reduce((acc, [code, country]) => {
    acc[code.toLowerCase()] = country.name;
    return acc;
  }, {} as Record<string, string>);
  
  // Merge with onboarding options taking precedence
  return { ...countriesListMap, ...onboardingCountryMap };
};

export const COUNTRY_MAP: Record<string, string> = createCountryMap();

// Helper function to format preference values
export const formatPreferenceValue = (key: string, value: any): string => {
  if (!value) return 'Not set';
  
  switch (key) {
    case 'investorType':
      return INVESTOR_TYPE_MAP[value] || value;
    case 'experience':
      return EXPERIENCE_MAP[value] || value;
    case 'riskTolerance':
      return RISK_TOLERANCE_MAP[value] || value;
    case 'interests':
      if (Array.isArray(value)) {
        return value.map(interest => INTERESTS_MAP[interest] || interest).join(', ');
      }
      return INTERESTS_MAP[value] || value;
    case 'country':
      return COUNTRY_MAP[value.toLowerCase()] || value;
    default:
      return value;
  }
};

// Get all available options for each preference type
export const getAvailableOptions = (preferenceType: string): { value: string; label: string }[] => {
  switch (preferenceType) {
    case 'investorType':
      return Object.entries(INVESTOR_TYPE_MAP).map(([value, label]) => ({ value, label }));
    case 'experience':
      return Object.entries(EXPERIENCE_MAP).map(([value, label]) => ({ value, label }));
    case 'riskTolerance':
      return Object.entries(RISK_TOLERANCE_MAP).map(([value, label]) => ({ value, label }));
    case 'interests':
      return Object.entries(INTERESTS_MAP).map(([value, label]) => ({ value, label }));
    case 'country':
      return Object.entries(COUNTRY_MAP).map(([value, label]) => ({ value, label }));
    default:
      return [];
  }
};

// Get onboarding options for a specific type
export const getOnboardingOptions = (type: keyof typeof ONBOARDING_OPTIONS) => {
  return ONBOARDING_OPTIONS[type] || [];
};

/**
 * Check if a room slug matches user preferences or admin status
 * @param roomSlug - The room slug to check
 * @param preferences - User preferences object
 * @param isAdmin - Whether the user is an admin (optional)
 * @returns true if the room should be visible to the user
 */
export const isRoomVisibleToUser = (roomSlug: string, preferences: any, isAdmin?: boolean): boolean => {
  // Admins can see ALL rooms
  if (isAdmin) {
    return true;
  }

  // Admin room is only visible to admins
  if (roomSlug === 'admin') {
    return false;
  }

  // General room is always visible to non-admins
  if (roomSlug === 'general') {
    return true;
  }

  // If no preferences, only show general room
  if (!preferences) {
    return false;
  }

  // Check if room slug matches any user interests
  if (preferences.interests && preferences.interests.includes(roomSlug)) {
    return true;
  }

  // Check if room slug matches user risk tolerance
  if (preferences.riskTolerance && roomSlug === preferences.riskTolerance) {
    return true;
  }

  // Check if room slug matches user investor type
  if (preferences.investorType && roomSlug === preferences.investorType) {
    return true;
  }

  // Check if room slug matches user experience level
  if (preferences.experience && roomSlug === preferences.experience) {
    return true;
  }

  // Check if room slug matches user country
  if (preferences.country && roomSlug === preferences.country) {
    return true;
  }

  return false;
}; 