"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Tag, Search, X, Copy } from 'lucide-react';
import { useTags } from '../../hooks/useDatabase';
import { ManagerHeader } from './ManagerHeader';
import { SearchBar } from './SearchBar';
import { DataTable, Column } from './DataTable';
import { EditModal, FormField } from './EditModal';
import { DeleteModal } from './DeleteModal';
import { CreateModal } from './CreateModal';
import { Tag as TagType } from '../../services/database';

interface TagManagerProps {}

export const TagManager: React.FC<TagManagerProps> = () => {
  const { data: tags, loading, create, update, delete: deleteTag } = useTags();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    
    const query = searchQuery.toLowerCase();
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(query) ||
      tag.slug.toLowerCase().includes(query)
    );
  }, [tags, searchQuery]);

  const handleCreateTag = async (tagData: Partial<TagType>) => {
    try {
      await create(tagData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleUpdateTag = async (id: string, tagData: Partial<TagType>) => {
    try {
      await update(id, tagData);
      setShowEditModal(false);
      setSelectedTag(null);
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await deleteTag(id);
      setShowDeleteModal(false);
      setSelectedTag(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleDuplicateTag = async (tag: TagType) => {
    try {
      await create({
        name: `${tag.name} (Copy)`,
        slug: `${tag.slug}-copy`
      });
      setShowEditModal(false);
      setSelectedTag(null);
    } catch (error) {
      console.error('Error duplicating tag:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Define table columns
  const columns: Column<TagType>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '50%'
    },
    {
      key: 'slug',
      header: 'Slug',
      width: '30%',
      render: (tag) => (
        <code style={{
          background: 'var(--color-bg-tertiary)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          fontFamily: 'monospace',
          color: 'var(--color-text-secondary)'
        }}>
          {tag.slug}
        </code>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      width: '20%',
      render: (tag) => formatDate(tag.created_at)
    }
  ];

  // Define form fields for modals
  const editFields: FormField[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Enter tag name'
    },
    {
      key: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      placeholder: 'Enter tag slug'
    }
  ];

  const createFields: FormField[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Enter tag name'
    },
    {
      key: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      placeholder: 'Enter tag slug'
    }
  ];

  return (
    <div>
      {/* Header */}
      <ManagerHeader
        title="Tags"
        itemCount={filteredTags.length}
        totalCount={tags.length}
        hasActiveFilters={Boolean(searchQuery)}
        createButtonText="Create Tag"
        onCreateClick={() => setShowCreateModal(true)}
      />

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search tags..."
      />

      {/* Tags Table */}
      <DataTable
        data={filteredTags}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: <Tag style={{
            width: '48px',
            height: '48px',
            color: 'var(--color-text-muted)'
          }} />,
          title: tags.length === 0 ? 'No tags yet' : 'No tags found',
          description: tags.length === 0 
            ? 'Create your first tag to organize content.'
            : 'Try adjusting your search criteria.',
          actionButton: tags.length === 0 ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              <span>Create Tag</span>
            </button>
          ) : undefined
        }}
        onRowClick={(tag) => {
          setSelectedTag(tag);
          setShowEditModal(true);
        }}
        getItemKey={(tag) => tag.id}
      />

      {/* Modals */}
      {React.createElement(EditModal<TagType>, {
        isOpen: showEditModal,
        onClose: () => {
          setShowEditModal(false);
          setSelectedTag(null);
        },
        title: "Edit Tag",
        subtitle: selectedTag?.name,
        item: selectedTag,
        fields: editFields,
        onSave: handleUpdateTag,
        onDelete: handleDeleteTag,
        onDuplicate: handleDuplicateTag,
        getItemId: (tag: TagType) => tag.id
      })}

      {React.createElement(CreateModal<TagType>, {
        isOpen: showCreateModal,
        onClose: () => setShowCreateModal(false),
        title: "Create Tag",
        fields: createFields,
        onCreate: handleCreateTag
      })}

      {React.createElement(DeleteModal<TagType>, {
        isOpen: showDeleteModal,
        onClose: () => {
          setShowDeleteModal(false);
          setSelectedTag(null);
        },
        title: "Delete Tag",
        message: "Are you sure you want to delete \"{name}\"?",
        item: selectedTag,
        onDelete: handleDeleteTag,
        getItemId: (tag: TagType) => tag.id,
        getItemName: (tag: TagType) => tag.name
      })}
    </div>
  );
};