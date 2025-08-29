import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  DocumentPlusIcon,
  ClockIcon,
  BookOpenIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BellIcon,
  ChartBarIcon,
  CheckCircleIcon,
  PaperClipIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ChevronDownIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence } from 'framer-motion';

const TeacherDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [classes, setClasses] = useState([]);

  // Check if user is authenticated and is a teacher
  useEffect(() => {
    if (!token || !user) {
      console.log('TeacherDashboard - No token or user, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'TEACHER') {
      console.log('TeacherDashboard - User is not a teacher, redirecting');
      navigate('/');
      return;
    }
    
    console.log('TeacherDashboard - User authenticated:', {
      userId: user.id,
      userEmail: user.email,
      userRole: user.role
    });
  }, [token, user, navigate]);

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  const [homeworks, setHomeworks] = useState([]);
  const [homeworksByGrade, setHomeworksByGrade] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingHomework, setEditingHomework] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [showSubmissionsList, setShowSubmissionsList] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Sticker options for feedback
  const stickerOptions = [
    { id: 1, emoji: '🌟', label: 'Excellent Work', category: 'achievement' },
    { id: 2, emoji: '🎉', label: 'Great Job', category: 'achievement' },
    { id: 3, emoji: '👍', label: 'Very Good', category: 'achievement' },
    { id: 4, emoji: '💯', label: 'Perfect Score', category: 'achievement' },
    { id: 5, emoji: '🏆', label: 'Outstanding', category: 'achievement' },
    { id: 6, emoji: '✨', label: 'Amazing', category: 'achievement' },
    { id: 7, emoji: '🎯', label: 'On Target', category: 'achievement' },
    { id: 8, emoji: '💪', label: 'Keep It Up', category: 'achievement' },
    { id: 9, emoji: '📚', label: 'Well Studied', category: 'achievement' },
    { id: 10, emoji: '🎨', label: 'Creative', category: 'achievement' },
    { id: 11, emoji: '🤔', label: 'Try More', category: 'improvement' },
    { id: 12, emoji: '📝', label: 'Needs Work', category: 'improvement' },
    { id: 13, emoji: '💡', label: 'Good Idea', category: 'improvement' },
    { id: 14, emoji: '🔍', label: 'Check Again', category: 'improvement' },
    { id: 15, emoji: '📖', label: 'Read More', category: 'improvement' },
    { id: 16, emoji: '🎭', label: 'Interesting', category: 'personality' },
    { id: 17, emoji: '🚀', label: 'Flying High', category: 'personality' },
    { id: 18, emoji: '💎', label: 'Precious Work', category: 'personality' },
    { id: 19, emoji: '🌈', label: 'Colorful', category: 'personality' },
    { id: 20, emoji: '🎪', label: 'Show Stopper', category: 'personality' }
  ];

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Geography',
    'Art',
    'Music',
    'Physical Education',
    'Computer Science',
    'Literature'
  ];

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowSuccessMessage(true);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const fetchHomeworks = async () => {
    if (!token) {
      console.error('No token available, cannot fetch homeworks');
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching homeworks with token:', token.substring(0, 20) + '...');
      const response = await axios.get(`/api/homework/teacher`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Homeworks response:', response.data);
      setHomeworks(response.data);
      
      // Group homeworks by grade
      const byGrade = response.data.reduce((acc, homework) => {
        const grade = homework.classGrade;
        if (!acc[grade]) {
          acc[grade] = [];
        }
        acc[grade].push(homework);
        return acc;
      }, {});
      setHomeworksByGrade(byGrade);
      
      // Fetch submissions after homeworks are loaded
      await fetchSubmissions(response.data);
    } catch (err) {
      console.error('Error fetching homeworks:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
      setError('Failed to fetch homeworks');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!token) {
      console.error('No token available, cannot fetch notifications');
      setNotificationsError('Authentication required. Please log in.');
      return;
    }

    try {
      setNotificationsLoading(true);
      setNotificationsError('');
      
      const response = await axios.get('/api/homework/notifications/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Notifications response:', response.data);
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
      setNotificationsError('Failed to fetch notifications');
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    // Debug: Log authentication state
    console.log('TeacherDashboard - Authentication state:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      hasUser: !!user,
      userRole: user?.role,
      userId: user?.id
    });

    fetchHomeworks();
    fetchClasses();
    fetchNotifications();
  }, [token]);
  
  // Debug: Log state changes for grading
  useEffect(() => {
    if (showGradingModal) {
      console.log('Grading modal opened with state:', {
        selectedSubmission,
        grade,
        feedback,
        showGradingModal
      });
    }
  }, [showGradingModal, selectedSubmission, grade, feedback]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  // Calculate total students across all classes
  const totalStudents = classes.reduce((sum, cls) => sum + (cls.currentStudentCount || 0), 0);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`/api/homework/classes/teacher/${user?.id}/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setClasses(response.data);
    } catch (err) {
      console.error('Error fetching classes:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
    }
  };

  const fetchSubmissions = async (homeworksData) => {
    try {
      console.log('Fetching submissions for homeworks:', homeworksData.map(h => ({ id: h.id, title: h.title })));
      
      // Fetch submissions for all homeworks
      const submissionsPromises = homeworksData.map(homework => {
        return axios.get(`/api/homework/submissions/homework/${homework.id}`);
      });
      
      const submissionsResponses = await Promise.all(submissionsPromises);
      const submissionsMap = {};
      
      submissionsResponses.forEach((response, index) => {
        console.log(`Submissions for homework ${homeworksData[index].id}:`, response.data);
        submissionsMap[homeworksData[index].id] = response.data;
      });
      
      console.log('Final submissions map:', submissionsMap);
      setSubmissions(submissionsMap);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
    }
  };

  const handleViewAttachment = (fileUrl) => {
    try {
      if (!fileUrl) {
        console.error('No file URL provided');
        return;
      }
      
      // Handle different file URL formats
      let fullUrl;
      if (fileUrl.startsWith('http')) {
        // External URL
        fullUrl = fileUrl;
      } else if (fileUrl.startsWith('/uploads/')) {
        // Backend uploads path - use new v1/files endpoint
        const fileName = fileUrl.split('/').pop();
        fullUrl = `/api/v1/files/download/homework/${fileName}`;
      } else if (fileUrl.startsWith('/api/uploads/')) {
        // Already has /api prefix - convert to new endpoint
        const fileName = fileUrl.split('/').pop();
        fullUrl = `/api/v1/files/download/homework/${fileName}`;
      } else {
        // Assume it's a filename, construct the full path
        fullUrl = `/api/v1/files/download/homework/${fileUrl}`;
      }
      
      console.log('Opening attachment:', fullUrl);
      window.open(fullUrl, '_blank');
    } catch (error) {
      console.error('Error opening attachment:', error);
      alert('Error opening attachment. Please try again.');
    }
  };

  const handleEdit = (homework) => {
    navigate(`/homework/edit/${homework.id}`, { state: { homework } });
  };

  const handleDelete = async (homework) => {
    if (!window.confirm('Are you sure you want to delete this homework?')) {
      return;
    }

    try {
              await axios.delete(`/api/homework/${homework.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Refresh homework list
      fetchHomeworks();
    } catch (err) {
      setError('Failed to delete homework');
      console.error('Error deleting homework:', err);
    }
  };

  const handleGradeSubmission = (submission) => {
    console.log('Opening grading modal for submission:', submission);
    console.log('Current state before opening modal:', { grade, feedback, selectedSubmission });
    
    // Ensure we have a clean state
    const gradeValue = submission.grade ? submission.grade.toString() : '';
    const feedbackValue = submission.feedback || '';
    
    console.log('Setting grade to:', gradeValue, 'and feedback to:', feedbackValue);
    
    // Set state in the correct order
    setSelectedSubmission(submission);
    setGrade(gradeValue);
    setFeedback(feedbackValue);
    setSelectedStickers([]); // Reset stickers for new submission
    
    // Force a small delay to ensure state is set before opening modal
    setTimeout(() => {
      console.log('Opening modal with state:', { grade: gradeValue, feedback: feedbackValue, selectedSubmission: submission });
      setShowGradingModal(true);
    }, 10);
  };
  
  const toggleSticker = (stickerId) => {
    setSelectedStickers(prev => {
      if (prev.includes(stickerId)) {
        return prev.filter(id => id !== stickerId);
      } else {
        return [...prev, stickerId];
      }
    });
  };
  
  const getSelectedStickerLabels = () => {
    return selectedStickers.map(id => {
      const sticker = stickerOptions.find(s => s.id === id);
      return sticker ? `${sticker.emoji} ${sticker.label}` : '';
    }).filter(label => label !== '');
  };

  const submitGrade = async () => {
    try {
      console.log('Submitting grade for submission:', selectedSubmission.id);
      console.log('Grade:', grade, 'Feedback:', feedback, 'Stickers:', selectedStickers);
      
      // Combine feedback with stickers
      const selectedStickerLabels = getSelectedStickerLabels();
      const fullFeedback = selectedStickerLabels.length > 0 
        ? `${feedback}\n\n${selectedStickerLabels.join('\n')}`
        : feedback;
      
      const response = await axios.post(
        `/api/homework/submissions/${selectedSubmission.id}/grade`,
        {
          grade: parseInt(grade),
          feedback: fullFeedback
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      console.log('Grade submission response:', response.data);

      setShowGradingModal(false);
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      setSelectedStickers([]);
      
      // Refresh submissions
      fetchSubmissions(homeworks);
      
      setSuccessMessage('Grade submitted successfully!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      console.error('Error submitting grade:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        setError(`Failed to submit grade: ${err.response.data.message || err.response.statusText}`);
      } else {
        setError('Failed to submit grade: Network error');
      }
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedHomeworks = [...homeworks]
    .filter(homework => !selectedSubject || homework.subject === selectedSubject)
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 text-green-700 px-6 py-4 rounded-3xl text-base flex items-center justify-center shadow-lg"
          >
            <CheckCircleIcon className="h-6 w-6 mr-3" />
            {successMessage}
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-700 px-6 py-4 rounded-3xl text-base flex items-center justify-center shadow-lg"
          >
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
            <button
              onClick={() => setError('')}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-teal-500 to-coral-500 rounded-3xl shadow-2xl mb-6">
            <AcademicCapIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="page-title">
            🎓 Teacher Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome back, <span className="font-semibold text-teal-600">{user?.firstName} {user?.lastName}</span>! 
            Inspire and educate with your creative learning hub.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <Link
            to="/homework/create"
            className="btn-primary flex items-center"
          >
            <DocumentPlusIcon className="h-5 w-5 mr-2" />
            Create New Homework
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 mb-12 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Active Students */}
          <motion.div
            variants={itemVariants}
            className="card-gradient border-2 border-teal-200"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 font-medium">Active Students</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                  {totalStudents}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Total Classes */}
          <motion.div
            variants={itemVariants}
            className="card-gradient border-2 border-coral-200"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-coral-500 to-coral-600 rounded-3xl flex items-center justify-center shadow-lg">
                <BookOpenIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 font-medium">Total Classes</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-coral-600 to-coral-700 bg-clip-text text-transparent">
                  {classes.length}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Subject */}
          <motion.div
            variants={itemVariants}
            className="card-gradient border-2 border-purple-200"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                <AcademicCapIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 font-medium">Subject</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {user?.subjectTaught || 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Classes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card border-2 border-teal-200">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4">
                    <AcademicCapIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="section-title text-teal-700">My Classes</h2>
                </div>
                <div className="space-y-6">
                  {classes.length === 0 ? (
                    <div className="text-center py-12">
                      <AcademicCapIcon className="mx-auto h-16 w-16 text-gray-300" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No classes assigned</h3>
                      <p className="mt-2 text-gray-500">You haven't been assigned to any classes yet.</p>
                    </div>
                  ) : (
                    classes.map((cls, index) => (
                      <motion.div
                        key={cls.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Class Info */}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{cls.className}</h3>
                            
                            {/* Class Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                  <BookOpenIcon className="h-4 w-4 text-teal-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Subject</p>
                                  <p className="text-sm font-semibold text-gray-900">{cls.subject}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                  <UserGroupIcon className="h-4 w-4 text-teal-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Grade</p>
                                  <p className="text-sm font-semibold text-gray-900">Grade {cls.gradeLevel}</p>
                                </div>
                              </div>
                              
                              {cls.roomNumber && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <CalendarIcon className="h-4 w-4 text-teal-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Room</p>
                                    <p className="text-sm font-semibold text-gray-900">{cls.roomNumber}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Student Count Badge */}
                          <div className="flex-shrink-0">
                            <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-2xl text-center shadow-lg">
                              <p className="text-2xl font-bold">{cls.currentStudentCount || 0}</p>
                              <p className="text-sm font-medium">Students</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="card border-2 border-purple-200">
              <div className="px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                      <BellIcon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="section-title text-purple-700">Notifications</h2>
                  </div>
                  <button
                    onClick={fetchNotifications}
                    disabled={notificationsLoading}
                    className="p-2 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors duration-200 disabled:opacity-50"
                    title="Refresh notifications"
                  >
                    <motion.div
                      animate={{ rotate: notificationsLoading ? 360 : 0 }}
                      transition={{ duration: 1, repeat: notificationsLoading ? Infinity : 0, ease: "linear" }}
                    >
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </motion.div>
                  </button>
                </div>
                <div className="space-y-4">
                  {notificationsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center"
                      >
                        <BellIcon className="h-4 w-4 text-white" />
                      </motion.div>
                    </div>
                  ) : notificationsError ? (
                    <div className="text-center py-6 text-red-600 bg-red-50 rounded-2xl border border-red-200">
                      <p className="text-sm">{notificationsError}</p>
                      <button
                        onClick={fetchNotifications}
                        className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <BellIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">No notifications yet</p>
                      <p className="text-gray-400 text-xs mt-1">You'll see updates here when they arrive</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 hover:border-purple-300 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.title || notification.message}</p>
                            {notification.message && notification.title && (
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            )}
                            <div className="flex items-center space-x-3 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                notification.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {notification.priority || 'NORMAL'}
                              </span>
                              <span className="text-xs text-purple-600 font-medium">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {notification.readStatus === 'UNREAD' && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full ml-2"></div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Homeworks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <div className="card border-2 border-coral-200">
            <div className="px-6 py-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-coral-500 to-coral-600 rounded-2xl flex items-center justify-center mr-4">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="section-title text-coral-700">Recent Homeworks</h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 bg-gradient-to-r from-teal-500 to-coral-500 rounded-full flex items-center justify-center"
                  >
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600 bg-red-50 rounded-2xl border border-red-200">
                  {error}
                </div>
              ) : homeworks.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No homeworks yet</h3>
                  <p className="mt-2 text-gray-500 mb-6">Get started by creating your first homework assignment.</p>
                  <Link
                    to="/homework/create"
                    className="btn-coral inline-flex items-center"
                  >
                    <DocumentPlusIcon className="h-5 w-5 mr-2" />
                    Create First Homework
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedHomeworks.map((homework) => (
                    <motion.div
                      key={homework.id}
                      variants={itemVariants}
                      className="bg-gradient-to-r from-white to-coral-50 rounded-2xl shadow-lg p-6 border border-coral-200 hover:border-coral-300 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{homework.title}</h3>
                          <p className="mt-2 text-sm text-gray-600">{homework.description}</p>
                          <div className="mt-3 flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                              <BookOpenIcon className="h-4 w-4 mr-2 text-coral-600" />
                              {homework.subject}
                            </div>
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-2 text-coral-600" />
                              Grade {homework.classGrade}
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-coral-600" />
                              Due: {formatDate(homework.dueDate)}
                            </div>
                            {homework.fileUrl && (
                              <button
                                onClick={() => {
                                  console.log('Attachment clicked:', homework.fileUrl);
                                  handleViewAttachment(homework.fileUrl);
                                }}
                                className="flex items-center bg-coral-50 hover:bg-coral-100 text-coral-700 hover:text-coral-800 px-3 py-2 rounded-xl transition-all duration-300 border border-coral-200 hover:border-coral-300"
                                title="View homework attachment"
                              >
                                <PaperClipIcon className="h-4 w-4 mr-2" />
                                <span className="font-medium">View Attachment</span>
                                <EyeIcon className="h-4 w-4 ml-2" />
                              </button>
                            )}
                          </div>
                          
                          {/* Submission Status */}
                          <div className="mt-4 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">
                                {submissions[homework.id]?.length || 0} submissions
                              </span>
                            </div>
                            {submissions[homework.id] && submissions[homework.id].length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedHomework(homework);
                                  setShowSubmissionsList(true);
                                }}
                                className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 px-3 py-2 rounded-xl transition-all duration-300 border border-blue-200 hover:border-blue-300"
                                title="View student submissions"
                              >
                                <EyeIcon className="h-4 w-4 mr-2" />
                                <span className="font-medium">View Submissions</span>
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(homework)}
                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors duration-300"
                            title="Edit homework"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(homework)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-300"
                            title="Delete homework"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Grading Modal - Simple Version */}
      {showGradingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Grade Submission</h3>
              <button
                onClick={() => setShowGradingModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Debug Info */}
            <div className="p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800 mb-4">
              Debug: grade="{grade}", feedback="{feedback}", selectedSubmission="{selectedSubmission?.id}", stickers="{selectedStickers.length}"
            </div>
            
            {/* Test Button */}
            <div className="p-2 bg-blue-100 border border-blue-300 rounded text-xs text-blue-800 mb-4">
              <button
                onClick={() => {
                  console.log('Test button clicked!');
                  setGrade('50');
                  setFeedback('Test feedback');
                }}
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
              >
                Test: Set Grade=50, Feedback="Test feedback"
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade (1-100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={grade || ''}
                  onChange={(e) => {
                    console.log('Grade input changed:', e.target.value);
                    setGrade(e.target.value);
                  }}
                  onFocus={() => console.log('Grade input focused')}
                  onBlur={() => console.log('Grade input blurred')}
                  onClick={() => console.log('Grade input clicked')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter grade (1-100)"
                  style={{ 
                    cursor: 'text',
                    pointerEvents: 'auto',
                    userSelect: 'auto',
                    opacity: '1',
                    backgroundColor: 'white',
                    color: 'black'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  value={feedback || ''}
                  onChange={(e) => {
                    console.log('Feedback input changed:', e.target.value);
                    setFeedback(e.target.value);
                  }}
                  onFocus={() => console.log('Feedback textarea focused')}
                  onBlur={() => console.log('Feedback textarea blurred')}
                  onClick={() => console.log('Feedback textarea clicked')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide constructive feedback..."
                  style={{ 
                    cursor: 'text',
                    pointerEvents: 'auto',
                    userSelect: 'auto',
                    opacity: '1',
                    backgroundColor: 'white',
                    color: 'black'
                  }}
                />
              </div>
              
              {/* Sticker Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Stickers to Feedback
                </label>
                
                {/* Selected Stickers Display */}
                {selectedStickers.length > 0 && (
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-700 mb-2">Selected Stickers:</p>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedStickerLabels().map((label, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Sticker Categories */}
                <div className="space-y-3">
                  {/* Achievement Stickers */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-2">🏆 Achievement</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {stickerOptions.filter(s => s.category === 'achievement').map(sticker => (
                        <button
                          key={sticker.id}
                          onClick={() => toggleSticker(sticker.id)}
                          className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                            selectedStickers.includes(sticker.id)
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          title={sticker.label}
                        >
                          <div className="text-2xl">{sticker.emoji}</div>
                          <div className="text-xs text-gray-600 mt-1">{sticker.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Improvement Stickers */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-2">📈 Improvement</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {stickerOptions.filter(s => s.category === 'improvement').map(sticker => (
                        <button
                          key={sticker.id}
                          onClick={() => toggleSticker(sticker.id)}
                          className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                            selectedStickers.includes(sticker.id)
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          title={sticker.label}
                        >
                          <div className="text-2xl">{sticker.emoji}</div>
                          <div className="text-xs text-gray-600 mt-1">{sticker.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Personality Stickers */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-2">🎭 Personality</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {stickerOptions.filter(s => s.category === 'personality').map(sticker => (
                        <button
                          key={sticker.id}
                          onClick={() => toggleSticker(sticker.id)}
                          className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                            selectedStickers.includes(sticker.id)
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          title={sticker.label}
                        >
                          <div className="text-2xl">{sticker.emoji}</div>
                          <div className="text-xs text-gray-600 mt-1">{sticker.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowGradingModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitGrade}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions List Modal */}
      {showSubmissionsList && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Submissions for: {selectedHomework.title}
              </h3>
              <button 
                onClick={() => setShowSubmissionsList(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Submissions List */}
            <div className="space-y-4">
              {submissions[selectedHomework.id] && submissions[selectedHomework.id].length > 0 ? (
                submissions[selectedHomework.id].map((submission, index) => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        {/* Student Profile Picture */}
                        <div className="flex-shrink-0">
                          {submission.studentProfilePicture ? (
                            <img
                              src={`/api/profile-pictures/${submission.studentProfilePicture}`}
                              alt={`${submission.studentName}'s profile`}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          {/* Fallback Avatar */}
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg ${submission.studentProfilePicture ? 'hidden' : 'block'}`}>
                            {submission.studentName ? submission.studentName.charAt(0).toUpperCase() : '?'}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{submission.studentName}</h4>
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                          submission.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status}
                        </span>
                        {submission.isLate && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Late
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <p className="text-gray-900">{submission.submissionType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Grade:</span>
                        <p className="text-gray-900">
                          {submission.grade ? `${submission.grade}%` : 'Not graded'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Feedback Display */}
                    {submission.feedback && (
                      <div className="mb-3">
                        <span className="font-medium text-gray-700 text-sm">Feedback:</span>
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          {/* Text Feedback */}
                          {submission.feedback.split('\n\n').map((part, index) => {
                            // Check if this part contains stickers (emoji + text pattern)
                            if (part.match(/^[^\w\s]*\s+\w+/)) {
                              // This looks like a sticker (emoji + label)
                              return (
                                <div key={index} className="inline-block mr-2 mb-2">
                                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-300">
                                    {part}
                                  </span>
                                </div>
                              );
                            } else {
                              // This is regular text feedback
                              return (
                                <p key={index} className="text-gray-900 text-sm mb-2">
                                  {part}
                                </p>
                              );
                            }
                          })}
                        </div>
                      </div>
                    )}
                    
                    {submission.submissionText && (
                      <div className="mb-3">
                        <span className="font-medium text-gray-700 text-sm">Text Response:</span>
                        <p className="text-gray-900 text-sm mt-1">{submission.submissionText}</p>
                      </div>
                    )}
                    
                    {/* Attachments Section */}
                    {(submission.audioData || submission.imageData || submission.pdfData || submission.attachmentUrl) && (
                      <div className="mb-3">
                        <span className="font-medium text-gray-700 text-sm">Attachments:</span>
                        <div className="mt-2 space-y-3">
                          
                          {/* Voice Recording */}
                          {submission.audioData && (
                            <div className="p-2 bg-gray-50 rounded border">
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  🎤 Voice Recording: {submission.attachmentName || 'voice_recording.wav'}
                                </p>
                                <audio 
                                  controls 
                                  className="w-full"
                                  preload="metadata"
                                >
                                  <source src={`data:audio/wav;base64,${submission.audioData}`} type="audio/wav" />
                                  Your browser does not support the audio element.
                                </audio>
                                <p className="text-xs text-gray-500">
                                  🎤 Listen to voice recording
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Photo/Image */}
                          {submission.imageData && (
                            <div className="p-2 bg-gray-50 rounded border">
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  📸 Photo: {submission.attachmentName || 'submission_photo.jpg'}
                                </p>
                                <img 
                                  src={`data:image/jpeg;base64,${submission.imageData}`}
                                  alt="Submitted photo"
                                  className="w-full max-w-sm rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => {
                                    // Create a modal to display the image in full size
                                    const modal = document.createElement('div');
                                    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
                                    modal.innerHTML = `
                                      <div class="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
                                        <div class="flex justify-between items-center mb-4">
                                          <h3 class="text-lg font-semibold">View Submission Image</h3>
                                          <button class="text-gray-500 hover:text-gray-700 text-2xl" onclick="this.closest('.fixed').remove()">&times;</button>
                                        </div>
                                        <img src="data:image/jpeg;base64,${submission.imageData}" alt="Submission Image" class="max-w-full h-auto rounded border" />
                                      </div>
                                    `;
                                    document.body.appendChild(modal);
                                    
                                    // Close modal when clicking outside
                                    modal.addEventListener('click', (e) => {
                                      if (e.target === modal) {
                                        modal.remove();
                                      }
                                    });
                                  }}
                                />
                                <p className="text-xs text-gray-500">
                                  📸 Click image to view full size
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* PDF Document */}
                          {submission.pdfData && (
                            <div className="p-2 bg-gray-50 rounded border">
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  📄 PDF: {submission.attachmentName || 'submission.pdf'}
                                </p>
                                <button 
                                  onClick={() => {
                                    try {
                                      // Convert base64 to blob
                                      const byteCharacters = atob(submission.pdfData);
                                      const byteNumbers = new Array(byteCharacters.length);
                                      for (let i = 0; i < byteCharacters.length; i++) {
                                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                                      }
                                      const byteArray = new Uint8Array(byteNumbers);
                                      const blob = new Blob([byteArray], { type: 'application/pdf' });
                                      
                                      // Create blob URL
                                      const url = window.URL.createObjectURL(blob);
                                      
                                      // Open PDF in new tab
                                      window.open(url, '_blank');
                                      
                                      // Clean up blob URL after a delay
                                      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                                    } catch (error) {
                                      console.error('Error opening PDF:', error);
                                      alert('Error opening PDF. Please try again.');
                                    }
                                  }}
                                  className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                >
                                  📄 View PDF
                                </button>
                                <p className="text-xs text-gray-500">
                                  Click to open PDF document
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Generic Attachment URL */}
                          {submission.attachmentUrl && !submission.audioData && !submission.imageData && !submission.pdfData && (
                            <div className="p-2 bg-gray-50 rounded border">
                              <p className="text-sm text-gray-600">
                                📎 Attachment: {submission.attachmentName || 'submission_attachment'}
                              </p>
                              <a 
                                href={submission.attachmentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 bg-sky-600 text-white text-xs rounded hover:bg-sky-700 transition-colors"
                              >
                                📎 View Attachment
                              </a>
                              <p className="text-xs text-gray-500">
                                Click to open attachment
                              </p>
                            </div>
                          )}
                          
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          console.log('Grading button clicked for submission:', submission);
                          handleGradeSubmission(submission);
                          setShowSubmissionsList(false);
                        }}
                        className="px-3 py-1 bg-sky-600 text-white text-xs rounded hover:bg-sky-700 transition-colors"
                      >
                        {submission.status === 'GRADED' ? 'Edit Grade' : 'Grade'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No submissions yet for this homework.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Additional bottom spacing to ensure full page height */}
      <div className="h-20"></div>
    </div>
  );
};

export default TeacherDashboard; 