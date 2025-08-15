import React from 'react';

/**
 * MessageContentRenderer component that converts ticker symbols ($TICKER) and URLs into clickable links
 */
export interface MessageContentRendererProps {
  text: string;
  className?: string;
}

export const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({ text, className = '' }) => {
  // Regex patterns
  const tickerRegex = /\$([A-Z]{1,5})\b/g;
  // More robust URL regex that handles various formats
  const urlRegex = /(https?:\/\/[^\s]+)|((?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\/[^\s]*)?)/g;
  
  // Combine patterns to find all matches
  const allMatches: Array<{
    type: 'ticker' | 'url';
    match: string;
    start: number;
    end: number;
    fullMatch: string;
  }> = [];
  
  // Find ticker matches
  let tickerMatch;
  while ((tickerMatch = tickerRegex.exec(text)) !== null) {
    allMatches.push({
      type: 'ticker',
      match: tickerMatch[1],
      start: tickerMatch.index,
      end: tickerMatch.index + tickerMatch[0].length,
      fullMatch: tickerMatch[0]
    });
  }
  
  // Find URL matches
  let urlMatch: RegExpExecArray | null;
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    // Skip if this URL overlaps with a ticker match
    const isOverlapping = allMatches.some(match => 
      match.start < urlMatch!.index + urlMatch![0].length && 
      match.end > urlMatch!.index
    );
    
    if (!isOverlapping) {
      allMatches.push({
        type: 'url',
        match: urlMatch[0],
        start: urlMatch.index,
        end: urlMatch.index + urlMatch[0].length,
        fullMatch: urlMatch[0]
      });
    }
  }
  
  // Sort matches by start position
  allMatches.sort((a, b) => a.start - b.start);
  
  // If no matches, return plain text
  if (allMatches.length === 0) {
    return <span className={className}>{text}</span>;
  }
  
  // Build result by processing text segments
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  
  allMatches.forEach((match, index) => {
    // Add text before this match
    if (match.start > lastIndex) {
      result.push(
        <span key={`text-${index}`}>
          {text.slice(lastIndex, match.start)}
        </span>
      );
    }
    
    // Add the match as a link
    if (match.type === 'ticker') {
      const ticker = match.match;
      const fullTicker = `$${ticker}`;
      const googleFinanceUrl = `https://www.google.com/search?q=${ticker}+stock`;
      
      result.push(
        <a
          key={`ticker-${index}`}
          href={googleFinanceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-brand font-bold hover:text-brand/80 transition-colors ${className}`}
          style={{
            color: 'var(--color-success)',
            fontWeight: 'var(--font-bold)',
            textDecoration: 'none',
            transition: 'color var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-brand-primary)';
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-success)';
            e.currentTarget.style.opacity = '1';
          }}
        >
          {fullTicker}
        </a>
      );
    } else if (match.type === 'url') {
      let url = match.fullMatch;
      
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Clean up URL (remove trailing punctuation that might be part of the sentence)
      url = url.replace(/[.,;!?]+$/, '');
      
      result.push(
        <a
          key={`url-${index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-brand hover:text-brand/80 transition-colors ${className}`}
          style={{
            color: 'var(--color-info)',
            fontWeight: 'var(--font-medium)',
            textDecoration: 'underline',
            textDecorationColor: 'var(--color-info)',
            textUnderlineOffset: '2px',
            transition: 'color var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-brand-primary)';
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-info)';
            e.currentTarget.style.opacity = '1';
          }}
        >
          {match.fullMatch}
        </a>
      );
    }
    
    lastIndex = match.end;
  });
  
  // Add remaining text after last match
  if (lastIndex < text.length) {
    result.push(
      <span key="text-end">
        {text.slice(lastIndex)}
      </span>
    );
  }
  
  return <span className={className}>{result}</span>;
};
