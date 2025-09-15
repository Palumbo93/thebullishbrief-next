"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ProfileSection } from '../components/account/ProfileSection';
import { PreferencesSection } from '../components/account/PreferencesSection';
import { NotificationPreferencesSection } from '../components/account/NotificationPreferencesSection';
import { DataSection } from '../components/account/DataSection';
import { PublicationHeader } from '../components/PublicationHeader';
import { LegalFooter } from '../components/LegalFooter';

interface AccountSettingsPageProps {
  onCreateAccountClick?: () => void;
}

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({ 
  onCreateAccountClick 
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Listen for section changes from the AccountPageList
  useEffect(() => {
    const handleSectionChange = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };

    // Check URL hash on mount
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setActiveSection(hash);
      }
    }

    window.addEventListener('accountSectionChange', handleSectionChange as EventListener);
    return () => {
      window.removeEventListener('accountSectionChange', handleSectionChange as EventListener);
    };
  }, []);

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const sections = [
    { id: 'profile', name: 'Your account', slug: 'profile' },
    { id: 'onboarding', name: 'Preferences', slug: 'onboarding' },
    { id: 'notifications', name: 'Notifications', slug: 'notifications' },
    { id: 'data', name: 'Data Management', slug: 'data' }
  ];

  const accountSections = sections.map(section => ({
    ...section,
    active: section.slug === activeSection
  }));

  const getSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'onboarding':
        return <PreferencesSection />;
      case 'notifications':
        return <NotificationPreferencesSection />;
      case 'security':
        return (
          <div>
            <h2 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-bold)',
              marginBottom: 'var(--space-6)',
              color: 'var(--color-text-primary)'
            }}>
              Security Settings
            </h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-8)'
            }}>
              Coming soon...
            </p>
          </div>
        );
      case 'data':
        return <DataSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div>
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-primary)',
    }}>
      {/* Header with Account Navigation */}
      <PublicationHeader
        variant="full"
        listType="account"
        accountSections={accountSections}
        activeItem={activeSection}
        showTicker={false}
      />

      {/* Content Container */}
      <div style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-4)'
      }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: 'var(--text-4xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-8)',
          textAlign: 'center'
        }}>
          Account Settings
        </h1>

        {/* Section Content */}
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-primary)',
          padding: 'var(--space-6)',
          transition: 'all var(--transition-base)'
        }}>
          {getSectionContent()}
        </div>
      </div>
      </div>
      
      {/* Footer */}
      <LegalFooter />
    </div>
  );
};

export default AccountSettingsPage;