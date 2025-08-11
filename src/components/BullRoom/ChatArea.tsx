import React from 'react';
import { MessageSquare, File } from 'lucide-react';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { MessageReactions } from './MessageReactions';

/**
 * ChatArea displays the list of messages for the current room.
 * @param messages - Array of messages to display.
 * @param userId - The current user's ID for message alignment.
 */
export interface ChatAreaProps {
  messages: BullRoomMessage[];
  userId: string | undefined;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string, username: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Function to detect and link tickers in text
const linkTickers = (text: string) => {
  // Regex to match $TICKER patterns (1-5 uppercase letters after $)
  const tickerRegex = /\$([A-Z]{1,5})\b/g;
  
  return text.replace(tickerRegex, (match, ticker) => {
    const googleFinanceUrl = `https://www.google.com/search?q=${ticker}+stock`;
    return `<a href="${googleFinanceUrl}" target="_blank" rel="noopener noreferrer" class="text-brand font-bold hover:text-brand/80">${match}</a>`;
  });
};

const renderMessageContent = (message: BullRoomMessage) => {
  switch (message.message_type) {
    case 'image':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <img 
            src={message.file_data?.url} 
            alt={message.content}
            style={{
              maxWidth: '100%',
              borderRadius: 'var(--radius-xl)',
              maxHeight: '320px',
              objectFit: 'cover',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          />
          {message.content && (
            <p style={{
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-relaxed)',
              opacity: 0.9
            }}>{message.content}</p>
          )}
        </div>
      );
    case 'file':
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: 'rgba(20, 20, 20, 0.2)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(31, 31, 31, 0.2)'
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
            <File style={{ 
              width: '20px', 
              height: '20px', 
              color: 'var(--color-brand-primary)' 
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: 'var(--space-1)'
            }}>{message.content}</p>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'rgba(153, 153, 153, 0.7)',
              fontWeight: 'var(--font-medium)'
            }}>{formatFileSize(message.file_data?.size || 0)}</p>
          </div>
        </div>
      );
    default:
      return (
        <div style={{ lineHeight: 'var(--leading-relaxed)' }}>
          <p 
            style={{
              fontSize: 'var(--text-sm)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-words',
              lineHeight: '24px'
            }}
            dangerouslySetInnerHTML={{ __html: linkTickers(message.content) }}
          />
        </div>
      );
  }
};

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  userId, 
  onAddReaction, 
  onRemoveReaction,
  onReply,
  onEdit,
  onDelete
}) => {
  const [hoveredMessageId, setHoveredMessageId] = React.useState<string | null>(null);
  
  // Reverse messages to show oldest first (proper chat order)
  const reversedMessages = [...messages].reverse();
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      padding: 'var(--space-6) 0',
      paddingBottom: '180px', // Space for floating message input
      display: 'flex',
      flexDirection: 'column-reverse'
    }} className="hide-scrollbar">
      {messages.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(20, 20, 20, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-6)'
          }}>
            <MessageSquare style={{ 
              width: '32px', 
              height: '32px', 
              color: 'var(--color-text-muted)' 
            }} />
          </div>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>Welcome to the Bull Room</h3>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            maxWidth: '384px'
          }}>
            Connect with traders, share insights, and stay ahead of the market
          </p>
        </div>
      ) : (
        <div>
          {reversedMessages.map((message, index) => {
            const isOwnMessage = message.user_id === userId;
            const showUsername = index === 0 || reversedMessages[index - 1]?.user_id !== message.user_id;
            
                                      return (
              <div key={message.id} style={{
                position: 'relative',
                padding: 'var(--space-2) var(--space-6)',
                transition: 'all var(--transition-base)',
                cursor: 'pointer'
              }} 
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                setHoveredMessageId(message.id);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                setHoveredMessageId(null);
              }}>
              {/* Username and timestamp */}
              {showUsername && (
                <div style={{
                  marginBottom: 'var(--space-1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-black)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {message.username || 'Anonymous'}
                  </span>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)'
                  }}>
                    {formatTime(message.created_at)}
                  </span>
                </div>
              )}
              
              {/* Message content */}
              <div style={{ maxWidth: '80%' }}>
                {renderMessageContent(message)}
              </div>
              
              {/* Reactions under message - always visible if they exist */}
              {onAddReaction && onRemoveReaction && Object.keys(message.reactions).length > 0 && (
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <MessageReactions
                    reactions={message.reactions}
                    messageId={message.id}
                    onAddReaction={onAddReaction}
                    onRemoveReaction={onRemoveReaction}
                    currentUserId={userId}
                    messageOwnerId={message.user_id}
                    showAllEmojis={false}
                    showCounts={true}
                  />
                </div>
              )}
                
                {/* Hover dock - different for own vs others' messages */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: 0,
                  opacity: hoveredMessageId === message.id ? 1 : 0,
                  transition: 'opacity 200ms',
                  pointerEvents: hoveredMessageId === message.id ? 'auto' : 'none'
                }}>
                  {isOwnMessage ? (
                    // Own message: reply, edit, delete
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid rgba(31, 31, 31, 0.3)',
                      borderRadius: 'var(--radius-full)',
                      padding: 'var(--space-2) var(--space-4)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}>
                      <button 
                        onClick={() => onReply?.(message.id, message.username || 'Anonymous')}
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-muted)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-md)',
                          transition: 'color var(--transition-base)',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-muted)';
                        }}
                      >
                        Reply
                      </button>
                      <button 
                        onClick={() => onEdit?.(message.id, message.content)}
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-muted)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-md)',
                          transition: 'color var(--transition-base)',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-muted)';
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete?.(message.id)}
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-error)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-md)',
                          transition: 'color var(--transition-base)',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-error)';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    // Others' messages: reactions and reply
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid rgba(31, 31, 31, 0.3)',
                      borderRadius: 'var(--radius-full)',
                      padding: 'var(--space-2) var(--space-4)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}>
                      {onAddReaction && onRemoveReaction && (
                        <MessageReactions
                          reactions={message.reactions}
                          messageId={message.id}
                          onAddReaction={onAddReaction}
                          onRemoveReaction={onRemoveReaction}
                          currentUserId={userId}
                          messageOwnerId={message.user_id}
                          showAllEmojis={true}
                          showCounts={false}
                        />
                      )}
                      <button 
                        onClick={() => onReply?.(message.id, message.username || 'Anonymous')}
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-muted)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-md)',
                          transition: 'color var(--transition-base)',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-muted)';
                        }}
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 