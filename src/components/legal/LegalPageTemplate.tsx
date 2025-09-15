import React from 'react';
import type { LegalDocument } from '../../data/legal/types';
import { PublicationHeader } from '../PublicationHeader';
import { legalDocuments } from '../../data/legal';
import { LegalFooter } from '../LegalFooter';

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
  // Create legal pages array for navigation
  const legalPages = Object.entries(legalDocuments).map(([slug, document]) => ({
    id: slug,
    name: document.title,
    slug: slug,
    active: slug === doc.slug
  }));

  return (
    <div>
    <div style={{
      minHeight: '80vh',
      background: 'var(--color-bg-primary)',
    }}>
      {/* Header with Legal Page Navigation */}
      <PublicationHeader
        variant="full"
        listType="legal"
        legalPages={legalPages}
        activeItem={doc.slug}
        showTicker={false}
      />

      {/* Content Container */}
      <div style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-4)'
      }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: 'var(--text-4xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-6)',
          textAlign: 'center'
        }}>
          {doc.title}
        </h1>

        {/* Effective Date Banner */}
        {(doc.effectiveDate || doc.updatedDate) && (
          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)'
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
                padding: '4px 12px',
                borderRadius: '999px',
                border: '0.5px solid var(--color-border-primary)'
              }}>
                Updated {new Date(doc.updatedDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Document Sections */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-8)'
        }}>
          {doc.sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              style={{
                padding: 'var(--space-6)',
                background: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-primary)',
                transition: 'all var(--transition-base)'
              }}
            >
              <h2 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-4)',
                marginTop: 0
              }}>
                {section.title}
              </h2>
              <div
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.7
                }}
                dangerouslySetInnerHTML={{ __html: formatContent(section.body) }}
              />
            </section>
          ))}
        </div>
      </div>
      </div>
      {/* Footer */}
      <LegalFooter />
    </div>
  );
};
