import { getServerUser, getServerUserProfile } from './supabase-server'
import { User } from '@supabase/supabase-js'

/**
 * Article access check properties
 */
export interface ArticleAccessCheckProps {
  id: string
  title: string
  premium: boolean
  status: string
  content?: string
  preview?: string
}

/**
 * Brief access check properties
 */
export interface BriefAccessCheckProps {
  id: string
  title: string
  premium?: boolean
  status?: string
  content?: string
  preview?: string
}

/**
 * Result of article access determination
 */
export interface ArticleAccessResult {
  renderMode: 'full' | 'preview' | 'blocked'
  reason: string
  user?: User | null
  canBookmark: boolean
  canShare: boolean
  showSubscribePrompt: boolean
}

/**
 * Result of brief access determination (same structure as articles)
 */
export interface BriefAccessResult {
  renderMode: 'full' | 'preview' | 'blocked'
  reason: string
  user?: User | null
  canBookmark: boolean
  canShare: boolean
  showSubscribePrompt: boolean
}

/**
 * Determines article access level for server-side rendering
 * This function runs on the server and can read authentication state from cookies
 * 
 * @param article - Article to check access for
 * @returns Access result with rendering mode and user context
 */
export async function determineArticleAccess(article: ArticleAccessCheckProps): Promise<ArticleAccessResult> {
  try {
    // Get authenticated user from server-side cookies
    const user = await getServerUser()
    const userProfile = user ? await getServerUserProfile() : null
    
    // If article is not premium, everyone can access full content
    if (!article.premium) {
      return {
        renderMode: 'full',
        reason: 'free_article',
        user,
        canBookmark: !!user,
        canShare: true,
        showSubscribePrompt: !user
      }
    }
    
    // For premium articles, check user authentication and subscription
    if (!user) {
      // Unauthenticated users get preview for premium articles
      return {
        renderMode: 'preview',
        reason: 'premium_content_unauthenticated',
        user: null,
        canBookmark: false,
        canShare: true,
        showSubscribePrompt: true
      }
    }
    
    // Authenticated users - check subscription status
    // For now, we'll assume all authenticated users have access
    // This can be extended with actual subscription logic
    const hasSubscription = true // TODO: Implement actual subscription check
    
    if (hasSubscription) {
      return {
        renderMode: 'full',
        reason: 'subscribed_user',
        user,
        canBookmark: true,
        canShare: true,
        showSubscribePrompt: false
      }
    }
    
    // Authenticated but no subscription - show preview
    return {
      renderMode: 'preview',
      reason: 'premium_content_no_subscription',
      user,
      canBookmark: true,
      canShare: true,
      showSubscribePrompt: true
    }
    
  } catch (error) {
    console.error('Error determining article access:', error)
    
    // Fallback to safe defaults on error
    return {
      renderMode: article.premium ? 'preview' : 'full',
      reason: 'error_fallback',
      user: null,
      canBookmark: false,
      canShare: true,
      showSubscribePrompt: true
    }
  }
}

/**
 * Determines brief access level for server-side rendering
 * This function runs on the server and can read authentication state from cookies
 * 
 * @param brief - Brief to check access for
 * @returns Access result with rendering mode and user context
 */
export async function determineBriefAccess(brief: BriefAccessCheckProps): Promise<BriefAccessResult> {
  // Briefs are typically free content, but check premium flag if set
  const isPremium = brief.premium === true
  
  try {
    // Get authenticated user from server-side cookies
    const user = await getServerUser()
    const userProfile = user ? await getServerUserProfile() : null
    
    // If brief is not premium, everyone can access full content
    if (!isPremium) {
      return {
        renderMode: 'full',
        reason: 'free_brief',
        user,
        canBookmark: !!user,
        canShare: true,
        showSubscribePrompt: !user
      }
    }
    
    // For premium briefs, check user authentication and subscription
    if (!user) {
      // Unauthenticated users get preview for premium briefs
      return {
        renderMode: 'preview',
        reason: 'premium_brief_unauthenticated',
        user: null,
        canBookmark: false,
        canShare: true,
        showSubscribePrompt: true
      }
    }
    
    // Authenticated users - check subscription status
    // For now, we'll assume all authenticated users have access
    // This can be extended with actual subscription logic
    const hasSubscription = true // TODO: Implement actual subscription check
    
    if (hasSubscription) {
      return {
        renderMode: 'full',
        reason: 'subscribed_user',
        user,
        canBookmark: true,
        canShare: true,
        showSubscribePrompt: false
      }
    }
    
    // Authenticated but no subscription - show preview
    return {
      renderMode: 'preview',
      reason: 'premium_brief_no_subscription',
      user,
      canBookmark: true,
      canShare: true,
      showSubscribePrompt: true
    }
    
  } catch (error) {
    console.error('Error determining brief access:', error)
    
    // Fallback to safe defaults on error
    return {
      renderMode: isPremium ? 'preview' : 'full',
      reason: 'error_fallback',
      user: null,
      canBookmark: false,
      canShare: true,
      showSubscribePrompt: true
    }
  }
}

/**
 * Generates preview content from full article content
 * Extracts the first few paragraphs for preview display
 * 
 * @param fullContent - Full HTML content of the article
 * @param maxLength - Maximum character length for preview (default: 1000)
 * @returns Preview HTML content
 */
export function generatePreviewContent(fullContent: string, maxLength: number = 1000): string {
  if (!fullContent) return ''
  
  // Remove HTML tags for length calculation
  const textContent = fullContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  
  // If content is short enough, return as is
  if (textContent.length <= maxLength) {
    return fullContent
  }
  
  // Find a good breaking point (end of paragraph)
  const truncateAt = Math.min(maxLength, fullContent.length)
  let previewContent = fullContent.substring(0, truncateAt)
  
  // Try to end at a complete paragraph
  const lastParagraphEnd = previewContent.lastIndexOf('</p>')
  if (lastParagraphEnd > maxLength * 0.7) {
    previewContent = fullContent.substring(0, lastParagraphEnd + 4) // Include </p>
  }
  
  return previewContent
}

/**
 * Server-side article access control middleware
 * Can be used in API routes or server components to enforce access rules
 * 
 * @param articleId - ID of the article to check
 * @param requiredAccess - Required access level ('full' | 'preview')
 * @returns Boolean indicating if access is granted
 */
export async function checkArticleAccess(articleId: string, requiredAccess: 'full' | 'preview' = 'preview'): Promise<boolean> {
  try {
    // This would typically fetch the article and check access
    // For now, we'll implement a basic check
    const user = await getServerUser()
    
    if (requiredAccess === 'preview') {
      return true // Everyone can access preview
    }
    
    if (requiredAccess === 'full') {
      return !!user // Only authenticated users can access full content
    }
    
    return false
  } catch (error) {
    console.error('Error checking article access:', error)
    return false
  }
}
