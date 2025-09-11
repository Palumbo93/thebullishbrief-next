export interface LegalSection {
  id: string;
  title: string;
  body: string; // plain text or simple HTML string
}

export interface LegalDocument {
  slug: 'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'contact' | 'about';
  title: string;
  effectiveDate?: string;
  updatedDate?: string;
  sections: LegalSection[];
}
