// src/components/layout/SideNav.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  PlusIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UsersIcon,
  HeartIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const SideNav = () => {
  const { user, logout, isHost, isTourist, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const isActivePath = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Navigation items based on user type
  const getNavigationItems = () => {
    const baseItems = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: HomeIcon,
        href: user?.user_type === 'host' ? '/host/dashboard' : 
              user?.user_type === 'tourist' ? '/tourist/dashboard' : 
              '/admin/dashboard'
      },
      {
        key: 'explore',
        label: 'Explore Villages',
        icon: MagnifyingGlassIcon,
        href: '/listings'
      }
    ];

    if (isHost) {
      return [
        ...baseItems,
        {
          key: 'listings',
          label: 'My Listings',
          icon: HomeIcon,
          href: '/host/listings',
          children: [
            { label: 'All Listings', href: '/host/listings' },
            { label: 'Add New Listing', href: '/host/create-listing' },
            { label: 'Manage Availability', href: '/host/availability' }
          ]
        },
        {
          key: 'bookings',
          label: 'Bookings',
          icon: CalendarDaysIcon,
          href: '/host/bookings'
        },
        {
          key: 'ai-tools',
          label: 'AI Tools',
          icon: SparklesIcon,
          children: [
            { 
              label: 'Voice Listing', 
              href: '/ai-features/voice-listing',
              icon: MicrophoneIcon,
              description: 'Create listings with voice'
            },
            { 
              label: 'Village Stories', 
              href: '/ai-features/village-stories',
              icon: VideoCameraIcon,
              description: 'Generate AI videos'
            },
            { 
              label: 'Cultural Concierge', 
              href: '/ai-features/cultural-concierge',
              icon: ChatBubbleLeftRightIcon,
              description: 'AI travel assistant'
            }
          ]
        },
        {
          key: 'analytics',
          label: 'Analytics',
          icon: ChartBarIcon,
          href: '/host/analytics'
        }
      ];
    }

    if (isTourist) {
      return [
        ...baseItems,
        {
          key: 'bookings',
          label: 'My Trips',
          icon: CalendarDaysIcon,
          href: '/tourist/bookings'
        },
        {
          key: 'favorites',
          label: 'Saved Places',
          icon: HeartIcon,
          href: '/tourist/favorites'
        },
        {
          key: 'ai-concierge',
          label: 'AI Cultural Guide',
          icon: ChatBubbleLeftRightIcon,
          href: '/ai-features/cultural-concierge'
        },
        {
          key: 'impact',
          label: 'My Impact',
          icon: SparklesIcon,
          href: '/tourist/impact'
        }
      ];
    }

    if (isAdmin) {
      return [
        ...baseItems,
        {
          key: 'users',
          label: 'User Management',
          icon: UsersIcon,
          href: '/admin/users'
        },
        {
          key: 'admin-listings',
          label: 'Manage Listings',
          icon: HomeIcon,
          href: '/admin/listings'
        },
        {
          key: 'admin-bookings',
          label: 'All Bookings',
          icon: CalendarDaysIcon,
          href: '/admin/bookings'
        },
        {
          key: 'analytics',
          label: 'Platform Analytics',
          icon: ChartBarIcon,
          href: '/admin/analytics'
        }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Side Navigation */}
      <div className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 ${
        isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-80 lg:w-72'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">VillageStay</h1>
                  <p className="text-xs text-green-600">Rural Tourism Platform</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              {isCollapsed ? (
                <Bars3Icon className="w-5 h-5" />
              ) : (
                <XMarkIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-6 border-b border-gray-200">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user.full_name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{user.full_name}</h3>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {user.user_type} Account
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.full_name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-2">
            {navigationItems.map((item) => (
              <div key={item.key}>
                {item.children ? (
                  // Menu with children
                  <div>
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActivePath(item.href) 
                          ? 'bg-green-100 text-green-700 border-r-2 border-green-500' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        expandedMenus[item.key] ? (
                          <ChevronDownIcon className="w-4 h-4" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4" />
                        )
                      )}
                    </button>
                    
                    {!isCollapsed && expandedMenus[item.key] && (
                      <div className="mt-2 ml-8 space-y-1">
                        {item.children.map((child, index) => (
                          <Link
                            key={index}
                            href={child.href}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                              isActivePath(child.href)
                                ? 'bg-green-50 text-green-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {child.icon && <child.icon className="w-4 h-4" />}
                              <span>{child.label}</span>
                            </div>
                            {child.description && (
                              <p className="text-xs text-gray-500 mt-1">{child.description}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular menu item
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActivePath(item.href) 
                        ? 'bg-green-100 text-green-700 border-r-2 border-green-500' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <Link
            href="/profile"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            <UserCircleIcon className="w-5 h-5" />
            {!isCollapsed && <span>Profile Settings</span>}
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className={`fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg lg:hidden ${
          isCollapsed ? 'block' : 'hidden'
        }`}
      >
        <Bars3Icon className="w-5 h-5" />
      </button>
    </>
  );
};

export default SideNav;