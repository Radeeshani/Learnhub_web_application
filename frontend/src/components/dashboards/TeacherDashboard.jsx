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
import Header from '../common/Header';

const TeacherDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [classes] = useState([
    {
      id: 1,
      name: 'Mathematics - Grade 8',
      students: 25,
      time: '09:00 AM',
      room: 'Room 101',
      attendance: 92
    },
    {
      id: 2,
      name: 'Mathematics - Grade 7',
      students: 28,
      time: '10:30 AM',
      room: 'Room 102',
      attendance: 88
    },
    {
      id: 3,
      name: 'Mathematics - Grade 6',
      students: 30,
      time: '01:00 PM',
      room: 'Room 103',
      attendance: 95
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      message: 'New homework submission from John Doe',
      time: '1 hour ago',
      type: 'submission'
    },
    {
      id: 2,
      message: 'Parent meeting scheduled for tomorrow',
      time: '2 hours ago',
      type: 'meeting'
    },
    {
      id: 3,
      message: 'Grade 8 test results ready for review',
      time: '3 hours ago',
      type: 'grades'
    }
  ]);

  const [homeworks, setHomeworks] = useState([]);
  const [homeworksByGrade, setHomeworksByGrade] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  const [editingHomework, setEditingHomework] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showSubmissionsList, setShowSubmissionsList] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Geography',
    'Art',
    'Music',
    'Physical Education'
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

  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        const response = await axios.get('/api/homework/teacher', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
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
        setError('Failed to fetch homeworks');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworks();
  }, [token]);

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
  const totalStudents = classes.reduce((sum, cls) => sum + cls.students, 0);

  // Calculate average attendance
  const avgAttendance = Math.round(
    classes.reduce((sum, cls) => sum + cls.attendance, 0) / classes.length
  );

  const fetchSubmissions = async (homeworksData) => {
    try {
      // Fetch submissions for all homeworks
      const submissionsPromises = homeworksData.map(homework => {
        return axios.get(`/api/homework/submissions/homework/${homework.id}`);
      });
      
      const submissionsResponses = await Promise.all(submissionsPromises);
      const submissionsMap = {};
      
      submissionsResponses.forEach((response, index) => {
        submissionsMap[homeworksData[index].id] = response.data;
      });
      
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
    // Extract the filename from the fileUrl (e.g., "/uploads/homework/filename.pdf" -> "filename.pdf")
    const fileName = fileUrl.split('/').pop();
    // Construct the correct URL for the backend file endpoint with /api context path
    const fullUrl = `/api/uploads/homework/${fileName}`;
    // Open in a new tab
    window.open(fullUrl, '_blank');
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
    setSelectedSubmission(submission);
    setGrade(submission.grade ? submission.grade.toString() : '');
    setFeedback(submission.feedback || '');
    setShowGradingModal(true);
  };

  const submitGrade = async () => {
    try {
                      await axios.post(
                  `/api/homework/submissions/${selectedSubmission.id}/grade`,
                  {
                    grade: parseInt(grade),
                    feedback: feedback
                  },
                  {
                    headers: { 'Authorization': `Bearer ${token}` }
                  }
                );

      setShowGradingModal(false);
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      
      // Refresh submissions
      fetchSubmissions(homeworks);
      
      setSuccessMessage('Grade submitted successfully!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      setError('Failed to submit grade');
      console.error('Error submitting grade:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl text-base flex items-center justify-center shadow-md"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {successMessage}
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 relative"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 to-indigo-900/90"></div>
          <div className="relative px-6 py-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white font-sans">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="mt-2 text-sky-100 text-lg">
                  Your educational dashboard awaits. Let's make learning engaging!
                </p>
              </div>
              <Link
                to="/homework/create"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <DocumentPlusIcon className="h-5 w-5 mr-2" />
                Create Homework
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4"
        >
                          {/* Total Homeworks */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-sky-100">
                <DocumentTextIcon className="h-8 w-8 text-sky-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Homeworks</p>
                <p className="text-2xl font-semibold text-sky-600">{homeworks.length}</p>
              </div>
            </div>
          </motion.div>

          {/* Active Students */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100">
                <UserGroupIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Students</p>
                <p className="text-2xl font-semibold text-indigo-600">{totalStudents}</p>
              </div>
            </div>
          </motion.div>

          {/* Average Attendance */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Attendance</p>
                <p className="text-2xl font-semibold text-green-600">{avgAttendance}%</p>
              </div>
            </div>
          </motion.div>

          {/* Subject */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpenIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Subject</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {user?.subjectTaught || 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <AcademicCapIcon className="h-6 w-6 mr-2 text-sky-600" />
                  Today's Classes
                </h2>
                <div className="space-y-4">
                  {classes.map((cls, index) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {cls.time}
                            <span className="mx-2">•</span>
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {cls.room}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{cls.students} Students</p>
                          <p className="text-sm text-sky-600">{cls.attendance}% Attendance</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BellIcon className="h-6 w-6 mr-2 text-sky-600" />
                  Notifications
                </h2>
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </motion.div>
                  ))}
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
          className="mt-8"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-sky-600" />
                Recent Homeworks
              </h2>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : homeworks.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No homeworks</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new homework.</p>
                  <div className="mt-6">
                    <Link
                      to="/create-homework"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                      <DocumentPlusIcon className="h-5 w-5 mr-2" />
                                              New Homework
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedHomeworks.map((homework) => (
                    <motion.div
                      key={homework.id}
                      variants={itemVariants}
                      className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{homework.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{homework.description}</p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <BookOpenIcon className="h-4 w-4 mr-1" />
                              {homework.subject}
                            </div>
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1" />
                              Grade {homework.classGrade}
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              Due: {formatDate(homework.dueDate)}
                            </div>
                            {homework.fileUrl && (
                              <button
                                onClick={() => handleViewAttachment(homework.fileUrl)}
                                className="flex items-center text-sky-600 hover:text-sky-700 transition-colors"
                              >
                                <PaperClipIcon className="h-4 w-4 mr-1" />
                                <span>View Attachment</span>
                                <EyeIcon className="h-4 w-4 ml-1" />
                              </button>
                            )}
                          </div>
                          
                          {/* Submission Status */}
                          <div className="mt-3 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">Submissions:</span>
                              <span className="text-sm text-gray-600">
                                {submissions[homework.id] ? submissions[homework.id].length : 0}
                              </span>
                            </div>
                            
                            {/* Progress Tracking */}
                            {submissions[homework.id] && submissions[homework.id].length > 0 && (
                              <div className="flex items-center space-x-4 text-xs">
                                <div className="flex items-center space-x-1">
                                  <span className="text-gray-600">Graded:</span>
                                  <span className="text-green-600 font-medium">
                                    {submissions[homework.id].filter(s => s.status === 'GRADED').length}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-gray-600">Pending:</span>
                                  <span className="text-blue-600 font-medium">
                                    {submissions[homework.id].filter(s => s.status === 'SUBMITTED').length}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-gray-600">Late:</span>
                                  <span className="text-red-600 font-medium">
                                    {submissions[homework.id].filter(s => s.isLate).length}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {submissions[homework.id] && submissions[homework.id].length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedHomework(homework); // Set selected homework for submissions list
                                  setShowSubmissionsList(true);
                                }}
                                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                              >
                                View Submissions ({submissions[homework.id].length})
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(homework)}
                            className="p-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-full transition-colors"
                            title="Edit Homework"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(homework)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Homework"
                          >
                            <TrashIcon className="h-5 w-5" />
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

      {/* Grading Modal */}
      {showGradingModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Grade Submission</h3>
            
            {/* Submission Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Submission Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Student:</span>
                  <p className="text-gray-900">{selectedSubmission.studentName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Homework:</span>
                  <p className="text-gray-900">{selectedSubmission.homeworkTitle}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Subject:</span>
                  <p className="text-gray-900">{selectedSubmission.subject}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Submitted:</span>
                  <p className="text-gray-900">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-900">{selectedSubmission.submissionType}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedSubmission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                    selectedSubmission.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedSubmission.status}
                  </span>
                </div>
              </div>
              
              {/* Submission Content */}
              {selectedSubmission.submissionText && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Text Response:</span>
                  <div className="mt-2 p-3 bg-white rounded border text-gray-900">
                    {selectedSubmission.submissionText}
                  </div>
                </div>
              )}
              
              {/* Attachments Section */}
              {(selectedSubmission.audioData || selectedSubmission.imageData || selectedSubmission.pdfData || selectedSubmission.attachmentUrl) && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Attachments:</span>
                  <div className="mt-2 space-y-4">
                    
                    {/* Voice Recording */}
                    {selectedSubmission.audioData && (
                      <div className="p-3 bg-white rounded border">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 mb-2">
                            🎤 Voice Recording: {selectedSubmission.attachmentName || 'voice_recording.wav'}
                          </p>
                          <audio 
                            controls 
                            className="w-full"
                            preload="metadata"
                          >
                            <source src={`data:audio/wav;base64,${selectedSubmission.audioData}`} type="audio/wav" />
                            Your browser does not support the audio element.
                          </audio>
                          <p className="text-xs text-gray-500 mt-1">
                            🎤 Listen to the student's voice recording.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Photo/Image */}
                    {selectedSubmission.imageData && (
                      <div className="p-3 bg-white rounded border">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 mb-2">
                            📸 Photo: {selectedSubmission.attachmentName || 'submission_photo.jpg'}
                          </p>
                          <img 
                            src={`data:image/jpeg;base64,${selectedSubmission.imageData}`}
                            alt="Submitted photo"
                            className="w-full max-w-md rounded-lg border"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            📸 Student's submitted photo is displayed above.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* PDF Document */}
                    {selectedSubmission.pdfData && (
                      <div className="p-3 bg-white rounded border">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 mb-2">
                            📄 PDF: {selectedSubmission.attachmentName || 'submission.pdf'}
                          </p>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-sm text-gray-700 mb-2">
                              📄 Student's submitted PDF document
                            </p>
                            <button 
                              onClick={() => {
                                try {
                                  // Convert base64 to blob
                                  const byteCharacters = atob(selectedSubmission.pdfData);
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
                              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              📄 View PDF Document
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                              Click the button above to open the PDF in a new tab.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Generic Attachment URL */}
                    {selectedSubmission.attachmentUrl && !selectedSubmission.audioData && !selectedSubmission.imageData && !selectedSubmission.pdfData && (
                      <div className="p-3 bg-white rounded border">
                        <p className="text-sm text-gray-600 mb-2">
                          📎 Attachment: {selectedSubmission.attachmentName || 'submission_attachment'}
                        </p>
                        <a 
                          href={selectedSubmission.attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 transition-colors"
                        >
                          📎 View Attachment
                        </a>
                        <p className="text-xs text-gray-500 mt-2">
                          Click the button above to open the attachment in a new tab.
                        </p>
                      </div>
                    )}
                    
                  </div>
                </div>
              )}
              
              {/* Late Submission Warning */}
              {selectedSubmission.isLate && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-800 text-sm font-medium">⚠️ Late Submission</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Grading Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade (0-100)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={grade} 
                  onChange={(e) => setGrade(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                <textarea 
                  value={feedback} 
                  onChange={(e) => setFeedback(e.target.value)} 
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                  placeholder="Provide detailed feedback for the student..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowGradingModal(false)} 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitGrade} 
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
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
                      <div>
                        <h4 className="font-semibold text-gray-900">{submission.studentName}</h4>
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </p>
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
                                  className="w-full max-w-sm rounded border"
                                />
                                <p className="text-xs text-gray-500">
                                  📸 View photo
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
                          setSelectedSubmission(submission);
                          setGrade(submission.grade ? submission.grade.toString() : '');
                          setFeedback(submission.feedback || '');
                          setShowSubmissionsList(false);
                          setShowGradingModal(true);
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
    </div>
  );
};

export default TeacherDashboard; 