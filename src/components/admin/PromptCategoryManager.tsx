"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Search, X, Copy } from 'lucide-react';
import { usePromptCategories, usePromptCategoryActions } from '../../hooks/useDatabase';
import { ManagerHeader } from './ManagerHeader';
import { SearchBar } from './SearchBar';
import { DataTable, Column } from './DataTable';
import { EditModal, FormField } from './EditModal';
import { DeleteModal } from './DeleteModal';
import { CreateModal } from './CreateModal';
import type { PromptCategory } from '../../services/database';

interface PromptCategoryManagerProps {}

export const PromptCategoryManager: React.FC<PromptCategoryManagerProps> = () => {
  const { data: categories, loading, create, update, delete: deleteCategory } = usePromptCategories();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const handleCreateCategory = async (categoryData: Partial<PromptCategory>) => {
    try {
      await create(categoryData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating prompt category:', error);
    }
  };

  const handleUpdateCategory = async (id: string, categoryData: Partial<PromptCategory>) => {
    try {
      await update(id, categoryData);
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error updating prompt category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error deleting prompt category:', error);
    }
  };

  const handleDuplicateCategory = async (category: PromptCategory) => {
    try {
      await create({
        name: `${category.name} (Copy)`,
        sort_order: (category.sort_order || 0) + 1
      });
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error duplicating prompt category:', error);
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
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter category name' },
    { key: 'sort_order', label: 'Sort Order', type: 'text', placeholder: 'Enter sort order (number)', defaultValue: '0' }
  ];

  const createFields: FormField[] = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter category name' },
    { key: 'sort_order', label: 'Sort Order', type: 'text', placeholder: 'Enter sort order (number)', defaultValue: '0' }
  ];

  // Define table columns
  const columns: Column<PromptCategory>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (category) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <MessageSquare style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
          <span style={{ fontWeight: 'var(--font-medium)' }}>{category.name}</span>
        </div>
      )
    },
    {
      key: 'sort_order',
      header: 'Sort Order',
      render: (category) => (
        <span style={{ 
          background: 'var(--color-bg-tertiary)', 
          padding: 'var(--space-1) var(--space-2)', 
          borderRadius: 'var(--radius-base)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-tertiary)'
        }}>
          {category.sort_order || 0}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (category) => formatDate(category.created_at)
    }
  ];

  return (
    <div>
      <ManagerHeader
        title="Prompt Categories"
        itemCount={filteredCategories.length}
        totalCount={categories.length}
        hasActiveFilters={Boolean(searchQuery)}
        onCreateClick={() => setShowCreateModal(true)}
        createButtonText="New Category"
      />

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search categories..."
        />
      </div>

      <DataTable
        data={filteredCategories}
        columns={columns}
        loading={loading}
        getItemKey={(item) => item.id}
        onRowClick={(category) => {
          setSelectedCategory(category);
          setShowEditModal(true);
        }}
        emptyState={{
          icon: <MessageSquare style={{ width: '48px', height: '48px' }} />,
          title: "No prompt categories found",
          description: "Create your first prompt category to get started."
        }}
      />

      {/* Modals */}
      {React.createElement(CreateModal<PromptCategory>, {
        isOpen: showCreateModal,
        onClose: () => setShowCreateModal(false),
        title: "Create Prompt Category",
        fields: createFields,
        onCreate: handleCreateCategory
      })}

      {React.createElement(EditModal<PromptCategory>, {
        isOpen: showEditModal,
        onClose: () => {
          setShowEditModal(false);
          setSelectedCategory(null);
        },
        title: "Edit Prompt Category",
        subtitle: selectedCategory?.name,
        item: selectedCategory,
        fields: editFields,
        onSave: handleUpdateCategory,
        onDelete: handleDeleteCategory,
        onDuplicate: handleDuplicateCategory,
        getItemId: (category: PromptCategory) => category.id
      })}

      {React.createElement(DeleteModal<PromptCategory>, {
        isOpen: showDeleteModal,
        onClose: () => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        },
        title: "Delete Prompt Category",
        message: "Are you sure you want to delete \"{name}\"?",
        item: selectedCategory,
        onDelete: handleDeleteCategory,
        getItemId: (category: PromptCategory) => category.id,
        getItemName: (category: PromptCategory) => category.name
      })}
    </div>
  );
}; 