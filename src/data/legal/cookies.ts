import { LegalDocument } from './types';

export const cookiesDocument: LegalDocument = {
  slug: 'cookies',
  title: 'Cookies Policy',
  effectiveDate: '2025-01-01',
  sections: [
    {
      id: 'what-are-cookies',
      title: 'What Are Cookies?',
      body: 'Cookies are small text files that are placed on your device to help the website provide a better user experience.'
    },
    {
      id: 'how-we-use-cookies',
      title: 'How We Use Cookies',
      body: 'We use cookies for authentication, analytics, and improving your browsing experience.'
    },

    {
      id: 'managing-cookies',
      title: 'Managing Cookies',
      body: 'You can disable cookies through your browser settings, though this may affect site functionality.'
    }
  ]
};
