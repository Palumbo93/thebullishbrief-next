"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import AdminPageClient from '../../page-components/AdminPageClient';
import { Layout } from '../../components/Layout';

export default function AdminPage() {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!loading && (!user || !hasRole('admin'))) {
      router.push('/');
    }
  }, [user, loading, hasRole, router]);
  
  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg-primary)'
      }}>
        <div style={{
          padding: 'var(--space-8)',
          textAlign: 'center',
          color: 'var(--color-text-secondary)'
        }}>
          Verifying admin access...
        </div>
      </div>
    );
  }
  
  // Redirect if not admin (this should happen in useEffect, but adding as safety)
  if (!user || !hasRole('admin')) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg-primary)'
      }}>
        <div style={{
          padding: 'var(--space-8)',
          textAlign: 'center',
          color: 'var(--color-text-secondary)'
        }}>
          Redirecting...
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <AdminPageClient />
    </Layout>
  );
}
