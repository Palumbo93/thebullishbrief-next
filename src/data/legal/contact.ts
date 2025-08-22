import { LegalDocument } from './types';

export const contactDocument: LegalDocument = {
  slug: 'contact',
  title: 'Contact Us',
  sections: [
    {
      id: 'contact-info',
      title: 'Get in Touch',
      body: `
        <p>We'd love to hear from you! For any questions, feedback, or support requests, please reach out to us at:</p>
        <br />
        <p><strong>Email:</strong> <a href="mailto:info@bullishbrief.com" style="color: var(--color-accent-primary); text-decoration: none;">info@bullishbrief.com</a></p>
        <br />
        <p>We typically respond to all inquiries within 48 hours during business days.</p>
        <br />
        <p><strong>Follow us on social media:</strong></p>
        <p>
          <a href="https://x.com/thebullishbrief" target="_blank" rel="noopener noreferrer" style="color: var(--color-accent-primary); text-decoration: none; margin-right: var(--space-4);">X (Twitter)</a>
          <a href="https://www.linkedin.com/company/the-bullish-brief/about/" target="_blank" rel="noopener noreferrer" style="color: var(--color-accent-primary); text-decoration: none;">LinkedIn</a>
        </p>
      `
    }
  ]
};
