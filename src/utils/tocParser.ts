export interface TOCSection {
  id: string;
  label: string;
  level: number;
}

/**
 * Parse brief content and extract TOC sections from headings
 * @param content - Brief content (rich text with HTML)
 * @returns Array of TOC sections
 */
export const parseTOCFromContent = (content: string): TOCSection[] => {
  if (!content) return [];
  
  const sections: TOCSection[] = [];
  const seenLabels = new Set<string>();
  
  // Create a temporary div to parse HTML content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  // Find all heading elements (h1, h2 only)
  const headings = tempDiv.querySelectorAll('h1, h2');
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent?.trim() || '';
    
    if (text && level === 2) {
      // Skip if we've already seen this exact label
      if (seenLabels.has(text)) {
        return;
      }
      seenLabels.add(text);
      
      // Generate ID from text (slugify)
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
      
      // Ensure unique ID
      let uniqueId = id;
      let counter = 1;
      while (sections.some(section => section.id === uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      
      sections.push({
        id: uniqueId,
        label: text,
        level
      });
    }
  });
  
  return sections;
};

/**
 * Get the first ticker symbol from ticker data
 * @param tickers - Ticker data from database
 * @returns First ticker symbol or null
 */
export const getFirstTickerSymbol = (tickers: any): string | null => {
  if (!tickers) return null;
  
  try {
    if (Array.isArray(tickers)) {
      // If it's an array of objects like [{"CSE":"SONC"},{"OTC":"SONCF"}]
      for (const ticker of tickers) {
        if (typeof ticker === 'object' && ticker !== null) {
          const entries = Object.entries(ticker);
          if (entries.length > 0) {
            const [exchange, symbol] = entries[0];
            return `${exchange}:${symbol}`;
          }
        }
      }
    } else if (typeof tickers === 'object' && tickers !== null) {
      // If it's a single object like {"CSE":"SONC","OTC":"SONCF"}
      const entries = Object.entries(tickers);
      if (entries.length > 0) {
        const [exchange, symbol] = entries[0];
        return `${exchange}:${symbol}`;
      }
    }
  } catch (error) {
    console.error('Error getting first ticker symbol:', error);
  }
  
  return null;
};

/**
 * Get country-appropriate ticker symbol based on user's location
 * Prioritizes exchanges relevant to the user's country
 * @param tickers Ticker data (array or object)
 * @param country User's country code (default: 'CA')
 * @returns Formatted ticker symbol (e.g., "CSE:SPTZ") or null
 */
export const getCountryAppropriateTickerSymbol = (
  tickers: any, 
  country: string = 'CA'
): string | null => {
  if (!tickers) return null;

  // Import exchange mapping
  let getBestExchangeForCountry: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    getBestExchangeForCountry = require('./exchangeMapping').getBestExchangeForCountry;
  } catch (error) {
    console.error('Error importing exchange mapping:', error);
    return getFirstTickerSymbol(tickers);
  }

  try {
    const availableExchanges: string[] = [];
    const tickerMap: { [exchange: string]: string } = {};

    if (Array.isArray(tickers)) {
      // Extract all available exchanges from array format
      for (const ticker of tickers) {
        if (typeof ticker === 'object' && ticker !== null) {
          Object.entries(ticker).forEach(([exchange, symbol]) => {
            availableExchanges.push(exchange);
            tickerMap[exchange] = symbol as string;
          });
        }
      }
    } else if (typeof tickers === 'object' && tickers !== null) {
      // Extract from single object format
      Object.entries(tickers).forEach(([exchange, symbol]) => {
        availableExchanges.push(exchange);
        tickerMap[exchange] = symbol as string;
      });
    }

    if (availableExchanges.length === 0) {
      return null;
    }

    // Get the best exchange for the user's country
    const bestExchange = getBestExchangeForCountry(availableExchanges, country);
    
    if (bestExchange && tickerMap[bestExchange]) {
      return `${bestExchange}:${tickerMap[bestExchange]}`;
    }

    // Fallback to first available ticker if no country-specific match
    return getFirstTickerSymbol(tickers);
  } catch (error) {
    console.error('Error getting country-appropriate ticker symbol:', error);
    // Fallback to original logic on error
    return getFirstTickerSymbol(tickers);
  }
}; 