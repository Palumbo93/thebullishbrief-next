"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class BullRoomErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BullRoom Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: 'var(--space-8)',
          textAlign: 'center',
          background: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-4)'
          }}>
            <AlertTriangle 
              style={{ 
                width: '32px', 
                height: '32px', 
                color: 'var(--color-text-error)' 
              }} 
            />
          </div>
          
          <h2 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--space-2)',
            color: 'var(--color-text-primary)'
          }}>
            Something went wrong
          </h2>
          
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-6)',
            maxWidth: '400px',
            lineHeight: 'var(--leading-relaxed)'
          }}>
            We encountered an unexpected error while loading the Bull Room. 
            Please try refreshing the page or contact support if the problem persists.
          </p>
          
          <button
            onClick={this.handleRetry}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-brand-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-brand-primary)';
            }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          
          {this.state.error && (
            <details style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-primary)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              maxWidth: '400px',
              width: '100%'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: 'var(--space-2)' }}>
                Error Details
              </summary>
              <pre style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: 'var(--text-xs)',
                lineHeight: 'var(--leading-relaxed)'
              }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
