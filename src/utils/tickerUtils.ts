/**
 * Get tickers as an array of objects for flexible UI formatting
 * @param tickers - JSONB ticker data from database
 * @returns Array of ticker objects with exchange and symbol, or null if no tickers
 */
export const getTickers = (tickers: any): Array<{exchange: string, symbol: string}> | null => {
  if (!tickers) return null;
  
  try {
    const tickerArray: Array<{exchange: string, symbol: string}> = [];
    
    if (Array.isArray(tickers)) {
      // If it's an array of objects like [{"CSE":"SONC"},{"OTC":"SONCF"}]
      tickers.forEach(ticker => {
        if (typeof ticker === 'object' && ticker !== null) {
          Object.entries(ticker).forEach(([exchange, symbol]) => {
            tickerArray.push({ exchange, symbol: String(symbol) });
          });
        }
      });
    } else if (typeof tickers === 'object' && tickers !== null) {
      // If it's a single object like {"CSE":"SONC","OTC":"SONCF"}
      Object.entries(tickers).forEach(([exchange, symbol]) => {
        tickerArray.push({ exchange, symbol: String(symbol) });
      });
    }
    
    return tickerArray.length > 0 ? tickerArray : null;
  } catch (error) {
    console.error('Error getting tickers:', error);
    return null;
  }
};

/**
 * Format tickers from JSONB format to display string (legacy function)
 * @param tickers - JSONB ticker data from database
 * @returns Formatted ticker string or null if no tickers
 */
export const formatTickers = (tickers: any): string | null => {
  const tickerArray = getTickers(tickers);
  if (!tickerArray) return null;
  
  return tickerArray
    .map(ticker => `${ticker.exchange}:${ticker.symbol}`)
    .join(' | ');
};

/**
 * Get ticker symbols as an array for easier processing
 * @param tickers - JSONB ticker data from database
 * @returns Array of ticker symbols
 */
export const getTickerSymbols = (tickers: any): string[] => {
  if (!tickers) return [];
  
  try {
    if (Array.isArray(tickers)) {
      return tickers.flatMap(ticker => {
        if (typeof ticker === 'object' && ticker !== null) {
          return Object.values(ticker);
        }
        return [String(ticker)];
      });
    } else if (typeof tickers === 'object' && tickers !== null) {
      return Object.values(tickers);
    } else {
      return [String(tickers)];
    }
  } catch (error) {
    console.error('Error getting ticker symbols:', error);
    return [];
  }
};

/**
 * Get ticker exchanges as an array
 * @param tickers - JSONB ticker data from database
 * @returns Array of exchange names
 */
export const getTickerExchanges = (tickers: any): string[] => {
  if (!tickers) return [];
  
  try {
    if (Array.isArray(tickers)) {
      return tickers.flatMap(ticker => {
        if (typeof ticker === 'object' && ticker !== null) {
          return Object.keys(ticker);
        }
        return [];
      });
    } else if (typeof tickers === 'object' && tickers !== null) {
      return Object.keys(tickers);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting ticker exchanges:', error);
    return [];
  }
};

/**
 * Validate ticker JSON input from admin forms
 * @param tickerInput - Raw string input from form
 * @returns Parsed tickers object or null if invalid
 */
export const validateTickerInput = (tickerInput: string): any => {
  if (!tickerInput.trim()) return null;
  
  try {
    const parsed = JSON.parse(tickerInput);
    
    // Validate the structure
    if (Array.isArray(parsed)) {
      // Check if it's an array of objects
      for (const item of parsed) {
        if (typeof item !== 'object' || item === null) {
          throw new Error('Each ticker must be an object');
        }
        if (Object.keys(item).length === 0) {
          throw new Error('Ticker objects cannot be empty');
        }
      }
    } else if (typeof parsed === 'object' && parsed !== null) {
      // Single object format is also valid
      if (Object.keys(parsed).length === 0) {
        throw new Error('Ticker object cannot be empty');
      }
    } else {
      throw new Error('Tickers must be an array of objects or a single object');
    }
    
    return parsed;
  } catch (error) {
    console.error('Invalid ticker format:', error);
    return null;
  }
}; 