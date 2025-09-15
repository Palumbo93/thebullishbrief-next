"use client";

import React from 'react';
import { useAuthorBySlug } from '../hooks/useAuthorBySlug';
import { AuthorPage } from './AuthorPage';
import { PageSkeleton } from '@/components/PageSkeleton';

interface AuthorPageClientProps {
  slug: string;
}

export const AuthorPageClient: React.FC<AuthorPageClientProps> = ({ slug }) => {
  const { author, error, isLoading } = useAuthorBySlug(slug);
  
  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh' }}>
        <PageSkeleton type="list" />
      </div>
    );
  }
  
  if (error || !author) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 'var(--space-6)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)'
          }}>
            Author Not Found
          </h1>
          <p style={{ 
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-6)'
          }}>
            The author you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }
  
  return <AuthorPage authorSlug={slug} />;
};
