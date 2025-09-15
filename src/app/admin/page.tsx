"use client";

import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
import AdminPageClient from '../../page-components/AdminPageClient';
import { Layout } from '../../components/Layout';
import { Shield, Lock } from 'lucide-react';

export default function AdminPage() {
  const { user, loading, hasRole } = useAuth();
  const { handleSignInClick } = useAuthModal();
  
  // Show loading while checking auth
  if (loading) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh'
        }}>
          <div style={{
            padding: 'var(--space-8)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--color-border-primary)',
              borderTop: '3px solid var(--color-brand-primary)',
              borderRadius: 'var(--radius-full)',
              margin: '0 auto var(--space-4)',
              animation: 'spin 1s linear infinite'
            }}></div>
            Verifying admin access...
          </div>
        </div>
      </Layout>
    );
  }
  
  // Show login prompt if not authenticated
  if (!user) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          padding: 'var(--space-8)'
        }}>
          <div style={{
            background: 'var(--color-bg-card)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-12)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <Lock style={{
              width: '64px',
              height: '64px',
              color: 'var(--color-brand-primary)',
              margin: '0 auto var(--space-6)'
            }} />
            
            <h1 style={{
              fontSize: 'var(--text-3xl)',
              fontFamily: 'var(--font-editorial)',
              fontWeight: 'var(--font-normal)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
              letterSpacing: '-0.02em'
            }}>
              Admin Access Required
            </h1>
            
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-lg)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 'var(--space-8)'
            }}>
              Please sign in with an admin account to access the administration panel.
            </p>
            
            <button
              onClick={handleSignInClick}
              className="btn btn-primary"
              style={{
                fontSize: 'var(--text-base)',
                padding: 'var(--space-3) var(--space-6)'
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Show access denied if authenticated but not admin
  if (!hasRole('admin')) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          padding: 'var(--space-8)'
        }}>
          <div style={{
            background: 'var(--color-bg-card)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-12)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <Shield style={{
              width: '64px',
              height: '64px',
              color: 'var(--color-warning)',
              margin: '0 auto var(--space-6)'
            }} />
            
            <h1 style={{
              fontSize: 'var(--text-3xl)',
              fontFamily: 'var(--font-editorial)',
              fontWeight: 'var(--font-normal)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
              letterSpacing: '-0.02em'
            }}>
              Access Denied
            </h1>
            
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-lg)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 'var(--space-8)'
            }}>
              You don't have permission to access the administration panel. Contact an administrator if you believe this is an error.
            </p>
            
            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary"
              style={{
                fontSize: 'var(--text-base)',
                padding: 'var(--space-3) var(--space-6)'
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminPageClient />
    </Layout>
  );
}
