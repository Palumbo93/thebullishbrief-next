import React from 'react';
import { Button } from '../../ui';
import { AuthButtonProps } from '../types/auth.types';

export const AuthButton: React.FC<AuthButtonProps> = (props) => {
  return <Button {...props} />;
}; 