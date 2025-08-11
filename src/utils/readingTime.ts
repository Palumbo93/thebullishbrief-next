/**
 * Calculate reading time for article content
 * Average reading speed: 200 words per minute
 */
export const calculateReadingTime = (content: string): number => {
  if (!content) return 1;
  
  // Remove HTML tags and count words
  const textContent = content.replace(/<[^>]*>/g, '');
  const wordCount = textContent.trim().split(/\s+/).length;
  
  // Calculate reading time (minimum 1 minute)
  const readingTime = Math.ceil(wordCount / 200);
  return Math.max(readingTime, 1);
};

/**
 * Format reading time for display
 */
export const formatReadingTime = (minutes: number): string => {
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
};

/**
 * Generate word count from content
 */
export const getWordCount = (content: string): number => {
  if (!content) return 0;
  
  const textContent = content.replace(/<[^>]*>/g, '');
  return textContent.trim().split(/\s+/).length;
};