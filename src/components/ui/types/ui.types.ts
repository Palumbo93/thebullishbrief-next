import { ReactNode } from 'react';

// Button types
export interface ButtonProps {
  children: ReactNode;
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
  iconSide?: 'left' | 'right';
  fullWidth?: boolean;
  form?: string;
  className?: string;
  style?: React.CSSProperties;
}

// FormField types
export interface FormFieldProps {
  type: 'text' | 'email' | 'password' | 'textarea';
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showPasswordToggle?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
} 