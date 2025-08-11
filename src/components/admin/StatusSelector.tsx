import React from 'react';

interface StatusSelectorProps {
  value: 'draft' | 'published' | 'archived';
  onChange: (status: 'draft' | 'published' | 'archived') => void;
  disabled?: boolean;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  const statuses: Array<'draft' | 'published' | 'archived'> = ['draft', 'published', 'archived'];

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-2)'
    }}>
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          disabled={disabled}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background: value === status ? 'var(--color-text-primary)' : 'var(--color-bg-tertiary)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-full)',
            color: value === status ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            textTransform: 'uppercase',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-base)',
            opacity: disabled ? 0.5 : 1
          }}
        >
          {status}
        </button>
      ))}
    </div>
  );
}; 