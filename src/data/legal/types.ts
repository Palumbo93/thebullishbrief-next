export interface LegalSection {
  id: string;
  title: string;
  body: string; // plain text or simple HTML string
}

export interface LegalDocument {
  slug: 'terms' | 'privacy' | 'disclaimer';
  title: string;
  effectiveDate?: string;
  updatedDate?: string;
  sections: LegalSection[];
}
