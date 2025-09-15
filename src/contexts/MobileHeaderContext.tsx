"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MobileHeaderConfig } from '../utils/mobileHeaderConfigs';

interface MobileHeaderContextType {
  config: MobileHeaderConfig | null;
  setConfig: (config: MobileHeaderConfig | null) => void;
}

const MobileHeaderContext = createContext<MobileHeaderContextType | undefined>(undefined);

export const useMobileHeader = () => {
  const context = useContext(MobileHeaderContext);
  if (!context) {
    // Return a default context during SSR to prevent build errors
    return {
      config: null,
      setConfig: () => {},
    };
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
