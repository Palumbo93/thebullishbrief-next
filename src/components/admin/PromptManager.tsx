"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Brain, Search, X, Copy, Eye } from 'lucide-react';
import { usePrompts, usePromptActions, usePromptCategories } from '../../hooks/useDatabase';
import { promptFieldService } from '../../services/database';
import { ManagerHeader } from './ManagerHeader';
import { SearchBar } from './SearchBar';
import { DataTable, Column } from './DataTable';
import { DeleteModal } from './DeleteModal';
import { PromptCreateModal } from './PromptCreateModal';
import { PromptEditModal } from './PromptEditModal';
import type { Prompt, PromptCategory, PromptField } from '../../services/database';

interface PromptManagerProps {}

export const PromptManager: React.FC<PromptManagerProps> = () => {
  const { data: prompts, loading, create, update, delete: deletePrompt } = usePrompts();
  const { data: categories } = usePromptCategories();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter prompts based on search
  const filteredPrompts = useMemo(() => {
    let filtered = [...prompts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.description.toLowerCase().includes(query) ||
        prompt.content.toLowerCase().includes(query) ||
        prompt.intended_llm.toLowerCase().includes(query) ||
        prompt.original_credit.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [prompts, searchQuery]);

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const handleCreatePrompt = async (promptData: Partial<Prompt> & { fields?: Partial<PromptField>[] }) => {
    try {
      // Extract fields from the data
      const { fields, ...promptCreateData } = promptData;
      
      // Create the prompt
      const newPrompt = await create(promptCreateData);
      
      // Create the fields if provided
      if (fields && fields.length > 0) {
        await promptFieldService.setFieldsForPrompt(newPrompt.id, fields);
      }
      
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const handleUpdatePrompt = async (id: string, promptData: Partial<Prompt> & { fields?: Partial<PromptField>[] }) => {
    try {
      // Extract fields from the data
      const { fields, ...promptUpdateData } = promptData;
      
      // Update the prompt
      await update(id, promptUpdateData);
      
      // Update the fields if provided
      if (fields) {
        await promptFieldService.setFieldsForPrompt(id, fields);
      }
      
      setShowEditModal(false);
      setSelectedPrompt(null);
    } catch (error) {
      console.error('Error updating prompt:', error);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      await deletePrompt(id);
      setShowDeleteModal(false);
      setSelectedPrompt(null);
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const handleDuplicatePrompt = async (prompt: Prompt) => {
    try {
      await create({
        title: `${prompt.title} (Copy)`,
        description: prompt.description,
        content: prompt.content,
        category_id: prompt.category_id,
        intended_llm: prompt.intended_llm,
        original_credit: prompt.original_credit
      });
    } catch (error) {
      console.error('Error duplicating prompt:', error);
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
  const columns: Column<Prompt>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (prompt) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Brain style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
          <div>
            <div style={{ fontWeight: 'var(--font-medium)' }}>{prompt.title}</div>
            <div style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
              {prompt.description.length > 60 ? `${prompt.description.substring(0, 60)}...` : prompt.description}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (prompt) => (
        <span style={{
          background: 'var(--color-bg-tertiary)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-base)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-tertiary)'
        }}>
          {getCategoryName(prompt.category_id)}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (prompt) => formatDate(prompt.created_at)
    }
  ];

  return (
    <div>
      <ManagerHeader
        title="AI Prompts"
        itemCount={filteredPrompts.length}
        totalCount={prompts.length}
        hasActiveFilters={Boolean(searchQuery)}
        onCreateClick={() => setShowCreateModal(true)}
        createButtonText="New Prompt"
      />

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search prompts..."
        />
      </div>

      <DataTable
        data={filteredPrompts}
        columns={columns}
        loading={loading}
        getItemKey={(item) => item.id}
        onRowClick={async (prompt) => {
          // Ensure fields are loaded for the selected prompt
          try {
            const fields = await promptFieldService.getFieldsForPrompt(prompt.id);
            const promptWithFields = {
              ...prompt,
              fields
            };
            setSelectedPrompt(promptWithFields);
            setShowEditModal(true);
          } catch (error) {
            console.error('Failed to load fields for prompt:', error);
            setSelectedPrompt(prompt);
            setShowEditModal(true);
          }
        }}
        emptyState={{
          icon: <Brain style={{ width: '48px', height: '48px' }} />,
          title: "No prompts found",
          description: "Create your first AI prompt to get started."
        }}
      />

      {/* Modals */}
      {showCreateModal && (
        <PromptCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePrompt}
        />
      )}

      {showEditModal && selectedPrompt && (
        <PromptEditModal
          prompt={selectedPrompt}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPrompt(null);
          }}
          onUpdate={handleUpdatePrompt}
        />
      )}

      {React.createElement(DeleteModal<Prompt>, {
        isOpen: showDeleteModal,
        onClose: () => {
          setShowDeleteModal(false);
          setSelectedPrompt(null);
        },
        title: "Delete AI Prompt",
        message: "Are you sure you want to delete \"{name}\"?",
        item: selectedPrompt,
        onDelete: handleDeletePrompt,
        getItemId: (prompt: Prompt) => prompt.id,
        getItemName: (prompt: Prompt) => prompt.title
      })}
    </div>
  );
}; 