import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiBook, FiAward, FiCamera, FiBookOpen, FiUsers, FiStar, FiMapPin } from 'react-icons/fi';

const Register = () => {
  const roles = [
    { 
      value: 'STUDENT', 
      label: 'Student', 
      icon: '👨‍🎓',
              description: 'Access your homeworks, grades, and class schedule'
    },
    { 
      value: 'TEACHER', 
      label: 'Teacher', 
      icon: '👨‍🏫',
              description: 'Manage classes, homeworks, and student progress'
    }
  ];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phoneNumber: '',
    classGrade: '',
    subjectTaught: '',
    studentId: '',
    address: '',
    parentFirstName: '',
    parentLastName: ''
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
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
    }
  };

  const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
              const response = await fetch('/api/profile-pictures/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.text();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate teacher requirements
    if (formData.role === 'TEACHER') {
      if (!formData.classGrade) {
        setError('Please select a grade level for teaching');
        return;
      }
      if (!formData.subjectTaught) {
        setError('Please select a subject to teach');
        return;
      }
    }

    // Validate student requirements
    if (formData.role === 'STUDENT') {
      if (!formData.classGrade) {
        setError('Please select your grade level');
        return;
      }
    }
    
    setLoading(true);
    setError('');

    try {
      let profilePictureFilename = null;
      
      // Upload profile picture if selected
      if (profilePicture) {
        setUploadingPicture(true);
        profilePictureFilename = await uploadProfilePicture(profilePicture);
        setUploadingPicture(false);
      }

      // Register user with profile picture filename
      const result = await register({
        ...formData,
        profilePicture: profilePictureFilename
      });
      
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to upload profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full space-y-8 flex">
          {/* Left side - Registration Form */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 flex items-center justify-center pr-8"
          >
            <div className="w-full max-w-2xl max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-transparent hover:scrollbar-thumb-emerald-400 transition-all duration-300">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 my-8"
              >
                <div className="text-center mb-8">
                  <motion.h2 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-3xl font-bold text-gray-800 mb-2"
                  >
                    Create Your Account
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-gray-600"
                  >
                    Join LearnHub today and start your learning journey
                  </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 pb-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Profile Picture Upload */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col items-center space-y-4"
                  >
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Picture
                    </label>
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-300 flex items-center justify-center shadow-lg">
                        {profilePicturePreview ? (
                          <img
                            src={profilePicturePreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiUser className="w-12 h-12 text-emerald-500" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full p-2 cursor-pointer hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg transform hover:scale-110">
                        <FiCamera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Click the camera icon to upload a profile picture<br />
                      Supported formats: JPG, PNG, GIF, WebP (max 5MB)
                    </p>
                  </motion.div>

                  {/* Role Selection */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    {roles.map((role, index) => (
                      <motion.div
                        key={role.value}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.role === role.value
                            ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                            : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
                        }`}
                        onClick={() => handleChange({ target: { name: 'role', value: role.value } })}
                      >
                        <div className="text-2xl mb-2">{role.icon}</div>
                        <h3 className="font-semibold text-gray-900">{role.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Basic Information */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="relative group">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <div className="relative group">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.1 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative group">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </motion.div>

                  {/* Address Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative group">
                      <FiMapPin className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                        placeholder="Enter your full address..."
                      />
                    </div>
                  </motion.div>

                  {/* Role-specific fields */}
                  {formData.role === 'STUDENT' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.3 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class Grade
                      </label>
                      <div className="relative group">
                        <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <select
                          name="classGrade"
                          value={formData.classGrade}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white/50 backdrop-blur-sm transition-all duration-200"
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
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Parent Information */}
                      <div className="mt-8 pt-6 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="text-xl font-bold text-gray-800">Parent Information</h5>
                            <p className="text-sm text-gray-600">Please provide your parent's contact details</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Parent First Name
                            </label>
                            <div className="relative group">
                              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                              <input
                                type="text"
                                name="parentFirstName"
                                value={formData.parentFirstName}
                                onChange={handleChange}
                                className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
                                placeholder="Enter parent's first name"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Parent Last Name
                            </label>
                            <div className="relative group">
                              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                              <input
                                type="text"
                                name="parentLastName"
                                value={formData.parentLastName}
                                onChange={handleChange}
                                className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
                                placeholder="Enter parent's last name"
                                required
                              />
                            </div>
                          </div>
                          

                        </div>
                      </div>
                    </motion.div>
                  )}

                  {formData.role === 'TEACHER' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.3 }}
                      className="space-y-4"
                    >
                      {/* Grade Selection for Teachers */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grade Level
                        </label>
                        <div className="relative group">
                          <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                          <select
                            name="classGrade"
                            value={formData.classGrade}
                            onChange={handleChange}
                            className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white/50 backdrop-blur-sm transition-all duration-200"
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
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Subject Selection based on Grade */}
                      {formData.classGrade && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject Taught
                          </label>
                          <div className="relative group">
                            <FiAward className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            <select
                              name="subjectTaught"
                              value={formData.subjectTaught}
                              onChange={handleChange}
                              className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white/50 backdrop-blur-sm transition-all duration-200"
                              required
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
                        </div>
                      )}
                    </motion.div>
                  )}

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || uploadingPicture}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform"
                  >
                    {loading || uploadingPicture ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {uploadingPicture ? 'Uploading Picture...' : 'Creating Account...'}
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </motion.button>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.5 }}
                    className="text-center mt-6"
                  >
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors hover:underline"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </motion.div>
                </form>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side - Hero Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:flex flex-1 items-center justify-center pl-8"
          >
            <div className="relative w-full max-w-lg text-center">
              {/* Logo and Title */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-2xl mb-6">
                  <FiBookOpen className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                  LearnHub
                </h1>
                <p className="text-xl text-gray-600 font-medium">
                  Creative Learning
                </p>
              </motion.div>

              {/* Floating Icons */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-16 right-16 text-4xl"
              >
                🚀
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-24 left-16 text-3xl"
              >
                💡
              </motion.div>

              {/* Feature Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-4 mt-12"
              >
                <div className="flex items-center justify-center space-x-3 text-gray-600">
                  <FiUsers className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium">Join Our Community</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-gray-600">
                  <FiStar className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-medium">Unlock Your Potential</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-gray-600">
                  <FiBookOpen className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm font-medium">Start Learning Today</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register; 