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