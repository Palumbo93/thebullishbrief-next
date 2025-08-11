import React, { useState, useEffect } from 'react';
import { AuthModalProps } from './types/auth.types';
import { SignInModal } from './components/SignInModal';
import { SignUpModal } from './components/SignUpModal';

import { SUCCESS_MESSAGES } from './utils/constants';

const AuthModalContent: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [isReady, setIsReady] = useState(false);

  // Update the mode when initialMode prop changes, but only if the modal is open
  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
      // Small delay to prevent flicker
      const timer = setTimeout(() => setIsReady(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [initialMode, isOpen]);

  const handleSwitchToSignUp = () => {
    setIsSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setIsSignUp(false);
  };

  const handleSignInSuccess = () => {
    onClose();
  };

  const handleSignUpSuccess = () => {
    // Just close the auth modal - App.tsx will handle onboarding
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Auth Modal */}
      {isOpen && isReady && (
        <>
          {isSignUp ? (
            <SignUpModal
              onClose={handleClose}
              onSwitchToSignIn={handleSwitchToSignIn}
              onSuccess={handleSignUpSuccess}
            />
          ) : (
            <SignInModal
              onClose={handleClose}
              onSwitchToSignUp={handleSwitchToSignUp}
              onSuccess={handleSignInSuccess}
            />
          )}
        </>
      )}
    </>
  );
};

export const AuthModal: React.FC<AuthModalProps> = (props) => {
  return <AuthModalContent {...props} />;
}; 