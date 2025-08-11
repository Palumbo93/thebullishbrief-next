import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SectionHeader } from '../SectionHeader';

export const NotificationPreferencesSection: React.FC = () => {
  const { user } = useAuth();
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('newsletter_subscribed')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setNewsletterSubscribed(data.newsletter_subscribed || false);
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const handleNewsletterToggle = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const newValue = !newsletterSubscribed;

      const { error } = await supabase
        .from('user_profiles')
        .update({ newsletter_subscribed: newValue })
        .eq('id', user.id);

      if (error) throw error;

      setNewsletterSubscribed(newValue);
    } catch (error) {
      console.error('Error updating newsletter subscription:', error);
    } finally {
      setSaving(false);
    }
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
        Loading notification preferences...
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column'
    }}>
      <SectionHeader title="Notification Preferences" />

      {/* Newsletter Subscription Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-4) 0',
        cursor: 'default'
      }}>
        <div style={{ flex: 1, padding: '0 var(--space-4)' }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-1)'
          }}>
            Newsletter Subscribed
          </div>
          <div style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)'
          }}>
            {newsletterSubscribed ? 'Subscribed' : 'Not subscribed'}
          </div>
        </div>
        
        {/* Toggle Switch */}
        <div style={{
          padding: '0 var(--space-4)'
        }}>
          <button
            onClick={handleNewsletterToggle}
            disabled={saving}
            style={{
              position: 'relative',
              width: '48px',
              height: '24px',
              borderRadius: 'var(--radius-full)',
              background: newsletterSubscribed ? '#10b981' : 'var(--color-border-primary)',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-base)',
              opacity: saving ? 0.5 : 1
            }}
          >
            <div style={{
              position: 'absolute',
              top: '2px',
              left: newsletterSubscribed ? '26px' : '2px',
              width: '20px',
              height: '20px',
              borderRadius: 'var(--radius-full)',
              background: 'white',
              transition: 'left var(--transition-base)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
            }} />
          </button>
        </div>
      </div>
      
      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'var(--color-border-primary)'
      }} />
    </div>
  );
}; 