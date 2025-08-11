import { LegalDocument } from './types';

export const privacyDocument: LegalDocument = {
  slug: 'privacy',
  title: 'Privacy Policy',
  effectiveDate: '2025-01-01',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      body: 'This Privacy Policy explains how we collect, use, and protect your information.'
    },
    {
      id: 'data-collection',
      title: 'Data Collection',
      body: 'We collect information you provide directly and data collected automatically during your use of the service.'
    },
    {
      id: 'data-use',
      title: 'How We Use Data',
      body: 'We use your data to provide and improve our services, and for security and legal purposes.'
    }
  ]
};
