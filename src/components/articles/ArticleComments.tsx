"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, MessageSquare, Reply, Edit, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { useArticleComments, useCreateComment, useDeleteComment, useAddReaction, useRemoveReaction } from '../../hooks/useArticleComments';
import { AuthorAvatarImage } from '../ui/OptimizedImage';
import { Comment } from '../../types/comment.types';
import { useConfirm } from '../../hooks/useConfirm';
import { useViewportHeightOnly } from '../../hooks/useViewportHeight';
import { useTrackUserActions } from '../../hooks/useClarityAnalytics';

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

interface ArticleCommentsProps {
  articleId: string;
  articleTitle: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onCreateAccountClick?: () => void;
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  replyingTo: string | null;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReaction: (commentId: string, reactionType: string) => void;
  onCancelReply: () => void;
  currentUserId?: string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth = 0,
  replyingTo,
  onReply,
  onDelete,
  onReaction,
  onCancelReply,
  currentUserId
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isOwnComment = comment.user_id === currentUserId;
  const isReplying = replyingTo === comment.id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{
      marginLeft: `${depth * 24}px`,
      paddingLeft: depth > 0 ? 'var(--space-3)' : '0',
      marginBottom: 'var(--space-4)'
    }}>
      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'flex-start'
      }}>
        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          background: 'transparent',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text-primary)',
          flexShrink: 0,
          border: '1px solid var(--color-border-secondary)'
        }}>
          {comment.user?.avatar_url ? (
            <AuthorAvatarImage 
              src={comment.user.avatar_url} 
              alt={comment.user.username}
              size="sm"
            />
          ) : (
            getUserInitials(comment.user?.username || 'User')
          )}
        </div>

        {/* Comment Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-2)', 
            marginBottom: 'var(--space-1)' 
          }}>
            <span style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {comment.user?.username || 'User'}
            </span>
            <span style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)'
            }}>
              {formatDate(comment.created_at)}
              {comment.is_edited && ' (edited)'}
            </span>
          </div>

          {/* Comment Text */}
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            wordBreak: 'break-word',
            marginBottom: 'var(--space-2)'
          }}>
            {comment.content}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={() => onReply(comment.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                padding: 'var(--space-1)',
                borderRadius: 'var(--radius-sm)',
                transition: 'all var(--transition-base)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-tertiary)';
              }}
            >
              <Reply style={{ width: '12px', height: '12px' }} />
              Reply
            </button>

            {/* Reactions */}
            {['like', 'dislike'].map((reactionType) => {
              const count = comment.reaction_counts?.[reactionType] || 0;
              const hasReaction = comment.user_reactions?.includes(reactionType);
              
              return (
                <button
                  key={reactionType}
                  onClick={() => onReaction(comment.id, reactionType)}
                  style={{
                    background: hasReaction ? 'var(--color-brand-primary)' : 'var(--color-bg-tertiary)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: 'var(--space-1) var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    color: hasReaction ? 'white' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    transition: 'all var(--transition-base)'
                  }}
                >
                  {reactionType === 'like' && <ThumbsUp style={{ width: '10px', height: '10px' }} />}
                  {reactionType === 'dislike' && <ThumbsDown style={{ width: '10px', height: '10px' }} />}
                  {count > 0 && count}
                </button>
              );
            })}

            {/* Delete for own comments */}
            {isOwnComment && (
              <button
                  onClick={() => onDelete(comment.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-error)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    padding: 'var(--space-1)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all var(--transition-base)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-bg-error)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-error)';
                  }}
                >
                  <Trash2 style={{ width: '12px', height: '12px' }} />
                  Delete
                </button>
            )}
          </div>

          {/* Show replies toggle */}
          {hasReplies && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                marginTop: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)'
              }}
            >
              {showReplies ? 'Hide' : 'Show'} {comment.replies?.length} replies
            </button>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {hasReplies && showReplies && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              replyingTo={replyingTo}
              onReply={onReply}
              onDelete={onDelete}
              onReaction={onReaction}
              onCancelReply={onCancelReply}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ArticleComments: React.FC<ArticleCommentsProps> = ({ 
  articleId, 
  articleTitle, 
  isExpanded, 
  onToggleExpanded,
  onCreateAccountClick
}) => {
  const { user } = useAuth();
  const confirm = useConfirm();
  const viewportHeight = useViewportHeightOnly();
  const isMobile = useIsMobile();
  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // The articleId passed in is already the UUID, no need to fetch article data
  
  // Remove the body scroll locking - it's preventing article scrolling
  // useEffect(() => {
  //   if (isExpanded) {
  //     // Store original body styles
  //     const originalStyle = window.getComputedStyle(document.body);
  //     const scrollY = window.scrollY;
  //     
  //     // Lock body scroll
  //     document.body.style.position = 'fixed';
  //     document.body.style.top = `-${scrollY}px`;
  //     document.body.style.width = '100%';
  //     document.body.style.overflow = 'hidden';
  //     
  //     // Restore scroll position when panel closes
  //     return () => {
  //       document.body.style.position = '';
  //       document.body.style.top = '';
  //       document.body.style.width = '';
  //       document.body.style.overflow = '';
  //       window.scrollTo(0, scrollY);
  //     };
  //   }
  // }, [isExpanded]);
  
  // Fetch comments using the article UUID - only when expanded
  const { 
    data: comments = [], 
    isLoading: commentsLoading, 
    error: commentsError 
  } = useArticleComments(articleId, isExpanded);

  // Mutations
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  
  // Analytics tracking
  const { trackComment } = useTrackUserActions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-resize textarea function
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // Auto-resize textarea when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    createComment.mutate({
      article_id: articleId,
      content: message.trim(),
      parent_id: replyingTo || undefined
    });

    // Track comment post analytics
    trackComment('article', articleId);

    setMessage('');
    setReplyingTo(null);
    
    // Reset textarea height after sending
    if (inputRef.current) {
      inputRef.current.style.height = '40px';
    }
    inputRef.current?.focus();
  };



  const handleDeleteComment = (commentId: string) => {
    confirm.danger(
      'Delete Comment',
      'Are you sure you want to delete this comment? This action cannot be undone.',
      async () => {
        deleteComment.mutate(commentId);
      }
    );
  };

  const handleReaction = (commentId: string, reactionType: string) => {
    if (!user) return;
    
    // Check if user already has this reaction
    const comment = comments.find(c => c.id === commentId);
    const hasReaction = comment?.user_reactions?.includes(reactionType);
    
    if (hasReaction) {
      removeReaction.mutate({ commentId, reactionType });
    } else {
      addReaction.mutate({ commentId, reactionType });
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const getReplyingToComment = () => {
    if (!replyingTo) return null;
    return comments.find(c => c.id === replyingTo);
  };

  if (!isExpanded) {
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        right: 0,
        transform: 'translateY(-50%)',
        zIndex: 'var(--z-modal)',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed'
      }}>
        <button
          onClick={onToggleExpanded}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4) var(--space-3)',
            background: 'var(--color-bg-primary)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            writingMode: 'horizontal-tb',
            minHeight: '120px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
          }}
        >
          <MessageSquare style={{ width: '20px', height: '20px', color: 'var(--color-brand-primary)' }} />
          <span style={{ 
            fontSize: 'var(--text-xs)', 
            fontWeight: 'var(--font-medium)',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            letterSpacing: '0.05em'
          }}>
            Comments ({comments.length})
          </span>
        </button>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      background: 'var(--color-bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Comments Header */}
      <div style={{
        padding: 'var(--space-4)',
        borderBottom: '0.5px solid var(--color-border-primary)',
        background: 'var(--color-bg-primary)',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <MessageSquare style={{ width: '16px', height: '16px', color: 'var(--color-brand-primary)' }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
            Comments ({comments.length})
          </span>
        </div>
        
        <button
          onClick={onToggleExpanded}
          style={{
            padding: 'var(--space-1)',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-base)',
            transition: 'all var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-tertiary)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-tertiary)';
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* Comments List */}
      <div className="" style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        minHeight: 0,
        position: 'relative'
      }}>
        {commentsLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid var(--color-border-primary)',
              borderTop: '3px solid var(--color-brand-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto var(--space-4)'
            }} />
            <p style={{ color: 'var(--color-text-tertiary)' }}>Loading comments...</p>
          </div>
        ) : commentsError ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-error)' }}>
            <p>Failed to load comments</p>
          </div>
        ) : comments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-12)', 
            color: 'var(--color-text-tertiary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-2)'
            }}>
              <MessageSquare style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-editorial)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-normal)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
              No comments yet
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: '200px' }}>
              Be the first to share your thoughts on this article
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replyingTo={replyingTo}
              onReply={handleReply}
              onDelete={handleDeleteComment}
              onReaction={handleReaction}
              onCancelReply={handleCancelReply}
              currentUserId={user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Comment Input */}
      {user ? (
        <form onSubmit={(e) => {
          e.preventDefault(); // Always prevent form submission
        }} style={{
          padding: 'var(--space-4)',
          paddingBottom: isMobile ? 'calc(var(--space-4) + env(safe-area-inset-bottom, 0))' : 'var(--space-4)',
          background: 'var(--color-bg-primary)',
          flexShrink: 0
        }}>
          {/* Reply indicator */}
          {replyingTo && (
            <div style={{
              padding: 'var(--space-3)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-3)',
              border: '1px solid var(--color-border-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Reply style={{ width: '14px', height: '14px', color: 'var(--color-text-tertiary)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                    Replying to <strong>{getReplyingToComment()?.user?.username || 'comment'}</strong>
                  </span>
                </div>
                <button
                  onClick={handleCancelReply}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-error)',
                    cursor: 'pointer',
                    padding: 'var(--space-1)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}

              placeholder={replyingTo ? "Write a reply..." : "Share your thoughts..."}
              style={{
                width: '100%',
                padding: '0',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 'max(var(--text-sm), 16px)', // Prevent zoom on mobile
                color: 'var(--color-text-primary)',
                fontFamily: 'inherit',
                minHeight: '40px',
                maxHeight: '400px',
                lineHeight: 'var(--leading-relaxed)'
              }}
              rows={1}
            />
            
            {/* Action Buttons Container */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!message.trim() || createComment.isPending}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--transition-base)',
                  cursor: message.trim() && !createComment.isPending ? 'pointer' : 'not-allowed',
                  opacity: message.trim() && !createComment.isPending ? 1 : 0.4,
                  background: message.trim() && !createComment.isPending ? 'white' : 'var(--color-bg-tertiary)',
                  color: message.trim() && !createComment.isPending ? 'black' : 'var(--color-text-primary)',
                  border: message.trim() && !createComment.isPending ? 'none' : '1px solid var(--color-border-primary)'
                }}
                title="Send comment"
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{
          padding: 'var(--space-4)',
          paddingBottom: isMobile ? 'calc(var(--space-4) + env(safe-area-inset-bottom, 0))' : 'var(--space-4)',
          borderTop: '0.5px solid var(--color-border-primary)',
          background: 'var(--color-bg-primary)',
          textAlign: 'center',
          flexShrink: 0
        }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>
            Sign up to join the discussion
          </p>
          <button 
            onClick={() => {
              onCreateAccountClick?.();
            }}
            className="btn btn-primary" 
            style={{ fontSize: 'var(--text-sm)', width: '100%' }}
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
};