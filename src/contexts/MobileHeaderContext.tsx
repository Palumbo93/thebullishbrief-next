"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the mobile header configuration type
interface MobileHeaderConfig {
  leftSection: {
    showMenu: boolean;
    logo?: {
      type: 'main' | 'company';
      src?: string;
      alt?: string;
      fallback?: string;
      onClick?: () => void;
    };
    branding?: {
      companyName?: string;
      companyLogoUrl?: string;
      tickers?: string[];
      fallback?: string;
      onClick?: () => void;
    };
  };
  rightSection: {
    actions: Array<{
      type: 'search' | 'bookmark' | 'share' | 'comment' | 'more';
      onClick: () => void;
      active?: boolean;
      loading?: boolean;
      disabled?: boolean;
    }>;
  };
  onMenuClick: () => void;
}

interface MobileHeaderContextType {
  config: MobileHeaderConfig | null;
  setConfig: (config: MobileHeaderConfig | null) => void;
}

const MobileHeaderContext = createContext<MobileHeaderContextType | undefined>(undefined);

export const useMobileHeader = () => {
  const context = useContext(MobileHeaderContext);
  if (!context) {
    throw new Error('useMobileHeader must be used within MobileHeaderProvider');
  }
  return context;
};

interface MobileHeaderProviderProps {
  children: ReactNode;
}

export const MobileHeaderProvider: React.FC<MobileHeaderProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<MobileHeaderConfig | null>(null);

  return (
    <MobileHeaderContext.Provider value={{ config, setConfig }}>
      {children}
    </MobileHeaderContext.Provider>
  );
};
