import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface CompactSearchBarProps {
  onSearch: (query: string) => void;
}

export const CompactSearchBar: React.FC<CompactSearchBarProps> = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(searchInput);
    }
  };
  
  return (
    <div style={{
      marginBottom: 'var(--space-4)'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          position: 'relative',
          width: '100%'
        }}>
          <Search style={{
            position: 'absolute',
            left: 'var(--space-3)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: 'var(--color-text-tertiary)',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles..."
            style={{
              width: '100%',
              height: '36px',
              padding: '0 var(--space-3) 0 calc(var(--space-3) + 16px + var(--space-2))',
              background: 'var(--color-bg-tertiary)',
              border: '0.5px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              transition: 'all var(--transition-base)',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-border-focus)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border-primary)';
            }}
          />
        </div>
      </form>
    </div>
  );
};
