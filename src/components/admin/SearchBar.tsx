import React from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  children?: React.ReactNode; // For advanced filters content
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder,
  showFilters = false,
  onToggleFilters,
  hasActiveFilters = false,
  onClearFilters,
  children
}) => {
  return (
    <div>
      {/* Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)'
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
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
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
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)'
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          )}
        </div>
        
        {/* Filter Button (only if onToggleFilters is provided) */}
        {onToggleFilters && (
          <button
            onClick={onToggleFilters}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <Filter style={{ width: '16px', height: '16px' }} />
            <span>Filters</span>
          </button>
        )}
        
        {/* Clear All Button (only if hasActiveFilters and onClearFilters are provided) */}
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="btn btn-ghost"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters (only if showFilters is true and children are provided) */}
      {showFilters && children && (
        <div style={{
          borderTop: '0.5px solid var(--color-border-primary)',
          paddingTop: 'var(--space-4)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}; 