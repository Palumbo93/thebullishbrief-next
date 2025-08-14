import React from 'react';
import { Button } from './ui/Button';

interface JoinButtonProps {
  onSignUpClick?: () => void;
}

const JoinButton: React.FC<JoinButtonProps> = ({ onSignUpClick }) => {
  return (
    <>
      <div className="join-button-container">
        <Button
          onClick={onSignUpClick}
          variant="secondary"
          fullWidth={true}
          className="join-button"
        >
          Join Free Now
        </Button>
      </div>

      <style jsx>{`
        .join-button-container {
          position: sticky;
          top: 0;
          z-index: 10;
          background: var(--color-bg-primary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem 1.5rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .join-button {
          background: linear-gradient(259deg, #214E81 0%, #506179 22.22%, #ED5409 65.15%, #FFCB67 100%);
          color: #F5F5F5;
          border: none;
          box-shadow: 0 4px 16px rgba(237,84,9,0.3), 0 0 0 1px rgba(237,84,9,0.2);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          font-weight: 600;
          padding: 0.75rem 1rem;
          border-radius: 9999px;
        }

        .join-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(237,84,9,0.4), 0 0 0 1px rgba(237,84,9,0.3);
        }

        /* Mobile responsive adjustments */
        @media (max-width: 1023px) {
          .join-button-container {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default JoinButton;
