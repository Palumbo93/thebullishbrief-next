import React, { useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { BullLogoImg } from './ui/BullLogo';

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
        <BullLogoImg 
          width={120}
          height={120}
          alt="Logo"
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