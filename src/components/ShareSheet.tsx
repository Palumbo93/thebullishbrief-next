import React, { useEffect, useRef } from 'react';
import { X, Twitter, Linkedin, MessageSquare, Share2, Copy, Check } from 'lucide-react';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onShare?: (platform: string) => void;
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  url: string;
  action: 'link' | 'copy';
}

export const ShareSheet: React.FC<ShareSheetProps> = ({
  isOpen,
  onClose,
  url,
  onShare
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const shareOptions: ShareOption[] = [
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: <Twitter size={20} />,
      color: '#1da1f2',
      url: `https://x.com/intent/tweet?text=${encodeURIComponent('Check out this article')}&url=${encodeURIComponent(url)}`,
      action: 'link'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin size={20} />,
      color: '#0077b5',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      action: 'link'
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: <MessageSquare size={20} />,
      color: '#34c759',
      url: `sms:&body=${encodeURIComponent(`Check out this article\n\n${url}`)}`,
      action: 'link'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <Share2 size={20} />,
      color: '#25d366',
      url: `https://wa.me/?text=${encodeURIComponent(`Check out this article\n\n${url}`)}`,
      action: 'link'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: <Share2 size={20} />,
      color: '#0088cc',
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this article')}`,
      action: 'link'
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: copied ? <Check size={20} /> : <Copy size={20} />,
      color: copied ? '#22c55e' : '#a3a3a3',
      url: '',
      action: 'copy'
    }
  ];

  const handleShare = async (option: ShareOption) => {
    // Track analytics share event
    onShare?.(option.id);
    
    if (option.action === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      window.open(option.url, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 2000,
          animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        }}
      />
      
      {/* Share Sheet */}
      <div
        ref={sheetRef}
        className="share-sheet-desktop"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--color-bg-card)',
          borderTop: '0.5px solid var(--color-border-primary)',
          borderTopLeftRadius: 'var(--radius-2xl)',
          borderTopRightRadius: 'var(--radius-2xl)',
          padding: 'var(--space-6)',
          zIndex: 2001,
          animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Handle - Only show on mobile */}
        <div
          className="share-sheet-handle-desktop"
          style={{
            width: '40px',
            height: '4px',
            background: 'var(--color-border-secondary)',
            borderRadius: 'var(--radius-full)',
            margin: '0 auto var(--space-6)',
            opacity: 0.6
          }}
        />
        
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-6)'
          }}
        >
          <h3
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0
            }}
          >
            Share Article
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-tertiary)';
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Share Options Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)'
          }}
        >
          {shareOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleShare(option)}
              style={{
                background: 'var(--color-bg-tertiary)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-2)',
                transition: 'all var(--transition-base)',
                animation: `slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
                transform: 'translateY(20px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                e.currentTarget.style.borderColor = option.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 25px rgba(0, 0, 0, 0.3)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  color: option.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-lg)',
                  background: `${option.color}15`,
                  transition: 'all var(--transition-base)'
                }}
              >
                {option.icon}
              </div>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                  lineHeight: 'var(--leading-tight)'
                }}
              >
                {option.name}
              </span>
            </button>
          ))}
        </div>

        {/* URL Preview */}
        <div
          style={{
            background: 'var(--color-bg-tertiary)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginTop: 'auto'
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-2)',
              fontWeight: 'var(--font-medium)'
            }}
          >
            Link to share
          </div>
          <div
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              wordBreak: 'break-all',
              lineHeight: 'var(--leading-relaxed)'
            }}
          >
            {url}
          </div>
        </div>
      </div>


    </>
  );
}; 