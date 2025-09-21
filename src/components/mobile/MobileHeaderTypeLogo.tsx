import React from 'react';
import { TypeLogo } from '../ui/TypeLogo';

interface MobileHeaderTypeLogoProps {
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * MobileHeaderTypeLogo - Type logo component for mobile headers
 * 
 * Displays The Bullish Brief type logo with theme-aware image selection.
 * Optimized for mobile display with appropriate sizing.
 */
export const MobileHeaderTypeLogo: React.FC<MobileHeaderTypeLogoProps> = ({
  onClick,
  size = 'md'
}) => {
  const getSizeConfig = () => {
    const sizes = {
      sm: {
        height: 20,
        width: 100
      },
      md: {
        height: 24,
        width: 120
      },
      lg: {
        height: 28,
        width: 140
      }
    };
    return sizes[size];
  };

  const sizeConfig = getSizeConfig();

  return (
    <TypeLogo
      height={sizeConfig.height}
      width={sizeConfig.width}
      alt="The Bullish Brief"
      onClick={onClick}
      className="mobile-header-type-logo"
      variant="light"
    />
  );
};
