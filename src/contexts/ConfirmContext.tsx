"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface ConfirmItem {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmState {
  confirms: ConfirmItem[];
}

type ConfirmAction = 
  | { type: 'ADD_CONFIRM'; payload: Omit<ConfirmItem, 'id'> }
  | { type: 'REMOVE_CONFIRM'; payload: string };

interface ConfirmContextType {
  confirms: ConfirmItem[];
  showConfirm: (options: Omit<ConfirmItem, 'id'>) => void;
  removeConfirm: (id: string) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

const confirmReducer = (state: ConfirmState, action: ConfirmAction): ConfirmState => {
  switch (action.type) {
    case 'ADD_CONFIRM': {
      const newConfirm: ConfirmItem = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        confirmText: action.payload.confirmText || 'Confirm',
        cancelText: action.payload.cancelText || 'Cancel',
        variant: action.payload.variant || 'info',
      };
      return {
        ...state,
        confirms: [...state.confirms, newConfirm],
      };
    }
    case 'REMOVE_CONFIRM':
      return {
        ...state,
        confirms: state.confirms.filter(confirm => confirm.id !== action.payload),
      };
    default:
      return state;
  }
};

const initialState: ConfirmState = {
  confirms: [],
};

interface ConfirmProviderProps {
  children: ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(confirmReducer, initialState);

  const showConfirm = (options: Omit<ConfirmItem, 'id'>) => {
    dispatch({
      type: 'ADD_CONFIRM',
      payload: options,
    });
  };

  const removeConfirm = (id: string) => {
    dispatch({
      type: 'REMOVE_CONFIRM',
      payload: id,
    });
  };

  const value: ConfirmContextType = {
    confirms: state.confirms,
    showConfirm,
    removeConfirm,
  };

  return (
    <ConfirmContext.Provider value={value}>
      {children}
    </ConfirmContext.Provider>
  );
};

export const useConfirmContext = (): ConfirmContextType => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error('useConfirmContext must be used within a ConfirmProvider');
  }
  return context;
};
