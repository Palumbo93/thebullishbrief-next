"use client";

import React, { useState, useEffect } from 'react';
import { Search, Copy, ArrowRight, Play, AlertCircle, X } from 'lucide-react';
import { PromptModal } from '../components/aivault/PromptModal';

import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { usePrompts } from '../hooks/usePrompts';
import { Prompt, PromptField } from '../services/database';
import { LegalFooter } from '../components/LegalFooter';

interface PromptWithFields extends Prompt {
  fields: PromptField[];
}

interface AIVaultProps {
  onCreateAccountClick?: () => void;
}

export const AIVault: React.FC<AIVaultProps> = ({ onCreateAccountClick }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptWithFields | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const { prompts, categories, loading, error, getPromptsByCategory, getPromptFields, resetPrompts } = usePrompts();

  // Handle category selection
  useEffect(() => {
    if (selectedCategory !== 'All') {
      const category = categories.find(c => c.name === selectedCategory);
      if (category) {
        getPromptsByCategory(category.id);
      }
    } else {
      resetPrompts();
    }
  }, [selectedCategory]);

  // Get category names for filtering
  const categoryNames = ['All', ...categories.map(c => c.name)];

  // Filter prompts based on category
  const filteredPrompts = prompts.filter(prompt => {
    const matchesCategory = selectedCategory === 'All' || (prompt as any).ai_prompt_categories?.name === selectedCategory;
    return matchesCategory;
  });

  const handleCopyPrompt = async (prompt: Prompt) => {
    // Check if user is authenticated
    if (!user) {
      onCreateAccountClick?.();
      return;
    }
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      toast.success('Prompt copied to clipboard');
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      toast.error('Failed to copy prompt. Please try again.');
    }
  };

  const handleUsePrompt = async (prompt: Prompt) => {
    // Check if user is authenticated
    if (!user) {
      onCreateAccountClick?.();
      return;
    }

    try {
      const fields = await getPromptFields(prompt.id);
      const promptWithFields: PromptWithFields = {
        ...prompt,
        fields
      };
      setSelectedPrompt(promptWithFields);
      setShowPromptModal(true);
    } catch (err) {
      console.error('Failed to load prompt fields:', err);
    }
  };

  return (
    <section style={{ padding: 0 }}>
      <div style={{ minHeight: '100vh' }}>
        {/* Category Filters - Sticky Header */}
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          background: 'var(--color-bg-primary)', 
          borderBottom: '0.5px solid var(--color-border-primary)',
          padding: 'var(--space-4) var(--content-padding)',
          zIndex: 10
        }}>
          <div className="hide-scrollbar-horizontal" style={{ 
            display: 'flex', 
            gap: 'var(--space-2)', 
            overflowX: 'auto'
          }}>
            {categoryNames.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-ghost'}`}
                style={{ 
                  fontSize: 'var(--text-sm)',
                  whiteSpace: 'nowrap',
                  borderRadius: 'var(--radius-full)',
                  padding: 'var(--space-2) var(--space-4)',
                  minHeight: '32px'
                }}
              >
                {category}
                {category !== 'All' && (
                  <span style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--text-xs)', opacity: 0.7 }}>
                    {prompts.filter(p => (p as any).ai_prompt_categories?.name === category).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-16) var(--content-padding)',
            color: 'var(--color-error)'
          }}>
            <AlertCircle style={{ width: '48px', height: '48px', margin: '0 auto var(--space-4)' }} />
            <h3 style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: 'var(--font-bold)',
              marginBottom: 'var(--space-2)',
              color: 'var(--color-text-primary)'
            }}>
              Error loading prompts
            </h3>
            <p style={{ color: 'var(--color-text-tertiary)' }}>
              {error}
            </p>
          </div>
        )}

        {/* Loading State - Skeleton Grid */}
        {loading && (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: 0
          }}>
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={`skeleton-${index}`} style={{ 
                background: 'transparent',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 0,
                padding: 'var(--space-6)',
                height: '280px'
              }}>
                {/* Title Skeleton */}
                <div style={{
                  width: '80%',
                  height: '20px',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--space-3)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                
                {/* Category Skeleton */}
                <div style={{
                  width: '60px',
                  height: '16px',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: 'var(--space-3)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />

                {/* Description Skeleton */}
                <div style={{
                  width: '100%',
                  height: '14px',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--space-2)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                <div style={{
                  width: '75%',
                  height: '14px',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--space-2)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                <div style={{
                  width: '50%',
                  height: '14px',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
              </div>
            ))}
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }
        `}</style>

        {/* Prompts Grid */}
        {!loading && !error && (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: 0
          }}>
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} style={{ 
                background: 'transparent',
                borderBottom: '0.5px solid var(--color-border-primary)',
                borderRight: '0.5px solid var(--color-border-primary)',
                borderRadius: 0,
                padding: 'var(--space-6)',
                cursor: 'pointer',
                transition: 'all var(--transition-slow)',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onClick={() => handleUsePrompt(prompt)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--color-border-primary)';
              }}
              >
                {/* Header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    <h3 style={{
                      fontSize: 'var(--text-lg)',
                      fontFamily: 'var(--font-editorial)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 'var(--leading-tight)',
                      letterSpacing: '-0.02em',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {prompt.title}
                    </h3>
                    
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-brand-primary)',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-full)',
                      whiteSpace: 'nowrap',
                      fontWeight: 'var(--font-medium)',
                      flexShrink: 0
                    }}>
                      {prompt.fields?.length || 0} field{prompt.fields?.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--leading-relaxed)',
                    fontFamily: 'var(--font-primary)',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    marginBottom: 'var(--space-3)'
                  }}>
                    {prompt.description}
                  </p>
                </div>

                {/* Footer */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginTop: 'auto'
                }}>
                  {/* Category */}
                  <div style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)',
                    fontWeight: 'var(--font-medium)'
                  }}>
                    {(prompt as any).ai_prompt_categories?.name || 'Uncategorized'}
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyPrompt(prompt);
                    }}
                    className={user ? "btn btn-ghost" : "btn btn-ghost"}
                    style={{ 
                      padding: 'var(--space-2)', 
                      fontSize: 'var(--text-xs)',
                      opacity: user ? 1 : 0.6,
                      borderRadius: 'var(--radius-lg)',
                      minWidth: 'auto'
                    }}
                    title={user ? "Copy prompt" : "Sign up to copy prompt"}
                  >
                    <Copy style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPrompts.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-16) var(--content-padding)',
            color: 'var(--color-text-tertiary)'
          }}>
            <h3 style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: 'var(--font-bold)', 
              marginBottom: 'var(--space-2)',
              color: 'var(--color-text-secondary)'
            }}>
              No prompts found
            </h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {selectedCategory !== 'All' 
                ? 'Try adjusting your filters'
                : 'No prompts available yet'
              }
            </p>
          </div>
        )}

        {/* Modals */}
        {showPromptModal && selectedPrompt && (
          <PromptModal
            prompt={selectedPrompt}
            onClose={() => {
              setShowPromptModal(false);
              setSelectedPrompt(null);
            }}
          />
        )}


      </div>
      
      <LegalFooter />
    </section>
  );
};

export default AIVault;