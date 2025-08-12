import React from 'react';
import { Paperclip, Image, File as FileIcon, X } from 'lucide-react';

/**
 * MessageInput handles new message input and file uploads.
 * @param value - The current message input value.
 * @param onChange - Handler for input value change.
 * @param onSend - Handler for sending a message.
 * @param onFileSelect - Handler for file selection.
 * @param fileUploads - Array of file upload objects.
 * @param onRemoveFile - Handler to remove a file upload.
 * @param disabled - Whether the input is disabled.
 * @param textareaRef - Ref for the textarea (for auto-resize).
 * @param fileInputRef - Ref for the file input.
 */
export interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
}

export interface MessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileUploads: FileUpload[];
  onRemoveFile: (file: File) => void;
  disabled?: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onFileSelect,
  fileUploads,
  onRemoveFile,
  disabled,
  textareaRef,
  fileInputRef
}) => {
  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);
  return (
    <>
      {/* File Upload Progress */}
      {fileUploads.length > 0 && (
        <div style={{ 
          padding: 'var(--space-6) var(--space-6) var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}>
          {fileUploads.map((upload, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              background: 'rgba(20, 20, 20, 0.3)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(31, 31, 31, 0.3)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {upload.file.type.startsWith('image/') ? (
                  <Image style={{ width: '20px', height: '20px', color: 'var(--color-brand-primary)' }} />
                ) : (
                  <FileIcon style={{ width: '20px', height: '20px', color: 'var(--color-brand-primary)' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 'var(--space-1)'
                }}>{upload.file.name}</p>
                <div style={{
                  width: '100%',
                  background: 'rgba(20, 20, 20, 0.5)',
                  borderRadius: 'var(--radius-full)',
                  height: '8px'
                }}>
                  <div 
                    style={{ 
                      background: 'var(--color-brand-primary)',
                      height: '8px',
                      borderRadius: 'var(--radius-full)',
                      transition: 'all 300ms',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      width: `${upload.progress}%`
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(upload.file)}
                style={{
                  width: '32px',
                  height: '32px',
                  color: 'var(--color-text-muted)',
                  transition: 'color var(--transition-base)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-error)';
                  e.currentTarget.style.background = 'rgba(20, 20, 20, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Message Input Container */}
      <div style={{ padding: 'var(--space-6)' }}>
        <div style={{
          background: 'var(--color-bg-secondary)',
          border: '0.5px solid rgba(31, 31, 31, 0.1)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={disabled ? "Sign in to chat" : "Share your thoughts..."}
            style={{
              width: '100%',
              padding: '0',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              transition: 'all 200ms',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'text',
              minHeight: '40px',
              maxHeight: '400px'
            }}
            className="hide-scrollbar"
            rows={1}
            disabled={disabled}
          />
          
          {/* Action Buttons Container */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(20, 20, 20, 0.6)',
                color: 'var(--color-text-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms',
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: '1px solid rgba(31, 31, 31, 0.4)',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'rgba(20, 20, 20, 0.8)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'rgba(20, 20, 20, 0.6)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
              title="Attach file"
            >
              <Paperclip style={{ width: '16px', height: '16px' }} />
            </button>
            
            {/* Send Button */}
            <button
              onClick={onSend}
              disabled={!value.trim() || disabled}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms',
                opacity: (!value.trim() || disabled) ? 0.4 : 1,
                cursor: (!value.trim() || disabled) ? 'not-allowed' : 'pointer',
                transform: 'scale(1)',
                border: value.trim() && !disabled ? 'none' : '1px solid rgba(31, 31, 31, 0.4)',
                background: value.trim() && !disabled ? 'var(--color-brand-primary)' : 'rgba(20, 20, 20, 0.6)',
                color: value.trim() && !disabled ? '#000000' : 'var(--color-text-primary)'
              }}
              onMouseEnter={(e) => {
                if (value.trim() && !disabled) {
                  e.currentTarget.style.background = '#f5f5f5';
                  e.currentTarget.style.transform = 'scale(1.05)';
                } else if (!disabled) {
                  e.currentTarget.style.background = 'rgba(20, 20, 20, 0.8)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (value.trim() && !disabled) {
                  e.currentTarget.style.background = 'var(--color-brand-primary)';
                  e.currentTarget.style.transform = 'scale(1)';
                } else if (!disabled) {
                  e.currentTarget.style.background = 'rgba(20, 20, 20, 0.6)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
              title="Send message"
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
        
        {/* Disabled State Message */}
        {disabled && (
          <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-medium)'
            }}>Sign in to join the conversation</p>
          </div>
        )}
      </div>
    </>
  );
}; 