import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiUserPlus, FiUserCheck, FiActivity, FiTrendingUp, FiBell, FiSettings, FiBook } from 'react-icons/fi';
import Header from '../common/Header';

const AdminDashboard = () => {
  const [users] = useState([
    {
      id: 1,
      name: 'John Smith',
      role: 'TEACHER',
      subject: 'Mathematics',
      status: 'active',
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'TEACHER',
      subject: 'Science',
      status: 'active',
      lastActive: '1 hour ago'
    },
    {
      id: 3,
      name: 'Michael Brown',
      role: 'STUDENT',
      grade: 'Grade 8',
      status: 'inactive',
      lastActive: '3 days ago'
    }
  ]);

  const [systemStats] = useState({
    totalUsers: 256,
    activeUsers: 180,
    totalClasses: 15,
            totalHomeworks: 45,
    averageGrade: 85,
    systemUptime: '99.9%'
  });

  const [notifications] = useState([
    {
      id: 1,
      message: 'New teacher registration request',
      time: '1 hour ago',
      type: 'registration'
    },
    {
      id: 2,
      message: 'System backup completed successfully',
      time: '2 hours ago',
      type: 'system'
    },
    {
      id: 3,
      message: 'Database optimization required',
      time: '3 hours ago',
      type: 'maintenance'
    }
  ]);

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
            <img
              src="https://img.freepik.com/free-vector/data-points-concept-illustration_114360-2908.jpg"
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">System Overview</h1>
          <p className="text-purple-100">Monitor and manage your educational platform</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg"
            >
              <div className="flex items-center">
                <FiUsers className="h-8 w-8 mr-4" />
                <div>
                  <p className="text-purple-100">Total Users</p>
                  <h3 className="text-2xl font-bold">{systemStats.totalUsers}</h3>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg"
            >
              <div className="flex items-center">
                <FiBook className="h-8 w-8 mr-4" />
                <div>
                  <p className="text-purple-100">Active Classes</p>
                  <h3 className="text-2xl font-bold">{systemStats.totalClasses}</h3>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg"
            >
              <div className="flex items-center">
                <FiActivity className="h-8 w-8 mr-4" />
                <div>
                  <p className="text-purple-100">System Uptime</p>
                  <h3 className="text-2xl font-bold">{systemStats.systemUptime}</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <button className="flex items-center text-purple-600 hover:text-purple-700 font-medium">
                  <FiUserPlus className="h-5 w-5 mr-2" />
                  Add User
                </button>
              </div>
              <div className="space-y-4">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <FiUserCheck className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{user.role}</span>
                            {user.subject && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{user.subject}</span>
                              </>
                            )}
                            {user.grade && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{user.grade}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          Last active: {user.lastActive}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* System Statistics */}
            <div className="bg-white rounded-3xl shadow-sm p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">System Statistics</h2>
                <button className="text-purple-600 hover:text-purple-700 font-medium">
                  <FiTrendingUp className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-sm text-gray-500">Active Users</div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">{systemStats.activeUsers}</div>
                  <div className="text-sm text-green-600 mt-1">
                    {Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100)}% of total
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                                  <div className="text-sm text-gray-500">Total Homeworks</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{systemStats.totalHomeworks}</div>
                  <div className="text-sm text-purple-600 mt-1">Across all classes</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-sm text-gray-500">Average Grade</div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">{systemStats.averageGrade}%</div>
                  <div className="text-sm text-blue-600 mt-1">Platform-wide</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
          >
            {/* System Health */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
                <button className="text-purple-600 hover:text-purple-700 font-medium">
                  <FiSettings className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">CPU Usage</div>
                    <div className="text-sm font-medium text-green-600">Normal</div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 rounded-full h-2" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Memory Usage</div>
                    <div className="text-sm font-medium text-yellow-600">Moderate</div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 rounded-full h-2" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Storage</div>
                    <div className="text-sm font-medium text-blue-600">Good</div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 rounded-full h-2" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Notifications</h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <FiBell className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 