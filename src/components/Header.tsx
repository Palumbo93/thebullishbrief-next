import React from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  showCreateAccount?: boolean;
  onCreateAccountClick?: () => void;
  children?: React.ReactNode;
  height?: string;
  variant?: 'hero' | 'minimal' | 'content';
}

// Import Google Fonts - Adding Crimson Text for a more refined editorial look
const loadEditorialFonts = () => {
  if (!document.querySelector('link[href*="Crimson+Text"]')) {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Playfair+Display:wght@400;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
};

export const Header: React.FC<HeaderProps> = ({ 
  title = "The Bullish Brief",
  subtitle = "Unconventional insights for the modern investor.",
  backgroundImage = "https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/smoke.webp",
  showCreateAccount = true,
  onCreateAccountClick,
  children,
  height = "250px",
  variant = "hero"
}) => {
  const { user } = useAuth();
  
  React.useEffect(() => {
    loadEditorialFonts();
  }, []);

  const isHero = variant === 'hero';
  const isMinimal = variant === 'minimal';
  const isContent = variant === 'content';

  return (
    <div style={{ 
      position: 'relative',
      height: height,
      backgroundImage: isHero ? `url(${backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      marginBottom: isContent ? 'var(--space-4)' : '0px',
      overflow: 'hidden',
      backgroundColor: isHero ? 'transparent' : 'var(--color-bg-primary)',
      borderBottom: isContent ? '0.5px solid var(--color-border-primary)' : 'none'
    }}>
      {/* Grain Texture Overlay - Only for hero variant */}
      {isHero && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '4px 4px, 4px 4px',
          backgroundPosition: '0 0, 2px 2px',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 0
        }} />
      )}
      
      {/* Gradient Overlay - Only for hero variant */}
      {isHero && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.85) 70%, rgba(0, 0, 0, 0.95) 85%, rgba(0, 0, 0, 1) 100%)',
          zIndex: 1
        }} />
      )}
      
      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 var(--content-padding)',
      }}>
        {/* Left side - Title and subtitle or custom content */}
        <div style={{ 
          maxWidth: isContent ? 'none' : '600px',
          flex: isContent ? 1 : 'none'
        }}>
          {children ? (
            children
          ) : (
            <>
              <h1 style={{
                fontSize: isMinimal ? 'var(--text-2xl)' : 'var(--text-4xl)',
                fontWeight: 'var(--font-black)',
                fontFamily: 'var(--font-primary)',
                marginBottom: 'var(--space-3)',
                lineHeight: 'var(--leading-tight)',
                color: isHero ? 'white' : 'var(--color-text-primary)',
                textAlign: 'left',
                letterSpacing: '-0.01em'
              }}>
                {title}
              </h1>
              
              {subtitle && (
                <p style={{
                  fontSize: isMinimal ? 'var(--text-base)' : 'var(--text-lg)',
                  fontFamily: 'var(--font-primary)',
                  color: isHero ? 'rgba(255, 255, 255, 0.7)' : 'var(--color-text-tertiary)',
                  lineHeight: 'var(--leading-relaxed)',
                  textAlign: 'left',
                  maxWidth: '500px',
                  fontWeight: '400'
                }}>
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>

        {/* Right side - Create Account button or custom content */}
        {showCreateAccount && onCreateAccountClick && !user && (
          <div>
            <Button
              onClick={onCreateAccountClick}
              variant="primary"
              size="lg"
              icon={UserPlus}
              fullWidth={false}
              style={{
                background: isHero ? 'rgba(255, 255, 255, 0.95)' : undefined,
                color: isHero ? 'var(--color-text-inverse)' : undefined,
                backdropFilter: isHero ? 'blur(10px)' : undefined,
                boxShadow: isHero ? '0 4px 12px rgba(0, 0, 0, 0.2)' : undefined,
                height: '48px',
                padding: '0 var(--space-6)'
              }}
            >
              Create Account
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 