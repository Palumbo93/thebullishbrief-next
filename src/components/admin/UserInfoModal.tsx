/**
 * User Info Modal
 * 
 * Displays comprehensive user information for admins including
 * profile details, activity stats, restrictions, and recent activity.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Eye, 
  Bookmark, 
  MessageSquare, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Activity,
  Mail,
  Shield,
  Settings
} from 'lucide-react';
import { ComprehensiveUserInfo } from '../../services/adminUserService';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  getUserInfo: (userId: string) => Promise<ComprehensiveUserInfo>;
}

export const UserInfoModal: React.FC<UserInfoModalProps> = ({
  isOpen,
  onClose,
  userId,
  getUserInfo
}) => {
  const [userInfo, setUserInfo] = useState<ComprehensiveUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'restrictions'>('profile');

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserInfo();
    }
  }, [isOpen, userId]);

  const fetchUserInfo = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const info = await getUserInfo(userId);
      setUserInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user info');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-4)'
    }}>
      <div style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <User style={{
              width: '24px',
              height: '24px',
              color: 'var(--color-brand-primary)'
            }} />
            <div>
              <h2 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                margin: 0
              }}>
                User Information
              </h2>
              {userInfo && (
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  margin: 0
                }}>
                  {userInfo.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto'
        }}>
          {loading && (
            <div style={{
              padding: 'var(--space-8)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)'
            }}>
              Loading user information...
            </div>
          )}

          {error && (
            <div style={{
              padding: 'var(--space-6)',
              textAlign: 'center',
              color: 'var(--color-error)'
            }}>
              {error}
            </div>
          )}

          {userInfo && (
            <>
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)'
              }}>
                {[
                  { key: 'profile', label: 'Profile', icon: User },
                  { key: 'activity', label: 'Activity', icon: Activity },
                  { key: 'restrictions', label: 'Restrictions', icon: Shield }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 'var(--space-4)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      color: activeTab === tab.key ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                      borderBottom: activeTab === tab.key ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)'
                    }}
                  >
                    <tab.icon style={{ width: '16px', height: '16px' }} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ padding: 'var(--space-6)' }}>
                {activeTab === 'profile' && (
                  <div style={{
                    display: 'grid',
                    gap: 'var(--space-6)'
                  }}>
                    {/* Basic Info */}
                    <div>
                      <h3 style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-4)'
                      }}>
                        Basic Information
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 'var(--space-4)'
                      }}>
                        <div>
                          <label style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--color-text-secondary)',
                            display: 'block',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Username
                          </label>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)'
                          }}>
                            {userInfo.username}
                          </div>
                        </div>
                        <div>
                          <label style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--color-text-secondary)',
                            display: 'block',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Email
                          </label>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)'
                          }}>
                            <Mail style={{ width: '16px', height: '16px' }} />
                            {userInfo.email}
                            {userInfo.email_verified && (
                              <span style={{
                                background: 'var(--color-success)',
                                color: 'white',
                                fontSize: 'var(--text-xs)',
                                padding: '2px 6px',
                                borderRadius: 'var(--radius-sm)'
                              }}>
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <label style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--color-text-secondary)',
                            display: 'block',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Subscription Tier
                          </label>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)'
                          }}>
                            <span style={{
                              background: userInfo.subscription_tier === 'premium' ? 'var(--color-warning)' : 
                                         userInfo.subscription_tier === 'pro' ? 'var(--color-brand-primary)' :
                                         'var(--color-text-muted)',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--text-xs)',
                              textTransform: 'uppercase'
                            }}>
                              {userInfo.subscription_tier || 'free'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--color-text-secondary)',
                            display: 'block',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Admin Status
                          </label>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)'
                          }}>
                            <Shield style={{ 
                              width: '16px', 
                              height: '16px',
                              color: userInfo.is_admin ? 'var(--color-error)' : 'var(--color-text-muted)'
                            }} />
                            {userInfo.is_admin ? 'Admin' : 'User'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activity Overview */}
                    <div>
                      <h3 style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-4)'
                      }}>
                        Activity Overview
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 'var(--space-4)'
                      }}>
                        {[
                          { label: 'Article Views', value: userInfo.activity_stats.article_views, icon: Eye },
                          { label: 'Brief Views', value: userInfo.activity_stats.brief_views, icon: Eye },
                          { label: 'Bookmarks', value: userInfo.activity_stats.bookmarks, icon: Bookmark },
                          { label: 'Messages', value: userInfo.activity_stats.bull_room_messages, icon: MessageSquare },
                          { label: 'Reading Time', value: `${userInfo.activity_stats.total_reading_time_minutes}m`, icon: Clock }
                        ].map((stat, index) => (
                          <div
                            key={index}
                            style={{
                              background: 'var(--color-bg-secondary)',
                              padding: 'var(--space-4)',
                              borderRadius: 'var(--radius-md)',
                              textAlign: 'center'
                            }}
                          >
                            <stat.icon style={{
                              width: '24px',
                              height: '24px',
                              color: 'var(--color-brand-primary)',
                              margin: '0 auto var(--space-2)'
                            }} />
                            <div style={{
                              fontSize: 'var(--text-lg)',
                              fontWeight: 'var(--font-bold)',
                              color: 'var(--color-text-primary)',
                              marginBottom: 'var(--space-1)'
                            }}>
                              {stat.value}
                            </div>
                            <div style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--color-text-secondary)'
                            }}>
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Account Details */}
                    <div>
                      <h3 style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-4)'
                      }}>
                        Account Details
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 'var(--space-4)'
                      }}>
                        <div>
                          <label style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--color-text-secondary)',
                            display: 'block',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Created
                          </label>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)'
                          }}>
                            <Calendar style={{ width: '16px', height: '16px' }} />
                            {formatDate(userInfo.created_at)}
                          </div>
                        </div>
                        <div>
                          <label style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--color-text-secondary)',
                            display: 'block',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Last Activity
                          </label>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)'
                          }}>
                            <Clock style={{ width: '16px', height: '16px' }} />
                            {userInfo.activity_stats.last_activity_at 
                              ? formatRelativeTime(userInfo.activity_stats.last_activity_at)
                              : 'Never'}
                          </div>
                        </div>
                        <div>
                          <label style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--color-text-secondary)',
                            display: 'block',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Newsletter
                          </label>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)'
                          }}>
                            {userInfo.newsletter_subscribed ? '✅ Subscribed' : '❌ Not Subscribed'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div style={{
                    display: 'grid',
                    gap: 'var(--space-6)'
                  }}>
                    {/* Recent Article Views */}
                    {userInfo.recent_article_views.length > 0 && (
                      <div>
                        <h3 style={{
                          fontSize: 'var(--text-lg)',
                          fontWeight: 'var(--font-semibold)',
                          color: 'var(--color-text-primary)',
                          marginBottom: 'var(--space-4)'
                        }}>
                          Recent Article Views
                        </h3>
                        <div style={{
                          background: 'var(--color-bg-secondary)',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden'
                        }}>
                          {userInfo.recent_article_views.map((view, index) => (
                            <div
                              key={index}
                              style={{
                                padding: 'var(--space-4)',
                                borderBottom: index < userInfo.recent_article_views.length - 1 
                                  ? '1px solid var(--color-border)' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: 'var(--font-medium)',
                                  color: 'var(--color-text-primary)',
                                  marginBottom: 'var(--space-1)'
                                }}>
                                  {view.article_title}
                                </div>
                                <div style={{
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--color-text-secondary)'
                                }}>
                                  {view.reading_time_seconds 
                                    ? `Read for ${Math.round(view.reading_time_seconds / 60)} minutes`
                                    : 'Reading time not tracked'}
                                </div>
                              </div>
                              <div style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-text-secondary)'
                              }}>
                                {formatRelativeTime(view.viewed_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Brief Views */}
                    {userInfo.recent_brief_views.length > 0 && (
                      <div>
                        <h3 style={{
                          fontSize: 'var(--text-lg)',
                          fontWeight: 'var(--font-semibold)',
                          color: 'var(--color-text-primary)',
                          marginBottom: 'var(--space-4)'
                        }}>
                          Recent Brief Views
                        </h3>
                        <div style={{
                          background: 'var(--color-bg-secondary)',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden'
                        }}>
                          {userInfo.recent_brief_views.map((view, index) => (
                            <div
                              key={index}
                              style={{
                                padding: 'var(--space-4)',
                                borderBottom: index < userInfo.recent_brief_views.length - 1 
                                  ? '1px solid var(--color-border)' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-medium)',
                                color: 'var(--color-text-primary)'
                              }}>
                                {view.brief_title}
                              </div>
                              <div style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-text-secondary)'
                              }}>
                                {formatRelativeTime(view.viewed_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Bull Room Activity */}
                    {userInfo.recent_bull_room_activity.length > 0 && (
                      <div>
                        <h3 style={{
                          fontSize: 'var(--text-lg)',
                          fontWeight: 'var(--font-semibold)',
                          color: 'var(--color-text-primary)',
                          marginBottom: 'var(--space-4)'
                        }}>
                          Recent Bull Room Activity
                        </h3>
                        <div style={{
                          background: 'var(--color-bg-secondary)',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden'
                        }}>
                          {userInfo.recent_bull_room_activity.map((activity, index) => (
                            <div
                              key={index}
                              style={{
                                padding: 'var(--space-4)',
                                borderBottom: index < userInfo.recent_bull_room_activity.length - 1 
                                  ? '1px solid var(--color-border)' : 'none'
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: 'var(--space-2)'
                              }}>
                                <div style={{
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: 'var(--font-medium)',
                                  color: 'var(--color-text-primary)'
                                }}>
                                  {activity.room_name}
                                </div>
                                <div style={{
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--color-text-secondary)'
                                }}>
                                  {formatRelativeTime(activity.created_at)}
                                </div>
                              </div>
                              <div style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-text-secondary)',
                                fontStyle: activity.type === 'reaction' ? 'italic' : 'normal'
                              }}>
                                {activity.message_content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'restrictions' && (
                  <div>
                    <h3 style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-4)'
                    }}>
                      User Restrictions
                    </h3>
                    {userInfo.restrictions.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-8)',
                        color: 'var(--color-text-secondary)'
                      }}>
                        <Shield style={{
                          width: '48px',
                          height: '48px',
                          color: 'var(--color-success)',
                          margin: '0 auto var(--space-4)'
                        }} />
                        <div>No restrictions applied</div>
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          marginTop: 'var(--space-2)'
                        }}>
                          This user has no active restrictions.
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        background: 'var(--color-bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden'
                      }}>
                        {userInfo.restrictions.map((restriction, index) => (
                          <div
                            key={restriction.id}
                            style={{
                              padding: 'var(--space-4)',
                              borderBottom: index < userInfo.restrictions.length - 1 
                                ? '1px solid var(--color-border)' : 'none',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 'var(--space-3)'
                            }}
                          >
                            <AlertTriangle style={{
                              width: '20px',
                              height: '20px',
                              color: 'var(--color-warning)',
                              marginTop: 'var(--space-1)'
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-medium)',
                                color: 'var(--color-text-primary)',
                                marginBottom: 'var(--space-1)'
                              }}>
                                {restriction.restriction_type.charAt(0).toUpperCase() + restriction.restriction_type.slice(1)}
                              </div>
                              {restriction.reason && (
                                <div style={{
                                  fontSize: 'var(--text-sm)',
                                  color: 'var(--color-text-secondary)',
                                  marginBottom: 'var(--space-2)'
                                }}>
                                  {restriction.reason}
                                </div>
                              )}
                              <div style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-text-secondary)'
                              }}>
                                Applied by {restriction.restricted_by_email} on {formatDate(restriction.created_at)}
                                {restriction.expires_at && (
                                  <> • Expires {formatDate(restriction.expires_at)}</>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
