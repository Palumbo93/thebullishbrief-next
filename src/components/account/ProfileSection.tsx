import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import { FormField } from '../ui';
import { SectionHeader } from '../SectionHeader';
import { useToast } from '../../hooks/useToast';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  newsletter_subscribed: boolean;
  created_at: string;
  updated_at: string;
}

interface FormButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}



const FormButton: React.FC<FormButtonProps> = ({ 
  onClick, 
  disabled = false, 
  loading = false, 
  variant = 'secondary',
  children 
}) => {
  const isPrimary = variant === 'primary';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: isPrimary ? 'white' : 'transparent',
        border: isPrimary ? 'none' : '0.5px solid var(--color-border-primary)',
        color: isPrimary ? 'black' : 'var(--color-text-primary)',
        padding: 'var(--space-2) var(--space-4)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--transition-base)',
        minWidth: '80px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)'
      }}
      onMouseEnter={e => {
        if (!disabled && !isPrimary) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !isPrimary) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {loading ? (
        <div style={{
          width: '12px',
          height: '12px',
          border: '1px solid currentColor',
          borderTop: '1px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      ) : null}
      {children}
    </button>
  );
};

export const ProfileSection: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Panel states
  const [activePanel, setActivePanel] = useState<'profile' | 'email' | 'username'>('profile');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data);
          setNewEmail(user.email || '');
          setNewUsername(data.username || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleEmailUpdate = async () => {
    if (!user || !newEmail.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);
      setEmailError('');

      // Update email in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        email: newEmail.trim()
      });

      if (authError) throw authError;

      // Update email in user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ email: newEmail.trim() })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update local state
      setProfile(prev => prev ? { ...prev, email: newEmail.trim() } : null);

      toast.success('Email update initiated. Please check your new email for verification.');
      setActivePanel('profile');
    } catch (error: any) {
      console.error('Error updating email:', error);
      setEmailError(error.message || 'Failed to update email');
    } finally {
      setSaving(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!user || !newUsername.trim()) return;

    // Basic username validation
    if (newUsername.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(newUsername.trim())) {
      setUsernameError('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    try {
      setSaving(true);
      setUsernameError('');

      // Check username uniqueness
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', newUsername.trim())
        .neq('id', user.id)
        .single();

      if (existingUser) {
        setUsernameError('Username is already taken');
        return;
      }

      // Update username in user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, username: newUsername.trim() } : null);
      toast.success('Username updated successfully');
      setActivePanel('profile');
    } catch (error: any) {
      console.error('Error updating username:', error);
      setUsernameError(error.message || 'Failed to update username');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{
        padding: 'var(--space-8)',
        color: 'var(--color-text-secondary)',
        textAlign: 'center'
      }}>
        Profile not found
      </div>
    );
  }

  // Email Editor Panel
  if (activePanel === 'email') {
    return (
      <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <SectionHeader 
            title="Change Email"
            showBackButton={true}
            onBackClick={() => setActivePanel('profile')}
          />

          {/* Email Form */}
          <div style={{
            padding: '0 var(--space-4)'
          }}>
            <FormField
              type="email"
              label="New Email Address"
              value={newEmail}
              onChange={setNewEmail}
              error={emailError}
              required
            />
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-4)'
            }}>
              <FormButton
                onClick={handleEmailUpdate}
                disabled={saving || !newEmail.trim()}
                loading={saving}
                variant="primary"
              >
                Save
              </FormButton>
              <FormButton
                onClick={() => {
                  setActivePanel('profile');
                  setNewEmail(user?.email || '');
                  setEmailError('');
                }}
                disabled={saving}
                variant="secondary"
              >
                Cancel
              </FormButton>
            </div>
          </div>
        </div>
    );
  }

  // Username Editor Panel
  if (activePanel === 'username') {
    return (
      <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <SectionHeader 
            title="Change Username"
            showBackButton={true}
            onBackClick={() => setActivePanel('profile')}
          />

          {/* Username Form */}
          <div style={{
            padding: '0 var(--space-4)'
          }}>
            <FormField
              type="text"
              label="New Username"
              value={newUsername}
              onChange={setNewUsername}
              error={usernameError}
              required
            />
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-4)'
            }}>
              <FormButton
                onClick={handleUsernameUpdate}
                disabled={saving || !newUsername.trim()}
                loading={saving}
                variant="primary"
              >
                Save
              </FormButton>
              <FormButton
                onClick={() => {
                  setActivePanel('profile');
                  setNewUsername(profile.username);
                  setUsernameError('');
                }}
                disabled={saving}
                variant="secondary"
              >
                Cancel
              </FormButton>
            </div>
          </div>
        </div>
    );
  }

  // Main Profile Panel
  const profileItems = [
    {
      id: 'email',
      label: 'Email',
      value: user?.email || '',
      onClick: () => setActivePanel('email')
    },
    {
      id: 'username',
      label: 'Username',
      value: profile.username,
      onClick: () => setActivePanel('username')
    },
    {
      id: 'member-since',
      label: 'Member since',
      value: formatDate(profile.created_at),
      onClick: null // Read-only
    },
    {
      id: 'last-updated',
      label: 'Last updated',
      value: formatDate(profile.updated_at),
      onClick: null // Read-only
    }
  ];

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        <SectionHeader title="Account Information" />

        {/* Profile Items List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          {profileItems.map((item, index) => (
            <div key={item.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4) 0',
                  cursor: item.onClick ? 'pointer' : 'default',
                  transition: 'background var(--transition-base)'
                }}
                onClick={item.onClick || undefined}
                onMouseEnter={(e) => {
                  if (item.onClick) {
                    e.currentTarget.style.background = 'var(--color-bg-card)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.onClick) {
                    e.currentTarget.style.background = 'transparent';
                  }
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
                {item.onClick && (
                  <div style={{
                    color: 'var(--color-text-tertiary)',
                    opacity: 0.7,
                    padding: '0 var(--space-4)'
                  }}>
                    <ArrowRight style={{ width: '16px', height: '16px' }} />
                  </div>
                )}
              </div>
              {/* Divider - only show if not the last item */}
              {index < profileItems.length - 1 && (
                <div style={{
                  height: '1px',
                  background: 'var(--color-border-primary)'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
  );
}; 