import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiUser, FiUserPlus, FiUserCheck, FiActivity, FiTrendingUp, 
  FiBell, FiSettings, FiBook, FiDatabase, FiHardDrive, 
  FiCpu, FiShield, FiAlertCircle, FiCheckCircle, FiXCircle,
  FiEdit3, FiTrash2, FiEye, FiSend, FiStar, FiZap
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State for dashboard data
  const [systemStats, setSystemStats] = useState(null);
  const [userData, setUserData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [recentActivities, setRecentActivities] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  
  // State for modals and forms
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State for forms
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    targetRole: ''
  });
  
  // Loading states
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [statsRes, userRes, healthRes, activitiesRes, performanceRes] = await Promise.all([
        axios.get('/api/admin/dashboard/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get('/api/admin/system/health', { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get('/api/admin/activities', { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get('/api/admin/system/performance', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      setSystemStats(statsRes.data);
      setUserData(userRes.data);
      setSystemHealth(healthRes.data);
      setRecentActivities(activitiesRes.data);
      setPerformanceMetrics(performanceRes.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/announcements', announcementForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('Announcement sent successfully!');
      setShowAnnouncementModal(false);
      setAnnouncementForm({ title: '', message: '', targetRole: '' });
      fetchDashboardData(); // Refresh to show new notification
      
    } catch (error) {
      showError('Failed to send announcement: ' + error.response?.data?.error || error.message);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('User role updated successfully!');
      fetchDashboardData();
      
    } catch (error) {
      showError('Failed to update user role: ' + error.response?.data?.error || error.message);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await axios.put(`/api/admin/users/${userId}/deactivate`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('User deactivated successfully!');
      fetchDashboardData();
      
    } catch (error) {
      showError('Failed to deactivate user: ' + error.response?.data?.error || error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'moderate': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'good': return <FiCheckCircle className="h-5 w-5 text-blue-500" />;
      case 'moderate': return <FiAlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'poor': return <FiXCircle className="h-5 w-5 text-red-500" />;
      default: return <FiActivity className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 bg-gradient-to-r from-teal-500 to-coral-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiStar className="h-10 w-10 text-white" />
          </motion.div>
          <p className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-coral-500 bg-clip-text text-transparent">
            Loading Admin Dashboard...
          </p>
          <p className="text-gray-600 mt-2">Preparing your creative learning hub</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-teal-500 to-coral-500 rounded-3xl shadow-2xl mb-6">
            <FiStar className="h-10 w-10 text-white" />
          </div>
          <h1 className="page-title">
            👑 Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome back, <span className="font-semibold text-teal-600">{user?.firstName} {user?.lastName}</span>! 
            Manage your creative learning hub with powerful tools and insights.
          </p>
        </motion.div>

        {/* Quick Stats Grid */}
        {systemStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {/* Total Users Card */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="card-gradient border-2 border-purple-200"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <FiUsers className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Total Users</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    {systemStats.users?.total || 0}
                  </p>
                  <p className="text-sm text-green-600 font-semibold">
                    {systemStats.users?.activePercentage || 0}% active
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Active Classes Card */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="card-gradient border-2 border-teal-200"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <FiBook className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Active Classes</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                    {systemStats.classes?.active || 0}
                  </p>
                  <p className="text-sm text-teal-600 font-semibold">
                    {systemStats.classes?.activePercentage || 0}% of total
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Active Homeworks Card */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="card-gradient border-2 border-coral-200"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-coral-500 to-coral-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <FiActivity className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Active Homeworks</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-coral-600 to-coral-700 bg-clip-text text-transparent">
                    {systemStats.homeworks?.active || 0}
                  </p>
                  <p className="text-sm text-coral-600 font-semibold">
                    {systemStats.homeworks?.overduePercentage || 0}% overdue
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Graded Submissions Card */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="card-gradient border-2 border-yellow-200"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <FiTrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Graded Submissions</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                    {systemStats.submissions?.graded || 0}
                  </p>
                  <p className="text-sm text-yellow-600 font-semibold">
                    {systemStats.submissions?.gradedPercentage || 0}% of total
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <button
            onClick={() => window.location.href = '/admin/users'}
            className="btn-primary flex items-center"
          >
            <FiUsers className="h-5 w-5 mr-2" />
            Manage Users
          </button>
          
          <button
            onClick={() => window.location.href = '/admin/classes'}
            className="btn-coral flex items-center"
          >
            <FiBook className="h-5 w-5 mr-2" />
            Manage Classes
          </button>
          

        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Management & Activities */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Management */}
            {userData && Object.keys(userData).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="card border-2 border-purple-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                      <FiUsers className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="section-title text-purple-700">User Management</h2>
                  </div>
                  <button 
                    onClick={() => setShowUserModal(true)}
                    className="btn-purple flex items-center"
                  >
                    <FiUserPlus className="h-5 w-5 mr-2" />
                    Manage Users
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600">{userData.teachers?.length || 0}</div>
                    <div className="text-sm text-purple-700 font-medium">Teachers</div>
                  </div>
                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200">
                    <div className="text-3xl font-bold text-teal-600">{userData.students?.length || 0}</div>
                    <div className="text-sm text-teal-700 font-medium">Students</div>
                  </div>
                </div>

                {/* Recent Users */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                  {userData?.recentUsers && userData.recentUsers.length > 0 ? (
                    userData.recentUsers.slice(0, 5).map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <FiUser className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-600">{user.role} • {user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors duration-300"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowUserModal(true)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors duration-300"
                          >
                            <FiEdit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">No recent users found</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Recent Activities */}
            {recentActivities && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="card border-2 border-teal-200"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4">
                    <FiActivity className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="section-title text-teal-700">Recent Activities</h2>
                </div>
                
                <div className="space-y-4">
                  {recentActivities.recentHomeworks?.slice(0, 3).map((homework, index) => (
                    <motion.div
                      key={homework.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl border border-teal-200"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center">
                        <FiBook className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-gray-900">New Homework: {homework.title}</p>
                        <p className="text-sm text-gray-600">{homework.subject} • Due: {new Date(homework.dueDate).toLocaleDateString()}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {recentActivities.recentClasses?.slice(0, 2).map((cls, index) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center p-4 bg-gradient-to-r from-coral-50 to-coral-100 rounded-2xl border border-coral-200"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-coral-500 to-coral-600 rounded-2xl flex items-center justify-center">
                        <FiUsers className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-gray-900">New Class: {cls.className}</p>
                        <p className="text-sm text-gray-600">{cls.subject} • {cls.gradeLevel}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - System Health & Actions */}
          <div className="space-y-8">
            {/* System Health */}
            {systemHealth && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="card border-2 border-green-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4">
                      <FiShield className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="section-title text-green-700">System Health</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="flex items-center">
                      <FiCpu className="h-5 w-5 text-blue-500 mr-3" />
                      <span className="text-sm text-gray-700 font-medium">Uptime</span>
                    </div>
                    <span className={`text-sm font-semibold ${getStatusColor(systemHealth.uptime?.status)}`}>
                      {systemHealth.uptime?.percentage}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="flex items-center">
                      <FiDatabase className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm text-gray-700 font-medium">Database</span>
                    </div>
                    <span className={`text-sm font-semibold ${getStatusColor(systemHealth.database?.status)}`}>
                      {systemHealth.database?.responseTime}ms
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="flex items-center">
                      <FiHardDrive className="h-5 w-5 text-purple-500 mr-3" />
                      <span className="text-sm text-gray-700 font-medium">Storage</span>
                    </div>
                    <span className={`text-sm font-semibold ${getStatusColor(systemHealth.fileSystem?.status)}`}>
                      {systemHealth.fileSystem?.availableStorage}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-coral-50 to-coral-100 rounded-xl border border-coral-200">
                    <div className="flex items-center">
                      <FiActivity className="h-5 w-5 text-coral-500 mr-3" />
                      <span className="text-sm text-gray-700 font-medium">Memory</span>
                    </div>
                    <span className={`text-sm font-semibold ${getStatusColor(systemHealth.memory?.status)}`}>
                      {systemHealth.memory?.usage}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Performance Metrics */}
            {performanceMetrics && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="card border-2 border-blue-200"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
                    <FiZap className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="section-title text-blue-700">Performance</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <span className="text-sm text-gray-700 font-medium">Response Time</span>
                    <span className={`text-sm font-semibold ${getStatusColor(performanceMetrics.responseTime?.status)}`}>
                      {performanceMetrics.responseTime?.average}ms
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                    <span className="text-sm text-gray-700 font-medium">Success Rate</span>
                    <span className={`text-sm font-semibold ${getStatusColor(performanceMetrics.successRate?.status)}`}>
                      {performanceMetrics.successRate?.percentage}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <span className="text-sm text-gray-700 font-medium">Throughput</span>
                    <span className={`text-sm font-semibold ${getStatusColor(performanceMetrics.throughput?.status)}`}>
                      {performanceMetrics.throughput?.requestsPerMinute}/min
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              >
                <form onSubmit={handleSendAnnouncement}>
                  <div className="bg-gradient-to-br from-teal-50 to-coral-50 px-6 pt-6 pb-4">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                        <FiBell className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Send System Announcement</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={announcementForm.title}
                          onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                          className="input-field"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                        <textarea
                          value={announcementForm.message}
                          onChange={(e) => setAnnouncementForm({...announcementForm, message: e.target.value})}
                          rows={3}
                          className="input-field"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Target Role (Optional)</label>
                        <select
                          value={announcementForm.targetRole}
                          onChange={(e) => setAnnouncementForm({...announcementForm, targetRole: e.target.value})}
                          className="input-field"
                        >
                          <option value="">All Users</option>
                          <option value="TEACHER">Teachers Only</option>
                          <option value="STUDENT">Students Only</option>
                          <option value="PARENT">Parents Only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="btn-primary w-full sm:w-auto"
                    >
                      <FiSend className="h-4 w-4 mr-2" />
                      Send Announcement
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAnnouncementModal(false)}
                      className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Additional bottom spacing to ensure full page height */}
      <div className="h-20"></div>
    </div>
  );
};

export default AdminDashboard; 