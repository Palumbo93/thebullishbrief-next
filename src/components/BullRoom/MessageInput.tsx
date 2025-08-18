import React from 'react';
import { Paperclip, Image, File as FileIcon, X } from 'lucide-react';
import { ReplyPreview } from './ReplyPreview';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useTheme } from '../../contexts/ThemeContext';

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
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  replyingTo?: {
    messageId: string;
    username: string;
    content: string;
  } | null;
  onCancelReply?: () => void;
  user?: any; // Add user prop for better placeholder text
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
  fileInputRef,
  replyingTo,
  onCancelReply,
  user
}) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  // Use design system variables instead of hardcoded colors
  
  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);
  return (
    <>
      {/* Reply Preview */}
      {replyingTo && onCancelReply && (
        <ReplyPreview
          username={replyingTo.username}
          content={replyingTo.content}
          onCancel={onCancelReply}
        />
      )}
      
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
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border-secondary)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-bg-secondary)',
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
                  background: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-full)',
                  height: '8px'
                }}>
                  <div 
                    style={{ 
                      background: 'var(--color-brand-primary)',
                      height: '8px',
                      borderRadius: 'var(--radius-full)',
                      transition: 'all 300ms',
                      boxShadow: 'var(--shadow-sm)',
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
                  e.currentTarget.style.background = 'var(--color-bg-card)';
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
      <div style={{ padding: '2px var(--space-2) var(--space-6) var(--space-2)' }}>
        <div style={{
          background: 'var(--color-bg-secondary)',
          border: '0.5px solid var(--color-border-primary)',
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
              // On mobile: Enter creates new line, only send button sends message
              // On desktop: Enter sends message, Shift+Enter creates new line
              if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={
              disabled 
                ? (!user ? "Sign in to chat" : "Select a room to chat...")
                : "Share your thoughts..."
            }
            style={{
              width: '100%',
              padding: '0',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: 'var(--text-input)',
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
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms',
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: '1px solid var(--color-border-secondary)',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--color-bg-tertiary)';
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
              disabled={(!value.trim() && fileUploads.length === 0) || disabled}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms',
                border: (value.trim() || fileUploads.length > 0) && !disabled ? 'none' : '1px solid var(--color-border-secondary)',
                background: (value.trim() || fileUploads.length > 0) && !disabled ? 'var(--color-brand-primary)' : 'var(--color-bg-tertiary)',
                color: (value.trim() || fileUploads.length > 0) && !disabled ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  if (value.trim() || fileUploads.length > 0) {
                    // Primary button hover (when ready to send)
                    e.currentTarget.style.filter = 'brightness(0.97)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  } else {
                    // Tertiary button hover (when not ready)
                    e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  if (value.trim() || fileUploads.length > 0) {
                    // Reset primary button
                    e.currentTarget.style.filter = 'none';
                    e.currentTarget.style.transform = 'scale(1)';
                  } else {
                    // Reset tertiary button
                    e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
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
          accept="image/*"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
        

      </div>
    </>
  );
}; 