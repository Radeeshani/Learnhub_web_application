import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiUserPlus, FiEdit3, FiTrash2, FiEye, FiSearch, 
  FiFilter, FiX, FiCheck, FiXCircle, FiShield,
  FiMail, FiPhone, FiCalendar, FiMapPin, FiBookOpen, FiUser,
  FiInfo, FiCheckCircle, FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

const UserManagement = () => {
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    isActive: true,
    subjectTaught: '',
    classGrade: '',
    studentId: ''
  });

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('API Response:', response.data); // Debug log
      // Ensure we always set an array, even if the response is empty or null
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.response?.data); // Debug log
      showError('Failed to load users');
      // Set empty array on error to prevent crashes
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/users', userForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('User created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      showError('Failed to create user: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/users/${selectedUser.id}`, userForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      showError('Failed to update user: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`/api/admin/users/${selectedUser.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('User deactivated successfully!');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      showError('Failed to deactivate user: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      isActive: true,
      subjectTaught: '',
      classGrade: '',
      studentId: ''
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: type === 'radio' ? value === 'true' : value
    }));
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
      role: user.role || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      isActive: user.isActive,
      subjectTaught: user.subjectTaught || '',
      classGrade: user.classGrade || '',
      studentId: user.studentId || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Filter users based on search and filters
  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.isActive === (statusFilter === 'active');
    
    // Apply grade filter only if STUDENT role is selected
    const matchesGrade = roleFilter !== 'STUDENT' || !gradeFilter || user.classGrade === gradeFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesGrade;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-emerald-100 text-emerald-800';
      case 'TEACHER': return 'bg-teal-100 text-teal-800';
      case 'STUDENT': return 'bg-cyan-100 text-cyan-800';
      case 'PARENT': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return '👑';
      case 'TEACHER': return '👨‍🏫';
      case 'STUDENT': return '🎓';
      case 'PARENT': return '👨‍👩‍👧‍👦';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                y: [0, -30, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-16 left-16 w-40 h-40 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full opacity-15 blur-xl"
            />
            
            <motion.div
              animate={{
                y: [0, 25, 0],
                rotate: [0, -8, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute top-32 right-24 w-32 h-32 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full opacity-15 blur-xl"
            />
          </div>
          
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-2xl mb-6"
            >
              <FiUsers className="w-12 h-12 text-white" />
            </motion.div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-xl text-emerald-600 font-semibold">Loading User Management...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating geometric shapes */}
          <motion.div
            animate={{
              y: [0, -30, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-16 left-16 w-40 h-40 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full opacity-15 blur-xl"
          />
          
          <motion.div
            animate={{
              y: [0, 25, 0],
              rotate: [0, -8, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-32 right-24 w-32 h-32 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full opacity-15 blur-xl"
          />
          
          <motion.div
            animate={{
              y: [0, -20, 0],
              x: [0, 15, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-40 left-1/3 w-28 h-28 bg-gradient-to-br from-teal-200 to-emerald-300 rounded-full opacity-15 blur-xl"
          />

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }} />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-2xl mb-6"
            >
              <FiUsers className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4"
            >
              👥 User Management
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Manage all users in the system - teachers, students, parents, and administrators
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center justify-center mt-8"
            >
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:from-emerald-600 hover:to-teal-700"
              >
                <FiUserPlus className="h-5 w-5 mr-2" />
                Add New User
              </button>
            </motion.div>
          </motion.div>
  
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search Users</label>
                  <div className="relative group">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 block w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Search by name or email..."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      // Clear grade filter when role changes
                      if (e.target.value !== 'STUDENT') {
                        setGradeFilter('');
                      }
                    }}
                    className="block w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="STUDENT">Student</option>
                  </select>
                </div>
                
                {/* Grade Filter - Only show when STUDENT role is selected */}
                {roleFilter === 'STUDENT' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Grade</label>
                    <select
                      value={gradeFilter}
                      onChange={(e) => setGradeFilter(e.target.value)}
                      className="block w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">All Grades</option>
                      <option value="1st Grade">Grade 01</option>
                      <option value="2nd Grade">Grade 02</option>
                      <option value="3rd Grade">Grade 03</option>
                      <option value="4th Grade">Grade 4</option>
                      <option value="5th Grade">Grade 5</option>
                      <option value="6th Grade">Grade 6</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('');
                      setStatusFilter('');
                      setGradeFilter('');
                    }}
                    className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
  
          {/* Users Table or No Users Message */}
          {filteredUsers.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-emerald-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-200">
                    {filteredUsers.map((user, index) => (
                      <motion.tr 
                        key={user.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="hover:bg-emerald-50/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border-2 border-emerald-200">
                                <span className="text-lg">{getRoleIcon(user.role)}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? (
                              <>
                                <FiCheck className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <FiXCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phoneNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openViewModal(user)}
                              className="text-emerald-600 hover:text-emerald-900 p-1 transition-colors duration-200"
                              title="View Details"
                            >
                              <FiEye className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEditModal(user)}
                              className="text-blue-600 hover:text-blue-900 p-1 transition-colors duration-200"
                              title="Edit User"
                            >
                              <FiEdit3 className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openDeleteModal(user)}
                              className="text-red-600 hover:text-red-900 p-1 transition-colors duration-200"
                              title="Delete User"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-200"
                >
                  <FiUsers className="h-12 w-12 text-emerald-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Users Found</h3>
                <p className="text-gray-600 mb-8">
                  {loading ? 'Loading users...' : 'No users have been created yet. Get started by adding your first user.'}
                </p>
                {!loading && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <FiUserPlus className="h-5 w-5 mr-2" />
                    Add Your First User
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
          
          {/* ALL MODALS MUST BE INSIDE THIS MAIN WRAPPER */}
          
          {/* Edit User Modal */}
          {showEditModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-3xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <FiEdit3 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Edit User</h3>
                        <p className="text-emerald-100 text-sm">Update user information and settings</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-white hover:text-emerald-100 transition-colors duration-200"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                </div>
  
                {/* Form Content */}
                <div className="p-8">
                  <form onSubmit={handleUpdateUser} className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <FiUser className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="firstName"
                              value={userForm.firstName}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                              required
                            />
                            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="lastName"
                              value={userForm.lastName}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                              required
                            />
                            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contact & Security Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <FiMail className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Contact & Security</h4>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <div className="relative">
                            <input
                              type="email"
                              name="email"
                              value={userForm.email}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                              required
                            />
                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                          <div className="relative">
                            <input
                              type="password"
                              name="password"
                              value={userForm.password}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                              placeholder="Leave blank to keep current password"
                            />
                            <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <FiInfo className="h-3 w-3 mr-1" />
                            Leave blank to keep current password
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Role & Contact Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <FiShield className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Role & Contact</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
                          <div className="relative">
                            <select
                              name="role"
                              value={userForm.role}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none"
                              required
                            >
                              <option value="ADMIN">Admin</option>
                              <option value="TEACHER">Teacher</option>
                              <option value="STUDENT">Student</option>
                            </select>
                            <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <div className="relative">
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={userForm.phoneNumber}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            />
                            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <FiCheckCircle className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Account Status</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="relative flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all duration-200">
                          <input
                            type="radio"
                            name="isActive"
                            value="true"
                            checked={userForm.isActive === true}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            userForm.isActive === true 
                              ? 'border-purple-600 bg-purple-600' 
                              : 'border-gray-300'
                          }`}>
                            {userForm.isActive === true && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <FiCheck className="h-5 w-5 text-green-500 mr-2" />
                            <span className="font-medium text-gray-900">Active</span>
                          </div>
                        </label>
                        
                        <label className="relative flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all duration-200">
                          <input
                            type="radio"
                            name="isActive"
                            value="false"
                            checked={userForm.isActive === false}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            userForm.isActive === false 
                              ? 'border-purple-600 bg-purple-600' 
                              : 'border-gray-300'
                          }`}>
                            {userForm.isActive === false && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <FiXCircle className="h-5 w-5 text-red-500 mr-2" />
                            <span className="font-medium text-gray-900">Inactive</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    {/* Conditional fields based on role */}
                    {userForm.role === 'TEACHER' && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <FiBookOpen className="h-5 w-5 text-purple-600" />
                          <h4 className="text-lg font-semibold text-gray-900">Teacher Information</h4>
                        </div>
                        <div className="space-y-4">
                          {/* Grade Selection for Teachers */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                            <div className="relative">
                              <select
                                name="classGrade"
                                value={userForm.classGrade || ''}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none"
                                required
                              >
                                <option value="">Select Grade</option>
                                <option value="1st Grade">Grade 01</option>
                                <option value="2nd Grade">Grade 02</option>
                                <option value="3rd Grade">Grade 03</option>
                                <option value="4th Grade">Grade 4</option>
                                <option value="5th Grade">Grade 5</option>
                                <option value="6th Grade">Grade 6</option>
                              </select>
                              <FiBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>

                          {/* Subject Selection based on Grade */}
                          {userForm.classGrade && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Taught</label>
                              <div className="relative">
                                <select
                                  name="subjectTaught"
                                  value={userForm.subjectTaught || ''}
                                  onChange={handleInputChange}
                                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none"
                                  required
                                >
                                  <option value="">Select Subject</option>
                                  {userForm.classGrade === '1st Grade' && (
                                    <>
                                      <option value="Maths Concept">Maths Concept</option>
                                      <option value="Writing">Writing</option>
                                      <option value="Concept">Concept</option>
                                    </>
                                  )}
                                  {(userForm.classGrade === '2nd Grade' || userForm.classGrade === '3rd Grade') && (
                                    <>
                                      <option value="Writing">Writing</option>
                                      <option value="Reading">Reading</option>
                                      <option value="Speaking">Speaking</option>
                                      <option value="Maths">Maths</option>
                                    </>
                                  )}
                                  {userForm.classGrade === '4th Grade' && (
                                    <>
                                      <option value="Maths">Maths</option>
                                      <option value="English">English</option>
                                      <option value="IT">IT</option>
                                      <option value="French">French</option>
                                      <option value="Music">Music</option>
                                      <option value="Environment">Environment</option>
                                    </>
                                  )}
                                  {(userForm.classGrade === '5th Grade' || userForm.classGrade === '6th Grade') && (
                                    <>
                                      <option value="English">English</option>
                                      <option value="Maths">Maths</option>
                                      <option value="Science">Science</option>
                                      <option value="Geography">Geography</option>
                                      <option value="Music">Music</option>
                                      <option value="Art">Art</option>
                                      <option value="Dance">Dance</option>
                                      <option value="History">History</option>
                                      <option value="French">French</option>
                                      <option value="Chinese">Chinese</option>
                                    </>
                                  )}
                                </select>
                                <FiBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {userForm.role === 'STUDENT' && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <FiBookOpen className="h-5 w-5 text-purple-600" />
                          <h4 className="text-lg font-semibold text-gray-900">Student Information</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Class Grade</label>
                            <div className="relative">
                              <select
                                name="classGrade"
                                value={userForm.classGrade || ''}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none"
                                required
                              >
                                <option value="">Select Grade</option>
                                <option value="1st Grade">Grade 01</option>
                                <option value="2nd Grade">Grade 02</option>
                                <option value="3rd Grade">Grade 03</option>
                                <option value="4th Grade">Grade 4</option>
                                <option value="5th Grade">Grade 5</option>
                                <option value="6th Grade">Grade 6</option>
                              </select>
                              <FiBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                            <div className="relative">
                              <input
                                type="text"
                                name="studentId"
                                value={userForm.studentId || ''}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                placeholder="e.g., STU001, STU002"
                              />
                              <FiBookOpen className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4 pt-6">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                      >
                        <FiCheck className="h-5 w-5" />
                        <span>Update User</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <FiX className="h-5 w-5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
          
          {/* View User Modal */}
          {showViewModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-3xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <FiEye className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">User Details</h3>
                        <p className="text-emerald-100 text-sm">View complete user information</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="text-white hover:text-emerald-100 transition-colors duration-200"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* User Information */}
                <div className="p-8 space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <FiUser className="h-5 w-5 text-purple-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                        <p className="text-gray-900 font-medium">{selectedUser.firstName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                        <p className="text-gray-900 font-medium">{selectedUser.lastName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <FiMail className="h-5 w-5 text-purple-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-gray-900 font-medium">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                        <p className="text-gray-900 font-medium">{selectedUser.phoneNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Role & Status */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <FiShield className="h-5 w-5 text-purple-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Role & Status</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedUser.isActive ? (
                            <>
                              <FiCheck className="h-4 w-4 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <FiXCircle className="h-4 w-4 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role-specific Information */}
                  {selectedUser.role === 'TEACHER' && selectedUser.subjectTaught && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <FiBookOpen className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Teacher Information</h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Subject Taught</label>
                        <p className="text-gray-900 font-medium">{selectedUser.subjectTaught}</p>
                      </div>
                    </div>
                  )}

                  {selectedUser.role === 'STUDENT' && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <FiBookOpen className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Student Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedUser.classGrade && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Class Grade</label>
                            <p className="text-gray-900 font-medium">{selectedUser.classGrade}</p>
                          </div>
                        )}
                        {selectedUser.studentId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Student ID</label>
                            <p className="text-gray-900 font-medium">{selectedUser.studentId}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 pt-6">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        openEditModal(selectedUser);
                      }}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <FiEdit3 className="h-5 w-5" />
                      <span>Edit User</span>
                    </button>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <FiX className="h-5 w-5" />
                      <span>Close</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-t-3xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <FiTrash2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Confirm Deactivation</h3>
                        <p className="text-red-100 text-sm">This action cannot be undone</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiTrash2 className="h-10 w-10 text-red-600" />
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Deactivate User Account
                  </h4>
                  
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to deactivate the account for{' '}
                    <span className="font-semibold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </span>?
                  </p>
                  
                  <p className="text-sm text-gray-500 mb-8">
                    The user will no longer be able to access the system, but their data will be preserved.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleDeleteUser}
                      className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <FiTrash2 className="h-5 w-5" />
                      <span>Deactivate User</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <FiX className="h-5 w-5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          
          {/* Create User Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-3xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <FiUserPlus className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Create New User</h3>
                        <p className="text-emerald-100 text-sm">Add a new user to the system</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-white hover:text-emerald-100 transition-colors duration-200"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  <form onSubmit={handleCreateUser} className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <FiUser className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="firstName"
                              value={userForm.firstName}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                              required
                            />
                            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="lastName"
                              value={userForm.lastName}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                              required
                            />
                            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contact & Security Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <FiMail className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Contact & Security</h4>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <div className="relative">
                            <input
                              type="email"
                              name="email"
                              value={userForm.email}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                              required
                            />
                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                          <div className="relative">
                            <input
                              type="password"
                              name="password"
                              value={userForm.password}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                              required
                            />
                            <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Role & Contact Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <FiShield className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Role & Contact</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
                          <div className="relative">
                            <select
                              name="role"
                              value={userForm.role}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none"
                              required
                            >
                              <option value="">Select Role</option>
                              <option value="ADMIN">Admin</option>
                              <option value="TEACHER">Teacher</option>
                              <option value="STUDENT">Student</option>
                              <option value="PARENT">Parent</option>
                            </select>
                            <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <div className="relative">
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={userForm.phoneNumber}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            />
                            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <FiCheckCircle className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Account Status</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="relative flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all duration-200">
                          <input
                            type="radio"
                            name="isActive"
                            value="true"
                            checked={userForm.isActive === true}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            userForm.isActive === true 
                              ? 'border-purple-600 bg-purple-600' 
                              : 'border-gray-300'
                          }`}>
                            {userForm.isActive === true && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <FiCheck className="h-5 w-5 text-green-500 mr-2" />
                            <span className="font-medium text-gray-900">Active</span>
                          </div>
                        </label>
                        
                        <label className="relative flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all duration-200">
                          <input
                            type="radio"
                            name="isActive"
                            value="false"
                            checked={userForm.isActive === false}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            userForm.isActive === false 
                              ? 'border-purple-600 bg-purple-600' 
                              : 'border-gray-300'
                          }`}>
                            {userForm.isActive === false && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <FiXCircle className="h-5 w-5 text-red-500 mr-2" />
                            <span className="font-medium text-gray-900">Inactive</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    {/* Conditional fields based on role */}
                    {userForm.role === 'TEACHER' && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <FiBookOpen className="h-5 w-5 text-purple-600" />
                          <h4 className="text-lg font-semibold text-gray-900">Teacher Information</h4>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subject Taught</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="subjectTaught"
                              value={userForm.subjectTaught || ''}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                              placeholder="e.g., Mathematics, English, Science"
                            />
                            <FiBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {userForm.role === 'STUDENT' && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <FiBookOpen className="h-5 w-5 text-purple-600" />
                          <h4 className="text-lg font-semibold text-gray-900">Student Information</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Class Grade</label>
                            <div className="relative">
                              <select
                                name="classGrade"
                                value={userForm.classGrade || ''}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none"
                                required
                              >
                                <option value="">Select Grade</option>
                                <option value="1st Grade">Grade 01</option>
                                <option value="2nd Grade">Grade 02</option>
                                <option value="3rd Grade">Grade 03</option>
                                <option value="4th Grade">Grade 4</option>
                                <option value="5th Grade">Grade 5</option>
                                <option value="6th Grade">Grade 6</option>
                              </select>
                              <FiBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                            <div className="relative">
                                                          <input
                              type="text"
                              name="studentId"
                              value={userForm.studentId || ''}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                              placeholder="e.g., STU001, STU002"
                            />
                              <FiBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-6">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                      >
                        <FiCheck className="h-5 w-5" />
                        <span>Create User</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <FiX className="h-5 w-5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserManagement;
