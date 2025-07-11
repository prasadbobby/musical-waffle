// src/app/admin/users/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

import { adminAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total_count: 0,
    total_pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    user_type: '',
    is_verified: ''
  });

useEffect(() => {
  if (!isAdmin) {
    router.push('/');
    return;
  }
  fetchUsers();
}, [isAdmin, router, pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const userTypeColors = {
    host: 'bg-green-100 text-green-800',
    tourist: 'bg-blue-100 text-blue-800',
    admin: 'bg-purple-100 text-purple-800'
  };

  return (
  
        <div className="min-h-screen village-bg pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    User Management 👥
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Manage platform users and their accounts
                  </p>
                </div>
                
                <div className="text-sm text-gray-600">
                  {pagination.total_count} total users
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="input-field pl-10"
                  />
                </div>

                <select
                  value={filters.user_type}
                  onChange={(e) => handleFilterChange('user_type', e.target.value)}
                  className="input-field"
                >
                  <option value="">All User Types</option>
                  <option value="host">Hosts</option>
                  <option value="tourist">Tourists</option>
                  <option value="admin">Admins</option>
                </select>

                <select
                  value={filters.is_verified}
                  onChange={(e) => handleFilterChange('is_verified', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Verification Status</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>

                <button
                  onClick={() => {
                    setFilters({ search: '', user_type: '', is_verified: '' });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="spinner spinner-lg mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : users.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {user.full_name?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.full_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                  {user.phone && (
                                    <div className="text-xs text-gray-400">
                                      {user.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userTypeColors[user.user_type]}`}>
                                {user.user_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {user.is_verified ? (
                                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircleIcon className="w-5 h-5 text-red-500" />
                                )}
                                <span className={`text-sm ${user.is_verified ? 'text-green-600' : 'text-red-600'}`}>
                                  {user.is_verified ? 'Verified' : 'Unverified'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div className="font-medium">
                                  {user.user_type === 'host' ? `${user.listings_count || 0} listings` : 
                                   user.user_type === 'tourist' ? `${user.bookings_count || 0} trips` : 
                                   'Admin user'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.bookings_count || 0} bookings total
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                <div>{formatDate(user.created_at)}</div>
                                {user.last_login && (
                                  <div className="text-xs">
                                    Last: {formatDate(user.last_login)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {/* View user details */}}
                                  className="text-green-600 hover:text-green-900 p-1 rounded"
                                  title="View Details"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {/* Edit user */}}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="Edit User"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {/* Delete user */}}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Delete User"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.total_pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                          {Math.min(pagination.page * pagination.limit, pagination.total_count)} of{' '}
                          {pagination.total_count} users
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          <div className="flex space-x-1">
                            {[...Array(Math.min(pagination.total_pages, 5))].map((_, i) => {
                              const pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
                              if (pageNum > pagination.total_pages) return null;
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                  className={`px-3 py-2 rounded-lg font-medium ${
                                    pageNum === pagination.page
                                      ? 'bg-green-500 text-white'
                                      : 'bg-white text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page === pagination.total_pages}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center">
                  <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
     
  );
};

export default AdminUsersPage;