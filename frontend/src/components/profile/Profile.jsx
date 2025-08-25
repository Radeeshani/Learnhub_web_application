import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiBook, FiAward, FiCamera, FiSave, FiEdit3, FiX } from 'react-icons/fi';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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
    studentId: ''
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
        studentId: user.studentId || ''
      });
      
      // Set profile picture preview if exists
      if (user.profilePicture) {
        setProfilePicturePreview(`http://localhost:8080/api/profile-pictures/${user.profilePicture}`);
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
      const response = await fetch('http://localhost:8080/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          profilePicture: profilePictureFilename || user.profilePicture
        })
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        // Refresh user data (you might want to implement this in AuthContext)
        window.location.reload(); // Temporary solution
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile. Please try again.');
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
      studentId: user.studentId || ''
    });
    
    // Reset profile picture
    setProfilePicture(null);
    if (user.profilePicture) {
      setProfilePicturePreview(`http://localhost:8080/api/profile-pictures/${user.profilePicture}`);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                >
                  <FiEdit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                  >
                    <FiX className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading || uploadingPicture}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    {loading || uploadingPicture ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-6"
            >
              {success}
            </motion.div>
          )}

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-16 h-16 text-gray-400 m-8" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-sky-500 text-white rounded-full p-3 cursor-pointer hover:bg-sky-600 transition-colors shadow-lg">
                  <FiCamera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {isEditing && (
              <p className="text-xs text-gray-500 text-center">
                Click the camera icon to upload a new profile picture<br />
                Supported formats: JPG, PNG, GIF, WebP (max 5MB)
              </p>
            )}
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>

            {/* Role-specific Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                  {getRoleDisplay()}
                </div>
              </div>

                            {user.role === 'STUDENT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        name="classGrade"
                        value={formData.classGrade}
                        onChange={handleChange}
                        className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
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
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                      {formData.classGrade || 'Not specified'}
                    </div>
                  )}
                </div>
              )}

              {user.role === 'TEACHER' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade Level
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                          name="classGrade"
                          value={formData.classGrade}
                          onChange={handleChange}
                          className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
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
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                        {formData.classGrade || 'Not specified'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Taught
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <FiAward className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                          name="subjectTaught"
                          value={formData.subjectTaught}
                          onChange={handleChange}
                          className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
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
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                        {formData.subjectTaught || 'Not specified'}
                      </div>
                    )}
                  </div>
                </>
              )}

              {user.role === 'STUDENT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                      isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <FiX className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
