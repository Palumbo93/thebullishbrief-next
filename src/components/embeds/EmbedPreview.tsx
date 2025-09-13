import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

interface EmbedPreviewProps {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  deleteNode: () => void;
  selected: boolean;
  editor: any;
}

export const EmbedPreview: React.FC<EmbedPreviewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor
}) => {
  const { content, title, width, height, type } = node.attrs;

  const handleClick = () => {
    // Trigger the embed modal with the current content
    const event = new CustomEvent('editEmbed', {
      detail: {
        content: content || '',
        title: title || '',
        width: width || '100%',
        height: height || '400px',
        type: type || 'html',
        updateAttributes
      }
    });
    window.dispatchEvent(event);
  };

  if (!content) {
    return (
      <NodeViewWrapper>
        <div
          onClick={handleClick}
          style={{
            width: width || '100%',
            height: height || '400px',
            maxWidth: '100%',
            background: 'var(--color-bg-secondary)',
            border: '2px dashed var(--color-border-primary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            ...(selected && {
              borderColor: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-bg)'
            })
          }}
        >
          Empty Embed (Click to edit)
        </div>
      </NodeViewWrapper>
    );
  }

  // Create a preview for the editor that shows what type of embed it is
  const embedType = type || (content.includes('<script') ? 'script' : content.includes('<iframe') ? 'iframe' : 'html');
  const embedIcon = embedType === 'script' ? '📊' : embedType === 'iframe' ? '🎥' : '📄';
  const embedLabel = embedType === 'script' ? 'Interactive Widget' : embedType === 'iframe' ? 'Video/Iframe' : 'HTML Content';

  // Show a truncated version of the code
  const codeSnippet = content.length > 100 ? content.substring(0, 100) + '...' : content;

  return (
    <NodeViewWrapper>
      <div
        onClick={handleClick}
        style={{
          width: width || '100%',
          height: height || 'auto',
          minHeight: height === 'auto' ? '120px' : height,
          maxWidth: '100%',
          background: 'var(--color-bg-secondary)',
          border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          cursor: 'pointer',
          transition: 'all var(--transition-base)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary)';
          e.currentTarget.style.backgroundColor = 'var(--color-primary-bg)';
        }}
        onMouseLeave={(e) => {
          if (!selected) {
            e.currentTarget.style.borderColor = 'var(--color-border-primary)';
            e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
          }
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 'var(--space-3)',
          gap: 'var(--space-2)'
        }}>
          <span style={{ fontSize: '20px' }}>{embedIcon}</span>
          <span style={{
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-sm)'
          }}>
            {embedLabel}
          </span>
          {title && (
            <span style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-xs)'
            }}>
              - {title}
            </span>
          )}
        </div>

        {/* Preview message */}
        <div style={{
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--text-xs)',
          marginBottom: 'var(--space-2)'
        }}>
          Preview in published page • Click to edit
        </div>

        {/* Code snippet */}
        <div style={{
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-secondary)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2)',
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-secondary)',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {codeSnippet}
        </div>
      </div>
    </NodeViewWrapper>
  );
};
