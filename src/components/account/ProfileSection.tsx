import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, Twitter } from 'lucide-react';
import { FormField } from '../ui';
import { ImageUpload } from '../ui/ImageUpload';
import { SectionHeader } from '../SectionHeader';
import { useToast } from '../../hooks/useToast';
import { useImageUpload } from '../../hooks/useImageUpload';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  bio: string | null;
  profile_image: string | null;
  twitter_handle: string | null;
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
  
  // Image upload hook
  const { uploadImage, isUploading: imageUploading, error: imageError } = useImageUpload({
    bucket: 'profile-images',
    onSuccess: (url) => {
      handleProfileImageUpdate(url);
    },
    onError: (error) => {
      toast.error(`Image upload failed: ${error}`);
    }
  });
  
  // Panel states
  const [activePanel, setActivePanel] = useState<'profile' | 'email' | 'username' | 'bio' | 'twitter'>('profile');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newTwitterHandle, setNewTwitterHandle] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [bioError, setBioError] = useState('');
  const [twitterError, setTwitterError] = useState('');

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
          setNewBio(data.bio || '');
          setNewTwitterHandle(data.twitter_handle || '');
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

      // Update username in Supabase Auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { username: newUsername.trim() }
      });
      if (authError) throw authError;

      // Refresh the session to get updated user metadata
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('Failed to refresh session after username update:', refreshError);
      }

      // Update username in user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user.id);

      if (profileError) throw profileError;

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

  const handleBioUpdate = async () => {
    if (!user) return;

    // Bio validation
    if (newBio.length > 500) {
      setBioError('Bio must be 500 characters or less');
      return;
    }

    try {
      setSaving(true);
      setBioError('');

      // Update bio in user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({ bio: newBio.trim() || null })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, bio: newBio.trim() || null } : null);
      toast.success('Bio updated successfully');
      setActivePanel('profile');
    } catch (error: any) {
      console.error('Error updating bio:', error);
      setBioError(error.message || 'Failed to update bio');
    } finally {
      setSaving(false);
    }
  };

  const handleTwitterHandleUpdate = async () => {
    if (!user) return;

    // Twitter handle validation
    const twitterHandle = newTwitterHandle.trim();
    if (twitterHandle && !/^@[a-zA-Z0-9_]{1,15}$/.test(twitterHandle)) {
      setTwitterError('Please enter a valid Twitter handle (e.g., @username)');
      return;
    }

    try {
      setSaving(true);
      setTwitterError('');

      // Update Twitter handle in user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({ twitter_handle: twitterHandle || null })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, twitter_handle: twitterHandle || null } : null);
      toast.success('Twitter handle updated successfully');
      setActivePanel('profile');
    } catch (error: any) {
      console.error('Error updating Twitter handle:', error);
      setTwitterError(error.message || 'Failed to update Twitter handle');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpdate = async (imageUrl: string) => {
    if (!user) return;

    try {
      // Update profile image in user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({ profile_image: imageUrl })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, profile_image: imageUrl } : null);
      toast.success('Profile image updated successfully');
    } catch (error: any) {
      console.error('Error updating profile image:', error);
      toast.error('Failed to update profile image');
    }
  };

  const handleImageUpload = async (file: File, optimizedUrl: string) => {
    await uploadImage(file);
  };

  const handleImageRemove = () => {
    if (!user) return;

    // Remove profile image from database
    supabase
      .from('user_profiles')
      .update({ profile_image: null })
      .eq('id', user.id)
      .then(({ error }) => {
        if (error) {
          console.error('Error removing profile image:', error);
          toast.error('Failed to remove profile image');
        } else {
          setProfile(prev => prev ? { ...prev, profile_image: null } : null);
          toast.success('Profile image removed');
        }
      });
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

  // Bio Editor Panel
  if (activePanel === 'bio') {
    return (
      <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <SectionHeader 
            title="Edit Bio"
            showBackButton={true}
            onBackClick={() => setActivePanel('profile')}
          />

          {/* Bio Form */}
          <div style={{
            padding: '0 var(--space-4)'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              width: '100%',
            }}>
              <label style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-1)'
              }}>
                Bio
              </label>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                maxLength={500}
                placeholder="Tell us about yourself..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: `1px solid ${bioError ? 'var(--color-error)' : 'var(--color-border-secondary)'}`,
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color var(--transition-base)',
                }}
              />
              {bioError && (
                <div style={{
                  color: 'var(--color-error)',
                  fontSize: 'var(--text-sm)',
                  marginTop: 'var(--space-1)'
                }}>
                  {bioError}
                </div>
              )}
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
              marginTop: 'var(--space-1)',
              textAlign: 'right'
            }}>
              {newBio.length}/500
            </div>
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-4)'
            }}>
              <FormButton
                onClick={handleBioUpdate}
                disabled={saving}
                loading={saving}
                variant="primary"
              >
                Save
              </FormButton>
              <FormButton
                onClick={() => {
                  setActivePanel('profile');
                  setNewBio(profile.bio || '');
                  setBioError('');
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

  // Twitter Handle Editor Panel
  if (activePanel === 'twitter') {
    return (
      <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <SectionHeader 
            title="Edit Twitter Handle"
            showBackButton={true}
            onBackClick={() => setActivePanel('profile')}
          />

          {/* Twitter Handle Form */}
          <div style={{
            padding: '0 var(--space-4)'
          }}>
            <FormField
              type="text"
              label="Twitter Handle"
              value={newTwitterHandle}
              onChange={setNewTwitterHandle}
              error={twitterError}
              placeholder="@username"
            />
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
              marginTop: 'var(--space-1)'
            }}>
              Enter your Twitter handle (e.g., @username)
            </div>
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-4)'
            }}>
              <FormButton
                onClick={handleTwitterHandleUpdate}
                disabled={saving}
                loading={saving}
                variant="primary"
              >
                Save
              </FormButton>
              <FormButton
                onClick={() => {
                  setActivePanel('profile');
                  setNewTwitterHandle(profile.twitter_handle || '');
                  setTwitterError('');
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
      id: 'profile-image',
      label: 'Profile Image',
      value: profile.profile_image ? 'Image uploaded' : 'No image',
      onClick: null, // Handled separately
      isImage: true
    },
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
      id: 'bio',
      label: 'Bio',
      value: profile.bio || 'No bio added',
      onClick: () => setActivePanel('bio')
    },
    {
      id: 'twitter',
      label: 'Twitter Handle',
      value: profile.twitter_handle || 'No Twitter handle',
      onClick: () => setActivePanel('twitter')
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
              {item.isImage ? (
                // Profile Image Section - centered layout
                <div style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  width: '100%'
                }}>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)',
                    textAlign: 'center'
                  }}>
                    {item.label}
                  </div>
                  <ImageUpload
                    currentImageUrl={profile.profile_image}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    disabled={imageUploading}
                    maxSize={2 * 1024 * 1024} // 2MB
                    maxWidth={400}
                    maxHeight={400}
                    quality={0.8}
                    size="medium"
                  />
                  {imageError && (
                    <div style={{
                      color: 'var(--color-error)',
                      fontSize: 'var(--text-sm)',
                      textAlign: 'center'
                    }}>
                      {imageError}
                    </div>
                  )}
                </div>
              ) : (
                // Regular Profile Item
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
                      marginBottom: 'var(--space-1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}>
                      {item.label}
                      {item.id === 'twitter' && profile.twitter_handle && (
                        <Twitter size={14} color="var(--color-primary)" />
                      )}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-secondary)',
                      wordBreak: 'break-word'
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
              )}
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