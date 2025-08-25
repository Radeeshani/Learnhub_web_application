import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  XCircleIcon
} from '@heroicons/react/24/outline';
import Header from '../common/Header';
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
        submissionsMap[submission.homeworkId] = submission;
      });
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
      return { text: 'Overdue', class: 'bg-red-100 text-red-800' };
    } else if (diffDays === 0) {
      return { text: 'Due Today', class: 'bg-yellow-100 text-yellow-800' };
    } else if (diffDays <= 3) {
      return { text: 'Due Soon', class: 'bg-orange-100 text-orange-800' };
    } else {
      return { text: `${diffDays} days left`, class: 'bg-green-100 text-green-800' };
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
    if (!submission) return { status: 'NOT_SUBMITTED', text: 'Not Submitted', class: 'bg-gray-100 text-gray-800' };
    
    switch (submission.status) {
      case 'SUBMITTED':
        return { status: 'SUBMITTED', text: 'Submitted', class: 'bg-blue-100 text-blue-800' };
      case 'GRADED':
        return { status: 'GRADED', text: `Grade: ${submission.grade}%`, class: 'bg-green-100 text-green-800' };
      case 'RETURNED':
        return { status: 'RETURNED', text: 'Returned', class: 'bg-yellow-100 text-yellow-800' };
      default:
        return { status: 'UNKNOWN', text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
    }
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

  const handleViewAttachment = (fileUrl) => {
    const fileName = fileUrl.split('/').pop();
            const fullUrl = `/api/uploads/homework/${fileName}`;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">
      <Header />
      
      {/* Success Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-800 font-medium">{message}</p>
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
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 relative"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 to-indigo-900/90"></div>
          <div className="relative px-6 py-12">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-white font-sans">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="mt-2 text-sky-100 text-lg">
                Stay on top of your homeworks and track your progress.
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="bg-sky-100/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                  <span className="text-sm">Grade</span>
                  <p className="text-lg font-semibold">{user?.classGrade}</p>
                </div>
                <div className="bg-sky-100/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                  <span className="text-sm">Student ID</span>
                  <p className="text-lg font-semibold">{user?.studentId}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="block w-full rounded-lg border-gray-300 text-base focus:border-sky-500 focus:ring-sky-500"
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
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleSort('dueDate')}
                className="flex items-center space-x-1 text-gray-600 hover:text-sky-600"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Due Date</span>
                {sortBy === 'dueDate' && (
                  sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => toggleSort('subject')}
                className="flex items-center space-x-1 text-gray-600 hover:text-sky-600"
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
          <GamificationWidget 
            compact={true} 
            onViewDetails={() => navigate('/gamification')}
          />
        </div>

        {/* Homework List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
            </div>
          ) : homeworks.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No homework</h3>
              <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            homeworks.map((homework, index) => {
              const dueStatus = getDueStatus(homework.dueDate);
              return (
                <motion.div
                  key={homework.id}
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {homework.title}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${dueStatus.class}`}>
                            {dueStatus.text}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSubmissionStatus(homework.id).class}`}>
                            {getSubmissionStatus(homework.id).text}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600">{homework.description}</p>
                        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <BookOpenIcon className="h-4 w-4 mr-1" />
                            {homework.subject}
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
                        
                        {/* Action Buttons */}
                        <div className="mt-4 flex items-center space-x-3">
                          {getSubmissionStatus(homework.id).status === 'NOT_SUBMITTED' && (
                            <button
                              onClick={() => handleSubmitHomework(homework)}
                              className="inline-flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
                            >
                              <DocumentTextIcon className="h-4 w-4 mr-2" />
                              Submit Homework
                            </button>
                          )}
                          
                          {getSubmissionStatus(homework.id).status === 'SUBMITTED' && (
                            <div className="flex items-center space-x-2 text-blue-600">
                              <ClockIcon className="h-5 w-5" />
                              <span className="text-sm font-medium">Submitted - Awaiting Grade</span>
                              <button
                                onClick={() => {
                                  const submission = submissions[homework.id];
                                  if (submission) {
                                    setSelectedSubmission(submission);
                                    setShowSubmissionModal(true);
                                  }
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 underline"
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
                                className="text-xs text-blue-600 hover:text-blue-700 underline"
                              >
                                Edit Submission
                              </button>
                              <span className="text-xs text-gray-500 ml-2">
                                (You can edit until graded)
                              </span>
                            </div>
                          )}
                          
                          {getSubmissionStatus(homework.id).status === 'GRADED' && (
                            <div className="flex items-center space-x-2 text-green-600">
                              <CheckCircleIcon className="h-5 w-5" />
                              <span className="text-sm font-medium">Graded!</span>
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
                                View Grade
                              </button>
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
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Submission Details</h3>
              <button 
                onClick={() => setShowSubmissionModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                {selectedSubmission.isLate && (
                  <div>
                    <span className="font-medium text-gray-700">Late:</span>
                    <span className="text-red-600 font-medium">Yes</span>
                  </div>
                )}
              </div>
              
              {/* Editing Note */}
              {selectedSubmission.status === 'SUBMITTED' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> You can still edit this submission until it's graded by your teacher.
                  </p>
                </div>
              )}
              
              {selectedSubmission.submissionText && (
                <div>
                  <span className="font-medium text-gray-700">Text Response:</span>
                  <div className="mt-2 p-3 bg-gray-50 rounded border text-gray-900">
                    {selectedSubmission.submissionText}
                  </div>
                </div>
              )}
              
              {/* Attachments Section */}
              {(selectedSubmission.audioData || selectedSubmission.imageData || selectedSubmission.pdfData || selectedSubmission.attachmentUrl) && (
                <div>
                  <span className="font-medium text-gray-700">Attachments:</span>
                  <div className="mt-2 space-y-4">
                    
                    {/* Voice Recording */}
                    {selectedSubmission.audioData && (
                      <div className="p-3 bg-gray-50 rounded border">
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
                            You can play back your voice recording to review what you submitted.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Photo/Image */}
                    {selectedSubmission.imageData && (
                      <div className="p-3 bg-gray-50 rounded border">
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
                            Your submitted photo is displayed above.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* PDF Document */}
                    {selectedSubmission.pdfData && (
                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 mb-2">
                            📄 PDF: {selectedSubmission.attachmentName || 'submission.pdf'}
                          </p>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-sm text-gray-700 mb-2">
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
                              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              📄 View PDF Document
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                              Click the button above to open your PDF in a new tab.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Generic Attachment URL */}
                    {selectedSubmission.attachmentUrl && !selectedSubmission.audioData && !selectedSubmission.imageData && !selectedSubmission.pdfData && (
                      <div className="p-3 bg-gray-50 rounded border">
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
                          Click the button above to open your attachment in a new tab.
                        </p>
                      </div>
                    )}
                    
                  </div>
                </div>
              )}

              
              {selectedSubmission.status === 'GRADED' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Grade & Feedback</h4>
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
                      <p className="text-green-900 mt-2">{selectedSubmission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowSubmissionModal(false)} 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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