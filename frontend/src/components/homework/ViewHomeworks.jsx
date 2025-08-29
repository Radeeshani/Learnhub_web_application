import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FiBook, FiCalendar, FiUser, FiEye, FiEdit3, FiTrash2,
  FiPlus, FiClock, FiCheckCircle, FiXCircle, FiFileText, FiUsers,
  FiStar, FiMessageSquare, FiSave, FiX
} from 'react-icons/fi';

const ViewHomeworks = () => {
  const { user, token } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Submissions modal state
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Grading modal state
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [gradingLoading, setGradingLoading] = useState(false);

  // Sticker options for feedback
  const stickerOptions = [
    { id: 1, emoji: '🌟', label: 'Excellent Work', category: 'achievement' },
    { id: 2, emoji: '🎉', label: 'Great Job', category: 'achievement' },
    { id: 3, emoji: '👍', label: 'Very Good', category: 'achievement' },
    { id: 4, emoji: '💡', label: 'Creative Thinking', category: 'thinking' },
    { id: 5, emoji: '🚀', label: 'Outstanding', category: 'achievement' },
    { id: 6, emoji: '🎯', label: 'On Target', category: 'achievement' },
    { id: 7, emoji: '💪', label: 'Keep Going', category: 'encouragement' },
    { id: 8, emoji: '🎨', label: 'Beautiful Work', category: 'creativity' }
  ];

  // Function to handle viewing homework attachments
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
      
      console.log('Opening homework attachment:', fullUrl);
      window.open(fullUrl, '_blank');
    } catch (error) {
      console.error('Error opening attachment:', error);
      alert('Error opening attachment. Please try again.');
    }
  };

  useEffect(() => {
    if (user?.role === 'TEACHER') {
      fetchHomeworks();
    }
  }, [user]);

  const fetchHomeworks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/homework/teacher', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add submission counts and status information
      const homeworksWithStats = await Promise.all(
        response.data.map(async (homework) => {
          try {
            const submissionsResponse = await axios.get(`/api/homework/submissions/homework/${homework.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            const submissions = submissionsResponse.data;
            const totalSubmissions = submissions.length;
            const gradedSubmissions = submissions.filter(s => s.status === 'GRADED').length;
            const pendingSubmissions = totalSubmissions - gradedSubmissions;
            
            return {
              ...homework,
              totalSubmissions,
              gradedSubmissions,
              pendingSubmissions,
              status: totalSubmissions === 0 ? 'NO_SUBMISSIONS' : 
                     pendingSubmissions === 0 ? 'ALL_GRADED' : 'PENDING_GRADES'
            };
          } catch (error) {
            console.error(`Error fetching submissions for homework ${homework.id}:`, error);
            return {
              ...homework,
              totalSubmissions: 0,
              gradedSubmissions: 0,
              pendingSubmissions: 0,
              status: 'NO_SUBMISSIONS'
            };
          }
        })
      );
      
      setHomeworks(homeworksWithStats);
      
    } catch (error) {
      console.error('Error fetching homeworks:', error);
      setError('Failed to fetch homeworks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (homework) => {
    switch (homework.status) {
      case 'NO_SUBMISSIONS':
        return {
          text: 'No Submissions',
          class: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: FiClock
        };
      case 'PENDING_GRADES':
        return {
          text: `${homework.pendingSubmissions} Pending`,
          class: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: FiClock
        };
      case 'ALL_GRADED':
        return {
          text: 'All Graded',
          class: 'bg-green-100 text-green-800 border-green-300',
          icon: FiCheckCircle
        };
      default:
        return {
          text: 'Unknown',
          class: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: FiClock
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewSubmissions = async (homework) => {
    setSelectedHomework(homework);
    setShowSubmissionsModal(true);
    setSubmissionsLoading(true);
    
    try {
      const response = await axios.get(`/api/homework/submissions/homework/${homework.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      showError('Failed to fetch submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || '');
    setFeedback(submission.feedback || '');
    setSelectedStickers([]);
    setShowGradingModal(true);
  };

  const handleSaveGrade = async () => {
    if (!grade || grade < 1 || grade > 100) {
      showError('Please enter a valid grade between 1 and 100');
      return;
    }

    setGradingLoading(true);
    try {
      // Prepare feedback with stickers
      let fullFeedback = feedback;
      if (selectedStickers.length > 0) {
        const stickerText = selectedStickers.map(sticker => `${sticker.emoji} ${sticker.label}`).join('\n\n');
        fullFeedback = feedback ? `${feedback}\n\n${stickerText}` : stickerText;
      }

      await axios.put(`/api/homework/submissions/${selectedSubmission.id}/grade`, {
        grade: parseInt(grade),
        feedback: fullFeedback
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showSuccess('Grade saved successfully!');
      
      // Update the submission in the local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, grade: parseInt(grade), feedback: fullFeedback, status: 'GRADED' }
          : sub
      ));

      // Refresh homeworks to update counts
      fetchHomeworks();
      
      setShowGradingModal(false);
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      setSelectedStickers([]);
    } catch (error) {
      console.error('Error saving grade:', error);
      showError('Failed to save grade');
    } finally {
      setGradingLoading(false);
    }
  };

  const toggleSticker = (sticker) => {
    setSelectedStickers(prev => 
      prev.find(s => s.id === sticker.id)
        ? prev.filter(s => s.id !== sticker.id)
        : [...prev, sticker]
    );
  };

  const handleEditHomework = (homework) => {
    window.location.href = `/homework/edit/${homework.id}`;
  };

  const handleDeleteHomework = async (homeworkId) => {
    if (!window.confirm('Are you sure you want to delete this homework? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/homework/${homeworkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showSuccess('Homework deleted successfully');
      fetchHomeworks(); // Refresh the list
    } catch (error) {
      console.error('Error deleting homework:', error);
      showError('Failed to delete homework');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homeworks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Homeworks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchHomeworks}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-6 h-full">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full shadow-lg mb-6">
                  <FiBook className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  View Homeworks
                </h1>
                <p className="text-lg text-gray-600">
                  Manage and monitor all your homework assignments
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/homework/create'}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                <FiPlus className="h-5 w-5 inline mr-2" />
                Create New Homework
              </motion.button>
            </div>
          </motion.div>

          {/* Homeworks List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {homeworks.map((homework, index) => {
              const statusInfo = getStatusInfo(homework);
              const StatusIcon = statusInfo.icon;
              
              return (
                <motion.div
                  key={homework.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Status Badge */}
                      <div className="flex items-center space-x-3 mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.class}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.text}
                        </span>
                        {homework.totalSubmissions > 0 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                            <FiUsers className="h-3 w-3 mr-1" />
                            {homework.totalSubmissions} submissions
                          </span>
                        )}
                      </div>

                      {/* Homework Title */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {homework.title}
                      </h3>

                      {/* Subject and Class */}
                      <div className="flex items-center space-x-4 mb-3">
                        <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                          {homework.subject}
                        </span>
                        {homework.classGrade && (
                          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            Grade {homework.classGrade}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {homework.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {homework.description}
                        </p>
                      )}

                      {/* Due Date */}
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <FiCalendar className="h-4 w-4 mr-2 text-blue-500" />
                        Due: {formatDate(homework.dueDate)}
                      </div>

                      {/* Submission Stats */}
                      {homework.totalSubmissions > 0 && (
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-blue-600">{homework.totalSubmissions}</div>
                            <div className="text-xs text-blue-600">Total</div>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-yellow-600">{homework.pendingSubmissions}</div>
                            <div className="text-xs text-yellow-600">Pending</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-green-600">{homework.gradedSubmissions}</div>
                            <div className="text-xs text-green-600">Graded</div>
                          </div>
                        </div>
                      )}

                      {/* Attachment */}
                      {homework.fileUrl && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FiFileText className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Homework Material</p>
                              <button
                                onClick={() => handleViewAttachment(homework.fileUrl)}
                                className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors flex items-center"
                              >
                                <span>View File</span>
                                <FiEye className="h-4 w-4 ml-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Created Date */}
                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                        Created: {formatDate(homework.createdAt)}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col items-end space-y-2 ml-6">
                      {homework.totalSubmissions > 0 && (
                        <button
                          onClick={() => handleViewSubmissions(homework)}
                          className="flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-xl transition-all duration-300 border border-blue-200 hover:border-blue-300"
                          title="View student submissions"
                        >
                          <FiEye className="h-4 w-4 mr-2" />
                          <span className="font-medium">View Submissions</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleEditHomework(homework)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Homework"
                      >
                        <FiEdit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHomework(homework.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Homework"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Empty State */}
          {homeworks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
                <FiBook className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Homeworks Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start creating homework assignments for your students.
              </p>
              <button
                onClick={() => window.location.href = '/homework/create'}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                <FiPlus className="h-5 w-5 inline mr-2" />
                Create Your First Homework
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Submissions Modal */}
      {showSubmissionsModal && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Submissions for: {selectedHomework.title}
              </h3>
              <button 
                onClick={() => setShowSubmissionsModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Submissions List */}
            <div className="space-y-4">
              {submissionsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No submissions yet for this homework.
                </div>
              ) : (
                submissions.map((submission, index) => (
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
                                <p key={index} className="text-gray-800 mb-2 last:mb-0">
                                  {part}
                                </p>
                              );
                            }
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Submission Content */}
                    {submission.submissionText && (
                      <div className="mb-3">
                        <span className="font-medium text-gray-700 text-sm">Submission:</span>
                        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-gray-800">{submission.submissionText}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Attachments Section */}
                    {(submission.audioData || submission.imageData || submission.pdfData || submission.attachmentUrl || submission.fileUrl) && (
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
                          
                          {/* Legacy File URL (for backward compatibility) */}
                          {submission.fileUrl && !submission.audioData && !submission.imageData && !submission.pdfData && !submission.attachmentUrl && (
                            <div className="p-2 bg-gray-50 rounded border">
                              <p className="text-sm text-gray-600">
                                📎 Legacy Attachment: {submission.attachmentName || 'submission_file'}
                              </p>
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                              >
                                <FiFileText className="h-4 w-4 mr-1" />
                                View Attachment
                              </a>
                              <p className="text-xs text-gray-500">
                                Click to open legacy attachment
                              </p>
                            </div>
                          )}
                          
                        </div>
                      </div>
                    )}

                    {/* Grade/Edit Button */}
                    <div className="flex justify-end mt-4">
                      {submission.status === 'GRADED' ? (
                        <button
                          onClick={() => handleGradeSubmission(submission)}
                          className="flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                        >
                          <FiEdit3 className="h-4 w-4 mr-2" />
                          Edit Grade
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGradeSubmission(submission)}
                          className="flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 rounded-lg transition-colors border border-green-200 hover:border-green-300"
                        >
                          <FiStar className="h-4 w-4 mr-2" />
                          Grade Submission
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {showGradingModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Grade Submission - {selectedSubmission.studentName}
              </h3>
              <button 
                onClick={() => setShowGradingModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Submission Content Display */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Submission Content</h4>
                
                {/* Text Submission */}
                {selectedSubmission.submissionText && (
                  <div className="mb-4">
                    <span className="font-medium text-gray-700 text-sm">Text Response:</span>
                    <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-gray-800">{selectedSubmission.submissionText}</p>
                    </div>
                  </div>
                )}
                
                {/* Attachments */}
                {(selectedSubmission.audioData || selectedSubmission.imageData || selectedSubmission.pdfData || selectedSubmission.attachmentUrl || selectedSubmission.fileUrl) && (
                  <div>
                    <span className="font-medium text-gray-700 text-sm">Attachments:</span>
                    <div className="mt-2 space-y-3">
                      
                      {/* Voice Recording */}
                      {selectedSubmission.audioData && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 font-medium">
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
                          </div>
                        </div>
                      )}
                      
                      {/* Photo/Image */}
                      {selectedSubmission.imageData && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 font-medium">
                              📸 Photo: {selectedSubmission.attachmentName || 'submission_photo.jpg'}
                            </p>
                            <img 
                              src={`data:image/jpeg;base64,${selectedSubmission.imageData}`}
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
                                    <img src="data:image/jpeg;base64,${selectedSubmission.imageData}" alt="Submission Image" class="max-w-full h-auto rounded border" />
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
                      {selectedSubmission.pdfData && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 font-medium">
                              📄 PDF: {selectedSubmission.attachmentName || 'submission.pdf'}
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
                              📄 View PDF
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Generic Attachment URL */}
                      {selectedSubmission.attachmentUrl && !selectedSubmission.audioData && !selectedSubmission.imageData && !selectedSubmission.pdfData && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600 font-medium mb-2">
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
                        </div>
                      )}
                      
                      {/* Legacy File URL */}
                      {selectedSubmission.fileUrl && !selectedSubmission.audioData && !selectedSubmission.imageData && !selectedSubmission.pdfData && !selectedSubmission.attachmentUrl && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600 font-medium mb-2">
                            📎 Legacy Attachment: {selectedSubmission.attachmentName || 'submission_file'}
                          </p>
                          <a
                            href={selectedSubmission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <FiFileText className="h-4 w-4 mr-2" />
                            View Attachment
                          </a>
                        </div>
                      )}
                      
                    </div>
                  </div>
                )}
              </div>

              {/* Grade Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade (1-100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter grade (1-100)"
                />
              </div>

              {/* Feedback Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Enter feedback for the student..."
                />
              </div>

              {/* Stickers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add Stickers (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stickerOptions.map((sticker) => (
                    <button
                      key={sticker.id}
                      type="button"
                      onClick={() => toggleSticker(sticker)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        selectedStickers.find(s => s.id === sticker.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{sticker.emoji}</div>
                      <div className="text-xs text-gray-600 text-center">{sticker.label}</div>
                    </button>
                  ))}
                </div>
                {selectedStickers.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">Selected Stickers:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStickers.map((sticker) => (
                        <span key={sticker.id} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-300">
                          {sticker.emoji} {sticker.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowGradingModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGrade}
                  disabled={gradingLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {gradingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4 mr-2" />
                      Save Grade
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Additional bottom spacing to ensure full page height */}
      <div className="h-20"></div>
    </div>
  );
};

export default ViewHomeworks;
