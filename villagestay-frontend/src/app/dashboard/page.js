'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Providers from '@/components/providers/Providers';
import AppLayout from '@/components/layout/AppLayout';

const DashboardPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen village-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen village-bg pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Your {user?.user_type} dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Type:</strong> {user?.user_type}</p>
              <p><strong>Verified:</strong> {user?.is_verified ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {user?.user_type === 'host' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Host Stats</h2>
              <div className="space-y-2">
                <p><strong>Listings:</strong> 0</p>
                <p><strong>Bookings:</strong> 0</p>
                <p><strong>Rating:</strong> N/A</p>
              </div>
            </div>
          )}

          {user?.user_type === 'tourist' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Travel Stats</h2>
              <div className="space-y-2">
                <p><strong>Trips:</strong> 0</p>
                <p><strong>Reviews:</strong> 0</p>
                <p><strong>Saved:</strong> 0</p>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {user?.user_type === 'host' ? (
                <>
                  <button className="btn-primary w-full">Add New Listing</button>
                  <button className="btn-secondary w-full">Manage Bookings</button>
                </>
              ) : (
                <>
                  <button className="btn-primary w-full">Explore Villages</button>
                  <button className="btn-secondary w-full">AI Travel Guide</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPageWithProviders() {
  return (
    <Providers>
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    </Providers>
  );
}