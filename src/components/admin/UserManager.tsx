"use client";

import React, { useState, useMemo } from 'react';
import { Plus,  Users } from 'lucide-react';
import { useUsers } from '../../hooks/useDatabase';
import { ManagerHeader } from './ManagerHeader';
import { SearchBar } from './SearchBar';
import { DataTable, Column } from './DataTable';
import { EditModal, FormField } from './EditModal';
import { DeleteModal } from './DeleteModal';
import { CreateModal } from './CreateModal';
import { User } from '../../services/database';

interface UserManagerProps {}

export const UserManager: React.FC<UserManagerProps> = () => {
  const { data: users, loading, create, update, delete: deleteUser } = useUsers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
      await create(userData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    try {
      await update(id, userData);
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

  const handleDuplicateUser = async (user: User) => {
    try {
      await create({
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
  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '25%',
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
            {user.email.split('@')[0].split('.').map(n => n[0]).join('').toUpperCase()}
          </div>
          <span>{user.email.split('@')[0]}</span>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      width: '25%',
      render: (user) => user.email
    },
    {
      key: 'username',
      header: 'Username',
      width: '15%',
      render: (user) => user.username
    },
    {
      key: 'status',
      header: 'Status',
      width: '15%',
      render: (user) => (
        <span style={{
          padding: 'var(--space-1) var(--space-2)',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          color: getStatusColor(user),
          fontWeight: 'var(--font-medium)'
        }}>
          {user.is_admin ? 'Admin' : 'User'}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      width: '20%',
      render: (user) => formatDate(user.created_at)
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
    </div>
  );
};