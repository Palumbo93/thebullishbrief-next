"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Eye, 
  Bookmark, 
  MessageSquare, 
  Activity, 
  Calendar, 
  Clock, 
  Mail, 
  Shield, 
  ShieldOff,
  Edit,
  Trash2,
  Info,
  TrendingUp,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { ComprehensiveUserInfo } from '../../services/adminUserService';
import { secureAdminService } from '../../services/secureAdminService';
import { useToastContext } from '../../contexts/ToastContext';
import { useViewportHeightOnly } from '../../hooks/useViewportHeight';
import { FULL_HEIGHT_BACKDROP_CSS, FULL_HEIGHT_DRAWER_CSS } from '../../utils/viewportUtils';

interface UserManagerPortalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  getUserInfo: (userId: string) => Promise<ComprehensiveUserInfo>;
  onUpdateUser: (id: string, userData: any) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const UserManagerPortal: React.FC<UserManagerPortalProps> = ({
  isOpen,
  onClose,
  userId,
  getUserInfo,
  onUpdateUser,
  onDeleteUser,
  refreshUsers
}) => {
  const [userInfo, setUserInfo] = useState<ComprehensiveUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToastContext();
  const viewportHeight = useViewportHeightOnly();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Load user info when portal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadUserInfo();
    }
  }, [isOpen, userId]);

  const loadUserInfo = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const info = await getUserInfo(userId);
      setUserInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  // Admin role management
  const handleGrantAdmin = async () => {
    if (!userInfo) return;
    try {
      await secureAdminService.grantAdminRole(
        userInfo.id, 
        `Admin role granted to ${userInfo.email} via user portal`
      );
      showToast('Admin privileges granted successfully', 'success');
      await loadUserInfo();
      await refreshUsers();
    } catch (error) {
      console.error('Error granting admin role:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to grant admin privileges',
        'error'
      );
    }
  };

  const handleRevokeAdmin = async () => {
    if (!userInfo) return;
    try {
      await secureAdminService.revokeAdminRole(
        userInfo.id, 
        `Admin role revoked from ${userInfo.email} via user portal`
      );
      showToast('Admin privileges revoked successfully', 'success');
      await loadUserInfo();
      await refreshUsers();
    } catch (error) {
      console.error('Error revoking admin role:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to revoke admin privileges',
        'error'
      );
    }
  };

  const handleDeleteUser = async () => {
    if (!userInfo) return;
    try {
      await onDeleteUser(userInfo.id);
      showToast('User deleted successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Failed to delete user', 'error');
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
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }> = ({ icon, title, value, subtitle, color = 'var(--color-brand-primary)' }) => (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '0.5px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        background: `${color}15`,
        color: color,
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-1)'
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text-primary)'
        }}>
          {value}
        </div>
        {subtitle && (
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)'
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .user-portal-backdrop {
          ${FULL_HEIGHT_BACKDROP_CSS}
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: stretch;
          justify-content: stretch;
          padding: 0;
        }
        .user-portal-container {
          background: var(--color-bg-primary);
          border: none;
          border-radius: 0;
          width: 100vw;
          height: 100vh;
          max-width: none;
          max-height: none;
          position: relative;
          overflow: hidden;
          box-shadow: none;
          display: flex;
          flex-direction: column;
        }
        
        /* Mobile styles */
        @media (max-width: 767px) {
          .user-portal-backdrop {
            padding: 0;
            align-items: stretch;
            justify-content: stretch;
            overflow: hidden;
          }
          .user-portal-container {
            ${FULL_HEIGHT_DRAWER_CSS}
            width: 100vw;
            max-width: none;
            max-height: none;
            border-radius: 0;
            border: none;
            box-shadow: none;
            flex-direction: column;
            overflow: hidden;
          }
          .user-portal-content {
            overflow-y: auto;
            overflow-x: hidden;
          }
        }
      `}</style>

      <div 
        className="user-portal-backdrop"
        style={{
          // Use JavaScript-calculated height as fallback for Safari
          height: `${viewportHeight}px`
        }}
      >
        <div className="user-portal-container">
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-6)',
            borderBottom: '0.5px solid var(--color-border-primary)',
            background: 'var(--color-bg-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <button
                onClick={onClose}
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
                  transition: 'background var(--transition-base), color var(--transition-base)'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                aria-label="Close"
              >
                <ArrowLeft style={{ width: '24px', height: '24px' }} />
              </button>
              
              <div style={{
                width: '48px',
                height: '48px',
                background: 'var(--color-brand-primary)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-bold)'
              }}>
                {userInfo?.email.split('@')[0].split('.').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
              </div>
              <div>
                <h2 style={{
                  fontSize: 'var(--text-2xl)',
                  fontFamily: 'var(--font-editorial)',
                  fontWeight: 'var(--font-normal)',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  lineHeight: 'var(--leading-tight)',
                  letterSpacing: '-0.02em'
                }}>
                  {userInfo?.username || 'Loading...'}
                </h2>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  margin: 0
                }}>
                  {userInfo?.email}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {userInfo && (
                <>
                  {userInfo.is_admin ? (
                    <button
                      onClick={handleRevokeAdmin}
                      className="btn btn-error"
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      <ShieldOff style={{ width: '16px', height: '16px' }} />
                      <span className="hidden mobile-only:hidden sm:inline">Revoke Admin</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleGrantAdmin}
                      className="btn btn-success"
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      <Shield style={{ width: '16px', height: '16px' }} />
                      <span className="hidden mobile-only:hidden sm:inline">Grant Admin</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="btn btn-secondary"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    <Edit style={{ width: '16px', height: '16px' }} />
                    <span className="hidden mobile-only:hidden sm:inline">Edit</span>
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn btn-error"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                    <span className="hidden mobile-only:hidden sm:inline">Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div 
            className="user-portal-content"
            style={{
              flex: 1,
              overflow: 'auto',
              padding: 'var(--space-6)'
            }}
          >
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--color-border-primary)',
                  borderTop: '3px solid var(--color-brand-primary)',
                  borderRadius: 'var(--radius-full)',
                  margin: '0 auto var(--space-4)'
                }} className="animate-spin"></div>
                <p style={{ color: 'var(--color-text-tertiary)' }}>Loading user information...</p>
              </div>
            </div>
          ) : error ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <AlertTriangle style={{
                  width: '48px',
                  height: '48px',
                  color: 'var(--color-error)',
                  margin: '0 auto var(--space-4)'
                }} />
                <p style={{ color: 'var(--color-error)' }}>{error}</p>
                <button
                  onClick={loadUserInfo}
                  className="btn btn-primary"
                  style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-4)' }}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : userInfo ? (
            <div style={{
              display: 'grid',
              gap: 'var(--space-6)'
            }}>
              {/* User Status & Basic Info */}
              <div>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-4)'
                }}>
                  Account Overview
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 'var(--space-4)'
                }}>
                  <div style={{
                    background: 'var(--color-bg-card)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)'
                  }}>
                    <h4 style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      Account Status
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {userInfo.is_admin ? (
                          <Shield style={{ width: '16px', height: '16px', color: 'var(--color-error)' }} />
                        ) : (
                          <User style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
                        )}
                        <span style={{ fontSize: 'var(--text-sm)' }}>
                          {userInfo.is_admin ? 'Administrator' : 'Standard User'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {userInfo.email_verified ? (
                          <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--color-success)' }} />
                        ) : (
                          <XCircle style={{ width: '16px', height: '16px', color: 'var(--color-error)' }} />
                        )}
                        <span style={{ fontSize: 'var(--text-sm)' }}>
                          Email {userInfo.email_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Mail style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
                        <span style={{ fontSize: 'var(--text-sm)' }}>
                          Newsletter: {userInfo.newsletter_subscribed ? 'Subscribed' : 'Not subscribed'}
                        </span>
                      </div>
                      
                      {userInfo.subscription_tier && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--color-brand-primary)' }} />
                          <span style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
                            {userInfo.subscription_tier} Tier
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--color-bg-card)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)'
                  }}>
                    <h4 style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      Account Dates
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <div>
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-tertiary)',
                          marginBottom: 'var(--space-1)'
                        }}>
                          Joined
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)' }}>
                          {formatDate(userInfo.created_at)}
                        </div>
                      </div>
                      
                      {userInfo.updated_at && (
                        <div>
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-tertiary)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Last Updated
                          </div>
                          <div style={{ fontSize: 'var(--text-sm)' }}>
                            {formatDate(userInfo.updated_at)}
                          </div>
                        </div>
                      )}
                      
                      {userInfo.activity_stats.last_activity_at && (
                        <div>
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-tertiary)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Last Activity
                          </div>
                          <div style={{ fontSize: 'var(--text-sm)' }}>
                            {formatRelativeTime(userInfo.activity_stats.last_activity_at)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Statistics */}
              <div>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-4)'
                }}>
                  Activity Statistics
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-4)'
                }}>
                  <StatCard
                    icon={<FileText style={{ width: '20px', height: '20px' }} />}
                    title="Article Views"
                    value={userInfo.activity_stats.article_views}
                    color="var(--color-brand-primary)"
                  />
                  
                  <StatCard
                    icon={<Eye style={{ width: '20px', height: '20px' }} />}
                    title="Brief Views"
                    value={userInfo.activity_stats.brief_views}
                    color="var(--color-success)"
                  />
                  
                  <StatCard
                    icon={<Bookmark style={{ width: '20px', height: '20px' }} />}
                    title="Bookmarks"
                    value={userInfo.activity_stats.bookmarks}
                    color="var(--color-warning)"
                  />
                  
                  <StatCard
                    icon={<MessageSquare style={{ width: '20px', height: '20px' }} />}
                    title="Bull Room Messages"
                    value={userInfo.activity_stats.bull_room_messages}
                    color="var(--color-purple-500)"
                  />
                  
                  <StatCard
                    icon={<Activity style={{ width: '20px', height: '20px' }} />}
                    title="Reactions"
                    value={userInfo.activity_stats.bull_room_reactions}
                    color="var(--color-pink-500)"
                  />
                  
                  <StatCard
                    icon={<Clock style={{ width: '20px', height: '20px' }} />}
                    title="Reading Time"
                    value={`${userInfo.activity_stats.total_reading_time_minutes} min`}
                    color="var(--color-blue-500)"
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--space-6)'
              }}>
                {/* Recent Article Views */}
                {userInfo.recent_article_views.length > 0 && (
                  <div>
                    <h4 style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      Recent Article Views
                    </h4>
                    <div style={{
                      background: 'var(--color-bg-card)',
                      border: '0.5px solid var(--color-border-primary)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden'
                    }}>
                      {userInfo.recent_article_views.map((view, index) => (
                        <div
                          key={index}
                          style={{
                            padding: 'var(--space-3)',
                            borderBottom: index < userInfo.recent_article_views.length - 1 
                              ? '0.5px solid var(--color-border-primary)' 
                              : 'none'
                          }}
                        >
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
                            color: 'var(--color-text-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)'
                          }}>
                            <span>{formatRelativeTime(view.viewed_at)}</span>
                            {view.reading_time_seconds && (
                              <span>• {Math.round(view.reading_time_seconds / 60)} min read</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Brief Views */}
                {userInfo.recent_brief_views.length > 0 && (
                  <div>
                    <h4 style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      Recent Brief Views
                    </h4>
                    <div style={{
                      background: 'var(--color-bg-card)',
                      border: '0.5px solid var(--color-border-primary)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden'
                    }}>
                      {userInfo.recent_brief_views.map((view, index) => (
                        <div
                          key={index}
                          style={{
                            padding: 'var(--space-3)',
                            borderBottom: index < userInfo.recent_brief_views.length - 1 
                              ? '0.5px solid var(--color-border-primary)' 
                              : 'none'
                          }}
                        >
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--color-text-primary)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            {view.brief_title}
                          </div>
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-tertiary)'
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
                    <h4 style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      Recent Bull Room Activity
                    </h4>
                    <div style={{
                      background: 'var(--color-bg-card)',
                      border: '0.5px solid var(--color-border-primary)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden'
                    }}>
                      {userInfo.recent_bull_room_activity.map((activity, index) => (
                        <div
                          key={index}
                          style={{
                            padding: 'var(--space-3)',
                            borderBottom: index < userInfo.recent_bull_room_activity.length - 1 
                              ? '0.5px solid var(--color-border-primary)' 
                              : 'none'
                          }}
                        >
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--color-text-primary)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            {activity.room_name}
                          </div>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-secondary)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            {activity.type === 'message' 
                              ? activity.message_content.length > 60 
                                ? `${activity.message_content.substring(0, 60)}...`
                                : activity.message_content
                              : 'Reacted to message'
                            }
                          </div>
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-tertiary)'
                          }}>
                            {formatRelativeTime(activity.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Restrictions (if any) */}
              {userInfo.restrictions.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-error)',
                    marginBottom: 'var(--space-4)'
                  }}>
                    Active Restrictions
                  </h3>
                  <div style={{
                    background: 'var(--color-error-bg)',
                    border: '0.5px solid var(--color-error)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden'
                  }}>
                    {userInfo.restrictions.map((restriction, index) => (
                      <div
                        key={restriction.id}
                        style={{
                          padding: 'var(--space-4)',
                          borderBottom: index < userInfo.restrictions.length - 1 
                            ? '0.5px solid var(--color-error-border)' 
                            : 'none'
                        }}
                      >
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--color-error)',
                          marginBottom: 'var(--space-1)'
                        }}>
                          {restriction.restriction_type}
                        </div>
                        {restriction.reason && (
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-error-text)',
                            marginBottom: 'var(--space-2)'
                          }}>
                            {restriction.reason}
                          </div>
                        )}
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-error-text)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)'
                        }}>
                          <span>Restricted by: {restriction.restricted_by_email}</span>
                          <span>•</span>
                          <span>{formatDate(restriction.created_at)}</span>
                          {restriction.expires_at && (
                            <>
                              <span>•</span>
                              <span>Expires: {formatDate(restriction.expires_at)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)'
        }}>
          <div style={{
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-error)',
              marginBottom: 'var(--space-3)'
            }}>
              Delete User Account
            </h3>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)'
            }}>
              Are you sure you want to delete <strong>{userInfo?.email}</strong>? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="btn btn-error"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
