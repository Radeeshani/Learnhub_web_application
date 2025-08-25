import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiBook, FiAward, FiCamera } from 'react-icons/fi';

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
    studentId: ''
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
      const response = await fetch('http://localhost:8080/api/profile-pictures/upload', {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 flex">
        {/* Left side - Registration Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 bg-white rounded-3xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join EduBuddy today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="flex flex-col items-center space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-sky-500 text-white rounded-full p-2 cursor-pointer hover:bg-sky-600 transition-colors">
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
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              {roles.map((role) => (
                <motion.div
                  key={role.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    formData.role === role.value
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange({ target: { name: 'role', value: role.value } })}
                >
                  <div className="text-2xl mb-2">{role.icon}</div>
                  <h3 className="font-semibold text-gray-900">{role.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {formData.role === 'STUDENT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Grade
                </label>
                <div className="relative">
                  <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="classGrade"
                    value={formData.classGrade}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
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
            )}

            {formData.role === 'TEACHER' && (
              <div className="space-y-4">
                {/* Grade Selection for Teachers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <div className="relative">
                    <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="classGrade"
                      value={formData.classGrade}
                      onChange={handleChange}
                      className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Taught
                    </label>
                    <div className="relative">
                      <FiAward className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        name="subjectTaught"
                        value={formData.subjectTaught}
                        onChange={handleChange}
                        className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
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
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || uploadingPicture}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-sky-600 hover:text-sky-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        {/* Right side - Decorative */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:flex flex-1 items-center justify-center pl-8"
        >
          <div className="relative w-full max-w-lg">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
              <img
                src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png"
                alt="Education Illustration"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative">
              <img
                src="https://img.freepik.com/free-vector/teaching-concept-illustration_114360-1708.jpg"
                alt="Education Illustration"
                className="w-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register; 