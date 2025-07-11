'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  PlusIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  ChartBarIcon,
  UsersIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  MapIcon,
  Cog6ToothIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const SideNav = () => {
  const { isHost, isTourist, isAdmin } = useAuth();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState({
    'ai-tools': true // AI tools expanded by default for hosts
  });

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const isActivePath = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Get navigation items based on user type
  const getNavigationItems = () => {
    if (isHost) {
      return [
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: HomeIcon,
          href: '/host/dashboard'
        },
        {
          key: 'ai-tools',
          label: 'AI-Powered Tools',
          icon: SparklesIcon,
          badge: 'AI',
          children: [
            { 
              label: 'Voice Listing Magic', 
              href: '/ai-features/voice-listing',
              icon: MicrophoneIcon,
              description: 'Create listings with voice',
              badge: 'NEW'
            },
            { 
              label: 'Village Story Videos', 
              href: '/ai-features/village-stories',
              icon: VideoCameraIcon,
              description: 'Generate promotional videos',
              badge: 'HOT'
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
          key: 'listings',
          label: 'My Properties',
          icon: BuildingOfficeIcon,
          children: [
            { label: 'All Properties', href: '/host/listings', icon: BuildingOfficeIcon },
            { label: 'Add New Property', href: '/host/create-listing', icon: PlusIcon },
            { label: 'Manage Availability', href: '/host/availability', icon: CalendarDaysIcon }
          ]
        },
        {
          key: 'bookings',
          label: 'Reservations',
          icon: CalendarDaysIcon,
          href: '/host/bookings'
        },
        {
          key: 'analytics',
          label: 'Analytics & Insights',
          icon: ChartBarIcon,
          href: '/host/analytics'
        },
        {
          key: 'explore',
          label: 'Explore Marketplace',
          icon: MapIcon,
          href: '/listings'
        }
      ];
    }

    if (isTourist) {
      return [
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: HomeIcon,
          href: '/tourist/dashboard'
        },
        {
          key: 'ai-concierge',
          label: 'AI Cultural Guide',
          icon: ChatBubbleLeftRightIcon,
          href: '/ai-features/cultural-concierge',
          badge: 'AI'
        },
        {
          key: 'explore',
          label: 'Discover Villages',
          icon: MapIcon,
          href: '/listings'
        },
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
          key: 'impact',
          label: 'My Impact',
          icon: SparklesIcon,
          href: '/tourist/impact'
        }
      ];
    }

    if (isAdmin) {
      return [
        {
          key: 'dashboard',
          label: 'Admin Dashboard',
          icon: HomeIcon,
          href: '/admin/dashboard'
        },
        {
          key: 'users',
          label: 'User Management',
          icon: UsersIcon,
          href: '/admin/users'
        },
        {
          key: 'listings',
          label: 'Property Management',
          icon: BuildingOfficeIcon,
          href: '/admin/listings'
        },
        {
          key: 'bookings',
          label: 'Booking Management',
          icon: CalendarDaysIcon,
          href: '/admin/bookings'
        },
        {
          key: 'analytics',
          label: 'Platform Analytics',
          icon: ChartBarIcon,
          href: '/admin/analytics'
        },
        {
          key: 'settings',
          label: 'System Settings',
          icon: Cog6ToothIcon,
          href: '/admin/settings'
        },
        {
          key: 'explore',
          label: 'Browse Platform',
          icon: GlobeAltIcon,
          href: '/listings'
        }
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 z-40">
      
      {/* Brand Section - No top padding, full width */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">VillageStay</h1>
            <p className="text-sm text-white/90 font-medium">AI-Powered Platform</p>
          </div>
        </div>
        
        {/* User Type Badge */}
        {/* <div className="mt-4">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30`}>
            {isHost && '🏠 Host Portal'}
            {isTourist && '✈️ Traveler Portal'}
            {isAdmin && '⚙️ Admin Portal'}
          </span>
        </div> */}
      </div>

      {/* Navigation Items */}
      <div className="h-[calc(100%-140px)] overflow-y-auto py-4">
        <nav className="px-4 space-y-2">
          {navigationItems.map((item) => (
            <div key={item.key}>
              {item.children ? (
                // Menu with children
                <div>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      item.children.some(child => isActivePath(child.href))
                        ? 'bg-green-100 text-green-700 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex items-center space-x-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                            item.badge === 'AI' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' :
                            item.badge === 'NEW' ? 'bg-green-500 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    {expandedMenus[item.key] ? (
                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedMenus[item.key] && (
                    <div className="mt-2 ml-6 space-y-1 border-l-2 border-green-200 pl-4">
                      {item.children.map((child, index) => (
                        <Link
                          key={index}
                          href={child.href}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 group ${
                            isActivePath(child.href)
                              ? 'bg-green-50 text-green-700 font-medium border-l-3 border-green-500 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {child.icon && <child.icon className="w-4 h-4 flex-shrink-0" />}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span>{child.label}</span>
                                {child.badge && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                                    child.badge === 'NEW' ? 'bg-blue-500 text-white' :
                                    child.badge === 'HOT' ? 'bg-red-500 text-white' :
                                    'bg-green-500 text-white'
                                  }`}>
                                    {child.badge}
                                  </span>
                                )}
                              </div>
                              {child.description && (
                                <p className="text-xs text-gray-500 mt-0.5">{child.description}</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular menu item
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActivePath(item.href) 
                      ? 'bg-green-100 text-green-700 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex items-center space-x-2 flex-1">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        item.badge === 'AI' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' :
                        item.badge === 'NEW' ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section - AI Feature Highlight */}
      {/* <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-gray-100 to-transparent">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-gray-900">AI-Powered Experience</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Leverage cutting-edge AI to enhance your rural tourism experience with smart recommendations and automated content creation.
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default SideNav;