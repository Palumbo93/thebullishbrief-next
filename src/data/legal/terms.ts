import { LegalDocument } from './types';

export const termsDocument: LegalDocument = {
  slug: 'terms',
  title: 'Terms and Conditions',
  effectiveDate: '2025-01-01',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      body: 'Welcome to Bullish Brief. These Terms and Conditions govern your use of our website and services.'
    },
    {
      id: 'use-of-service',
      title: 'Use of Service',
      body: 'You agree to use the service in compliance with applicable laws and these terms.'
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      body: 'All content on the site is the property of Bullish Brief or its licensors and is protected by copyright laws.'
    }
  ]
};