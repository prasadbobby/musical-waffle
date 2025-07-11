// src/app/dashboard/page.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';

const DashboardPage = () => {
  const { user, isAuthenticated, loading, isHost, isTourist, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        // Redirect based on user type with proper verification
        switch (user.user_type) {
          case 'host':
            router.push('/host/dashboard');
            break;
          case 'tourist':
            router.push('/tourist/dashboard');
            break;
          case 'admin':
            router.push('/admin/dashboard');
            break;
          default:
            console.error('Unknown user type:', user.user_type);
            router.push('/');
        }
      }
    }
  }, [isAuthenticated, loading, router, user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen village-bg flex items-center justify-center">
          <div className="text-center">
            <div className="spinner spinner-lg mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return null; // Will redirect before rendering
};

export default DashboardPage;