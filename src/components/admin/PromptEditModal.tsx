"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Brain, Plus, Trash2, Edit } from 'lucide-react';
import { usePromptCategories } from '../../hooks/useDatabase';
import type { Prompt, PromptField } from '../../services/database';

interface PromptEditModalProps {
  prompt: Prompt & { fields?: PromptField[] };
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Prompt> & { fields: Partial<PromptField>[] }) => void;
}

interface FormData {
  title: string;
  description: string;
  content: string;
  category_id: string;
  intended_llm: string;
  original_credit: string;
}

interface FieldData {
  id: string;
  label: string;
  placeholder: string;
  field_type: 'text' | 'textarea' | 'select';
  options: string[];
  sort_order: number;
}

export const PromptEditModal: React.FC<PromptEditModalProps> = ({ prompt, onClose, onUpdate }) => {
  const { data: categories } = usePromptCategories();
  
  const [formData, setFormData] = useState<FormData>({
    title: prompt.title,
    description: prompt.description,
    content: prompt.content,
    category_id: prompt.category_id,
    intended_llm: prompt.intended_llm,
    original_credit: prompt.original_credit
  });

  const [fields, setFields] = useState<FieldData[]>(
    prompt.fields?.map(field => ({
      id: field.id,
      label: field.label,
      placeholder: field.placeholder,
      field_type: field.field_type,
      options: field.options || [],
      sort_order: field.sort_order
    })) || []
  );

  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState<FieldData | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number>(-1);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hasUnsavedChanges) {
          if (confirm('You have unsaved changes. Are you sure you want to close?')) {
            onClose();
          }
        } else {
          onClose();
        }
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmit(e as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, onClose]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = 
      formData.title !== prompt.title ||
      formData.description !== prompt.description ||
      formData.content !== prompt.content ||
      formData.category_id !== prompt.category_id ||
      formData.intended_llm !== prompt.intended_llm ||
      formData.original_credit !== prompt.original_credit ||
      JSON.stringify(fields) !== JSON.stringify(prompt.fields?.map(field => ({
        id: field.id,
        label: field.label,
        placeholder: field.placeholder,
        field_type: field.field_type,
        options: field.options || [],
        sort_order: field.sort_order
      })));
    setHasUnsavedChanges(hasChanges);
  }, [formData, fields, prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promptData = {
        ...formData,
        fields: fields.map(field => ({
          id: field.id,
          label: field.label,
          placeholder: field.placeholder,
          field_type: field.field_type,
          options: field.options,
          sort_order: field.sort_order
        }))
      };
      await onUpdate(prompt.id, promptData as Partial<Prompt> & { fields: Partial<PromptField>[] });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error updating prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addField = () => {
    const newField: FieldData = {
      id: `field-${Date.now()}`,
      label: '',
      placeholder: '',
      field_type: 'text',
      options: [],
      sort_order: fields.length
    };
    setFields([...fields, newField]);
    setEditingField(newField);
    setEditingFieldIndex(fields.length);
    setShowFieldModal(true);
  };

  const editField = (index: number) => {
    setEditingField(fields[index]);
    setEditingFieldIndex(index);
    setShowFieldModal(true);
  };

  const deleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const saveField = (fieldData: FieldData) => {
    if (editingFieldIndex >= 0) {
      // Edit existing field
      const newFields = [...fields];
      newFields[editingFieldIndex] = fieldData;
      setFields(newFields);
    } else {
      // Add new field
      setFields([...fields, fieldData]);
    }
    setShowFieldModal(false);
    setEditingField(null);
    setEditingFieldIndex(-1);
  };

  const getFieldTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Text Input';
      case 'textarea': return 'Text Area';
      case 'select': return 'Dropdown';
      default: return type;
    }
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--color-bg-primary)',
      zIndex: 'var(--z-modal)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderBottom: '0.5px solid var(--color-border-primary)',
        padding: 'var(--space-4) var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '80px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)'
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)'
            }}>
              Edit AI Prompt
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)'
            }}>
              Update prompt template and dynamic fields
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}>
          {hasUnsavedChanges && (
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-warning)',
              fontStyle: 'italic'
            }}>
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            form="prompt-form"
            disabled={loading || !formData.title.trim() || !formData.content.trim()}
            className="btn btn-primary"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <Save style={{ width: '16px', height: '16px' }} />
            <span>{loading ? 'Updating...' : 'Update Prompt'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="modal-content"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 'var(--space-6)',
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-border-primary) transparent'
        }}
      >
        <style>{`
          .modal-content::-webkit-scrollbar {
            width: 8px;
          }
          .modal-content::-webkit-scrollbar-track {
            background: transparent;
          }
          .modal-content::-webkit-scrollbar-thumb {
            background: var(--color-border-primary);
            border-radius: 4px;
          }
          .modal-content::-webkit-scrollbar-thumb:hover {
            background: var(--color-border-secondary);
          }
        `}</style>
        <form id="prompt-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Title */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '60px',
                  padding: '0 var(--space-4)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-semibold)',
                  transition: 'all var(--transition-base)'
                }}
                placeholder="Enter your prompt title..."
              />
            </div>

            {/* Description */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
                  resize: 'vertical',
                  minHeight: '80px',
                  transition: 'all var(--transition-base)'
                }}
                placeholder="Describe what this prompt does..."
              />
            </div>

            {/* Metadata Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 'var(--space-4)'
            }}>
              {/* Category */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleChange('category_id', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: '0 var(--input-padding-x)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--transition-base)'
                  }}
                >
                  <option value="">Select a category...</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Intended LLM */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Intended LLM *
                </label>
                <input
                  type="text"
                  value={formData.intended_llm}
                  onChange={(e) => handleChange('intended_llm', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: '0 var(--input-padding-x)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--transition-base)'
                  }}
                  placeholder="e.g., Claude 3.5 Sonnet"
                />
              </div>

              {/* Original Credit */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Original Credit *
                </label>
                <input
                  type="text"
                  value={formData.original_credit}
                  onChange={(e) => handleChange('original_credit', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: '0 var(--input-padding-x)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--transition-base)'
                  }}
                  placeholder="e.g., The Bullish Brief Research Team"
                />
              </div>
            </div>

            {/* Prompt Fields */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-3)'
              }}>
                <label style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)'
                }}>
                  Dynamic Fields
                </label>
                <button
                  type="button"
                  onClick={addField}
                  className="btn btn-secondary"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  <span>Add Field</span>
                </button>
              </div>
              
              {fields.length === 0 ? (
                <div style={{
                  padding: 'var(--space-6)',
                  border: '2px dashed var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center',
                  background: 'var(--color-bg-secondary)'
                }}>
                  <Brain style={{ width: '32px', height: '32px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)' }} />
                  <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                    No fields added yet. Add fields to make this prompt dynamic.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {fields.map((field, index) => (
                    <div key={field.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      background: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border-primary)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                          <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                            {field.label || 'Unnamed Field'}
                          </span>
                          <span style={{ 
                            background: 'var(--color-bg-secondary)',
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: 'var(--radius-base)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-tertiary)'
                          }}>
                            {getFieldTypeLabel(field.field_type)}
                          </span>
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                          {field.placeholder || 'No placeholder'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => editField(index)}
                        className="btn btn-ghost"
                        style={{ padding: 'var(--space-1)', minWidth: 'auto' }}
                        title="Edit field"
                      >
                        <Edit style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteField(index)}
                        className="btn btn-ghost"
                        style={{ padding: 'var(--space-1)', minWidth: 'auto', color: 'var(--color-error)' }}
                        title="Delete field"
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content Editor */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-3)'
              }}>
                <label style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)'
                }}>
                  Prompt Content *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)'
                }}>
                  <span>Characters: {formData.content.length}</span>
                </div>
              </div>
              
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                required
                rows={12}
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-mono)',
                  resize: 'vertical',
                  minHeight: '300px',
                  transition: 'all var(--transition-base)'
                }}
                placeholder="Write your prompt content here. Use [FIELD_NAME] to reference dynamic fields..."
              />
            </div>

          </div>
        </form>
      </div>

      {/* Field Modal */}
      {showFieldModal && (
        <FieldModal
          field={editingField}
          onSave={saveField}
          onClose={() => {
            setShowFieldModal(false);
            setEditingField(null);
            setEditingFieldIndex(-1);
          }}
        />
      )}
    </div>,
    document.body
  );
};

// Field Modal Component (same as in PromptCreateModal)
interface FieldModalProps {
  field: FieldData | null;
  onSave: (field: FieldData) => void;
  onClose: () => void;
}

const FieldModal: React.FC<FieldModalProps> = ({ field, onSave, onClose }) => {
  const [fieldData, setFieldData] = useState<FieldData>(field || {
    id: `field-${Date.now()}`,
    label: '',
    placeholder: '',
    field_type: 'text',
    options: [],
    sort_order: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(fieldData);
  };

  const addOption = () => {
    setFieldData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFieldData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index: number) => {
    setFieldData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(4px)',
      zIndex: 'var(--z-modal)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)'
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-2xl)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-6)',
          borderBottom: '0.5px solid var(--color-border-primary)',
          background: 'var(--color-bg-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>
              {field ? 'Edit Field' : 'Add Field'}
            </h2>
            <button
              onClick={onClose}
              style={{
                color: 'var(--color-text-tertiary)',
                background: 'transparent',
                border: 'none',
                padding: 'var(--space-1)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-base)'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-6)', flex: 1, overflow: 'auto' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              {/* Label */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Field Label *
                </label>
                <input
                  type="text"
                  value={fieldData.label}
                  onChange={(e) => setFieldData(prev => ({ ...prev, label: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)'
                  }}
                  placeholder="e.g., Company Name"
                />
              </div>

              {/* Placeholder */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={fieldData.placeholder}
                  onChange={(e) => setFieldData(prev => ({ ...prev, placeholder: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)'
                  }}
                  placeholder="e.g., Enter company name..."
                />
              </div>

              {/* Field Type */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Field Type *
                </label>
                <select
                  value={fieldData.field_type}
                  onChange={(e) => setFieldData(prev => ({ 
                    ...prev, 
                    field_type: e.target.value as 'text' | 'textarea' | 'select',
                    options: e.target.value === 'select' ? prev.options : []
                  }))}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  <option value="text">Text Input</option>
                  <option value="textarea">Text Area</option>
                  <option value="select">Dropdown</option>
                </select>
              </div>



              {/* Options (for select fields) */}
              {fieldData.field_type === 'select' && (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <label style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)'
                    }}>
                      Options
                    </label>
                    <button
                      type="button"
                      onClick={addOption}
                      className="btn btn-secondary"
                      style={{ fontSize: 'var(--text-xs)' }}
                    >
                      <Plus style={{ width: '12px', height: '12px' }} />
                      Add Option
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {fieldData.options.map((option, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)'
                      }}>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          style={{
                            flex: 1,
                            padding: 'var(--space-2)',
                            background: 'var(--color-bg-tertiary)',
                            border: '1px solid var(--color-border-primary)',
                            borderRadius: 'var(--radius-base)',
                            color: 'var(--color-text-primary)',
                            fontSize: 'var(--text-sm)'
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="btn btn-ghost"
                          style={{ padding: 'var(--space-1)', minWidth: 'auto', color: 'var(--color-error)' }}
                        >
                          <Trash2 style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-4)'
              }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!fieldData.label.trim()}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {field ? 'Update Field' : 'Add Field'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}; 