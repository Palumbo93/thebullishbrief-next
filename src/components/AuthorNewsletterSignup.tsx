"use client";

import React, { useState } from 'react';
import { Check, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmailSubmission } from '../hooks/useEmailSubmission';
import { submitToMailchimp } from '../services/mailchimp';
import { Author } from '../lib/database.aliases';
import { FormField } from './ui/FormField';
import { Button } from './ui/Button';
import { useIsMobile } from '../hooks/useIsMobile';

interface AuthorNewsletterSignupProps {
  author: Author;
  onEmailSubmitted?: (email: string, isAuthenticated: boolean) => void;
}

type SignupState = 'form' | 'thank-you';

/**
 * AuthorNewsletterSignup - Newsletter signup widget for author pages
 * 
 * Features:
 * - Shows only if author has audience_tag configured
 * - Email collection for unauthenticated users
 * - One-click signup for authenticated users
 * - Direct Mailchimp integration
 */
export const AuthorNewsletterSignup: React.FC<AuthorNewsletterSignupProps> = ({
  author,
  onEmailSubmitted
}) => {
  const { user } = useAuth();
  const { submitEmail, submitAuthenticatedUser, isSubmitting, error } = useEmailSubmission();
  const isMobile = useIsMobile();
  const [currentState, setCurrentState] = useState<SignupState>('form');
  const [emailInput, setEmailInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Don't render if no audience tag is configured
  if (!author.audience_tag) {
    return null;
  }

  // Handle email submission for unauthenticated users
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!emailInput.trim()) {
      setSubmitError('Please enter your email address');
      return;
    }

    // Submit to our internal system first
    const result = await submitEmail(emailInput, author.id, isMobile ? 'mobile_author' : 'desktop_author', true);
    
    if (result.success) {
      // Submit directly to Mailchimp
      try {
        await submitToMailchimp({
          email: emailInput,
          audienceTag: author.audience_tag || undefined
        });
      } catch (mailchimpError) {
        // Silent fail for Mailchimp - don't interrupt user experience
        console.warn('Mailchimp submission failed:', mailchimpError);
      }
      
      setCurrentState('thank-you');
      onEmailSubmitted?.(emailInput, false);
    } else {
      setSubmitError(result.error || 'Failed to submit email');
    }
  };

  // Handle one-click signup for authenticated users
  const handleAuthenticatedSignup = async () => {
    setSubmitError(null);

    // Submit to our internal system first
    const result = await submitAuthenticatedUser(author.id, isMobile ? 'mobile_author' : 'desktop_author', true);
    
    if (result.success) {
      // Submit directly to Mailchimp
      if (user?.email) {
        try {
          await submitToMailchimp({
            email: user.email,
            audienceTag: author.audience_tag || undefined
          });
        } catch (mailchimpError) {
          // Silent fail for Mailchimp - don't interrupt user experience
          console.warn('Mailchimp submission failed:', mailchimpError);
        }
      }
      
      setCurrentState('thank-you');
      onEmailSubmitted?.(user?.email || '', true);
    } else {
      setSubmitError(result.error || 'Failed to subscribe');
    }
  };

  // Thank you state
  if (currentState === 'thank-you') {
    return (
      <div style={{
        borderTop: '0.5px solid var(--color-border-primary)',
        paddingTop: 'var(--space-8)',
        paddingBottom: 'var(--space-8)',
      maxWidth: '400px',
      margin: '0 auto'
      }}>
        <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
        >
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'var(--color-success)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-3)',
          color: 'white'
        }}>
          <Check size={20} />
        </div>

        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-2)'
        }}>
          {user ? "You're all signed up!" : "Thank you for subscribing!"}
        </h3>
        
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.4,
          margin: 0
        }}>
          {user 
            ? `You'll receive updates from ${author.name} at your registered email.`
            : `You'll receive updates from ${author.name} directly in your inbox.`
          }
        </p>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div style={{
        borderTop: '0.5px solid var(--color-border-primary)',
        paddingTop: 'var(--space-8)',
        paddingBottom: 'var(--space-8)',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-4)'
      }}>
        <div>
          <h3 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-regular)',
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 1.2
          }}>
            Get Updates from {author.name}
          </h3>
        </div>
      </div>

      {user ? (
        // Authenticated user: one-click signup
        <>
          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '0.5px solid var(--color-border-primary)',
            marginBottom: 'var(--space-3)',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-1)'
            }}>
              One-click signup for:
            </p>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              fontWeight: 'var(--font-medium)',
              margin: 0
            }}>
              {user.email}
            </p>
          </div>

          {(submitError || error) && (
            <p style={{
              color: 'var(--color-danger)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-3)',
              textAlign: 'center',
              padding: 'var(--space-2)',
              backgroundColor: 'rgba(var(--color-danger-rgb), 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '0.5px solid rgba(var(--color-danger-rgb), 0.2)'
            }}>
              {submitError || error}
            </p>
          )}

          <Button
            onClick={handleAuthenticatedSignup}
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size="base"
            fullWidth={true}
          >
            Subscribe to Updates
          </Button>
        </>
      ) : (
        // Unauthenticated user: email form
        <form onSubmit={handleEmailSubmit}>
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <FormField
              type="email"
              label="Email Address"
              value={emailInput}
              onChange={setEmailInput}
              required
              disabled={isSubmitting}
              error={submitError || error || undefined}
              placeholder="Enter your email address"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size="base"
            fullWidth={true}
          >
            Subscribe to Updates
          </Button>
        </form>
      )}
    </div>
  );
};

export default AuthorNewsletterSignup;
