import React, { useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--color-bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      {/* Large Logo Only */}
      <div style={{
        width: '120px',
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src="/images/logo.png" 
          alt="Logo" 
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'contain'
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling.style.display = 'block';
          }}
        />
        <TrendingUp 
          style={{ 
            width: '80px', 
            height: '80px', 
            color: 'var(--color-brand-primary)',
            display: 'none'
          }} 
        />
      </div>
    </div>
  );
};