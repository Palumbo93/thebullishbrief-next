"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Users, Eye, Activity, MessageSquare, Clock, Info, Shield, ShieldOff } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { ManagerHeader } from './ManagerHeader';
import { SearchBar } from './SearchBar';
import { DataTable, Column } from './DataTable';
import { EditModal, FormField } from './EditModal';
import { DeleteModal } from './DeleteModal';
import { CreateModal } from './CreateModal';
import { UserInfoModal } from './UserInfoModal';
import { User } from '../../services/database';
import { secureAdminService } from '../../services/secureAdminService';
import { useToastContext } from '../../contexts/ToastContext';

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
  const { showToast } = useToastContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
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
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleViewUserInfo = (user: any) => {
    setSelectedUserId(user.id);
    setShowUserInfoModal(true);
  };

  // Secure admin role management functions
  const handleGrantAdmin = async (user: any) => {
    try {
      await secureAdminService.grantAdminRole(
        user.id, 
        `Admin role granted to ${user.email} via admin panel`
      );
      showToast('Admin privileges granted successfully', 'success');
      await refreshUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error granting admin role:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to grant admin privileges',
        'error'
      );
    }
  };

  const handleRevokeAdmin = async (user: any) => {
    try {
      await secureAdminService.revokeAdminRole(
        user.id, 
        `Admin role revoked from ${user.email} via admin panel`
      );
      showToast('Admin privileges revoked successfully', 'success');
      await refreshUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error revoking admin role:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to revoke admin privileges',
        'error'
      );
    }
  };

  const handleDuplicateUser = async (user: any) => {
    try {
      await createUser({
        email: `${user.email.split('@')[0]}_copy@${user.email.split('@')[1]}`,
        username: `${user.username}_copy`,
        is_admin: user.is_admin,
        newsletter_subscribed: user.newsletter_subscribed,
        subscription_tier: user.subscription_tier
      });
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error duplicating user:', error);
    }
  };

  const getRoleColor = (role: string | null | undefined) => {
    if (!role) {
      return 'var(--color-text-tertiary)';
    }
    
    switch (role.toLowerCase()) {
      case 'admin':
        return 'var(--color-error)';
      case 'editor':
        return 'var(--color-warning)';
      case 'author':
        return 'var(--color-success)';
      case 'user':
        return 'var(--color-brand-primary)';
      default:
        return 'var(--color-text-tertiary)';
    }
  };

  const getStatusColor = (user: User) => {
    if (user.is_admin) {
      return 'var(--color-success)';
    }
    return 'var(--color-text-muted)';
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

  // Define form fields for modals
  const editFields: FormField[] = [
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

  // Define table columns
  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'User',
      width: '20%',
      render: (user) => (
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
          <div>
            <div style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {user.username}
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)'
            }}>
              {user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '12%',
      render: (user) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <span style={{
            padding: 'var(--space-1) var(--space-2)',
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            color: getStatusColor(user),
            fontWeight: 'var(--font-medium)',
            textAlign: 'center'
          }}>
            {user.is_admin ? 'Admin' : 'User'}
          </span>
          {user.subscription_tier && user.subscription_tier !== 'free' && (
            <span style={{
              padding: 'var(--space-1) var(--space-2)',
              background: user.subscription_tier === 'premium' ? 'var(--color-warning)' : 'var(--color-brand-primary)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              textAlign: 'center',
              textTransform: 'capitalize'
            }}>
              {user.subscription_tier}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'activity',
      header: 'Activity',
      width: '18%',
      render: (user) => (
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
      )
    },
    {
      key: 'created_at',
      header: 'Joined',
      width: '15%',
      render: (user) => (
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
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '15%',
      render: (user) => (
        <div style={{
          display: 'flex',
          gap: 'var(--space-1)'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewUserInfo(user);
            }}
            style={{
              background: 'var(--color-brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="View detailed user information"
          >
            <Info style={{ width: '14px', height: '14px' }} />
          </button>
          
          {/* Secure Admin Role Management */}
          {user.is_admin ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRevokeAdmin(user);
              }}
              style={{
                background: 'var(--color-red-500)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Revoke admin privileges (secure server-side)"
            >
              <ShieldOff style={{ width: '14px', height: '14px' }} />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGrantAdmin(user);
              }}
              style={{
                background: 'var(--color-green-500)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Grant admin privileges (secure server-side)"
            >
              <Shield style={{ width: '14px', height: '14px' }} />
            </button>
          )}
        </div>
      )
    }
  ];

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
      <DataTable
        data={filteredUsers}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: <Users style={{
            width: '48px',
            height: '48px',
            color: 'var(--color-text-muted)'
          }} />,
          title: users.length === 0 ? 'No users yet' : 'No users found',
          description: users.length === 0 
            ? 'Create your first user to get started.'
            : 'Try adjusting your search criteria.',
          actionButton: users.length === 0 ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              <span>Create User</span>
            </button>
          ) : undefined
        }}
        onRowClick={(user) => {
          setSelectedUser(user);
          setShowEditModal(true);
        }}
        getItemKey={(user) => user.id}
      />

      {/* Modals */}
      {React.createElement(EditModal<User>, {
        isOpen: showEditModal,
        onClose: () => {
          setShowEditModal(false);
          setSelectedUser(null);
        },
        title: "Edit User",
        subtitle: selectedUser?.email,
        item: selectedUser,
        fields: editFields,
        onSave: handleUpdateUser,
        onDelete: handleDeleteUser,
        onDuplicate: handleDuplicateUser,
        getItemId: (user: User) => user.id
      })}

      {React.createElement(CreateModal<User>, {
        isOpen: showCreateModal,
        onClose: () => setShowCreateModal(false),
        title: "Create User",
        fields: createFields,
        onCreate: handleCreateUser
      })}

      {React.createElement(DeleteModal<User>, {
        isOpen: showDeleteModal,
        onClose: () => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        },
        title: "Delete User",
        message: "Are you sure you want to delete \"{name}\"?",
        item: selectedUser,
        onDelete: handleDeleteUser,
        getItemId: (user: User) => user.id,
        getItemName: (user: User) => user.email
      })}

      {/* User Info Modal */}
      <UserInfoModal
        isOpen={showUserInfoModal}
        onClose={() => {
          setShowUserInfoModal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        getUserInfo={getUserInfo}
      />
    </div>
  );
};