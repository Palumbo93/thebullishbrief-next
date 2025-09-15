import React, { useEffect, useRef } from 'react';
import { X, MessageSquare, Copy, Check } from 'lucide-react';
import { SocialIcon } from 'react-social-icons';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();
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
      icon: <SocialIcon network="x" style={{ width: 36, height: 36 }} fgColor="var(--color-text-primary)" bgColor="transparent" />,
      color: 'var(--color-text-primary)',
      url: `https://x.com/intent/tweet?text=${encodeURIComponent('Check out this article')}&url=${encodeURIComponent(url)}`,
      action: 'link'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <SocialIcon network="linkedin" style={{ width: 36, height: 36 }} fgColor="var(--color-text-primary)" bgColor="transparent" />,
      color: 'var(--color-text-primary)',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      action: 'link'
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: <MessageSquare size={20} />,
      color: 'var(--color-text-primary)',
      url: `sms:&body=${encodeURIComponent(`Check out this article\n\n${url}`)}`,
      action: 'link'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <SocialIcon network="whatsapp" style={{ width: 36, height: 36 }} fgColor="var(--color-text-primary)" bgColor="transparent" />,
      color: 'var(--color-text-primary)',
      url: `https://wa.me/?text=${encodeURIComponent(`Check out this article\n\n${url}`)}`,
      action: 'link'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: <SocialIcon network="telegram" style={{ width: 36, height: 36 }} fgColor="var(--color-text-primary)" bgColor="transparent" />,
      color: 'var(--color-text-primary)',
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this article')}`,
      action: 'link'
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: copied ? <Check size={20} /> : <Copy size={20} />,
      color: copied ? 'var(--color-success)' : 'var(--color-text-primary)',
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
          background: theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)',
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
              const hoverColor = theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.background = hoverColor;
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

        {/* Share Options List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)'
          }}
        >
          {shareOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleShare(option)}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-base)',
                padding: 'var(--space-3) 0px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                transition: 'all var(--transition-base)',
                animation: `slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
                transform: 'translateY(20px)',
                width: '100%',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div
                style={{
                  color: option.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-base)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-secondary)',
                  flexShrink: 0
                }}
              >
                {option.icon}
              </div>
              <span
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-tight)'
                }}
              >
                {option.name}
              </span>
            </button>
          ))}
        </div>
      </div>


    </>
  );
}; 