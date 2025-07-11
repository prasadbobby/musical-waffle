'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SideNav from './SideNav';
import Footer from './Footer';
import { 
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const AppLayoutWithSideNav = ({ children }) => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
      
      {/* Main Content Area */}
      <div className="lg:ml-64"> {/* Adjusted for narrower sidebar */}
        {/* Top Header with Branding and Profile */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left - Brand */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">VillageStay</h1>
                  <p className="text-xs text-green-600 font-medium">AI-Powered Platform</p>
                </div>
              </div>

              {/* Right - User Info and Profile */}
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.full_name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-32">
                      {user?.full_name}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                      {user?.user_type}
                    </span>
                  </div>
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        {/* Profile Header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {user?.full_name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                              <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={() => {
                              router.push('/profile');
                              setShowProfileMenu(false);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                          >
                            <UserCircleIcon className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium">Profile Settings</div>
                              <div className="text-xs text-gray-500">Manage your account</div>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => {
                              router.push('/settings');
                              setShowProfileMenu(false);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Cog6ToothIcon className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium">Account Settings</div>
                              <div className="text-xs text-gray-500">Privacy & preferences</div>
                            </div>
                          </button>
                        </div>
                        
                        {/* Logout */}
                        <div className="border-t border-gray-100">
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowProfileMenu(false);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium">Sign Out</div>
                              <div className="text-xs text-red-500">End your session</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>
        
        <Footer />
      </div>

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
};

export default AppLayoutWithSideNav;