// src/app/layout.client.js
'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppLayoutWithSideNav from '@/components/layout/AppLayoutWithSideNav';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // Routes that should use the regular navbar instead of sidenav
  const useRegularNavRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/listings',
    '/listings/',
    '/about',
    '/contact'
  ];

  const shouldUseRegularNav = useRegularNavRoutes.some(route => 
    pathname === route || (route.endsWith('/') && pathname.startsWith(route))
  );

  return (
    <AuthProvider>
      {shouldUseRegularNav ? (
        // Regular layout for public pages
        <div className="min-h-screen flex flex-col village-bg">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      ) : (
        // Side navigation layout for authenticated areas
        <AppLayoutWithSideNav>
          {children}
        </AppLayoutWithSideNav>
      )}
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}