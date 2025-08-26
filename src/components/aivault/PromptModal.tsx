import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Play, Download, AlertCircle, ArrowLeft } from 'lucide-react';

import { PromptField } from '../../services/database';
import { useToast } from '../../hooks/useToast';
import { useViewportHeightOnly } from '../../hooks/useViewportHeight';
import { FULL_HEIGHT_BACKDROP_CSS, FULL_HEIGHT_DRAWER_CSS } from '../../utils/viewportUtils';
import { useTrackPromptInteractions } from '../../hooks/useClarityAnalytics';

interface PromptWithFields {
  id: string;
  title: string;
  description: string;
  content: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  ai_prompt_categories?: {
    id: string;
    name: string;
    description?: string;
  };
  intended_llm: string;
  original_credit: string;
  fields: PromptField[];
}

interface PromptModalProps {
  prompt: PromptWithFields;
  onClose: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({ prompt, onClose }) => {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const viewportHeight = useViewportHeightOnly();
  
  // Analytics tracking
  const { trackPromptCopied, trackPromptDownloaded } = useTrackPromptInteractions();

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Generate the prompt preview with highlighted fields
  const generatePromptPreview = () => {
    let preview = prompt.content;
    
    // Replace placeholders with field values or highlighted placeholders
    prompt.fields.forEach(field => {
      const placeholder = `[${field.label.toUpperCase().replace(/\s+/g, '_')}]`;
      const value = fieldValues[field.id];
      
      if (value) {
        // Use actual value
        preview = preview.split(placeholder).join(value);
      } else {
        // Highlight the placeholder
        preview = preview.split(placeholder).join(`<span class="highlight-field">${placeholder}</span>`);
      }
    });

    return preview;
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const copyToClipboard = async () => {
    // Create a temporary element to extract text content from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = promptPreview;
    const textToCopy = tempDiv.textContent || tempDiv.innerText || promptPreview;
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        toast.success('Prompt copied to clipboard');
        
        // Track prompt copied analytics
        trackPromptCopied(prompt.id, prompt.title);
      } else {
        // Fallback for older browsers/mobile
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          toast.success('Prompt copied to clipboard');
          
          // Track prompt copied analytics
          trackPromptCopied(prompt.id, prompt.title);
        } else {
          throw new Error('execCommand copy failed');
        }
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy prompt. Please try again.');
    }
  };

  const downloadPrompt = () => {
    // Create a temporary element to extract text content from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = promptPreview;
    const textToDownload = tempDiv.textContent || tempDiv.innerText || promptPreview;
    
    try {
      const element = document.createElement('a');
      const file = new Blob([textToDownload], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${prompt.title.replace(/\s+/g, '_').toLowerCase()}_prompt.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Prompt downloaded successfully');
      
      // Track prompt downloaded analytics
      trackPromptDownloaded(prompt.id, prompt.title);
    } catch (err) {
      console.error('Failed to download prompt:', err);
      toast.error('Failed to download prompt. Please try again.');
    }
  };

  const resetForm = () => {
    setFieldValues({});
    setValidationErrors({});
  };

  const promptPreview = generatePromptPreview();

  return (
    <>
      <style>{`
        .prompt-modal-backdrop {
          ${FULL_HEIGHT_BACKDROP_CSS}
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: stretch;
          justify-content: stretch;
          padding: 0;
        }
        .prompt-modal-container {
          background: var(--color-bg-primary);
          border: none;
          border-radius: 0;
          width: 100vw;
          height: 100vh;
          max-width: none;
          max-height: none;
          position: relative;
          overflow: hidden;
          box-shadow: none;
          display: flex;
        }
        
                 /* Mobile styles */
         @media (max-width: 767px) {
           .prompt-modal-backdrop {
             padding: 0;
             align-items: stretch;
             justify-content: stretch;
             overflow: hidden;
           }
           .prompt-modal-container {
             ${FULL_HEIGHT_DRAWER_CSS}
             width: 100vw;
             max-width: none;
             max-height: none;
             border-radius: 0;
             border: none;
             box-shadow: none;
             flex-direction: column;
             overflow: hidden;
           }
           .prompt-modal-content {
             overflow-y: auto;
             overflow-x: hidden;
           }
         }
      `}</style>

      <div 
        className="prompt-modal-backdrop"
        style={{
          // Use JavaScript-calculated height as fallback for Safari
          height: `${viewportHeight}px`
        }}
      >
        <div className="prompt-modal-container">
          {/* Desktop: Left Column - Form */}
          <div style={{
            width: '500px',
            borderRight: '0.5px solid var(--color-border-primary)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'sticky',
            top: 0
          }}
          className="mobile-only:hidden"
          >
            {/* Header */}
            <div style={{
              padding: 'var(--space-6)',
              borderBottom: '0.5px solid var(--color-border-primary)',
              background: 'var(--color-bg-primary)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)'
              }}>
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'background var(--transition-base), color var(--transition-base)'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  aria-label="Close"
                >
                  <ArrowLeft style={{ width: '24px', height: '24px' }} />
                </button>
                <h1 style={{
                  fontSize: 'var(--text-2xl)',
                  fontFamily: 'var(--font-editorial)',
                  fontWeight: 'var(--font-normal)',
                  margin: 0,
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-tight)',
                  letterSpacing: '-0.02em'
                }}>
                  {prompt.title}
                </h1>
              </div>

              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'var(--space-4)'
              }}>
                {prompt.description}
              </p>

              {/* Attribution */}
              <div style={{ 
                padding: 'var(--space-4)', 
                backgroundColor: 'var(--color-bg-secondary)', 
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span><strong>Intended LLM:</strong> {prompt.intended_llm}</span>
                    <span style={{ marginLeft: 'var(--space-4)' }}>
                      <strong>Credit:</strong> {prompt.original_credit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: 'var(--space-6)'
            }} className="hide-scrollbar">
              <h3 style={{ 
                fontSize: 'var(--text-xl)', 
                fontFamily: 'var(--font-editorial)',
                fontWeight: 'var(--font-normal)', 
                marginBottom: 'var(--space-6)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-tight)',
                letterSpacing: '-0.02em'
              }}>
                Fill in the Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {prompt.fields.map((field) => (
                  <div key={field.id}>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      {field.label}
                    </label>
                    
                    {field.field_type === 'textarea' ? (
                      <textarea
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        style={{
                          width: '100%',
                          padding: 'var(--space-4)',
                          background: 'var(--color-bg-secondary)',
                          border: 'none',
                          borderRadius: 'var(--radius-lg)',
                          color: 'var(--color-text-primary)',
                          fontSize: 'var(--text-sm)',
                          fontFamily: 'var(--font-primary)',
                          resize: 'vertical',
                          minHeight: '100px'
                        }}
                      />
                    ) : field.field_type === 'select' ? (
                      <select
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: 'var(--space-4)',
                          background: 'var(--color-bg-secondary)',
                          border: 'none',
                          borderRadius: 'var(--radius-lg)',
                          color: 'var(--color-text-primary)',
                          fontSize: 'var(--text-sm)',
                          fontFamily: 'var(--font-primary)'
                        }}
                      >
                        <option value="">{field.placeholder}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="input"
                        style={{
                          border: 'none',
                          padding: 'var(--space-4)',
                          background: 'var(--color-bg-secondary)',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: 'var(--text-sm)'
                        }}
                      />
                    )}
                    
                    {validationErrors[field.id] && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginTop: 'var(--space-2)',
                        color: 'var(--color-error)',
                        fontSize: 'var(--text-xs)'
                      }}>
                        <AlertCircle style={{ width: '14px', height: '14px' }} />
                        {validationErrors[field.id]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            {/* Reset Button */}
            <div style={{ 
              marginTop: 'var(--space-8)',
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              <button
                onClick={resetForm}
                className="btn btn-ghost"
                style={{ 
                  padding: 'var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Right Column - Prompt Preview */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          
        }}
        className="mobile-only:hidden hide-scrollbar"
        >
          <div style={{
            padding: 'var(--space-6)',
            maxWidth: '100%'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 'var(--space-6)'
            }}>
                             <h2 style={{ 
                 fontSize: 'var(--text-2xl)', 
                 fontFamily: 'var(--font-editorial)',
                 fontWeight: 'var(--font-normal)',
                 color: 'var(--color-text-primary)',
                 display: 'flex',
                 alignItems: 'center',
                 gap: 'var(--space-3)',
                 lineHeight: 'var(--leading-tight)',
                 letterSpacing: '-0.02em'
               }}>
                 Prompt Preview
               </h2>
              
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button
                  onClick={copyToClipboard}
                  className="btn btn-secondary"
                  style={{ 
                    padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                  title="Copy to clipboard"
                >
                  <Copy style={{ width: '16px', height: '16px' }} />
                  <span>Copy</span>
                </button>
                
                <button
                  onClick={downloadPrompt}
                  className="btn btn-secondary"
                  style={{ 
                    padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                  title="Download as text file"
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div style={{
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-primary)',
              whiteSpace: 'pre-wrap',
              minHeight: '400px',
              overflow: 'auto',
            }}
                         dangerouslySetInnerHTML={{ 
               __html: promptPreview.replace(/\n/g, '<br>')
             }}
            />
            <div style={{ height: 'var(--space-6)' }}></div>
          </div>
        </div>

        {/* Mobile: Single Column Layout */}
        <div 
          className="prompt-modal-content mobile-only:block hidden"
          style={{
            padding: '0px var(--content-padding) var(--space-6) var(--content-padding)',
            paddingBottom: 'calc(var(--space-6) + env(safe-area-inset-bottom, 0))'
          }}
        >
          {/* Mobile Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
            position: 'sticky',
            top: 0,
            background: 'var(--color-bg-primary)',
            padding: 'var(--space-4)',
            zIndex: 10,
            marginTop: 'calc(-1 * var(--space-6))',
            marginLeft: 'calc(-1 * var(--content-padding))',
            marginRight: 'calc(-1 * var(--content-padding))',
            width: 'calc(100% + 2 * var(--content-padding))'
          }}>
            <h1 style={{
              fontSize: 'var(--text-xl)',
              fontFamily: 'var(--font-editorial)',
              fontWeight: 'var(--font-normal)',
              margin: 0,
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: '-0.02em',
              flex: 1
            }}>
              {prompt.title}
            </h1>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-lg)',
                transition: 'background var(--transition-base)'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              aria-label="Close"
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>
          </div>

          {/* Mobile: Prompt Preview Section */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)'
            }}>
              <h2 style={{ 
                fontSize: 'var(--text-lg)', 
                fontFamily: 'var(--font-editorial)',
                fontWeight: 'var(--font-normal)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-tight)',
                letterSpacing: '-0.02em'
              }}>
                Prompt Preview
              </h2>
              
                             <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                 <button
                   onClick={copyToClipboard}
                   className="btn btn-secondary"
                   style={{ 
                     padding: 'var(--space-3)',
                     fontSize: 'var(--text-xs)',
                     borderRadius: '50%',
                     width: '40px',
                     height: '40px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}
                   title="Copy to clipboard"
                 >
                   <Copy style={{ width: '16px', height: '16px' }} />
                 </button>
                 
                 <button
                   onClick={downloadPrompt}
                   className="btn btn-secondary"
                   style={{ 
                     padding: 'var(--space-3)',
                     fontSize: 'var(--text-xs)',
                     borderRadius: '50%',
                     width: '40px',
                     height: '40px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}
                   title="Download as text file"
                 >
                   <Download style={{ width: '16px', height: '16px' }} />
                 </button>
               </div>
            </div>

            <div style={{
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-primary)',
              whiteSpace: 'pre-wrap',
              minHeight: '200px',
              maxHeight: '300px',
              overflow: 'auto'
            }}
            dangerouslySetInnerHTML={{ 
              __html: promptPreview.replace(/\n/g, '<br>')
            }}
            />
          </div>

          {/* Mobile: Form Section */}
          <div>
            <h3 style={{ 
              fontSize: 'var(--text-lg)', 
              fontFamily: 'var(--font-editorial)',
              fontWeight: 'var(--font-normal)', 
              marginBottom: 'var(--space-4)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: '-0.02em'
            }}>
              Fill in the Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {prompt.fields.map((field) => (
                <div key={field.id}>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    {field.label}
                  </label>
                  
                  {field.field_type === 'textarea' ? (
                    <textarea
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-primary)',
                        resize: 'vertical',
                        minHeight: '80px'
                      }}
                    />
                  ) : field.field_type === 'select' ? (
                    <select
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-primary)'
                      }}
                    >
                      <option value="">{field.placeholder}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="input"
                      style={{
                        border: 'none',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: 'var(--text-sm)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Reset Button */}
            <div style={{ 
              marginTop: 'var(--space-6)',
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              <button
                onClick={resetForm}
                className="btn btn-ghost"
                style={{ 
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                Reset
              </button>
            </div>
          </div>
                 </div>
       </div>
     </div>

     <style>{`
       .highlight-field {
         background: linear-gradient(120deg, var(--color-warning-bg) 0%, var(--color-info-bg) 100%);
         color: var(--color-warning);
         padding: 2px 6px;
         border-radius: 4px;
         font-weight: var(--font-semibold);
         border: 1px solid var(--color-warning-border);
         font-style: italic;
       }
       
       @media (max-width: 767px) {
         .mobile-only\\:block {
           display: block !important;
         }
         .mobile-only\\:hidden {
           display: none !important;
         }
       }
       
       @media (min-width: 768px) {
         .mobile-only\\:block {
           display: none !important;
         }
         .mobile-only\\:hidden {
           display: flex !important;
         }
       }
     `}</style>
   </>
  );
};