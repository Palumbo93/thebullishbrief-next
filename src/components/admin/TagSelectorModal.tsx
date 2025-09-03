"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check, Search, Tag } from 'lucide-react';
import { useAllTags } from '../../hooks/useDatabase';
import { CreateModal } from './CreateModal';
import { Tag as TagType } from '../../services/database';

interface TagSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onTagCreated?: (tag: TagType) => void;
  placeholder?: string;
  maxTags?: number;
}

export const TagSelectorModal: React.FC<TagSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedTags,
  onTagsChange,
  onTagCreated,
  placeholder = "Select tags...",
  maxTags = 5
}) => {
  const { tags: allTags, create: createTag } = useAllTags();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tempSelectedTags, setTempSelectedTags] = useState<string[]>([]);
  const [newlyCreatedTags, setNewlyCreatedTags] = useState<TagType[]>([]);

  // Initialize temp selected tags when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempSelectedTags([...selectedTags]);
      setSearchQuery('');
      setNewlyCreatedTags([]); // Reset newly created tags when modal opens
    }
  }, [isOpen, selectedTags]);



  // Filter tags based on search and include selected tags that might not be in allTags yet
  const filteredTags = useMemo(() => {
    let baseTagsList = [...allTags, ...newlyCreatedTags];
    
    // Remove duplicates (in case a newly created tag is now in allTags)
    baseTagsList = baseTagsList.filter((tag, index, self) => 
      self.findIndex(t => t.id === tag.id) === index
    );
    
    if (!searchQuery.trim()) return baseTagsList;
    
    return baseTagsList.filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allTags, newlyCreatedTags, searchQuery]);

  const handleTagToggle = (tagId: string) => {
    setTempSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        if (prev.length >= maxTags) {
          return prev; // Don't add if at max
        }
        return [...prev, tagId];
      }
    });
  };

  const handleClearAll = () => {
    setTempSelectedTags([]);
  };

  const handleApply = () => {
    onTagsChange(tempSelectedTags);
    onClose();
  };

  const handleCreateTag = async (tagData: Partial<TagType>) => {
    try {
      const newTag = await createTag(tagData);
      setShowCreateModal(false);
      
      if (newTag) {
        // Add to local cache of newly created tags
        setNewlyCreatedTags(prev => [...prev, newTag]);
        
        // Notify parent component about the new tag
        onTagCreated?.(newTag);
        
        // Immediately add the new tag to selection if we have space
        if (tempSelectedTags.length < maxTags && !tempSelectedTags.includes(newTag.id)) {
          setTempSelectedTags(prev => [...prev, newTag.id]);
        }
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  // Define form fields for tag creation
  const createFields = [
    {
      key: 'name',
      label: 'Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter tag name'
    },
    {
      key: 'slug',
      label: 'Slug',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter tag slug'
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 'var(--z-modal)',
          padding: 'var(--space-4)'
        }}>
          <div style={{
            background: 'var(--color-bg-card)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            animation: 'modalEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards'
          }}>
            {/* Header */}
            <div style={{
              padding: 'var(--space-6)',
              borderBottom: '0.5px solid var(--color-border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-1)'
                }}>
                  Select Tags
                </h2>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-tertiary)'
                }}>
                  {tempSelectedTags.length} of {maxTags} tags selected
                </p>
              </div>
              <button
                onClick={onClose}
                className="btn btn-ghost"
                style={{
                  padding: 'var(--space-2)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Search Bar */}
            <div style={{
              padding: 'var(--space-4) var(--space-6)',
              borderBottom: '0.5px solid var(--color-border-primary)'
            }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)'
              }}>
                <div style={{
                  position: 'relative',
                  flex: 1
                }}>
                  <Search style={{
                    position: 'absolute',
                    left: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    color: 'var(--color-text-tertiary)'
                  }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tags..."
                    style={{
                      width: '100%',
                      height: 'var(--input-height)',
                      padding: '0 var(--space-3) 0 calc(var(--space-3) + 16px + var(--space-2))',
                      background: 'var(--color-bg-tertiary)',
                      border: '0.5px solid var(--color-border-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--text-base)',
                      transition: 'all var(--transition-base)'
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                  style={{
                    fontSize: 'var(--text-sm)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  <span>Add Tag</span>
                </button>
              </div>
            </div>

            {/* Tags List */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: 'var(--space-4) var(--space-6)'
            }}>
              {filteredTags.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-8)',
                  color: 'var(--color-text-tertiary)',
                  textAlign: 'center'
                }}>
                  <Tag style={{
                    width: '48px',
                    height: '48px',
                    marginBottom: 'var(--space-3)'
                  }} />
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    {searchQuery ? 'No tags found' : 'No tags available'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary"
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      <Plus style={{ width: '16px', height: '16px' }} />
                      <span>Create First Tag</span>
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)'
                }}>
                  {filteredTags.map((tag) => {
                    const isSelected = tempSelectedTags.includes(tag.id);
                    const isDisabled = !isSelected && tempSelectedTags.length >= maxTags;
                    
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          if (!isDisabled) {
                            handleTagToggle(tag.id);
                          }
                        }}
                        disabled={isDisabled}
                        style={{
                          fontSize: 'var(--text-sm)',
                          borderRadius: 'var(--radius-full)',
                          padding: 'var(--space-2) var(--space-4)',
                          height: 'auto',
                          minHeight: '32px',
                          whiteSpace: 'nowrap',
                          background: isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-card)',
                          border: '0.5px solid var(--color-border-primary)',
                          color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          transition: 'all var(--transition-base)',
                          opacity: isDisabled ? 0.5 : 1,
                          position: 'relative',
                          fontWeight: 'var(--font-medium)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isDisabled) {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                              e.currentTarget.style.color = 'var(--color-text-primary)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDisabled) {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'var(--color-bg-card)';
                              e.currentTarget.style.color = 'var(--color-text-secondary)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }
                          }
                        }}
                      >
                        {isSelected && (
                          <Check style={{
                            width: '14px',
                            height: '14px',
                            marginRight: 'var(--space-1)',
                            color: 'var(--color-primary)'
                          }} />
                        )}
                        <span>{tag.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: 'var(--space-4) var(--space-6)',
              borderTop: '0.5px solid var(--color-border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-3)'
            }}>
              <button
                type="button"
                onClick={handleClearAll}
                className="btn btn-ghost"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-tertiary)'
                }}
              >
                Clear All
              </button>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)'
              }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="btn btn-primary"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  Apply ({tempSelectedTags.length})
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Tag Modal */}
      {showCreateModal && createPortal(
        <CreateModal<TagType>
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Tag"
          fields={createFields}
          onCreate={handleCreateTag}
        />,
        document.body
      )}
    </>
  );
}; 