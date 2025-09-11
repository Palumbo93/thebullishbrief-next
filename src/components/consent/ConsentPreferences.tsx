/**
 * Cookie Preferences Link Component
 * Simple component for footer/settings to open consent modal
 */

'use client';

import React from 'react';
import { useConsent } from '../../contexts/ConsentContext';

interface ConsentPreferencesProps {
  className?: string;
  children?: React.ReactNode;
}

export const ConsentPreferences: React.FC<ConsentPreferencesProps> = ({ 
  className = '',
  children = 'Cookie Preferences'
}) => {
  const { showConsentModal } = useConsent();

  return (
    <button
      onClick={showConsentModal}
      className={`text-sm text-gray-600 hover:text-gray-900 transition-colors ${className}`}
    >
      {children}
    </button>
  );
};
