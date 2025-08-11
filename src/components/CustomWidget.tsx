import React from 'react';

interface CustomWidgetProps {
  code: string;
  title?: string;
}

/**
 * CustomWidget renders custom HTML/JavaScript widget code
 * @param code - HTML/JavaScript code to render
 * @param title - Optional title for the widget
 */
const CustomWidget: React.FC<CustomWidgetProps> = ({ code, title }) => {
  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '0.5px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      marginBottom: 'var(--space-4)'
    }}>
      {title && (
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-3)'
        }}>
          {title}
        </h3>
      )}
      <div 
        dangerouslySetInnerHTML={{ __html: code }}
        style={{
          width: '100%',
          minHeight: '200px'
        }}
      />
    </div>
  );
};

export default CustomWidget; 