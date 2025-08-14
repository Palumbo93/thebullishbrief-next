import React from 'react';
import type { LegalDocument } from '../../data/legal/types';
import { SectionHeader } from '../SectionHeader';

interface LegalPageTemplateProps {
  doc: LegalDocument;
}

// Function to convert plain text bullet points to HTML lists
const formatContent = (content: string): string => {
  // Split content into lines
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Check if content contains bullet points
  const hasBullets = lines.some(line => line.startsWith('•') || line.startsWith('-') || line.startsWith('*'));
  
  if (hasBullets) {
    // Convert bullet points to HTML list
    const listItems = lines.map(line => {
      // Remove bullet point and trim
      const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
      return `<li>${cleanLine}</li>`;
    });
    
    return `<ul style="margin: 0; padding-left: var(--space-6); list-style-type: disc;">${listItems.join('')}</ul>`;
  } else {
    // Return as regular paragraph
    return `<p style="margin: 0 0 var(--space-4) 0;">${content}</p>`;
  }
};

export const LegalPageTemplate: React.FC<LegalPageTemplateProps> = ({ doc }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column'
    }}>
      <SectionHeader title={doc.title} />

      {/* Document Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Effective Date Banner */}
        {(doc.effectiveDate || doc.updatedDate) && (
          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}>
            {doc.effectiveDate && (
              <span style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                fontWeight: 'var(--font-medium)'
              }}>
                Effective: {new Date(doc.effectiveDate).toLocaleDateString()}
              </span>
            )}
            {doc.updatedDate && (
              <span style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                background: 'var(--color-bg-tertiary)',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '0.5px solid var(--color-border-primary)'
              }}>
                Updated {new Date(doc.updatedDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Sections */}
        {doc.sections.map((section, index) => (
          <div key={section.id}>
            <div
              id={section.id}
              style={{
                padding: 'var(--space-6) var(--space-4)',
                transition: 'background var(--transition-base)'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-4)'
                }}>
                  {section.title}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6
                  }}
                  dangerouslySetInnerHTML={{ __html: formatContent(section.body) }}
                />
              </div>
            </div>
            {/* Divider - only show if not the last item */}
            {index < doc.sections.length - 1 && (
              <div style={{
                height: '1px',
                background: 'var(--color-border-primary)'
              }} />
            )}
          </div>
        ))}

        {/* Back to top link */}
        <div style={{ 
          padding: 'var(--space-4)',
          borderTop: '1px solid var(--color-border-primary)'
        }}>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              fontWeight: 'var(--font-medium)'
            }}
          >
            ↑ Back to top
          </a>
        </div>
      </div>
    </div>
  );
};
