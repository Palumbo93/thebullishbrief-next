import { useState } from 'react';

interface RevalidationResponse {
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
}

/**
 * Hook for on-demand revalidation of specific pages
 * This replaces the expensive webhook rebuild approach with targeted cache invalidation
 */
export function useOnDemandRevalidation() {
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [lastRevalidation, setLastRevalidation] = useState<RevalidationResponse | null>(null);

  /**
   * Revalidate a specific path (e.g., /articles/my-slug)
   * This instantly updates the cached page without rebuilding the entire site
   */
  const revalidatePath = async (path: string): Promise<RevalidationResponse> => {
    setIsRevalidating(true);
    
    try {
      console.log(`🔄 Triggering on-demand revalidation for: ${path}`);
      
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path,
          secret: process.env.NEXT_PUBLIC_REVALIDATION_SECRET || 'dev-secret', // In production, use proper secret
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Revalidation failed');
      }

      console.log(`✅ Successfully revalidated: ${path}`, result);
      setLastRevalidation(result);
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      console.error(`❌ Revalidation failed for ${path}:`, error);
      setLastRevalidation(errorResult);
      return errorResult;
    } finally {
      setIsRevalidating(false);
    }
  };

  /**
   * Revalidate an article page
   */
  const revalidateArticle = async (slug: string) => {
    return revalidatePath(`/articles/${slug}`);
  };

  /**
   * Revalidate a brief page
   */
  const revalidateBrief = async (slug: string) => {
    return revalidatePath(`/briefs/${slug}`);
  };

  /**
   * Revalidate an author page (both /authors/slug and /slug)
   */
  const revalidateAuthor = async (slug: string) => {
    // Revalidate both author page locations
    const results = await Promise.all([
      revalidatePath(`/authors/${slug}`),
      revalidatePath(`/${slug}`),
    ]);
    
    return results[0]; // Return first result for status
  };

  /**
   * Revalidate multiple paths at once
   */
  const revalidateMultiple = async (paths: string[]) => {
    setIsRevalidating(true);
    
    try {
      const results = await Promise.all(
        paths.map(path => revalidatePath(path))
      );
      
      return results;
    } finally {
      setIsRevalidating(false);
    }
  };

  return {
    revalidatePath,
    revalidateArticle,
    revalidateBrief,
    revalidateAuthor,
    revalidateMultiple,
    isRevalidating,
    lastRevalidation,
  };
}
