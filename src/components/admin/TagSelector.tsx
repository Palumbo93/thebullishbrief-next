"use client";

import React, { useState, useMemo } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { useAllTags } from '../../hooks/useDatabase';
import { Tag } from '../../services/database';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  placeholder = "Select tags...",
  maxTags = 10
}) => {
  const { tags, loading } = useAllTags();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, searchQuery]);

  // Get selected tag objects
  const selectedTagObjects = useMemo(() => {
    return tags.filter(tag => selectedTags.includes(tag.id));
  }, [tags, selectedTags]);

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    if (newSelectedTags.length <= maxTags) {
      onTagsChange(newSelectedTags);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  const handleInputClick = () => {
    setIsDropdownOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow for dropdown clicks
    setTimeout(() => setIsDropdownOpen(false), 200);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Selected Tags Display */}
      <div style={{
        minHeight: 'var(--input-height)',
        padding: 'var(--space-2)',
        background: 'var(--color-bg-tertiary)',
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
        alignItems: 'center',
        cursor: 'text'
      }}
      onClick={handleInputClick}
      onBlur={handleInputBlur}
      >
        {/* Selected Tag Chips */}
        {selectedTagObjects.map(tag => (
          <div
            key={tag.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              padding: 'var(--space-1) var(--space-2)',
              background: 'var(--color-primary)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)'
            }}
          >
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        ))}

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          style={{
            flex: 1,
            minWidth: '120px',
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)'
          }}
        />

        {/* Loading Indicator */}
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-text-tertiary)'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid var(--color-border-primary)',
              borderTop: '2px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--color-bg-card)',
          border: '0.5px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {filteredTags.length === 0 ? (
            <div style={{
              padding: 'var(--space-4)',
              textAlign: 'center',
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-sm)'
            }}>
              {searchQuery ? 'No tags found' : 'No tags available'}
            </div>
          ) : (
            filteredTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  background: selectedTags.includes(tag.id) 
                    ? 'var(--color-primary)' 
                    : 'transparent',
                  color: selectedTags.includes(tag.id) 
                    ? 'white' 
                    : 'var(--color-text-primary)',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  transition: 'all var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                  if (!selectedTags.includes(tag.id)) {
                    e.currentTarget.style.background = 'var(--color-bg-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedTags.includes(tag.id)) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid',
                  borderColor: selectedTags.includes(tag.id) ? 'white' : 'var(--color-border-primary)',
                  borderRadius: '2px',
                  background: selectedTags.includes(tag.id) ? 'white' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedTags.includes(tag.id) && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: 'var(--color-primary)',
                      borderRadius: '1px'
                    }} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--font-medium)' }}>
                    {tag.name}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Max Tags Warning */}
      {selectedTags.length >= maxTags && (
        <div style={{
          marginTop: 'var(--space-2)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-warning)'
        }}>
          Maximum {maxTags} tags allowed
        </div>
      )}
    </div>
  );
}; 