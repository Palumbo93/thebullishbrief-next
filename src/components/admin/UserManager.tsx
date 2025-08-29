"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Users, Eye, Activity, MessageSquare, Clock } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { ManagerHeader } from './ManagerHeader';
import { SearchBar } from './SearchBar';
import { FormField } from './EditModal';
import { CreateModal } from './CreateModal';
import { UserManagerPortal } from './UserManagerPortal';
import { User } from '../../services/database';

interface UserManagerProps {}

export const UserManager: React.FC<UserManagerProps> = () => {
  const { 
    users, 
    loading, 
    error,
    getUserInfo,
    updateUser, 
    deleteUser, 
    createUser,
    refreshUsers
  } = useAdminUsers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserPortal, setShowUserPortal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.email.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      (user.is_admin && 'admin'.includes(query)) ||
      (user.subscription_tier && user.subscription_tier.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      await createUser(userData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    try {
      await updateUser(id, userData);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUserId(user.id);
    setShowUserPortal(true);
  };





  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  // Define form fields for create modal
  const createFields: FormField[] = [
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter user email' },
    { key: 'username', label: 'Username', type: 'text', required: true, placeholder: 'Enter username' },
    { key: 'is_admin', label: 'Admin', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ] },
    { key: 'newsletter_subscribed', label: 'Newsletter', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ] },
    { key: 'subscription_tier', label: 'Subscription', type: 'select', options: [
      { value: 'free', label: 'Free' },
      { value: 'premium', label: 'Premium' },
      { value: 'pro', label: 'Pro' }
    ] }
  ];

  if (loading) {
    return (
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
          <p style={{ color: 'var(--color-text-tertiary)' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <ManagerHeader
        title="Users"
        itemCount={filteredUsers.length}
        totalCount={users.length}
        hasActiveFilters={Boolean(searchQuery)}
        createButtonText="Create User"
        onCreateClick={() => setShowCreateModal(true)}
      />

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search users..."
      />

      {/* Users Table */}
      <div style={{
        background: 'var(--color-bg-card)',
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden'
      }}>
        {filteredUsers.length === 0 ? (
          <div style={{
            padding: 'var(--space-8)',
            textAlign: 'center'
          }}>
            <Users style={{
              width: '48px',
              height: '48px',
              color: 'var(--color-text-muted)',
              margin: '0 auto var(--space-4)'
            }} />
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)'
            }}>
              {users.length === 0 ? 'No users yet' : 'No users found'}
            </h3>
            <p style={{
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--space-4)'
            }}>
              {users.length === 0 
                ? 'Create your first user to get started.'
                : 'Try adjusting your search criteria.'
              }
            </p>
            {users.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>Create User</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'var(--color-bg-secondary)',
                  borderBottom: '0.5px solid var(--color-border-primary)'
                }}>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)',
                    width: '40%'
                  }}>
                    User
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Activity
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '0.5px solid var(--color-border-primary)',
                      transition: 'all var(--transition-base)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    onClick={() => {
                      handleViewUser(user);
                    }}
                  >
                    <td style={{
                      padding: 'var(--space-4)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-brand-primary)',
                          color: 'var(--color-text-inverse)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-semibold)'
                        }}>
                          {user.email.split('@')[0].split('.').map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            <span style={{
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-medium)',
                              color: 'var(--color-text-primary)'
                            }}>
                              {user.username}
                            </span>
                            {user.is_admin && (
                              <span style={{
                                padding: 'var(--space-1) var(--space-2)',
                                background: 'var(--color-error)',
                                color: 'white',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 'var(--font-medium)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                Admin
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-secondary)'
                          }}>
                            {user.email}
                          </div>
                          {user.subscription_tier && user.subscription_tier !== 'free' && (
                            <div style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--color-text-tertiary)',
                              marginTop: 'var(--space-1)'
                            }}>
                              <span style={{
                                padding: 'var(--space-1) var(--space-2)',
                                background: user.subscription_tier === 'premium' ? 'var(--color-warning)' : 'var(--color-brand-primary)',
                                color: 'white',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 'var(--text-xs)',
                                textTransform: 'capitalize'
                              }}>
                                {user.subscription_tier}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: 'var(--space-4)'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--space-2)',
                        fontSize: 'var(--text-xs)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          <Eye style={{ width: '12px', height: '12px' }} />
                          {user.total_views}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          <MessageSquare style={{ width: '12px', height: '12px' }} />
                          {user.total_messages}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          <Activity style={{ width: '12px', height: '12px' }} />
                          {user.total_bookmarks}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          <Clock style={{ width: '12px', height: '12px' }} />
                          {user.last_activity_at ? formatRelativeTime(user.last_activity_at) : 'Never'}
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: 'var(--space-4)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-primary)'
                        }}>
                          {formatDate(user.created_at)}
                        </div>
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          {formatRelativeTime(user.created_at)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {React.createElement(CreateModal<User>, {
        isOpen: showCreateModal,
        onClose: () => setShowCreateModal(false),
        title: "Create User",
        fields: createFields,
        onCreate: handleCreateUser
      })}

      {/* User Manager Portal */}
      <UserManagerPortal
        isOpen={showUserPortal}
        onClose={() => {
          setShowUserPortal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        getUserInfo={getUserInfo}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        refreshUsers={refreshUsers}
      />
    </div>
  );
};