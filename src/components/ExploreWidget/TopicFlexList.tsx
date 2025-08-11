import React from 'react';

interface TopicFlexListProps {
  tags: Array<{ id: string; name: string; slug: string; article_count: number | null; created_at: string | null; updated_at: string | null }>;
  onTopicClick: (tag: string) => void;
  isLoading?: boolean;
}

export const TopicFlexList: React.FC<TopicFlexListProps> = ({ 
  tags, 
  onTopicClick, 
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
          Trending Topics
        </h4>
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-2)'
        }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              style={{
                width: `${Math.random() * 40 + 60}px`,
                height: '24px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-bg-tertiary)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                flexShrink: 0
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!tags || tags.length === 0) {
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
        Trending Topics
      </h4>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)'
      }}>
        {tags.slice(0, 12).map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTopicClick(tag.name)}
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-secondary)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
                      >
              {tag.name}
            </button>
        ))}
      </div>
    </div>
  );
};
