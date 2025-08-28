import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  FunnelIcon,
  PaperClipIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  TrophyIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import GamificationWidget from '../gamification/GamificationWidget';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [homeworks, setHomeworks] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [message, setMessage] = useState('');
  // Removed reminder loading state
  const { user, token } = useAuth();

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



  const fetchHomeworks = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching homeworks with token:', token ? 'Token exists' : 'No token');
      console.log('API URL:', `/api/homework/student?subject=${selectedSubject}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      
      const response = await axios.get(
        `/api/homework/student?subject=${selectedSubject}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      console.log('Homeworks response:', response.data);
      setHomeworks(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching homeworks:', err);
      setError('Failed to fetch homeworks');
    } finally {
      setLoading(false);
    }
  }, [token, selectedSubject, sortBy, sortOrder]);

  const fetchSubmissions = useCallback(async () => {
    try {
      console.log('Fetching submissions with token:', token ? 'Token exists' : 'No token');
      const response = await axios.get(
        '/api/homework/submissions/student',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      console.log('Submissions response:', response.data);
      const submissionsMap = {};
      response.data.forEach(submission => {
        console.log('Processing submission:', {
          id: submission.id,
          homeworkId: submission.homeworkId,
          status: submission.status,
          grade: submission.grade,
          feedback: submission.feedback,
          feedbackLength: submission.feedback ? submission.feedback.length : 0
        });
        submissionsMap[submission.homeworkId] = submission;
      });
      console.log('Final submissions map:', submissionsMap);
      setSubmissions(submissionsMap);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDueStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', class: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300' };
    } else if (diffDays === 0) {
      return { text: 'Due Today', class: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300' };
    } else if (diffDays <= 3) {
      return { text: 'Due Soon', class: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300' };
    } else {
      return { text: `${diffDays} days left`, class: 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-300' };
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSubmitHomework = (homework) => {
    navigate('/submit-homework', { state: { homework } });
  };

  const getSubmissionStatus = (homeworkId) => {
    const submission = submissions[homeworkId];
    if (!submission) return { status: 'NOT_SUBMITTED', text: 'Not Submitted', class: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300' };
    
    switch (submission.status) {
      case 'SUBMITTED':
        return { status: 'SUBMITTED', text: 'Submitted', class: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' };
      case 'GRADED':
        const feedbackPreview = submission.feedback ? 
          (submission.feedback.split('\n\n')[0].substring(0, 20) + '...') : 
          '';
        return { 
          status: 'GRADED', 
          text: `Grade: ${submission.grade}%${feedbackPreview ? ` | ${feedbackPreview}` : ''}`, 
          class: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
        };
      case 'RETURNED':
        return { status: 'RETURNED', text: 'Returned', class: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300' };
      default:
        return { status: 'UNKNOWN', text: 'Unknown', class: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300' };
    }
  };
  
  // Helper function to extract stickers from feedback
  const extractStickersFromFeedback = (feedback) => {
    console.log('extractStickersFromFeedback called with:', feedback);
    if (!feedback) {
      console.log('No feedback provided, returning empty array');
      return [];
    }
    
    const parts = feedback.split('\n\n');
    console.log('Split feedback into parts:', parts);
    
    const stickers = parts.filter(part => 
      part.match(/^[^\w\s]*\s+\w+/) // Matches emoji + text pattern
    );
    console.log('Extracted stickers:', stickers);
    return stickers;
  };
  
  // Helper function to extract text feedback (without stickers)
  const extractTextFeedback = (feedback) => {
    console.log('extractTextFeedback called with:', feedback);
    if (!feedback) {
      console.log('No feedback provided, returning empty string');
      return '';
    }
    
    const parts = feedback.split('\n\n');
    console.log('Split feedback into parts:', parts);
    
    const textParts = parts.filter(part => 
      !part.match(/^[^\w\s]*\s+\w+/) // Doesn't match emoji + text pattern
    );
    console.log('Text parts:', textParts);
    
    const result = textParts.join('\n\n').trim();
    console.log('Final text feedback:', result);
    return result;
  };

  // Removed reminder creation function

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

    const handleViewAttachment = (fileUrl) => {
    const fileName = fileUrl.split('/').pop();
    const fullUrl = `/api/v1/files/download/homework/${fileName}`;
    window.open(fullUrl, '_blank');
  };

  // Main useEffect to fetch data on component mount and when dependencies change
  useEffect(() => {
    console.log('StudentDashboard useEffect triggered with:', { token: token ? 'Token exists' : 'No token', user, sortBy, sortOrder, selectedSubject });
    fetchHomeworks();
    fetchSubmissions();
  }, [token, sortBy, sortOrder, selectedSubject, fetchHomeworks, fetchSubmissions]);

  // Refresh submissions when location changes (e.g., returning from submission)
  useEffect(() => {
    fetchSubmissions();
    
    // Check for navigation state messages
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
      // Clear the navigation state to prevent showing the message again
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate, fetchSubmissions]);

  // Refresh submissions when component receives focus (e.g., returning from submission)
  useEffect(() => {
    const handleFocus = () => {
      fetchSubmissions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchSubmissions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50">
      
      {/* Success Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-2xl p-4 mb-4 shadow-lg"
          >
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-teal-600 mr-2" />
              <p className="text-teal-800 font-medium">{message}</p>
            </div>
          </motion.div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="bg-gradient-to-r from-teal-500 to-coral-500 rounded-3xl p-8 shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <AcademicCapIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome back, {user?.firstName}! 🎉
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Ready to conquer your homework and level up your learning journey?
            </p>
            <div className="flex justify-center items-center space-x-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                <span className="text-sm text-white/80 font-medium">Grade</span>
                <p className="text-2xl font-bold text-white">{user?.classGrade}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                <span className="text-sm text-white/80 font-medium">Student ID</span>
                <p className="text-2xl font-bold text-white">{user?.studentId}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Sorting */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-100 to-coral-100 rounded-xl flex items-center justify-center">
                  <FunnelIcon className="h-5 w-5 text-teal-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Filters</span>
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input-field border-2 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  fetchHomeworks();
                  fetchSubmissions();
                }}
                className="btn-secondary bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600">Sort by:</span>
              <button
                onClick={() => toggleSort('dueDate')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Due Date</span>
                {sortBy === 'dueDate' && (
                  sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => toggleSort('subject')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200"
              >
                <BookOpenIcon className="h-5 w-5" />
                <span>Subject</span>
                {sortBy === 'subject' && (
                  sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Gamification Widget */}
        <div className="mb-8">
          <div className="card-gradient bg-gradient-to-r from-purple-500 to-yellow-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <TrophyIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Your Learning Journey</h3>
                  <p className="text-white/90">Track your progress and earn rewards!</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/gamification')}
                className="btn-secondary bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                View Details
              </button>
            </div>
            <GamificationWidget 
              compact={true} 
              onViewDetails={() => navigate('/gamification')}
            />
          </div>
        </div>

        {/* Homework List */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-coral-100 to-teal-100 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 text-coral-600" />
            </div>
            <h2 className="section-title text-coral-700">My Homework Assignments</h2>
          </div>
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : homeworks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-100 to-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LightBulbIcon className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up! 🎉</h3>
              <p className="text-gray-600">No homework assignments at the moment. Great job staying on top of things!</p>
            </div>
          ) : (
            homeworks.map((homework, index) => {
              const dueStatus = getDueStatus(homework.dueDate);
              return (
                <motion.div
                  key={homework.id}
                  variants={itemVariants}
                  className="card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-teal-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {homework.title}
                          </h3>
                          <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold ${dueStatus.class}`}>
                            {dueStatus.text}
                          </span>
                          <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold ${getSubmissionStatus(homework.id).class}`}>
                            {getSubmissionStatus(homework.id).text}
                          </span>
                        </div>
                        <p className="text-gray-600 text-lg mb-4">{homework.description}</p>
                        
                        {/* Homework Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                              <BookOpenIcon className="h-4 w-4 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Subject</p>
                              <p className="text-sm font-semibold text-gray-900">{homework.subject}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-coral-100 rounded-lg flex items-center justify-center">
                              <CalendarIcon className="h-4 w-4 text-coral-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Due Date</p>
                              <p className="text-sm font-semibold text-gray-900">{formatDate(homework.dueDate)}</p>
                            </div>
                          </div>
                          
                          {homework.fileUrl && (
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <PaperClipIcon className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Attachment</p>
                                <button
                                  onClick={() => handleViewAttachment(homework.fileUrl)}
                                  className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors flex items-center"
                                >
                                  <span>View File</span>
                                  <EyeIcon className="h-4 w-4 ml-1" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center space-x-4">
                          {getSubmissionStatus(homework.id).status === 'NOT_SUBMITTED' && (
                            <button
                              onClick={() => handleSubmitHomework(homework)}
                              className="btn-primary bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <DocumentTextIcon className="h-5 w-5 mr-2" />
                              Submit Homework
                            </button>
                          )}
                          
                          {getSubmissionStatus(homework.id).status === 'SUBMITTED' && (
                            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                              <div className="flex items-center space-x-2 text-blue-700">
                                <ClockIcon className="h-6 w-6" />
                                <span className="text-sm font-semibold">Submitted - Awaiting Grade</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    const submission = submissions[homework.id];
                                    if (submission) {
                                      setSelectedSubmission(submission);
                                      setShowSubmissionModal(true);
                                    }
                                  }}
                                  className="btn-secondary bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-medium"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    const submission = submissions[homework.id];
                                    if (submission) {
                                      navigate('/submit-homework', { 
                                        state: { 
                                          homework, 
                                          editingSubmission: submission,
                                          isEditing: true 
                                        } 
                                      });
                                    }
                                  }}
                                  className="btn-secondary bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-medium"
                                >
                                  Edit Submission
                                </button>
                              </div>
                              <span className="text-xs text-blue-600 font-medium">
                                (You can edit until graded)
                              </span>
                            </div>
                          )}
                          
                          {getSubmissionStatus(homework.id).status === 'GRADED' && (
                            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
                              <div className="flex items-center space-x-3 mb-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                <span className="text-lg font-semibold text-green-700">Graded!</span>
                                <button
                                  onClick={() => {
                                    const submission = submissions[homework.id];
                                    if (submission) {
                                      setSelectedSubmission(submission);
                                      setShowSubmissionModal(true);
                                    }
                                  }}
                                  className="text-xs text-green-600 hover:text-green-700 underline"
                                >
                                  View Details
                                </button>
                              </div>
                              
                              {/* Grade and Feedback Display */}
                              {(() => {
                                const submission = submissions[homework.id];
                                return (
                                  <div className="space-y-3">
                                    {/* Grade Display */}
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm font-medium text-gray-700">Grade:</span>
                                      <span className="text-lg font-bold text-green-600">{submission?.grade}/100</span>
                                    </div>
                                    
                                    {/* Feedback Display */}
                                    {submission?.feedback && (
                                      <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-700">Teacher Feedback:</span>
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
      
      {/* Submission Details Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-100 to-coral-100 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Submission Details</h3>
              </div>
              <button 
                onClick={() => setShowSubmissionModal(false)} 
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl border border-teal-200">
                  <span className="text-xs text-teal-600 font-medium">Homework</span>
                  <p className="text-teal-900 font-semibold">{selectedSubmission.homeworkTitle}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-coral-50 to-coral-100 rounded-2xl border border-coral-200">
                  <span className="text-xs text-coral-600 font-medium">Subject</span>
                  <p className="text-coral-900 font-semibold">{selectedSubmission.subject}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                  <span className="text-xs text-purple-600 font-medium">Submitted</span>
                  <p className="text-purple-900 font-semibold">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                  <span className="text-xs text-yellow-600 font-medium">Type</span>
                  <p className="text-yellow-900 font-semibold">{selectedSubmission.submissionType}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                  <span className="text-xs text-blue-600 font-medium">Status</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedSubmission.status === 'SUBMITTED' ? 'bg-blue-600 text-white' :
                    selectedSubmission.status === 'GRADED' ? 'bg-green-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                {selectedSubmission.isLate && (
                  <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200">
                    <span className="text-xs text-red-600 font-medium">Late</span>
                    <span className="text-red-700 font-semibold">Yes</span>
                  </div>
                )}
              </div>
              
              {/* Editing Note */}
              {selectedSubmission.status === 'SUBMITTED' && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <LightBulbIcon className="h-5 w-5 text-blue-600" />
                    <p className="text-blue-800 font-medium">
                      <strong>Tip:</strong> You can still edit this submission until it's graded by your teacher.
                    </p>
                  </div>
                </div>
              )}
              
              {selectedSubmission.submissionText && (
                <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl border border-teal-200">
                  <span className="text-xs text-teal-600 font-medium">Text Response</span>
                  <div className="mt-2 p-3 bg-white/50 rounded-xl text-teal-900">
                    {selectedSubmission.submissionText}
                  </div>
                </div>
              )}
              
              {/* Attachments Section */}
              {(selectedSubmission.audioData || selectedSubmission.imageData || selectedSubmission.pdfData || selectedSubmission.attachmentUrl) && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                      <PaperClipIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Attachments</span>
                  </div>
                  <div className="space-y-4">
                    
                    {/* Voice Recording */}
                    {selectedSubmission.audioData && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm">🎤</span>
                            </div>
                            <span className="text-sm text-blue-700 font-medium">
                              Voice Recording: {selectedSubmission.attachmentName || 'voice_recording.wav'}
                            </span>
                          </div>
                          <audio 
                            controls 
                            className="w-full"
                            preload="metadata"
                          >
                            <source src={`data:audio/wav;base64,${selectedSubmission.audioData}`} type="audio/wav" />
                            Your browser does not support the audio element.
                          </audio>
                          <p className="text-xs text-blue-600">
                            You can play back your voice recording to review what you submitted.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Photo/Image */}
                    {selectedSubmission.imageData && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-sm">📸</span>
                            </div>
                            <span className="text-sm text-green-700 font-medium">
                              Photo: {selectedSubmission.attachmentName || 'submission_photo.jpg'}
                            </span>
                          </div>
                          <img 
                            src={`data:image/jpeg;base64,${selectedSubmission.imageData}`}
                            alt="Submitted photo"
                            className="w-full max-w-md rounded-xl border-2 border-green-300"
                          />
                          <p className="text-xs text-green-600">
                            Your submitted photo is displayed above.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* PDF Document */}
                    {selectedSubmission.pdfData && (
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 text-sm">📄</span>
                            </div>
                            <span className="text-sm text-yellow-700 font-medium">
                              PDF: {selectedSubmission.attachmentName || 'submission.pdf'}
                            </span>
                          </div>
                          <div className="bg-white/50 border border-yellow-300 rounded-xl p-4">
                            <p className="text-sm text-yellow-800 mb-3 font-medium">
                              Your submitted PDF document
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
                              className="btn-primary bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              📄 View PDF Document
                            </button>
                            <p className="text-xs text-yellow-600 mt-2">
                              Click the button above to open your PDF in a new tab.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Generic Attachment URL */}
                    {selectedSubmission.attachmentUrl && !selectedSubmission.audioData && !selectedSubmission.imageData && !selectedSubmission.pdfData && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 text-sm">📎</span>
                            </div>
                            <span className="text-sm text-purple-700 font-medium">
                              Attachment: {selectedSubmission.attachmentName || 'submission_attachment'}
                            </span>
                          </div>
                          <a 
                            href={selectedSubmission.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-primary bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
                          >
                            📎 View Attachment
                          </a>
                          <p className="text-xs text-purple-600">
                            Click the button above to open your attachment in a new tab.
                          </p>
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>
              )}

              
              {selectedSubmission.status === 'GRADED' && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <StarIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-green-900">Grade & Feedback</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="font-medium text-green-700">Grade:</span>
                      <p className="text-green-900 text-lg font-bold">{selectedSubmission.grade}%</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Graded on:</span>
                      <p className="text-green-900">{new Date(selectedSubmission.gradedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedSubmission.feedback && (
                    <div>
                      <span className="font-medium text-green-700">Feedback:</span>
                      <div className="mt-2 space-y-3">
                        {/* Text Feedback */}
                        {extractTextFeedback(selectedSubmission.feedback) && (
                          <div className="p-3 bg-white rounded-lg border border-green-200">
                            <p className="text-green-900 text-sm leading-relaxed">
                              {extractTextFeedback(selectedSubmission.feedback)}
                            </p>
                          </div>
                        )}
                        
                        {/* Stickers */}
                        {extractStickersFromFeedback(selectedSubmission.feedback).length > 0 && (
                          <div>
                            <span className="text-xs text-green-600 font-medium mb-2 block">Stickers:</span>
                            <div className="flex flex-wrap gap-2">
                              {extractStickersFromFeedback(selectedSubmission.feedback).map((sticker, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-2 bg-green-200 text-green-800 text-sm rounded-full border border-green-300 shadow-sm">
                                  {sticker}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowSubmissionModal(false)} 
                className="btn-secondary bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard; 