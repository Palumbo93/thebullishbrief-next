"use client";

import React from 'react';
import { BriefPage } from './BriefPage';

interface BriefPageClientProps {
  briefSlug: string;
}

export const BriefPageClient: React.FC<BriefPageClientProps> = ({ briefSlug }) => {
  return <BriefPage briefSlug={briefSlug} />;
};
