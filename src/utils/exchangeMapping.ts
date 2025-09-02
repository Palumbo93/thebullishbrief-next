/**
 * Exchange mapping and prioritization system for different countries
 */

export interface ExchangePriorityMap {
  [countryCode: string]: string[];
}

/**
 * Exchange priority mapping by country
 * Each country lists exchanges in order of preference
 */
export const EXCHANGE_PRIORITY: ExchangePriorityMap = {
  // Canada - CSE first as requested
  CA: ['CSE', 'TSX', 'TSXV', 'NEO'],
  
  // United States - OTC first as requested
  US: ['OTC', 'NASDAQ', 'NYSE', 'AMEX', 'NYSEARCA'],
  
  // United Kingdom
  UK: ['LSE', 'AIM'],
  GB: ['LSE', 'AIM'], // Alternative UK code
  
  // Germany
  DE: ['XETRA', 'FRA', 'GETTEX'],
  
  // France
  FR: ['EPA', 'PAR'],
  
  // Australia
  AU: ['ASX'],
  
  // Japan
  JP: ['TYO', 'OSA'],
  
  // Hong Kong
  HK: ['HKEX'],
  
  // India
  IN: ['NSE', 'BSE'],
  
  // South Korea
  KR: ['KRX', 'KOSDAQ'],
  
  // China
  CN: ['SSE', 'SZSE'],
  
  // Brazil
  BR: ['BOVESPA'],
  
  // Netherlands
  NL: ['AMS'],
  
  // Switzerland
  CH: ['SWX'],
  
  // Sweden
  SE: ['STO'],
  
  // Norway
  NO: ['OSL'],
  
  // Denmark
  DK: ['CPH'],
  
  // Default fallback priority (Canada-focused as requested)
  DEFAULT: ['CSE', 'TSX', 'OTC', 'NASDAQ', 'NYSE']
};

/**
 * Get exchange priority list for a given country
 * @param country Country code (e.g., 'CA', 'US')
 * @returns Array of exchange codes in priority order
 */
export const getExchangePriorityForCountry = (country: string): string[] => {
  return EXCHANGE_PRIORITY[country.toUpperCase()] || EXCHANGE_PRIORITY.DEFAULT;
};

/**
 * Check if an exchange is supported in the mapping
 * @param exchange Exchange code to check
 * @returns boolean indicating if exchange is known
 */
export const isSupportedExchange = (exchange: string): boolean => {
  const allExchanges = Object.values(EXCHANGE_PRIORITY).flat();
  return allExchanges.includes(exchange.toUpperCase());
};

/**
 * Get the best matching exchange for a country from available tickers
 * @param availableExchanges Array of available exchange codes
 * @param country Country code
 * @returns Best matching exchange code or null
 */
export const getBestExchangeForCountry = (
  availableExchanges: string[], 
  country: string
): string | null => {
  const priority = getExchangePriorityForCountry(country);
  
  console.log('🔍 Exchange selection debug:', {
    country,
    availableExchanges,
    priority,
  });
  
  // Find the first exchange from the priority list that's available
  for (const exchange of priority) {
    if (availableExchanges.includes(exchange)) {
      console.log(`✅ Found matching exchange: ${exchange} for country ${country}`);
      return exchange;
    }
  }
  
  // If no priority match found, return the first available exchange
  const fallback = availableExchanges.length > 0 ? availableExchanges[0] : null;
  console.log(`⚠️ No priority match, using fallback: ${fallback}`);
  return fallback;
};
