import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionButton?: React.ReactNode;
  };
  onRowClick?: (item: T) => void;
  getItemKey: (item: T) => string | number;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyState,
  onRowClick,
  getItemKey
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-border-primary)',
            borderTop: '3px solid var(--color-brand-primary)',
            borderRadius: 'var(--radius-full)',
            margin: '0 auto var(--space-4)'
          }} className="animate-spin"></div>
          <p style={{ color: 'var(--color-text-tertiary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div style={{
        background: 'var(--color-bg-card)',
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: 'var(--space-8)',
          textAlign: 'center'
        }}>
          <div style={{
            margin: '0 auto var(--space-4)',
            display: 'flex',
            justifyContent: 'center'
          }}>
            {emptyState.icon}
          </div>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            {emptyState.title}
          </h3>
          <p style={{
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-4)'
          }}>
            {emptyState.description}
          </p>
          {emptyState.actionButton}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '0.5px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{
              background: 'var(--color-bg-secondary)',
              borderBottom: '0.5px solid var(--color-border-primary)'
            }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)',
                    width: column.width
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={getItemKey(item)}
                style={{
                  borderBottom: '0.5px solid var(--color-border-primary)',
                  transition: 'all var(--transition-base)',
                  cursor: onRowClick ? 'pointer' : 'default'
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) {
                    e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      padding: 'var(--space-4)',
                      fontSize: column.key === 'name' || column.key === 'title' 
                        ? 'var(--text-base)' 
                        : 'var(--text-sm)',
                      color: column.key === 'name' || column.key === 'title'
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-tertiary)',
                      fontWeight: column.key === 'name' || column.key === 'title'
                        ? 'var(--font-medium)'
                        : 'var(--font-normal)'
                    }}
                  >
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 