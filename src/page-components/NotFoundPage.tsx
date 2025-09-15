"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LegalFooter } from '../components/LegalFooter';

interface NotFoundPageProps {
  onCreateAccountClick?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onCreateAccountClick }) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: 'var(--content-padding)',
      background: 'var(--color-bg-primary)'
    }}>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* 404 Number */}
        <div style={{
          fontSize: 'var(--text-9xl)',
          fontFamily: 'var(--font-editorial)',
          fontWeight: 'var(--font-black)',
          color: 'var(--color-text-primary)',
          lineHeight: '0.8',
          marginBottom: 'var(--space-8)',
          letterSpacing: '-0.04em'
        }}>
          404
        </div>

        {/* Main Heading */}
        <h1 style={{
          fontSize: 'var(--text-2xl)',
          fontFamily: 'var(--font-editorial)',
          fontWeight: 'var(--font-normal)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-4)',
          lineHeight: 'var(--leading-tight)'
        }}>
          Page Not Found
        </h1>

        {/* Description */}
        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--leading-relaxed)',
          marginBottom: 'var(--space-8)',
          maxWidth: '400px',
          margin: '0 auto var(--space-8)'
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'center',
          marginBottom: 'var(--space-8)'
        }}>
          <button
            onClick={handleBack}
            className="btn btn-secondary"
            style={{
              fontSize: 'var(--text-sm)',
              padding: 'var(--space-2) var(--space-4)'
            }}
          >
            Go Back
          </button>

          <button
            onClick={handleGoHome}
            className="btn btn-primary"
            style={{
              fontSize: 'var(--text-sm)',
              padding: 'var(--space-2) var(--space-4)'
            }}
          >
            Go Home
          </button>
        </div>
      </div>

      </div>
      
      <LegalFooter />
    </div>
  );
};

export default NotFoundPage; 