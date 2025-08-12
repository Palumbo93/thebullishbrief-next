import React from 'react';
import { TrendingUp } from 'lucide-react';

interface InlineLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const InlineLoadingSpinner: React.FC<InlineLoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <div className={`${sizeClasses[size]} border-3 border-border-primary border-t-brand-primary rounded-full animate-spin`} />
      </div>
      {text && (
        <p className={`text-tertiary ${textSizes[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
};
