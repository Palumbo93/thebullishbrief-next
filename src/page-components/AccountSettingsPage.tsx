"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileSection } from '../components/account/ProfileSection';
import { PreferencesSection } from '../components/account/PreferencesSection';
import { NotificationPreferencesSection } from '../components/account/NotificationPreferencesSection';
import { DataSection } from '../components/account/DataSection';

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

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const handleBack = () => {
    router.back();
  };

  const sections = [
    { id: 'profile', label: 'Your account', description: 'Manage your profile information' },
    { id: 'onboarding', label: 'Preferences', description: 'View and edit your preferences' },
    { id: 'notifications', label: 'Notifications', description: 'Manage notification settings' },
    { id: 'data', label: 'Data Management', description: 'Delete account and manage your data' }
  ];

  const filteredSections = sections;

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
    <>
      <style>{`
        .account-settings-container {
          min-height: 100vh;
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          font-family: var(--font-primary);
          display: flex;
        }

        .account-settings-header {
          display: block;
        }

        .account-settings-sidebar {
          width: 400px;
          border-right: 0.5px solid var(--color-border-primary);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          background: var(--color-bg-primary);
          z-index: 10;
        }

        .account-settings-content {
          flex: 1;
          overflow-y: auto;
        }

        .account-settings-content-inner {
          max-width: 100%;
        }

        /* Mobile Layout */
        @media (max-width: 768px) {
          .account-settings-container {
            flex-direction: column;
          }

          .account-settings-header {
            display: none;
          }
          
          .account-settings-sidebar {
            width: 100%;
            height: auto;
            position: sticky;
            top: 56px; /* Below mobile header */
            left: 0; /* Reset left position on mobile */
            border-right: none;
            background: var(--color-bg-primary);
            z-index: 10;
          }
          
          .account-settings-content {
            height: auto;
            margin-left: 0; /* Reset margin on mobile */
          }
          
          .sidebar-navigation {
            display: flex;
            overflow-x: auto;
            padding: var(--space-4) !important;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* Internet Explorer 10+ */
          }
          
          .sidebar-navigation::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
          }
          
          .sidebar-navigation > div {
            display: flex !important;
            flex-direction: row !important;
            gap: var(--space-2) !important;
            min-width: max-content;
          }
          
          .section-button {
            min-width: max-content !important;
            white-space: nowrap !important;
          }
          
          .section-button-content {
            display: flex !important;
            align-items: center !important;
            gap: var(--space-2) !important;
          }
          
          .section-description {
            display: none !important;
          }
          
          .section-arrow {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="account-settings-container">
        {/* Left Sidebar */}
        <div className="account-settings-sidebar">
        {/* Header */}
        <div 
        className="account-settings-header"
        style={{
          padding: 'var(--space-4)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}>
            <button 
              onClick={handleBack}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-lg)',
                transition: 'background var(--transition-base), color var(--transition-base)',
                marginRight: 'var(--space-3)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              aria-label="Back"
            >
              <ArrowLeft style={{ width: '24px', height: '24px' }} />
            </button>
            <h1 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-bold)',
              margin: 0,
              color: 'var(--color-text-primary)',
            }}>
              Settings
            </h1>
          </div>
          

        </div>

        {/* Navigation */}
        <div className="sidebar-navigation" style={{
          flex: 1,
          padding: '0px var(--space-4)',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)'
          }}>
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="section-button"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4)',
                  background: activeSection === section.id 
                    ? 'var(--color-bg-tertiary)' 
                    : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: activeSection === section.id 
                    ? 'var(--color-text-primary)' 
                    : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== section.id) {
                    e.currentTarget.style.background = 'var(--color-bg-card)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                <div className="section-button-content" style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: activeSection === section.id 
                      ? 'var(--font-semibold)' 
                      : 'var(--font-medium)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    {section.label}
                  </div>
                  <div className="section-description" style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-tertiary)',
                    lineHeight: 1.4
                  }}>
                    {section.description}
                  </div>
                </div>
                <div className="section-arrow" style={{
                  width: '16px',
                  height: '16px',
                  color: 'var(--color-text-tertiary)',
                  opacity: activeSection === section.id ? 1 : 0.5
                }}>
                  →
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="account-settings-content">
        <div className="account-settings-content-inner">
          {getSectionContent()}
        </div>
      </div>
    </div>
    </>
  );
};

export default AccountSettingsPage;