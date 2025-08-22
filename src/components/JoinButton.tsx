import React from 'react';
import { Button } from './ui/Button';
import { useTrackCTAInteractions } from '../hooks/useDatafastAnalytics';

interface JoinButtonProps {
  onSignUpClick?: () => void;
}

const JoinButton: React.FC<JoinButtonProps> = ({ onSignUpClick }) => {
  const { trackCTAButtonClick } = useTrackCTAInteractions();

  const handleClick = async () => {
    // Track the CTA button click
    await trackCTAButtonClick('join_button', 'Join Free Now');
    
    // Call the original click handler
    onSignUpClick?.();
  };

  return (
    <>
      <div className="join-button-container">
        <Button
          onClick={handleClick}
          variant="primary"
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
          border-bottom: 0.5px solid var(--color-border-primary);
          padding: 1rem 1.5rem;
          backdrop-filter: blur(10px);
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
