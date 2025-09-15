"use client";

import React from 'react';
import { LegalPageTemplate } from '../components/legal/LegalPageTemplate';
import type { LegalDocument } from '../data/legal/types';
import { PageSkeleton } from '@/components/PageSkeleton';

interface LegalPageProps {
  doc: LegalDocument;
}

export const LegalPage: React.FC<LegalPageProps> = ({ doc }) => {
  // Add null check for doc
  if (!doc || !doc.slug) {
    return <PageSkeleton />;
  }

  return <LegalPageTemplate doc={doc} />;
};

export default LegalPage;
