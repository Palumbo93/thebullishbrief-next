"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error';
  timestamp: number;
  isClosing?: boolean;
}

interface ToastState {
  toasts: ToastItem[];
}

type ToastAction = 
  | { type: 'ADD_TOAST'; payload: Omit<ToastItem, 'id' | 'timestamp'> }
  | { type: 'START_CLOSING_TOAST'; payload: string }
  | { type: 'REMOVE_TOAST'; payload: string };

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type: 'success' | 'error') => void;
  startClosingToast: (id: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST': {
      const newToast: ToastItem = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      return {
        ...state,
        toasts: [...state.toasts, newToast],
      };
    }
    case 'START_CLOSING_TOAST':
      return {
        ...state,
        toasts: state.toasts.map(toast => 
          toast.id === action.payload 
            ? { ...toast, isClosing: true }
            : toast
        ),
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
    default:
      return state;
  }
};

const initialState: ToastState = {
  toasts: [],
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  const showToast = (message: string, type: 'success' | 'error') => {
    dispatch({
      type: 'ADD_TOAST',
      payload: { message, type },
    });
  };

  const startClosingToast = (id: string) => {
    dispatch({
      type: 'START_CLOSING_TOAST',
      payload: id,
    });
  };

  const removeToast = (id: string) => {
    dispatch({
      type: 'REMOVE_TOAST',
      payload: id,
    });
  };

  const value: ToastContextType = {
    toasts: state.toasts,
    showToast,
    startClosingToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    // Return a safe default for SSR
    return {
      toasts: [],
      showToast: () => {},
      startClosingToast: () => {},
      removeToast: () => {},
    };
  }
  return context;
};
