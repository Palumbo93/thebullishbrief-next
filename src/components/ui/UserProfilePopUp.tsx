import React, { useState, useEffect, useRef } from 'react';
import { X, Twitter, Calendar, User } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { supabase } from '../../lib/supabase';

interface UserProfilePopUpProps {
  userId: string;
  username: string;
  profile_image?: string | null;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

interface UserProfileData {
  id: string;
  username: string;
  bio: string | null;
  profile_image: string | null;
  twitter_handle: string | null;
  created_at: string;
}

export const UserProfilePopUp: React.FC<UserProfilePopUpProps> = ({
  userId,
  username,
  profile_image,
  isOpen,
  onClose,
  position
}) => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Fetch user profile data when popup opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_profile_public', { user_id: userId });

      if (error) throw error;
      setProfileData(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTwitterUrl = (handle: string) => {
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    return `https://twitter.com/${cleanHandle}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        top: position?.y || '50%',
        left: position?.x || '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        minWidth: '320px',
        maxWidth: '400px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--color-border-primary)',
        background: 'var(--color-bg-secondary)'
      }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          margin: 0
        }}>
          
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-1)',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            transition: 'all var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-tertiary)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-4)' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-8)'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid var(--color-border-primary)',
              borderTop: '2px solid var(--color-brand-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : profileData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Avatar and Username */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)'
            }}>
              <UserAvatar
                user={{
                  username: profileData.username,
                  profile_image: profileData.profile_image
                }}
                size="lg"
              />
              <div>
                <h4 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  marginBottom: 'var(--space-1)'
                }}>
                  {profileData.username}
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)'
                }}>
                  <Calendar size={14} />
                  <span>Joined {formatDate(profileData.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-primary)'
              }}>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--color-text-primary)',
                  margin: 0
                }}>
                  {profileData.bio}
                </p>
              </div>
            )}

            {/* Twitter Handle */}
            {profileData.twitter_handle && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <Twitter size={16} style={{ color: 'var(--color-text-muted)' }} />
                <a
                  href={getTwitterUrl(profileData.twitter_handle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-brand-primary)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-base)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {profileData.twitter_handle}
                </a>
              </div>
            )}

            {/* No Bio Message */}
            {!profileData.bio && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-primary)',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  margin: 0
                }}>
                  No bio available
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            color: 'var(--color-text-muted)'
          }}>
            <p>Failed to load profile</p>
          </div>
        )}
      </div>
    </div>
  );
};
