import React from 'react';
import { Plus } from 'lucide-react';

interface ManagerHeaderProps {
  title: string;
  itemCount: number;
  totalCount: number;
  hasActiveFilters?: boolean;
  createButtonText: string;
  onCreateClick: () => void;
}

export const ManagerHeader: React.FC<ManagerHeaderProps> = ({
  title,
  itemCount,
  totalCount,
  hasActiveFilters = false,
  createButtonText,
  onCreateClick
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 'var(--space-6)'
    }}>
      <div>
        <h2 style={{
          fontSize: 'var(--text-3xl)',
          fontFamily: 'var(--font-editorial)',
          fontWeight: 'var(--font-normal)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-1)'
        }}>
          {title}
        </h2>
        <p style={{
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-editorial)'
        }}>
          {itemCount} of {totalCount} {title.toLowerCase()}
          {hasActiveFilters && (
            <span style={{ color: 'var(--color-brand-primary)', fontWeight: 'var(--font-medium)' }}>
              {' '}(filtered)
            </span>
          )}
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="btn btn-primary"
        style={{ fontSize: 'var(--text-sm)' }}
      >
        <Plus style={{ width: '16px', height: '16px' }} />
        <span>{createButtonText}</span>
      </button>
    </div>
  );
}; 