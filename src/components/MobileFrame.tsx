"use client";

import React from 'react';
import Image from 'next/image';

interface MobileFrameProps {
  src?: string;
  alt?: string;
  placeholder?: string;
  className?: string;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  src,
  alt = 'Mobile app screenshot',
  placeholder = 'Mobile Screenshot',
  className = ''
}) => {
  return (
    <div className={`mobile-frame ${className}`}>
      {/* Phone Frame */}
      <div className="phone-frame">
        {/* Phone Body */}
        <div className="phone-body">
          {/* Screen Content */}
          <div className="phone-screen">
            {src ? (
              <Image
                src={src}
                alt={alt}
                fill
                style={{
                  objectFit: 'cover',
                  objectPosition: 'top'
                }}
                priority={false}
              />
            ) : (
              <div className="placeholder-content">
                <span>{placeholder}</span>
              </div>
            )}
          </div>
          
        </div>
      </div>

      <style jsx>{`
        .mobile-frame {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          overflow: hidden;
        }

        .phone-frame {
          position: relative;
          width: 350px;
          height: 467px; /* 2/3 of 700px */
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .phone-body {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);
          border-radius: 40px 40px 0px 0px; /* Rounded top, slightly rounded bottom */
          padding: 0px 8px 0px 8px; /* No bottom padding */
        }

        .phone-screen {
          position: relative;
          width: 100%;
          height: calc(100% - 8px);
          background: var(--color-bg-primary);
          border-radius: 32px 32px 0px 0px;
          overflow: hidden;
          margin-top: 8px;
        }

        .placeholder-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-secondary);
          color: var(--color-text-tertiary);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }


        /* Light mode adjustments */
        @media (prefers-color-scheme: light) {
          .phone-body {
            background: linear-gradient(145deg, #e0e0e0 0%, #f5f5f5 100%);
          }

          .phone-body::before {
            background: linear-gradient(90deg, #c0c0c0 0%, #d0d0d0 50%, #c0c0c0 100%);
          }

          .phone-body::after {
            background: radial-gradient(circle, #a0a0a0 30%, #b0b0b0 100%);
            border-color: #999;
          }

        }

        /* Responsive sizing */
        @media (max-width: 768px) {
          .phone-frame {
            width: 300px;
            height: 400px; /* 2/3 of 600px */
          }
        }

        @media (max-width: 480px) {
          .phone-frame {
            width: 250px;
            height: 333px; /* 2/3 of 500px */
          }
        }
      `}</style>
    </div>
  );
};
