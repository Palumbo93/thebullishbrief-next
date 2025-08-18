"use client";

import React from 'react';
import { BriefPage } from './BriefPage';
import { useAuthModal } from '../contexts/AuthModalContext';

interface BriefPageClientProps {
  briefSlug: string;
}

export const BriefPageClient: React.FC<BriefPageClientProps> = ({ briefSlug }) => {
  const { handleSignUpClick } = useAuthModal();
  
  return <BriefPage briefSlug={briefSlug} onCreateAccountClick={handleSignUpClick} />;
};
