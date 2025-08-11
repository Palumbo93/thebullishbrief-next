import { LegalDocument } from './types';
import { termsDocument } from './terms';
import { privacyDocument } from './privacy';
import { cookiesDocument } from './cookies';
import { disclaimerDocument } from './disclaimer';

export const legalDocuments: Record<LegalDocument['slug'], LegalDocument> = {
  terms: termsDocument,
  privacy: privacyDocument,
  cookies: cookiesDocument,
  disclaimer: disclaimerDocument,
};

export const getLegalDocument = (slug: LegalDocument['slug']): LegalDocument => {
  return legalDocuments[slug];
};
