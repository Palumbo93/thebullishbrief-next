import { LegalDocument } from './types';

export const disclaimerDocument: LegalDocument = {
  slug: 'disclaimer',
  title: 'Disclaimer',
  effectiveDate: '2025-01-01',
  sections: [
    {
      id: 'no-financial-advice',
      title: 'No Financial Advice',
      body: 'The information provided by Bullish Brief does not constitute financial advice.'
    },
    {
      id: 'accuracy',
      title: 'Accuracy of Information',
      body: 'While we strive for accuracy, we do not guarantee that the information is always up to date or correct.'
    }
  ]
};
