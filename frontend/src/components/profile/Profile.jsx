import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiBook, FiAward, FiCamera, FiSave, FiEdit3, FiX, FiLock, FiEye, FiEyeOff, FiMapPin } from 'react-icons/fi';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  TrophyIcon,
  CameraIcon,
  CheckIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon,
  HeartIcon,
  StarIcon,
  ShieldCheckIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    classGrade: '',
    subjectTaught: '',
    address: '',
    parentFirstName: '',
    parentLastName: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        classGrade: user.classGrade || '',
        subjectTaught: user.subjectTaught || '',
        address: user.address || '',
        parentFirstName: user.parentFirstName || '',
        parentLastName: user.parentLastName || ''
      });
      
      // Set profile picture preview if exists
      if (user.profilePicture) {
        const pictureUrl = `/api/profile-pictures/${user.profilePicture}`;
        console.log('Setting profile picture URL:', pictureUrl);
        setProfilePicturePreview(pictureUrl);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If grade is changed for teachers, reset subject if it's no longer valid
    if (name === 'classGrade' && user?.role === 'TEACHER') {
      const currentSubject = formData.subjectTaught;
      let isSubjectValid = false;
      
      // Check if current subject is valid for the new grade
      if (value === '1st Grade') {
        isSubjectValid = ['Maths Concept', 'Writing', 'Concept'].includes(currentSubject);
      } else if (value === '2nd Grade' || value === '3rd Grade') {
        isSubjectValid = ['Writing', 'Reading', 'Speaking', 'Maths'].includes(currentSubject);
      } else if (value === '4th Grade') {
        isSubjectValid = ['Maths', 'English', 'IT', 'French', 'Music', 'Environment'].includes(currentSubject);
      } else if (value === '5th Grade' || value === '6th Grade') {
        isSubjectValid = ['English', 'Maths', 'Science', 'Geography', 'Music', 'Art', 'Dance', 'History', 'French', 'Chinese'].includes(currentSubject);
      }
      
      // Reset subject if it's no longer valid
      if (!isSubjectValid) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          subjectTaught: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      if (error) setError('');
      if (success) setSuccess('');
    }
  };

  const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/profile-pictures/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const result = response.data;
        // Extract filename from response
        const filename = result.replace('Profile picture uploaded successfully: ', '');
        return filename;
      } else {
        throw new Error('Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let profilePictureFilename = null;
      
      // Upload profile picture if selected
      if (profilePicture) {
        setUploadingPicture(true);
        profilePictureFilename = await uploadProfilePicture(profilePicture);
        setUploadingPicture(false);
      }

      // Update user profile
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/profile', {
        ...formData,
        profilePicture: profilePictureFilename || user.profilePicture
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        // Refresh user data (you might want to implement this in AuthContext)
        window.location.reload(); // Temporary solution
      } else {
        const errorData = response.data;
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/change-password', {
        email: user.email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setSuccess('Password changed successfully!');
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = response.data;
        setError(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      classGrade: user.classGrade || '',
      subjectTaught: user.subjectTaught || '',
      address: user.address || '',
      parentFirstName: user.parentFirstName || '',
      parentLastName: user.parentLastName || ''
    });
    
    // Reset profile picture
    setProfilePicture(null);
    if (user.profilePicture) {
      setProfilePicturePreview(`/api/profile-pictures/${user.profilePicture}`);
    } else {
      setProfilePicturePreview(null);
    }
    
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const getRoleDisplay = () => {
    if (!user?.role) return '';
    
    switch (user.role) {
      case 'ADMIN':
        return '👑 Administrator';
      case 'TEACHER':
        return '👨‍🏫 Teacher';
      case 'STUDENT':
        return '👨‍🎓 Student';
      case 'PARENT':
        return '👨‍👩‍👧‍👦 Parent';
      default:
        return user.role;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-teal-600 font-semibold">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-teal-50 via-white to-coral-50 py-8 relative">
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-teal-400 to-coral-400 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-r from-purple-400 to-yellow-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-r from-coral-400 to-teal-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 right-10 w-14 h-14 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
      
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-white/20 to-coral-50/30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(20,184,166,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.1),transparent_50%)] pointer-events-none"></div>
      
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-gradient bg-gradient-to-r from-teal-500 to-coral-500 rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-coral-600/20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                  <UserIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
                  <p className="text-white/90 text-lg">Manage your personal information and settings</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 transform hover:scale-105 border border-white/30"
                    >
                      <PencilIcon className="w-5 h-5 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="btn-secondary inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 transform hover:scale-105 border border-white/30"
                    >
                      <KeyIcon className="w-5 h-5 mr-2" />
                      Change Password
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="btn-secondary inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 transform hover:scale-105 border border-white/30"
                    >
                      <FiX className="w-5 h-5 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading || uploadingPicture}
                      className="btn-primary inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <CheckIcon className="w-5 h-5 mr-2" />
                      {loading || uploadingPicture ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Alerts */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm mb-6 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <FiX className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-semibold">{error}</span>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200 text-green-700 px-6 py-4 rounded-2xl text-sm mb-6 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-semibold">{success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Picture and Basic Info */}
          <div className="lg:col-span-1">
            {/* Enhanced Profile Picture Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card bg-white rounded-3xl shadow-xl p-6 mb-6"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-teal-100 to-coral-100 border-4 border-white shadow-2xl transform group-hover:scale-105 transition-transform duration-300 relative">
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onLoad={(e) => {
                          console.log('Profile picture loaded successfully:', e.target.src);
                        }}
                        onError={(e) => {
                          console.error('Profile picture failed to load:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-r from-teal-200 to-coral-200 ${profilePicturePreview ? 'hidden' : 'flex'}`}>
                      <UserIcon className="w-16 h-16 text-teal-600" />
                    </div>
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-full p-3 cursor-pointer hover:from-teal-600 hover:to-coral-600 transition-all duration-300 shadow-xl transform hover:scale-110 border-2 border-white">
                      <CameraIcon className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  
                  {/* Role Badge */}
                  <div className="absolute -top-2 -left-2 bg-gradient-to-r from-purple-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white">
                    {getRoleDisplay()}
                  </div>
                </div>
                
                {isEditing && (
                  <div className="text-center bg-gradient-to-r from-teal-50 to-coral-50 px-4 py-3 rounded-xl border border-teal-200">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <CameraIcon className="w-4 h-4 text-teal-600" />
                      <span className="text-teal-800 font-semibold text-sm">Upload New Picture</span>
                    </div>
                    <p className="text-xs text-teal-700">
                      Click the camera icon to upload a new profile picture<br />
                      Supported formats: JPG, PNG, GIF, WebP (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

          </div>

          {/* Right Column - Form Fields */}
          <div className="lg:col-span-2">
            {/* Enhanced Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card bg-white rounded-3xl shadow-xl p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-100 to-coral-100 rounded-xl flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300 ${
                        isEditing ? 'border-teal-300 bg-white hover:border-teal-400' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300 ${
                        isEditing ? 'border-teal-300 bg-white hover:border-teal-400' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300 ${
                        isEditing ? 'border-teal-300 bg-white hover:border-teal-400' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300 ${
                        isEditing ? 'border-teal-300 bg-white hover:border-teal-400' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                {/* Role-specific Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-yellow-100 rounded-xl flex items-center justify-center">
                      <TrophyIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Role Information</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-yellow-50 border-2 border-purple-200 rounded-xl text-purple-800 font-semibold">
                      {getRoleDisplay()}
                    </div>
                  </div>

                  {user.role === 'STUDENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <AcademicCapIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 h-5 w-5" />
                          <select
                            name="classGrade"
                            value={formData.classGrade}
                            onChange={handleChange}
                            className="pl-12 pr-10 py-3 w-full border-2 border-teal-300 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 appearance-none bg-white hover:border-teal-400 transition-all duration-300"
                          >
                            <option value="">Select Grade</option>
                            <option value="1st Grade">Grade 01</option>
                            <option value="2nd Grade">Grade 02</option>
                            <option value="3rd Grade">Grade 03</option>
                            <option value="4th Grade">Grade 4</option>
                            <option value="5th Grade">Grade 5</option>
                            <option value="6th Grade">Grade 6</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-coral-50 border-2 border-teal-200 rounded-xl text-teal-800 font-semibold">
                          {formData.classGrade || 'Not specified'}
                        </div>
                      )}
                    </div>
                  )}

                  {user.role === 'TEACHER' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grade Level
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <AcademicCapIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 h-5 w-5" />
                            <select
                              name="classGrade"
                              value={formData.classGrade}
                              onChange={handleChange}
                              className="pl-12 pr-10 py-3 w-full border-2 border-teal-300 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 appearance-none bg-white hover:border-teal-400 transition-all duration-300"
                            >
                              <option value="">Select Grade</option>
                              <option value="1st Grade">Grade 01</option>
                              <option value="2nd Grade">Grade 02</option>
                              <option value="3rd Grade">Grade 03</option>
                              <option value="4th Grade">Grade 4</option>
                              <option value="5th Grade">Grade 5</option>
                              <option value="6th Grade">Grade 6</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-coral-50 border-2 border-teal-200 rounded-xl text-teal-800 font-semibold">
                            {formData.classGrade || 'Not specified'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject Taught
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <StarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coral-500" />
                            <select
                              name="subjectTaught"
                              value={formData.subjectTaught}
                              onChange={handleChange}
                              className="pl-12 pr-10 py-3 w-full border-2 border-coral-300 rounded-xl focus:ring-4 focus:ring-coral-200 focus:border-coral-500 appearance-none bg-white hover:border-coral-400 transition-all duration-300"
                            >
                              <option value="">Select Subject</option>
                              {formData.classGrade === '1st Grade' && (
                                <>
                                  <option value="Maths Concept">Maths Concept</option>
                                  <option value="Writing">Writing</option>
                                  <option value="Concept">Concept</option>
                                </>
                              )}
                              {(formData.classGrade === '2nd Grade' || formData.classGrade === '3rd Grade') && (
                                <>
                                  <option value="Writing">Writing</option>
                                  <option value="Reading">Reading</option>
                                  <option value="Speaking">Speaking</option>
                                  <option value="Maths">Maths</option>
                                </>
                              )}
                              {formData.classGrade === '4th Grade' && (
                                <>
                                  <option value="Maths">Maths</option>
                                  <option value="English">English</option>
                                  <option value="IT">IT</option>
                                  <option value="French">French</option>
                                  <option value="Music">Music</option>
                                  <option value="Environment">Environment</option>
                                </>
                              )}
                              {(formData.classGrade === '5th Grade' || formData.classGrade === '6th Grade') && (
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
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-3 bg-gradient-to-r from-coral-50 to-pink-50 border-2 border-coral-200 rounded-xl text-coral-800 font-semibold">
                            {formData.subjectTaught || 'Not specified'}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Address and Parent Information for Students */}
              {user.role === 'STUDENT' && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Address Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                          <FiMapPin className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Address Information</h3>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        {isEditing ? (
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 resize-none"
                            placeholder="Enter your full address..."
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 font-semibold min-h-[60px] flex items-center">
                            {formData.address || 'Not specified'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Parent Information Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                          <FiUser className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Parent Information</h3>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parent First Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="parentFirstName"
                            value={formData.parentFirstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300"
                            placeholder="Enter parent's first name"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl text-green-800 font-semibold">
                            {formData.parentFirstName || 'Not specified'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parent Last Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="parentLastName"
                            value={formData.parentLastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300"
                            placeholder="Enter parent's last name"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl text-green-800 font-semibold">
                            {formData.parentLastName || 'Not specified'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-gradient bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl shadow-2xl p-8 relative overflow-hidden mt-8"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-pink-600/20"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                <ArrowRightOnRectangleIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Account Actions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center px-6 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-2xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 transform hover:scale-105 border-2 border-white/30 shadow-lg"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                Logout
              </button>
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full flex items-center justify-center px-6 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-2xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 transform hover:scale-105 border-2 border-white/30 shadow-lg"
              >
                <KeyIcon className="w-5 h-5 mr-3" />
                Change Password
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50"
          >
            <div className="relative top-20 mx-auto p-6 border-0 w-[500px] shadow-2xl rounded-3xl bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    🔐 Change Password
                  </h3>
                  <button
                    onClick={() => setShowChangePassword(false)}
                    className="text-blue-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-all duration-300 transform hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-2">🔑 Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="input-field w-full pl-12 pr-12 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg transition-all duration-300 transform focus:scale-105"
                        placeholder="Enter your current password"
                      />
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                      >
                        {showPasswords.current ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-2">🆕 New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="input-field w-full pl-12 pr-12 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg transition-all duration-300 transform focus:scale-105"
                        placeholder="Enter your new password"
                      />
                      <KeyIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                      >
                        {showPasswords.new ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Password must be at least 6 characters long</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-2">✅ Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="input-field w-full pl-12 pr-12 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg transition-all duration-300 transform focus:scale-105"
                        placeholder="Confirm your new password"
                      />
                      <ShieldCheckIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                      >
                        {showPasswords.confirm ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowChangePassword(false)}
                    className="btn-secondary bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    ❌ Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="btn-primary bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? '🔄 Changing...' : '💾 Change Password'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
