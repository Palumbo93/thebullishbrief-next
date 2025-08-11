import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { OnboardingModal } from '../OnboardingModal';
import { formatPreferenceValue } from '../../utils/preferenceMapping';

interface UserPreferences {
  investorType?: string;
  experience?: string;
  riskTolerance?: string;
  interests?: string[];
  country?: string;
}

interface PreferencesItem {
  id: string;
  label: string;
  value: string;
  description?: string;
}

export const PreferencesSection: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.preferences) {
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const getPreferencesItems = (): PreferencesItem[] => {
    if (!preferences) return [];

    return [
      {
        id: 'investor-type',
        label: 'Investor Type',
        value: formatPreferenceValue('investorType', preferences.investorType)
      },
      {
        id: 'experience',
        label: 'Experience Level',
        value: formatPreferenceValue('experience', preferences.experience)
      },
      {
        id: 'risk-tolerance',
        label: 'Risk Tolerance',
        value: formatPreferenceValue('riskTolerance', preferences.riskTolerance)
      },
      {
        id: 'interests',
        label: 'Investment Interests',
        value: formatPreferenceValue('interests', preferences.interests)
      },
      {
        id: 'country',
        label: 'Country',
        value: formatPreferenceValue('country', preferences.country)
      }
    ];
  };

  const handleEditPreferences = () => {
    setShowOnboardingModal(true);
  };

  const handleOnboardingComplete = async (newPreferences: UserPreferences) => {
    if (!user) return;

    try {
      // Update preferences in database
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          preferences: { 
            ...newPreferences,
            onboardingCompleted: true 
          } 
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setPreferences(newPreferences);
      setShowOnboardingModal(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handleOnboardingModalComplete = () => {
    // Reload preferences after modal completes
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.preferences) {
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
    setShowOnboardingModal(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-8)',
        color: 'var(--color-text-secondary)'
      }}>
        Loading preferences...
      </div>
    );
  }

  const preferencesItems = getPreferencesItems();

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        <SectionHeader title="Preferences" />

        {/* Edit Button */}
        <div style={{
          padding: '0 var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}>
          <button
            onClick={handleEditPreferences}
            style={{
              background: 'transparent',
              border: '0.5px solid var(--color-border-primary)',
              color: 'var(--color-text-primary)',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Edit Preferences
            <ArrowRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        {/* Preferences List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          {preferencesItems.map((item, index) => (
            <div key={item.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4) 0',
                  cursor: 'default'
                }}
              >
                <div style={{ flex: 1, padding: '0 var(--space-4)' }}>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-secondary)'
                  }}>
                    {item.value}
                  </div>
                </div>
              </div>
              {/* Divider - only show if not the last item */}
              {index < preferencesItems.length - 1 && (
                <div style={{
                  height: '1px',
                  background: 'var(--color-border-primary)'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {preferencesItems.length === 0 && (
          <div style={{
            padding: 'var(--space-8)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-4)'
            }}>
              No preferences set yet
            </p>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)'
            }}>
              Click "Edit Preferences" to set up your investment preferences
            </p>
          </div>
        )}
      </div>

      {/* Onboarding Modal */}
      {showOnboardingModal && (
        <OnboardingModal
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          onComplete={handleOnboardingModalComplete}
        />
      )}
    </>
  );
}; 