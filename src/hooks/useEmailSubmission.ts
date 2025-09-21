import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { submitToMailchimp, isValidEmail } from '../services/mailchimp';

interface UseEmailSubmissionReturn {
  submitEmail: (email: string, briefIdOrAuthorId: string, source?: string, isAuthor?: boolean) => Promise<{success: boolean, error?: string}>;
  submitAuthenticatedUser: (briefIdOrAuthorId: string, source?: string, isAuthor?: boolean) => Promise<{success: boolean, error?: string}>; // Uses auth context email
  syncToMailchimp: (emailId: string, briefId: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

interface EmailSubmissionData {
  email: string;
  brief_id?: string;
  author_id?: string;
  source: 'popup' | 'widget' | 'mobile_popup' | 'desktop_popup' | 'mobile_widget' | 'desktop_widget' | 'newsletter' | 'manual' | 'mobile_author' | 'desktop_author' | 'newsletter_home' | 'newsletter_category';
  user_id?: string;
}

/**
 * Hook for handling email submissions with Mailchimp integration
 * Supports both authenticated and unauthenticated users
 */
export const useEmailSubmission = (): UseEmailSubmissionReturn => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Mutation for submitting emails via API
  const emailMutation = useMutation({
    mutationFn: async (data: EmailSubmissionData) => {
      const response = await fetch('/api/emails/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          briefId: data.brief_id,
          authorId: data.author_id,
          source: data.source,
          userId: data.user_id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit email');
      }

      return result;
    },
    onError: (error: Error) => {
      setError(error.message);
    },
    onSuccess: () => {
      setError(null);
    }
  });

  // Sync email to Mailchimp after database submission
  const syncToMailchimp = async (emailId: string, briefId: string): Promise<void> => {
    try {
      // Get brief information for Mailchimp tag
      const { data: brief, error: briefError } = await supabase
        .from('briefs')
        .select('mailchimp_audience_tag')
        .eq('id', briefId)
        .single();

      if (briefError || !brief) {
        return;
      }

      // Get email information
      const { data: emailRecord, error: emailError } = await supabase
        .from('emails')
        .select('email')
        .eq('id', emailId)
        .single();

      if (emailError || !emailRecord) {
        return;
      }

      // Submit to Mailchimp
      const mailchimpResult = await submitToMailchimp({
        email: emailRecord.email,
        audienceTag: brief.mailchimp_audience_tag || undefined
      });

      // Note: mailchimp_status field removed - no longer tracking sync status in database
    } catch (error) {
      // Note: mailchimp_status field removed - no longer tracking sync status in database
    }
  };

  // Submit email for unauthenticated users or manual entry
  const submitEmail = async (
    email: string, 
    briefIdOrAuthorId: string, 
    source: string = 'popup',
    isAuthor: boolean = false
  ): Promise<{success: boolean, error?: string}> => {
    try {
      // Validate email format
      if (!isValidEmail(email)) {
        const errorMsg = 'Please enter a valid email address';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Check if email already exists for this brief/author/general newsletter
      let existingEmailsQuery = supabase
        .from('emails')
        .select('id')
        .eq('email', email);
      
      // If it's a specific brief or author signup, check for duplicates in that context
      if (isAuthor && briefIdOrAuthorId) {
        existingEmailsQuery = existingEmailsQuery.eq('author_id', briefIdOrAuthorId);
      } else if (!isAuthor && briefIdOrAuthorId) {
        existingEmailsQuery = existingEmailsQuery.eq('brief_id', briefIdOrAuthorId);
      } else {
        // For general newsletter, check if email already exists without brief/author association
        existingEmailsQuery = existingEmailsQuery
          .is('brief_id', null)
          .is('author_id', null);
      }

      const { data: existingEmails, error: checkError } = await existingEmailsQuery;

      if (checkError) {
        throw new Error(checkError.message);
      }

      if (existingEmails && existingEmails.length > 0) {
        let entityType = 'newsletter';
        if (isAuthor && briefIdOrAuthorId) entityType = 'author';
        else if (!isAuthor && briefIdOrAuthorId) entityType = 'brief';
        
        const errorMsg = `You're already subscribed to updates for this ${entityType}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Submit the email
      const submissionData: any = {
        email,
        source: source as 'popup' | 'widget' | 'mobile_popup' | 'desktop_popup' | 'mobile_widget' | 'desktop_widget' | 'newsletter' | 'manual' | 'mobile_author' | 'desktop_author' | 'newsletter_home' | 'newsletter_category',
        user_id: user?.id || undefined
      };

      // Only add briefId/authorId if they are provided (not empty strings)
      if (isAuthor && briefIdOrAuthorId) {
        submissionData.author_id = briefIdOrAuthorId;
      } else if (!isAuthor && briefIdOrAuthorId) {
        submissionData.brief_id = briefIdOrAuthorId;
      }

      const result = await emailMutation.mutateAsync(submissionData);

      // Note: Mailchimp submission now handled directly in components

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to submit email';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Submit for authenticated users (uses their account email)
  const submitAuthenticatedUser = async (
    briefIdOrAuthorId: string,
    source: string = 'popup',
    isAuthor: boolean = false
  ): Promise<{success: boolean, error?: string}> => {
    try {
      if (!user?.email) {
        const errorMsg = 'User email not found';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Check if user already subscribed to this brief/author/general newsletter
      let existingEmailsQuery = supabase
        .from('emails')
        .select('id')
        .eq('email', user.email);
      
      // If it's a specific brief or author signup, check for duplicates in that context
      if (isAuthor && briefIdOrAuthorId) {
        existingEmailsQuery = existingEmailsQuery.eq('author_id', briefIdOrAuthorId);
      } else if (!isAuthor && briefIdOrAuthorId) {
        existingEmailsQuery = existingEmailsQuery.eq('brief_id', briefIdOrAuthorId);
      } else {
        // For general newsletter, check if email already exists without brief/author association
        existingEmailsQuery = existingEmailsQuery
          .is('brief_id', null)
          .is('author_id', null);
      }

      const { data: existingEmails, error: checkError } = await existingEmailsQuery;

      if (checkError) {
        throw new Error(checkError.message);
      }

      if (existingEmails && existingEmails.length > 0) {
        const entityType = isAuthor ? 'author' : 'brief';
        const errorMsg = `You're already subscribed to updates for this ${entityType}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Submit with user's authenticated email
      const submissionData: any = {
        email: user.email,
        source: source as 'popup' | 'widget' | 'mobile_popup' | 'desktop_popup' | 'mobile_widget' | 'desktop_widget' | 'newsletter' | 'manual' | 'mobile_author' | 'desktop_author' | 'newsletter_home' | 'newsletter_category',
        user_id: user.id
      };

      // Only add briefId/authorId if they are provided (not empty strings)
      if (isAuthor && briefIdOrAuthorId) {
        submissionData.author_id = briefIdOrAuthorId;
      } else if (!isAuthor && briefIdOrAuthorId) {
        submissionData.brief_id = briefIdOrAuthorId;
      }

      const result = await emailMutation.mutateAsync(submissionData);

      // Note: Mailchimp submission now handled directly in components

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to subscribe';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  return {
    submitEmail,
    submitAuthenticatedUser,
    syncToMailchimp,
    isSubmitting: emailMutation.isPending,
    error
  };
};

export default useEmailSubmission;
