'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SideNav from './SideNav';
import Footer from './Footer';
import { 
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const AppLayoutWithSideNav = ({ children }) => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu]);

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsLoggingOut(true);
      setShowProfileMenu(false);
      
      console.log('Logout clicked'); // Debug log
      
      // Call logout function
      logout();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileMenuClick = (e) => {
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
  };

  const handleMenuItemClick = (path) => {
    setShowProfileMenu(false);
    router.push(path);
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
      <div className="lg:ml-72">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileNav(!showMobileNav)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>

              {/* Page Title */}
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
                <p className="text-sm text-gray-500">Welcome back to your workspace</p>
              </div>

              {/* Right Side - Notifications & Profile */}
              <div className="flex items-center space-x-4">
                
                {/* Quick Actions (for hosts) */}
                {user?.user_type === 'host' && (
                  <div className="hidden md:flex items-center space-x-2">
                    <Link 
                      href="/host/create-listing"
                      className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      + Add Listing
                    </Link>
                  </div>
                )}

                {/* Notifications */}
                <div className="relative">
                  <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400"></span>
                  </button>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={handleProfileMenuClick}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    disabled={isLoggingOut}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.full_name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-32">
                        {user?.full_name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user?.user_type}</p>
                    </div>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="py-3">
                        
                        {/* Profile Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {user?.full_name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                              <p className="text-xs text-gray-500">{user?.email}</p>
                              <span className={`inline-flex items-center mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                                user?.user_type === 'host' ? 'bg-blue-100 text-blue-800' :
                                user?.user_type === 'tourist' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user?.user_type?.charAt(0)?.toUpperCase()}{user?.user_type?.slice(1)} Account
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            type="button"
                            onClick={() => handleMenuItemClick('/profile')}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 text-left"
                          >
                            <UserCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">Profile Settings</div>
                              <div className="text-xs text-gray-500">Manage your account details</div>
                            </div>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleMenuItemClick('/settings')}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-left"
                          >
                            <Cog6ToothIcon className="w-5 h-5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">Account Settings</div>
                              <div className="text-xs text-gray-500">Privacy & preferences</div>
                            </div>
                          </button>
                        </div>
                        
                        {/* Logout Section */}
                        <div className="border-t border-gray-100 pt-2">
                          <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">
                                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                              </div>
                              <div className="text-xs text-red-500">
                                {isLoggingOut ? 'Please wait...' : 'End your session'}
                              </div>
                            </div>
                            {isLoggingOut && (
                              <div className="ml-auto">
                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                              </div>
                            )}
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
    </div>
  );
};

export default AppLayoutWithSideNav;