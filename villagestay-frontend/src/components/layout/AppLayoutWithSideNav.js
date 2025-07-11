// src/components/layout/AppLayoutWithSideNav.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import SideNav from './SideNav';
import Footer from './Footer';

const AppLayoutWithSideNav = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

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
    // For non-authenticated users, use the regular layout
    return (
      <div className="min-h-screen flex flex-col village-bg">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SideNav />
      
      {/* Main Content */}
      <div className="lg:ml-72">
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayoutWithSideNav;