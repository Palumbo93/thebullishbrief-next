import React from 'react';

interface MobileHeaderSectionProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  flex?: boolean;
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * MobileHeaderSection - Container for organizing mobile header content
 * 
 * Provides flexible layout options for different sections of the mobile header.
 * Supports alignment, flexbox behavior, and gap management.
 */
export const MobileHeaderSection: React.FC<MobileHeaderSectionProps> = ({
  children,
  align = 'left',
  flex = false,
  gap = 'md'
}) => {
  const getGapValue = () => {
    const gaps = {
      none: '0',
      sm: 'var(--space-1)',
      md: 'var(--space-2)',
      lg: 'var(--space-3)'
    };
    return gaps[gap];
  };

  const getJustifyContent = () => {
    const alignments = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end'
    };
    return alignments[align];
  };

  const getSectionStyles = () => {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: getJustifyContent(),
      gap: getGapValue(),
      flex: flex ? 1 : 'none',
      minWidth: 0, // Allow content to shrink
      height: '100%',
    };
  };

  return (
    <div style={getSectionStyles()}>
      {children}
    </div>
  );
};
