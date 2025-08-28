/**
 * Mailchimp integration service for lead generation
 * Handles email submissions to Mailchimp audience with brief-specific tags
 */

interface MailchimpSubmissionData {
  email: string;
  audienceTag?: string; // Brief-specific tag ID (e.g., "40174992" for Sonic Strategy)
}

interface MailchimpSubmissionResult {
  success: boolean;
  error?: string;
  mailchimpResponse?: any;
}

/**
 * Submit email to Mailchimp audience with optional brief-specific tag
 * Uses fetch API only to avoid popup windows
 */
export async function submitToMailchimp(
  data: MailchimpSubmissionData
): Promise<MailchimpSubmissionResult> {
  try {
    return await submitToMailchimpFetch(data);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit to Mailchimp'
    };
  }
}

/**
 * Submit to Mailchimp using fetch API
 */
async function submitToMailchimpFetch(
  data: MailchimpSubmissionData
): Promise<MailchimpSubmissionResult> {
  try {
    // Mailchimp form URL (same for all briefs)
    const MAILCHIMP_URL = 'https://bullishbrief.us14.list-manage.com/subscribe/post?u=a69d5b5fa1c66fd8c078d560f&id=9cd1fb4392&f_id=0072a9e0f0';

    // Prepare form data
    const formData = new FormData();
    formData.append('EMAIL', data.email);
    
    // Add brief-specific tag if provided
    if (data.audienceTag) {
      formData.append('tags', data.audienceTag);
    }

    // Add anti-bot field (must be empty)
    formData.append('b_a69d5b5fa1c66fd8c078d560f_9cd1fb4392', '');

    // Submit to Mailchimp
    const response = await fetch(MAILCHIMP_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors', // Mailchimp doesn't support CORS for form submissions
    });

    return {
      success: true,
      mailchimpResponse: 'Submitted successfully via fetch (no-cors mode - cannot verify actual success)'
    };

  } catch (error) {
    throw error;
  }
}



/**
 * Validate email format before submission
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get Mailchimp submission URL for manual form creation
 */
export function getMailchimpFormUrl(): string {
  return 'https://bullishbrief.us14.list-manage.com/subscribe/post?u=a69d5b5fa1c66fd8c078d560f&id=9cd1fb4392&f_id=0072a9e0f0';
}

/**
 * Create a hidden form element for Mailchimp submission
 * This can be used as an alternative to fetch API
 */
export function createMailchimpForm(email: string, audienceTag?: string): HTMLFormElement {
  const form = document.createElement('form');
  form.action = getMailchimpFormUrl();
  form.method = 'POST';
  form.target = '_blank';
  form.style.display = 'none';

  // Email field
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.name = 'EMAIL';
  emailInput.value = email;
  form.appendChild(emailInput);

  // Tag field (if provided)
  if (audienceTag) {
    const tagInput = document.createElement('input');
    tagInput.type = 'hidden';
    tagInput.name = 'tags';
    tagInput.value = audienceTag;
    form.appendChild(tagInput);
  }

  // Anti-bot field
  const botInput = document.createElement('input');
  botInput.type = 'text';
  botInput.name = 'b_a69d5b5fa1c66fd8c078d560f_9cd1fb4392';
  botInput.tabIndex = -1;
  botInput.value = '';
  botInput.style.position = 'absolute';
  botInput.style.left = '-5000px';
  form.appendChild(botInput);

  return form;
}
