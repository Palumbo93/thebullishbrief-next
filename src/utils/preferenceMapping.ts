import { countries } from 'countries-list';

// Investor Type mappings
export const INVESTOR_TYPE_MAP: Record<string, string> = {
  'individual': 'Individual',
  'institutional': 'Institutional',
  'retail': 'Retail',
  'day-trader': 'Day Trader',
  'swing-trader': 'Swing Trader',
  'position-trader': 'Position Trader',
  'scalper': 'Scalper',
  'algorithmic': 'Algorithmic Trader',
  'long-term': 'Long-term Investor',
  'diversified': 'Diversified Portfolio'
};

// Experience Level mappings
export const EXPERIENCE_MAP: Record<string, string> = {
  'beginner': 'Just starting',
  'intermediate': 'Getting serious',
  'advanced': 'Experienced',
  'expert': 'Market veteran',
  'experienced': 'Experienced',
  'veteran': 'Market veteran'
};

// Risk Tolerance mappings
export const RISK_TOLERANCE_MAP: Record<string, string> = {
  'conservative': 'Conservative',
  'moderate': 'Moderate',
  'aggressive': 'Aggressive',
  'very-aggressive': 'Very Aggressive',
  'speculative': 'Speculative'
};

// Investment Interests mappings
export const INTERESTS_MAP: Record<string, string> = {
  // Market Intelligence
  'hot-tickers': 'Hot Tickers',
  'insider-tracking': 'Insider Tracking',
  'earnings-catalysts': 'Earnings & Catalysts',
  
  // Speculative Plays
  'degen-plays': 'Degen Plays',
  'crypto': 'Crypto',
  
  // Sector Focus
  'tech': 'Tech',
  'mining-commodities-energy': 'Mining, Commodities & Energy',
  
  // Evergreen Trading
  'trading-strategies': 'Trading Strategies & Setups'
};

// Country mappings using countries-list
export const COUNTRY_MAP: Record<string, string> = Object.entries(countries).reduce((acc, [code, country]) => {
  acc[code.toLowerCase()] = country.name;
  return acc;
}, {} as Record<string, string>);

// Add custom country mappings for OnboardingModal options
export const CUSTOM_COUNTRY_MAP: Record<string, string> = {
  'us': 'United States',
  'ca': 'Canada',
  'uk': 'United Kingdom',
  'au': 'Australia',
  'de': 'Germany',
  'fr': 'France',
  'jp': 'Japan',
  'sg': 'Singapore',
  'hk': 'Hong Kong',
  'in': 'India',
  'br': 'Brazil',
  'mx': 'Mexico',
  'other': 'Other'
};

// Merge custom country mappings with the main country map
Object.assign(COUNTRY_MAP, CUSTOM_COUNTRY_MAP);

// OnboardingModal Options Data
export const ONBOARDING_OPTIONS = {
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
  
    // Evergreen Trading
    { id: 'trading-strategies', label: 'Trading Strategies & Setups' }
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
 * Check if a room slug matches user preferences
 * @param roomSlug - The room slug to check
 * @param preferences - User preferences object
 * @returns true if the room should be visible to the user
 */
export const isRoomVisibleToUser = (roomSlug: string, preferences: any): boolean => {
  // General room is always visible
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