"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Folder } from 'lucide-react';
import { useCategories } from '../../hooks/useDatabase';
import { ManagerHeader } from './ManagerHeader';
import { SearchBar } from './SearchBar';
import { DataTable, Column } from './DataTable';
import { EditModal, FormField } from './EditModal';
import { DeleteModal } from './DeleteModal';
import { CreateModal } from './CreateModal';
import type { Category } from '../../services/database';
interface CategoryManagerProps {}

export const CategoryManager: React.FC<CategoryManagerProps> = () => {
  const { data: categories, loading, create, update, delete: deleteCategory } = useCategories();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const handleCreateCategory = async (categoryData: Partial<Category>) => {
    try {
      await create(categoryData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      await update(id, categoryData);
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleDuplicateCategory = async (category: Category) => {
    try {
      await create({
        name: `${category.name} (Copy)`,
        slug: `${category.slug}-copy`,
        description: category.description,
      featured: false,
        sort_order: (category.sort_order || 0) + 1
      });
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error duplicating category:', error);
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
    { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'Auto-generated from name' },
    { key: 'featured', label: 'Featured', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
    { key: 'sort_order', label: 'Sort Order', type: 'text', placeholder: 'Enter sort order (number)', defaultValue: '0' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter category description', rows: 4 }
  ];

  const createFields: FormField[] = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter category name' },
    { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'Auto-generated from name' },
    { key: 'featured', label: 'Featured', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }], defaultValue: 'false' },
    { key: 'sort_order', label: 'Sort Order', type: 'text', placeholder: 'Enter sort order (number)', defaultValue: '0' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter category description', rows: 4 }
  ];

  // Define table columns
  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '30%'
    },
    {
      key: 'slug',
      header: 'Slug',
      width: '25%',
      render: (category) => (
        <code style={{
          background: 'var(--color-bg-tertiary)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          fontFamily: 'monospace',
          color: 'var(--color-text-secondary)'
        }}>
          {category.slug}
        </code>
      )
    },
    {
      key: 'featured',
      header: 'Featured',
      width: '15%',
      render: (category) => (
        <span style={{
          padding: 'var(--space-1) var(--space-2)',
          background: category.featured ? 'var(--color-success-bg)' : 'var(--color-bg-tertiary)',
          color: category.featured ? 'var(--color-success)' : 'var(--color-text-tertiary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-medium)'
        }}>
          {category.featured ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'sort_order',
      header: 'Sort Order',
      width: '15%',
      render: (category) => (
        <span style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)'
        }}>
          {category.sort_order || 0}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      width: '15%',
      render: (category) => formatDate(category.created_at)
    }
  ];

  return (
    <div>
      {/* Header */}
      <ManagerHeader
        title="Categories"
        itemCount={filteredCategories.length}
        totalCount={categories.length}
        hasActiveFilters={Boolean(searchQuery)}
        createButtonText="Create Category"
        onCreateClick={() => setShowCreateModal(true)}
      />

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
            placeholder="Search categories..."
          />

      {/* Categories Table */}
      <DataTable
        data={filteredCategories}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: <Folder style={{
            width: '48px',
            height: '48px',
            color: 'var(--color-text-muted)'
          }} />,
          title: categories.length === 0 ? 'No categories yet' : 'No categories found',
          description: categories.length === 0 
            ? 'Create your first category to organize your content.'
            : 'Try adjusting your search criteria.',
          actionButton: categories.length === 0 ? (
                <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{ fontSize: 'var(--text-sm)' }}
            >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>Create Category</span>
          </button>
          ) : undefined
        }}
        onRowClick={(category) => {
          setSelectedCategory(category);
          setShowEditModal(true);
        }}
        getItemKey={(category) => category.id}
      />

      {/* Modals */}
      {React.createElement(EditModal<Category>, {
        isOpen: showEditModal,
        onClose: () => {
          setShowEditModal(false);
          setSelectedCategory(null);
        },
        title: "Edit Category",
        subtitle: selectedCategory?.name,
        item: selectedCategory,
        fields: editFields,
        onSave: handleUpdateCategory,
        onDelete: handleDeleteCategory,
        onDuplicate: handleDuplicateCategory,
        getItemId: (category: Category) => category.id
      })}

      {React.createElement(CreateModal<Category>, {
        isOpen: showCreateModal,
        onClose: () => setShowCreateModal(false),
        title: "Create Category",
        fields: createFields,
        onCreate: handleCreateCategory
      })}

      {React.createElement(DeleteModal<Category>, {
        isOpen: showDeleteModal,
        onClose: () => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        },
        title: "Delete Category",
        message: "Are you sure you want to delete \"{name}\"?",
        item: selectedCategory,
        onDelete: handleDeleteCategory,
        getItemId: (category: Category) => category.id,
        getItemName: (category: Category) => category.name
      })}
    </div>
  );
};