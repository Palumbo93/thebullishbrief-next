"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme; // The actual theme being applied (follows system)
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return a safe default for SSR
    return {
      theme: 'light' as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Force light theme only - no system theme detection
  const [theme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme as light only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update document class when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    // Update document class for theme switching
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Update the data-theme attribute for better CSS targeting
    root.setAttribute('data-theme', theme);
  }, [theme, mounted]);

  // No-op functions since we force light theme only
  const toggleTheme = () => {
    // No-op since we force light theme only
  };

  const handleSetTheme = () => {
    // No-op since we force light theme only
  };

  const contextValue = {
    theme,
    setTheme: handleSetTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
