"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, User, Search, X, Copy } from 'lucide-react';
import { useAuthors } from '../../hooks/useDatabase';
import { ManagerHeader } from './ManagerHeader';
import { SearchBar } from './SearchBar';
import { DataTable, Column } from './DataTable';
import { EditModal, FormField } from './EditModal';
import { DeleteModal } from './DeleteModal';
import { CreateModal } from './CreateModal';
import { Author } from '../../services/database';
import { STORAGE_BUCKETS } from '../../lib/storage';
import { AuthorAvatarImage } from '../ui/OptimizedImage';

interface AuthorManagerProps {}

export const AuthorManager: React.FC<AuthorManagerProps> = () => {
  const { data: authors, loading, create, update, delete: deleteAuthor } = useAuthors();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter authors based on search
  const filteredAuthors = useMemo(() => {
    if (!searchQuery.trim()) return authors;
    
    const query = searchQuery.toLowerCase();
    return authors.filter(author =>
      author.name.toLowerCase().includes(query) ||
      author.email?.toLowerCase().includes(query) ||
      author.bio?.toLowerCase().includes(query) ||
      author.slug.toLowerCase().includes(query) ||
      author.twitter_handle?.toLowerCase().includes(query) ||
      author.linkedin_url?.toLowerCase().includes(query)
    );
  }, [authors, searchQuery]);

  const handleCreateAuthor = async (authorData: Partial<Author>) => {
    try {
      await create(authorData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating author:', error);
    }
  };

  const handleUpdateAuthor = async (id: string, authorData: Partial<Author>) => {
    try {
      await update(id, authorData);
      setShowEditModal(false);
      setSelectedAuthor(null);
    } catch (error) {
      console.error('Error updating author:', error);
    }
  };

  const handleDeleteAuthor = async (id: string) => {
    try {
      await deleteAuthor(id);
      setShowDeleteModal(false);
      setSelectedAuthor(null);
    } catch (error) {
      console.error('Error deleting author:', error);
    }
  };

  const handleDuplicateAuthor = async (author: Author) => {
    try {
      await create({
        name: `${author.name} (Copy)`,
        slug: `${author.slug}-copy`,
        email: author.email,
        bio: author.bio,
        avatar_url: author.avatar_url,
        linkedin_url: author.linkedin_url,
        twitter_handle: author.twitter_handle,
        website_url: author.website_url,
      featured: false
      });
      setShowEditModal(false);
      setSelectedAuthor(null);
    } catch (error) {
      console.error('Error duplicating author:', error);
    }
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
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter author name' },
    { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'Auto-generated from name' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'Enter author email' },
    { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Enter author bio', rows: 4 },
    { key: 'featured', label: 'Featured', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
    { key: 'linkedin_url', label: 'LinkedIn URL', type: 'text', placeholder: 'Enter LinkedIn URL' },
    { key: 'twitter_handle', label: 'Twitter Handle', type: 'text', placeholder: 'Enter Twitter handle' },
    { key: 'website_url', label: 'Website URL', type: 'text', placeholder: 'Enter website URL' }
  ];

  const createFields: FormField[] = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter author name' },
    { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'Auto-generated from name' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'Enter author email' },
    { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Enter author bio', rows: 4 },
    { key: 'featured', label: 'Featured', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }], defaultValue: 'false' },
    { key: 'linkedin_url', label: 'LinkedIn URL', type: 'text', placeholder: 'Enter LinkedIn URL' },
    { key: 'twitter_handle', label: 'Twitter Handle', type: 'text', placeholder: 'Enter Twitter handle' },
    { key: 'website_url', label: 'Website URL', type: 'text', placeholder: 'Enter website URL' }
  ];

  // Define table columns
  const columns: Column<Author>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '25%',
      render: (author) => (
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
                {author.avatar_url ? (
                  <AuthorAvatarImage
                    src={author.avatar_url}
                    alt={author.name}
                    size="sm"
                  />
                ) : (
              author.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  )}
                </div>
          <span>{author.name}</span>
        </div>
      )
    },
    {
      key: 'slug',
      header: 'Slug',
      width: '20%',
      render: (author) => (
        <code style={{
          background: 'var(--color-bg-tertiary)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          fontFamily: 'monospace',
          color: 'var(--color-text-secondary)'
        }}>
          {author.slug}
        </code>
      )
    },
    {
      key: 'email',
      header: 'Email',
      width: '20%',
      render: (author) => author.email || '-'
    },
    {
      key: 'featured',
      header: 'Featured',
      width: '10%',
      render: (author) => (
        <span style={{
          padding: 'var(--space-1) var(--space-2)',
          background: author.featured ? 'var(--color-success-bg)' : 'var(--color-bg-tertiary)',
          color: author.featured ? 'var(--color-success)' : 'var(--color-text-tertiary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-medium)'
        }}>
          {author.featured ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'article_count',
      header: 'Articles',
      width: '10%',
      render: (author) => (
        <span style={{
                    color: 'var(--color-text-secondary)', 
          fontSize: 'var(--text-sm)'
        }}>
          {author.article_count || 0}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      width: '15%',
      render: (author) => formatDate(author.created_at)
    }
  ];

  return (
    <div>
      {/* Header */}
      <ManagerHeader
        title="Authors"
        itemCount={filteredAuthors.length}
        totalCount={authors.length}
        hasActiveFilters={Boolean(searchQuery)}
        createButtonText="Create Author"
        onCreateClick={() => setShowCreateModal(true)}
      />

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search authors..."
      />

      {/* Authors Table */}
      <DataTable
        data={filteredAuthors}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: <User style={{
            width: '48px',
            height: '48px',
            color: 'var(--color-text-muted)'
          }} />,
          title: authors.length === 0 ? 'No authors yet' : 'No authors found',
          description: authors.length === 0 
            ? 'Create your first author to start writing content.'
            : 'Try adjusting your search criteria.',
          actionButton: authors.length === 0 ? (
                <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{ fontSize: 'var(--text-sm)' }}
            >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>Create Author</span>
          </button>
          ) : undefined
        }}
        onRowClick={(author) => {
          setSelectedAuthor(author);
          setShowEditModal(true);
        }}
        getItemKey={(author) => author.id}
      />

      {/* Modals */}
      {React.createElement(EditModal<Author>, {
        isOpen: showEditModal,
        onClose: () => {
          setShowEditModal(false);
          setSelectedAuthor(null);
        },
        title: "Edit Author",
        subtitle: selectedAuthor?.name,
        item: selectedAuthor,
        fields: editFields,
        onSave: handleUpdateAuthor,
        onDelete: handleDeleteAuthor,
        onDuplicate: handleDuplicateAuthor,
        getItemId: (author: Author) => author.id,
        imageUpload: {
          fieldKey: 'avatar_url',
          bucket: STORAGE_BUCKETS.AUTHOR_AVATARS,
          placeholder: 'Upload Author Avatar'
        }
      })}

      {React.createElement(CreateModal<Author>, {
        isOpen: showCreateModal,
        onClose: () => setShowCreateModal(false),
        title: "Create Author",
        fields: createFields,
        onCreate: handleCreateAuthor,
        imageUpload: {
          fieldKey: 'avatar_url',
          bucket: STORAGE_BUCKETS.AUTHOR_AVATARS,
          placeholder: 'Upload Author Avatar'
        }
      })}

      {React.createElement(DeleteModal<Author>, {
        isOpen: showDeleteModal,
        onClose: () => {
          setShowDeleteModal(false);
          setSelectedAuthor(null);
        },
        title: "Delete Author",
        message: "Are you sure you want to delete \"{name}\"?",
        item: selectedAuthor,
        onDelete: handleDeleteAuthor,
        getItemId: (author: Author) => author.id,
        getItemName: (author: Author) => author.name
      })}
    </div>
  );
};