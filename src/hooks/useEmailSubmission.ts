import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { submitToMailchimp, isValidEmail } from '../services/mailchimp';

interface UseEmailSubmissionReturn {
  submitEmail: (email: string, briefId: string, userId?: string) => Promise<{success: boolean, error?: string}>;
  submitAuthenticatedUser: (briefId: string) => Promise<{success: boolean, error?: string}>; // Uses auth context email
  syncToMailchimp: (emailId: string, briefId: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

interface EmailSubmissionData {
  email: string;
  brief_id: string;
  source: 'popup' | 'widget' | 'newsletter' | 'manual';
  user_id?: string;
  mailchimp_status?: 'pending' | 'synced' | 'failed';
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
        console.warn('Could not fetch brief for Mailchimp sync:', briefError);
        return;
      }

      // Get email information
      const { data: emailRecord, error: emailError } = await supabase
        .from('emails')
        .select('email')
        .eq('id', emailId)
        .single();

      if (emailError || !emailRecord) {
        console.warn('Could not fetch email for Mailchimp sync:', emailError);
        return;
      }

      // Submit to Mailchimp
      const mailchimpResult = await submitToMailchimp({
        email: emailRecord.email,
        audienceTag: brief.mailchimp_audience_tag || undefined
      });

      // Update sync status in database
      await supabase
        .from('emails')
        .update({ 
          mailchimp_status: mailchimpResult.success ? 'synced' : 'failed' 
        })
        .eq('id', emailId);

      if (!mailchimpResult.success) {
        console.error('Mailchimp submission failed:', mailchimpResult.error);
      }
    } catch (error) {
      console.error('Mailchimp sync error:', error);
      
      // Update status to failed
      await supabase
        .from('emails')
        .update({ mailchimp_status: 'failed' })
        .eq('id', emailId);
    }
  };

  // Submit email for unauthenticated users or manual entry
  const submitEmail = async (
    email: string, 
    briefId: string, 
    userId?: string
  ): Promise<{success: boolean, error?: string}> => {
    try {
      // Validate email format
      if (!isValidEmail(email)) {
        const errorMsg = 'Please enter a valid email address';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Check if email already exists for this brief
      const { data: existingEmails, error: checkError } = await supabase
        .from('emails')
        .select('id')
        .eq('email', email)
        .eq('brief_id', briefId);

      if (checkError) {
        throw new Error(checkError.message);
      }

      if (existingEmails && existingEmails.length > 0) {
        const errorMsg = 'You\'re already subscribed to updates for this brief';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Submit the email
      const result = await emailMutation.mutateAsync({
        email,
        brief_id: briefId,
        source: 'popup', // Default source, can be customized
        user_id: userId,
        mailchimp_status: 'pending'
      });

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to submit email';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Submit for authenticated users (uses their account email)
  const submitAuthenticatedUser = async (
    briefId: string
  ): Promise<{success: boolean, error?: string}> => {
    try {
      if (!user?.email) {
        const errorMsg = 'User email not found';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Check if user already subscribed to this brief
      const { data: existingEmails, error: checkError } = await supabase
        .from('emails')
        .select('id')
        .eq('email', user.email)
        .eq('brief_id', briefId);

      if (checkError) {
        throw new Error(checkError.message);
      }

      if (existingEmails && existingEmails.length > 0) {
        const errorMsg = 'You\'re already subscribed to updates for this brief';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Submit with user's authenticated email
      const result = await emailMutation.mutateAsync({
        email: user.email,
        brief_id: briefId,
        source: 'popup', // Default source, can be customized
        user_id: user.id,
        mailchimp_status: 'pending'
      });

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
