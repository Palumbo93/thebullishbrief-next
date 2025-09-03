"use client";

import React, { useState, useEffect } from 'react';
import { Tag, ChevronDown, X } from 'lucide-react';
import { useAllTags } from '../../hooks/useDatabase';
import { TagSelectorModal } from './TagSelectorModal';
import { Tag as TagType } from '../../services/database';

interface TagSelectorButtonProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export const TagSelectorButton: React.FC<TagSelectorButtonProps> = ({
  selectedTags,
  onTagsChange,
  placeholder = "Select tags...",
  maxTags = 5
}) => {
  const { tags: allTags } = useAllTags();
  const [showModal, setShowModal] = useState(false);
  const [locallyCreatedTags, setLocallyCreatedTags] = useState<TagType[]>([]);

  // Get selected tag objects for display, including fallback for missing tags
  const selectedTagsWithNames = selectedTags.map(tagId => {
    // First check in allTags, then in locallyCreatedTags
    const tag = allTags.find(tag => tag.id === tagId) || 
                locallyCreatedTags.find(tag => tag.id === tagId);
    return {
      id: tagId,
      name: tag?.name || 'Loading...' // Fallback for newly created tags
    };
  });

  // Handler for when a new tag is created in the modal
  const handleTagCreated = (newTag: TagType) => {
    setLocallyCreatedTags(prev => {
      // Avoid duplicates
      if (prev.find(tag => tag.id === newTag.id)) {
        return prev;
      }
      return [...prev, newTag];
    });
  };

  // Clean up locally created tags that are now in allTags
  useEffect(() => {
    setLocallyCreatedTags(prev => 
      prev.filter(localTag => !allTags.find(tag => tag.id === localTag.id))
    );
  }, [allTags]);

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  return (
    <>
      <div style={{
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-tertiary)',
        minHeight: 'var(--input-height)',
        padding: 'var(--space-2)',
        cursor: 'pointer',
        transition: 'all var(--transition-base)'
      }}
      onClick={() => setShowModal(true)}
      >
        {selectedTagsWithNames.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--text-base)',
            padding: 'var(--space-2) var(--space-3)'
          }}>
            <span>{placeholder}</span>
            <ChevronDown style={{ width: '16px', height: '16px' }} />
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)'
          }}>
            {/* Selected Tags */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)'
            }}>
              {selectedTagsWithNames.map((tagWithName) => {
                return (
                  <button
                    key={tagWithName.id}
                    type="button"
                    style={{
                      fontSize: 'var(--text-sm)',
                      borderRadius: 'var(--radius-full)',
                      padding: 'var(--space-2) var(--space-4)',
                      height: 'auto',
                      minHeight: '32px',
                      whiteSpace: 'nowrap',
                      background: 'var(--color-bg-tertiary)',
                      border: '0.5px solid var(--color-border-primary)',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                      fontWeight: 'var(--font-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tagWithName.id);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Tag style={{ 
                      width: '14px', 
                      height: '14px',
                      color: 'var(--color-text-tertiary)'
                    }} />
                    <span>{tagWithName.name}</span>
                    <X style={{ 
                      width: '14px', 
                      height: '14px',
                      opacity: 0.8,
                      color: 'var(--color-text-tertiary)'
                    }} />
                  </button>
                );
              })}
            </div>
            
            {/* Summary and Chevron */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-1) var(--space-2)',
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-sm)'
            }}>
              <span>
                {selectedTagsWithNames.length} of {maxTags} tags selected
              </span>
              <ChevronDown style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
        )}
      </div>

      {/* Tag Selector Modal */}
      <TagSelectorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedTags={selectedTags}
        onTagsChange={onTagsChange}
        onTagCreated={handleTagCreated}
        placeholder={placeholder}
        maxTags={maxTags}
      />
    </>
  );
}; 