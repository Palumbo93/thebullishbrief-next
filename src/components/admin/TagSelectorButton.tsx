"use client";

import React, { useState } from 'react';
import { Tag, ChevronDown, X } from 'lucide-react';
import { useAllTags } from '../../hooks/useDatabase';
import { TagSelectorModal } from './TagSelectorModal';

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

  // Get selected tag names for display
  const selectedTagNames = selectedTags
    .map(tagId => allTags.find(tag => tag.id === tagId)?.name)
    .filter(Boolean);

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
        {selectedTagNames.length === 0 ? (
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
              {selectedTagNames.map((tagName, index) => {
                const tagId = selectedTags[index];
                return (
                  <div
                    key={tagId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)',
                      padding: 'var(--space-1) var(--space-2)',
                      background: 'var(--color-primary)',
                      color: 'var(--color-text-inverse)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tagId);
                    }}
                  >
                    <Tag style={{ width: '12px', height: '12px' }} />
                    <span>{tagName}</span>
                    <X style={{ 
                      width: '12px', 
                      height: '12px',
                      cursor: 'pointer',
                      opacity: 0.7
                    }} />
                  </div>
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
                {selectedTagNames.length} of {maxTags} tags selected
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
        placeholder={placeholder}
        maxTags={maxTags}
      />
    </>
  );
}; 