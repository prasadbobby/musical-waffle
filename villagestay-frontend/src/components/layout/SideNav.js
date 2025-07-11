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
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  MapIcon
} from '@heroicons/react/24/outline';

const SideNav = () => {
  const { isHost, isTourist, isAdmin } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
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
          label: '🤖 AI Tools',
          icon: SparklesIcon,
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
              badge: ''
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
          label: 'Properties',
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
          label: 'Analytics & Reports',
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
          label: '🤖 AI Cultural Guide',
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
          key: 'explore',
          label: 'Browse Platform',
          icon: MapIcon,
          href: '/listings'
        }
      ];
    }

    return [];
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

      {/* Side Navigation - Clean menu only */}
      <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg border-r border-gray-200 z-40 transition-all duration-300 ${
        isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'w-80 lg:w-64'
      }`}>
        
        {/* Navigation Items */}
        <div className="h-full overflow-y-auto py-6">
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
                        {!isCollapsed && (
                          <div className="flex items-center space-x-2">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {!isCollapsed && (
                        expandedMenus[item.key] ? (
                          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                        )
                      )}
                    </button>
                    
                    {!isCollapsed && expandedMenus[item.key] && (
                      <div className="mt-2 ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                        {item.children.map((child, index) => (
                          <Link
                            key={index}
                            href={child.href}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                              isActivePath(child.href)
                                ? 'bg-green-50 text-green-700 font-medium border-l-2 border-green-500'
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
                                      child.badge === 'NEW' ? 'bg-blue-100 text-blue-600' :
                                      child.badge === 'HOT' ? 'bg-red-100 text-red-600' :
                                      'bg-green-100 text-green-600'
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
                    {!isCollapsed && (
                      <div className="flex items-center space-x-2 flex-1">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className={`fixed top-20 left-4 z-30 p-2 bg-white rounded-lg shadow-lg lg:hidden ${
          isCollapsed ? 'block' : 'hidden'
        }`}
      >
        <Bars3Icon className="w-5 h-5" />
      </button>
    </>
  );
};

export default SideNav;