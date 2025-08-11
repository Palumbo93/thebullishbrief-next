import React from 'react';

interface Author {
  name: string;
  count: number;
  avatar?: string;
  slug?: string;
}

interface AuthorListProps {
  authors: Author[];
  onAuthorClick: (authorName: string, authorSlug?: string) => void;
  isLoading?: boolean;
}

export const AuthorList: React.FC<AuthorListProps> = ({ 
  authors, 
  onAuthorClick, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div style={{
        marginBottom: 'var(--space-4)'
      }}>
        <h4 style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-3)'
        }}>
          Popular Authors
        </h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)'
        }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-tertiary)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--color-bg-secondary)',
                flexShrink: 0
              }} />
              <div style={{
                flex: 1,
                height: '16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg-secondary)'
              }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!authors || authors.length === 0) {
    return null;
  }

  return (
    <div style={{
      marginBottom: 'var(--space-4)',
      border: '0.5px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-3)',
      // background: 'var(--color-bg-secondary)'
    }}>
      <h4 style={{
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-3)'
      }}>
        Popular Authors
      </h4>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)'
      }}>
        {authors.map((author) => (
          <button
            key={author.name}
            onClick={() => onAuthorClick(author.name, author.slug)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              width: '100%',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {/* Author Avatar */}
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={`${author.name} avatar`}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--color-bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-secondary)',
                flexShrink: 0
              }}>
                {author.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Author Info */}
            <div style={{
              flex: 1,
              minWidth: 0
            }}>
              <div style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                lineHeight: 1.2,
                marginBottom: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {author.name}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
