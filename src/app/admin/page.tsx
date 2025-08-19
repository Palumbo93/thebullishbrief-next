"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import AdminPageClient from '../../page-components/AdminPageClient';
import { Layout } from '../../components/Layout';
import { LoadingScreen } from '../../components/LoadingScreen';

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
    return <LoadingScreen />;
  }
  
  // Redirect if not admin (this should happen in useEffect, but adding as safety)
  if (!user || !hasRole('admin')) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <AdminPageClient />
    </Layout>
  );
}
