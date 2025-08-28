import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  MicrophoneIcon,
  CameraIcon,
  DocumentTextIcon,
  PaperClipIcon,
  XMarkIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { FiBook, FiCalendar, FiUser, FiSearch, FiPlus, FiEye, FiClock, FiCheckCircle, FiXCircle, FiEdit3 } from 'react-icons/fi';

const SubmitHomework = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State for homeworks list
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHomeworks, setFilteredHomeworks] = useState([]);
  
  // State for submission modal
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [submissionText, setSubmissionText] = useState('');
  const [voiceRecording, setVoiceRecording] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [submissionType, setSubmissionType] = useState('TEXT');
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  
  // Fetch homeworks for the logged-in student
  useEffect(() => {
    fetchHomeworks();
  }, []);
  
  useEffect(() => {
    filterHomeworks();
  }, [homeworks, searchQuery]);
  
  const fetchHomeworks = async () => {
    try {
      setLoading(true);
      
      // Fetch homeworks first
      const homeworksResponse = await axios.get('/api/homework/student', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Try to fetch submissions, but don't fail if it doesn't work
      let submissionsMap = {};
      try {
        const submissionsResponse = await axios.get('/api/homework/submissions/student', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Create a map of submissions by homework ID
        submissionsResponse.data.forEach(submission => {
          submissionsMap[submission.homeworkId] = submission;
        });
      } catch (submissionsError) {
        console.warn('Could not fetch submissions, continuing without submission data:', submissionsError);
        // Continue without submission data - all homeworks will show as not submitted
      }
      
      // Combine homeworks with their submission data
      const homeworksWithSubmissions = homeworksResponse.data.map(homework => ({
        ...homework,
        submission: submissionsMap[homework.id] || null,
        hasSubmission: !!submissionsMap[homework.id]
      }));
      
      // Debug: Log homework data to see what fields are available
      console.log('Homeworks with submissions:', homeworksWithSubmissions);
      homeworksWithSubmissions.forEach(hw => {
        if (hw.fileUrl) {
          console.log(`Homework ${hw.id} has attachment:`, {
            fileName: hw.fileName,
            fileUrl: hw.fileUrl,
            title: hw.title
          });
        }
      });
      
      setHomeworks(homeworksWithSubmissions);
    } catch (error) {
      console.error('Error fetching homeworks:', error);
      showError('Failed to fetch homeworks');
    } finally {
      setLoading(false);
    }
  };
  
  const filterHomeworks = () => {
    if (!searchQuery.trim()) {
      setFilteredHomeworks(homeworks);
      return;
    }
    
    const filtered = homeworks.filter(hw => 
      hw.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hw.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hw.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredHomeworks(filtered);
  };
  
  const openSubmissionModal = (homework) => {
    setSelectedHomework(homework);
    setShowSubmissionModal(true);
    
          if (homework.hasSubmission && homework.submission) {
        // Editing existing submission
        console.log('Opening submission for editing:', homework.submission);
        setIsEditing(true);
        setEditingSubmission(homework.submission);
        setSubmissionText(homework.submission.submissionText || '');
        setSubmissionType(homework.submission.submissionType || 'TEXT');
        
        // Set existing attachments if they exist
        if (homework.submission.imageData) {
          console.log('Found existing image:', homework.submission.imageData);
          setPhotoFile({ 
            name: 'Previous Image', 
            url: `data:image/jpeg;base64,${homework.submission.imageData}`,
            isExisting: true,
            base64Data: homework.submission.imageData
          });
        } else {
          setPhotoFile(null);
        }
        
        if (homework.submission.pdfData) {
          console.log('Found existing PDF:', homework.submission.pdfData);
          setPdfFile({ 
            name: 'Previous PDF', 
            url: `data:application/pdf;base64,${homework.submission.pdfData}`,
            isExisting: true,
            base64Data: homework.submission.pdfData
          });
        } else {
          setPdfFile(null);
        }
        
        if (homework.submission.audioData) {
          console.log('Found existing audio:', homework.submission.audioData);
          setVoiceRecording({ 
            url: `data:audio/wav;base64,${homework.submission.audioData}`,
            isExisting: true,
            base64Data: homework.submission.audioData
          });
        } else {
          setVoiceRecording(null);
        }
      } else {
      // New submission
      setIsEditing(false);
      setEditingSubmission(null);
      setSubmissionText('');
      setVoiceRecording(null);
      setPhotoFile(null);
      setPdfFile(null);
      setSubmissionType('TEXT');
    }
  };
  
  const closeSubmissionModal = () => {
    setShowSubmissionModal(false);
    setSelectedHomework(null);
    setSubmitting(false);
    setIsEditing(false);
    setEditingSubmission(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!submissionText.trim() && !voiceRecording && !photoFile && !pdfFile) {
      showError('Please provide a submission (text, voice, photo, or PDF)');
      return;
    }
    
    try {
      setSubmitting(true);
      
      let response;
      if (isEditing && editingSubmission && editingSubmission.id) {
        // Update existing submission - use MultipartFile format
        const formData = new FormData();
        formData.append('homeworkId', selectedHomework.id);
        formData.append('submissionText', submissionText);
        formData.append('submissionType', submissionType);
        
        if (voiceRecording && !voiceRecording.isExisting) {
          formData.append('voiceFile', voiceRecording.blob, 'voice.wav');
        }
        if (photoFile && !photoFile.isExisting) {
          formData.append('photoFile', photoFile);
        }
        if (pdfFile && !pdfFile.isExisting) {
          formData.append('pdfFile', pdfFile);
        }
        
        try {
          response = await axios.put(`/api/homework/submissions/${editingSubmission.id}`, formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          showSuccess('Homework submission updated successfully!');
        } catch (updateError) {
          console.error('Error updating submission:', updateError);
          showError('Failed to update submission. Please try again.');
          return;
        }
      } else {
        // Create new submission - send ONLY base64 data (backend doesn't save files to disk)
        const formData = new FormData();
        formData.append('homeworkId', selectedHomework.id);
        formData.append('submissionText', submissionText);
        formData.append('submissionType', submissionType);
        
        // Send base64 data for database storage
        if (voiceRecording && !voiceRecording.isExisting) {
          try {
            const audioBase64 = await convertBlobToBase64(voiceRecording.blob);
            formData.append('audioData', audioBase64);
          } catch (error) {
            console.error('Error converting audio to base64:', error);
            showError('Failed to process voice recording');
            return;
          }
        }
        
        if (photoFile && !photoFile.isExisting) {
          try {
            const imageBase64 = await convertFileToBase64(photoFile);
            formData.append('imageData', imageBase64);
          } catch (error) {
            console.error('Error converting image to base64:', error);
            showError('Failed to process image');
            return;
          }
        }
        
        if (pdfFile && !pdfFile.isExisting) {
          try {
            const pdfBase64 = await convertFileToBase64(pdfFile);
            formData.append('pdfData', pdfBase64);
          } catch (error) {
            console.error('Error converting PDF to base64:', error);
            showError('Failed to process PDF');
            return;
          }
        }

        response = await axios.post('/api/homework/submit', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        showSuccess('Homework submitted successfully!');
      }
      
      closeSubmissionModal();
      fetchHomeworks(); // Refresh the list
      
    } catch (error) {
      console.error('Error submitting homework:', error);
      showError('Failed to submit homework. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setVoiceRecording({ blob, url });
        setSubmissionType('VOICE');
        // Clear other submission types when voice is selected
        setSubmissionText('');
        setPhotoFile(null);
        setPdfFile(null);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      showError('Could not access microphone. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };
  
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setSubmissionType('PHOTO');
      // Clear other submission types when photo is selected
      setSubmissionText('');
      setVoiceRecording(null);
      setPdfFile(null);
    }
  };
  
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setSubmissionType('PDF');
      // Clear other submission types when PDF is selected
      setSubmissionText('');
      setVoiceRecording(null);
      setPhotoFile(null);
    }
  };
  
  const removeExistingAttachment = (type) => {
    switch (type) {
      case 'photo':
        setPhotoFile(null);
        break;
      case 'pdf':
        setPdfFile(null);
        break;
      case 'voice':
        setVoiceRecording(null);
        break;
      default:
        break;
    }
  };
  
  const handleTextChange = (e) => {
    const text = e.target.value;
    setSubmissionText(text);
    
    // If text is entered, set submission type to TEXT and clear other types
    if (text.trim()) {
      setSubmissionType('TEXT');
      setVoiceRecording(null);
      setPhotoFile(null);
      setPdfFile(null);
    }
  };
  
  // Convert file to base64 for POST endpoint
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Convert blob to base64 for voice recordings
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:audio/wav;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get file icon based on file type
  const getFileIcon = (fileName) => {
    if (!fileName) return <PaperClipIcon className="h-4 w-4 text-purple-600" />;
    
    const lowerFileName = fileName.toLowerCase();
    if (lowerFileName.includes('.pdf')) {
      return <DocumentTextIcon className="h-4 w-4 text-purple-600" />;
    } else if (lowerFileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return <CameraIcon className="h-4 w-4 text-purple-600" />;
    } else if (lowerFileName.match(/\.(doc|docx)$/)) {
      return <DocumentTextIcon className="h-4 w-4 text-purple-600" />;
    } else if (lowerFileName.match(/\.(xls|xlsx)$/)) {
      return <DocumentTextIcon className="h-4 w-4 text-purple-600" />;
    } else if (lowerFileName.match(/\.(ppt|pptx)$/)) {
      return <DocumentTextIcon className="h-4 w-4 text-purple-600" />;
    } else {
      return <PaperClipIcon className="h-4 w-4 text-purple-600" />;
    }
  };

  // Helper function to get clean file name
  const getCleanFileName = (fileName) => {
    if (!fileName) return 'Attachment';
    
    // Extract meaningful name from UUID_filename format
    if (fileName.includes('_') && fileName.split('_').length > 1) {
      const parts = fileName.split('_');
      return parts.slice(1).join('_').replace(/\.[^/.]+$/, ''); // Remove extension
    }
    return fileName.replace(/\.[^/.]+$/, ''); // Remove extension
  };

  // Helper function to get file extension
  const getFileExtension = (fileName) => {
    if (!fileName) return 'FILE';
    const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
    return ext;
  };
  

  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <FiClock className="h-4 w-4" />;
      case 'OVERDUE':
        return <FiXCircle className="h-4 w-4" />;
      case 'GRADED':
        return <FiCheckCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };
  
  const getSubmissionStatus = (homework) => {
    if (!homework.hasSubmission) {
      return { status: 'NOT_SUBMITTED', canEdit: true, label: 'Not Submitted' };
    }
    
    const submission = homework.submission;
    if (submission.grade !== null && submission.grade !== undefined) {
      return { status: 'GRADED', canEdit: false, label: 'Graded' };
    }
    
    if (submission.status === 'SUBMITTED') {
      return { status: 'SUBMITTED', canEdit: true, label: 'Submitted' };
    }
    
    return { status: submission.status || 'PENDING', canEdit: true, label: submission.status || 'Pending' };
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'GRADED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SUBMITTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NOT_SUBMITTED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-300/30 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 to-blue-50/30" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-2xl mb-6"
            >
              <FiBook className="h-12 w-12 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4"
            >
              Loading Homeworks
            </motion.h2>
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 to-blue-50/30" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg mb-6"
                >
                  <FiBook className="h-10 w-10 text-white" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4"
                >
                  Submit Homework
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-lg text-gray-600"
                >
                  View and submit your homework assignments
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-6 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="relative">
              <FiSearch className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search homeworks by title, subject, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Homeworks List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            {filteredHomeworks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-6">
                  <FiBook className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Homeworks Found</h3>
                <p className="text-gray-600 mb-6">
                  {homeworks.length === 0 
                    ? 'You have no homework assignments yet.' 
                    : 'No homeworks match your search.'
                  }
                </p>
                {homeworks.length === 0 && (
                  <p className="text-gray-500 mb-6">
                    Check with your teachers for upcoming assignments.
                  </p>
                )}
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Clear Search
                </button>
              </motion.div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold text-emerald-600">{filteredHomeworks.length}</span> homework assignments
                  </p>
                </div>

                {/* Homeworks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHomeworks.map((homework, index) => (
                    <motion.div
                      key={homework.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 relative"
                    >
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        {(() => {
                          const submissionStatus = getSubmissionStatus(homework);
                          return (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submissionStatus.status)}`}>
                              {getStatusIcon(submissionStatus.status)}
                              <span className="ml-1 capitalize">{submissionStatus.label}</span>
                            </span>
                          );
                        })()}
                      </div>

                      {/* Homework Header */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                          {homework.title}
                        </h3>
                        <p className="text-sm text-emerald-600 font-semibold">
                          {homework.subject}
                        </p>
                        {homework.gradeLevel && (
                          <p className="text-xs text-gray-500 mt-1">
                            Grade {homework.gradeLevel}
                          </p>
                        )}
                      </div>

                      {/* Homework Description */}
                      {homework.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {homework.description}
                        </p>
                      )}

                      {/* Homework Details */}
                      <div className="space-y-2 mb-4">
                        {homework.dueDate && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FiCalendar className="h-4 w-4 mr-2 text-emerald-500" />
                            Due: {formatDate(homework.dueDate)}
                          </div>
                        )}
                        
                        {homework.teacherName && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FiUser className="h-4 w-4 mr-2 text-teal-500" />
                            {homework.teacherName}
                          </div>
                        )}
                        
                        {/* Homework Attachment */}
                        {homework.fileUrl && (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              {getFileIcon(homework.fileName || homework.fileUrl.split('/').pop())}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 font-medium">Homework Material</p>
                              <div className="flex items-center space-x-2">
                                <span 
                                  className="text-sm font-semibold text-gray-900"
                                  title={homework.fileName || homework.fileUrl.split('/').pop()}
                                >
                                  {getCleanFileName(homework.fileName || homework.fileUrl.split('/').pop())}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {getFileExtension(homework.fileName || homework.fileUrl.split('/').pop())}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                try {
                                  console.log('Attachment clicked for homework:', {
                                    id: homework.id,
                                    title: homework.title,
                                    fileUrl: homework.fileUrl,
                                    fileName: homework.fileName
                                  });
                                  
                                  if (!homework.fileUrl) {
                                    console.error('No file URL provided');
                                    return;
                                  }
                                  
                                  // Handle different file URL formats
                                  let fullUrl;
                                  if (homework.fileUrl.startsWith('http')) {
                                    // External URL
                                    fullUrl = homework.fileUrl;
                                  } else if (homework.fileUrl.startsWith('/uploads/')) {
                                    // Backend uploads path - use new v1/files endpoint
                                    const fileName = homework.fileUrl.split('/').pop();
                                    fullUrl = `/api/v1/files/download/homework/${fileName}`;
                                  } else if (homework.fileUrl.startsWith('/api/uploads/')) {
                                    // Already has /api prefix - convert to new endpoint
                                    const fileName = homework.fileUrl.split('/').pop();
                                    fullUrl = `/api/v1/files/download/homework/${fileName}`;
                                  } else {
                                    // Assume it's a filename, construct the full path
                                    fullUrl = `/api/v1/files/download/homework/${homework.fileUrl}`;
                                  }
                                  
                                  console.log('Constructed full URL:', fullUrl);
                                  console.log('Opening homework attachment:', fullUrl);
                                  window.open(fullUrl, '_blank');
                                } catch (error) {
                                  console.error('Error opening homework attachment:', error);
                                  alert('Error opening attachment. Please try again.');
                                }
                              }}
                              className="flex items-center space-x-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors font-medium text-sm"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span>View</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-4">
                        {(() => {
                          const submissionStatus = getSubmissionStatus(homework);
                          if (submissionStatus.status === 'GRADED') {
                            return (
                              <div className="text-center">
                                <div className="text-sm text-gray-600 mb-2">
                                  Grade: <span className="font-semibold text-blue-600">{homework.submission.grade}/100</span>
                                </div>
                                {homework.submission.feedback && (
                                  <div className="text-sm text-gray-600 mb-2 text-left">
                                    <div className="font-medium text-gray-700 mb-1">Teacher Feedback:</div>
                                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                                      {homework.submission.feedback.split('\n\n').map((part, index) => {
                                        // Check if this part contains stickers (emoji + text pattern)
                                        if (part.match(/^[^\w\s]*\s+\w+/)) {
                                          // This looks like a sticker (emoji + label)
                                          return (
                                            <div key={index} className="inline-block mr-2 mb-1">
                                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-300">
                                                {part}
                                              </span>
                                            </div>
                                          );
                                        } else {
                                          // This is regular text feedback
                                          return (
                                            <p key={index} className="text-gray-900 text-xs mb-1">
                                              {part}
                                            </p>
                                          );
                                        }
                                      })}
                                    </div>
                                  </div>
                                )}
                                <button
                                  disabled
                                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-xl text-sm font-semibold cursor-not-allowed"
                                >
                                  Already Graded
                                </button>
                              </div>
                            );
                          }
                          
                          return (
                            <button
                              onClick={() => openSubmissionModal(homework)}
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                            >
                              {submissionStatus.canEdit && homework.hasSubmission ? (
                                <>
                                  <FiEdit3 className="h-4 w-4 mr-2" />
                                  Edit Submission
                                </>
                              ) : (
                                <>
                                  <FiPlus className="h-4 w-4 mr-2" />
                                  Submit Homework
                                </>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Homework Submission' : 'Submit Homework'}
                </h2>
                <button
                  onClick={closeSubmissionModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiXCircle className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">{selectedHomework.title}</p>
              
              {/* Homework Attachment in Modal Header */}
              {selectedHomework.fileUrl && (
                <div className="mt-2 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                      {getFileIcon(selectedHomework.fileName || selectedHomework.fileUrl.split('/').pop())}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-purple-800 font-medium">📚 Homework Material</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span 
                          className="text-sm font-semibold text-purple-900"
                          title={selectedHomework.fileName || selectedHomework.fileUrl.split('/').pop()}
                        >
                          {getCleanFileName(selectedHomework.fileName || selectedHomework.fileUrl.split('/').pop())}
                        </span>
                        <span className="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded-full">
                          {getFileExtension(selectedHomework.fileName || selectedHomework.fileUrl.split('/').pop())}
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">
                        Review this material before submitting your work
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          console.log('Modal attachment clicked for homework:', {
                            id: selectedHomework.id,
                            title: selectedHomework.title,
                            fileUrl: selectedHomework.fileUrl,
                            fileName: selectedHomework.fileName
                          });
                          
                          if (!selectedHomework.fileUrl) {
                            console.error('No file URL provided');
                            return;
                          }
                          
                          // Handle different file URL formats
                          let fullUrl;
                          if (selectedHomework.fileUrl.startsWith('http')) {
                            // External URL
                            fullUrl = selectedHomework.fileUrl;
                          } else if (selectedHomework.fileUrl.startsWith('/uploads/')) {
                            // Backend uploads path - use new v1/files endpoint
                            const fileName = selectedHomework.fileUrl.split('/').pop();
                            fullUrl = `/api/v1/files/download/homework/${fileName}`;
                          } else if (selectedHomework.fileUrl.startsWith('/api/uploads/')) {
                            // Already has /api prefix - convert to new endpoint
                            const fileName = selectedHomework.fileUrl.split('/').pop();
                            fullUrl = `/api/v1/files/download/homework/${fileName}`;
                          } else {
                            // Assume it's a filename, construct the full path
                            fullUrl = `/api/v1/files/download/homework/${selectedHomework.fileUrl}`;
                          }
                          
                          console.log('Modal constructed full URL:', fullUrl);
                          console.log('Opening homework attachment from modal:', fullUrl);
                          window.open(fullUrl, '_blank');
                        } catch (error) {
                          console.error('Error opening homework attachment:', error);
                          alert('Error opening attachment. Please try again.');
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View Material</span>
                    </button>
                  </div>
                </div>
              )}
              
              {isEditing && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You can edit your submission until the teacher grades it.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Existing Submission Info */}
              {isEditing && editingSubmission && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Current Submission</h3>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div>
                      <strong>Submitted:</strong> {formatDate(editingSubmission.submittedAt)}
                    </div>
                    <div>
                      <strong>Type:</strong> {editingSubmission.submissionType || 'TEXT'}
                    </div>
                    {editingSubmission.submissionText && (
                      <div>
                        <strong>Text:</strong> {editingSubmission.submissionText.substring(0, 100)}
                        {editingSubmission.submissionText.length > 100 && '...'}
                      </div>
                    )}
                    {/* Warning for old submissions with fake URLs */}
                    {editingSubmission.attachmentUrl && !editingSubmission.imageData && !editingSubmission.pdfData && !editingSubmission.audioData && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-2">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-orange-800 text-xs">
                            This submission was created with the old system. Please re-upload your attachments below to make them viewable.
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Show existing attachments */}
                    {(editingSubmission.imageData || editingSubmission.pdfData || editingSubmission.audioData || editingSubmission.attachmentUrl) && (
                      <div>
                        <strong>Attachments:</strong>
                        <ul className="ml-4 mt-1">
                          {editingSubmission.imageData && (
                            <li className="flex items-center space-x-2">
                              <span>• Image (Base64)</span>
                              <button
                                type="button"
                                onClick={() => {
                                  // Create a modal to display the image
                                  const modal = document.createElement('div');
                                  modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
                                  modal.innerHTML = `
                                    <div class="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
                                      <div class="flex justify-between items-center mb-4">
                                        <h3 class="text-lg font-semibold">View Image</h3>
                                        <button class="text-gray-500 hover:text-gray-700 text-2xl" onclick="this.closest('.fixed').remove()">&times;</button>
                                      </div>
                                      <img src="data:image/jpeg;base64,${editingSubmission.imageData}" alt="Submission Image" class="max-w-full h-auto rounded border" />
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
                                className="text-blue-500 hover:text-blue-700 underline text-sm cursor-pointer"
                              >
                                View Image
                              </button>
                            </li>
                          )}
                          {editingSubmission.pdfData && (
                            <li className="flex items-center space-x-2">
                              <span>• PDF (Base64)</span>
                              <button
                                type="button"
                                onClick={() => {
                                  // Open PDF in new tab (PDFs are better handled by browser)
                                  window.open(`data:application/pdf;base64,${editingSubmission.pdfData}`, '_blank');
                                }}
                                className="text-blue-500 hover:text-blue-700 underline text-sm cursor-pointer"
                              >
                                View PDF
                              </button>
                            </li>
                          )}
                          {editingSubmission.audioData && (
                            <li className="flex items-center space-x-2">
                              <span>• Voice Recording (Base64)</span>
                              <audio controls className="h-6">
                                <source src={`data:audio/wav;base64,${editingSubmission.audioData}`} type="audio/wav" />
                                Your browser does not support the audio element.
                              </audio>
                            </li>
                          )}
                          {editingSubmission.attachmentUrl && !editingSubmission.imageData && !editingSubmission.pdfData && !editingSubmission.audioData && (
                            <li className="flex items-center space-x-2">
                              <span>• File: {editingSubmission.attachmentUrl}</span>
                              <span className="text-orange-600 text-sm">
                                (File not accessible - was uploaded with old system)
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Text Submission */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEditing ? 'Update Text Submission' : 'Text Submission'}
                </label>
                <textarea
                  value={submissionText}
                  onChange={handleTextChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder={isEditing ? "Update your text submission..." : "Enter your homework submission..."}
                />
              </div>

              {/* Voice Recording */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEditing ? 'Update Voice Recording' : 'Voice Recording'}
                </label>
                <div className="flex items-center space-x-4">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <MicrophoneIcon className="h-5 w-5 mr-2" />
                      Start Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <MicrophoneIcon className="h-5 w-5 mr-2" />
                      Stop Recording ({recordingTime}s)
                    </button>
                  )}
                </div>
                {voiceRecording && (
                  <div className="mt-2 flex items-center space-x-2 text-green-600">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>
                      {voiceRecording.isExisting ? 'Previous voice recording' : 'Voice recording ready'}
                    </span>
                    {voiceRecording.isExisting && (
                      <div className="flex items-center space-x-2">
                        <audio controls className="h-8">
                          <source src={voiceRecording.url} type="audio/wav" />
                          Your browser does not support the audio element.
                        </audio>
                        <button
                          type="button"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = voiceRecording.url;
                            link.download = 'previous_recording.wav';
                            link.click();
                          }}
                          className="text-green-500 hover:text-green-700 underline text-sm"
                        >
                          Download
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setVoiceRecording(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* File Uploads */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEditing ? 'Update File Attachments' : 'File Attachments'}
                </label>
                <div className="space-y-4">
                  {/* Photo Upload */}
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors">
                      <CameraIcon className="h-5 w-5" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    
                    {photoFile && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>
                          {photoFile.isExisting ? 'Previous image attachment' : photoFile.name}
                        </span>
                        {photoFile.isExisting && (
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                // Create a modal to display the image
                                const modal = document.createElement('div');
                                modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
                                modal.innerHTML = `
                                  <div class="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
                                    <div class="flex justify-between items-center mb-4">
                                      <h3 class="text-lg font-semibold">View Image</h3>
                                      <button class="text-gray-500 hover:text-gray-700 text-2xl" onclick="this.closest('.fixed').remove()">&times;</button>
                                    </div>
                                    <img src="${photoFile.url}" alt="Submission Image" class="max-w-full h-auto rounded border" />
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
                              className="text-blue-500 hover:text-blue-700 underline text-sm cursor-pointer"
                            >
                              View Image
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = photoFile.url;
                                link.download = 'previous_image.jpg';
                                link.click();
                              }}
                              className="text-green-500 hover:text-green-700 underline text-sm"
                            >
                              Download
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setPhotoFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PDF Upload */}
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-teal-500 text-teal-600 hover:bg-teal-50 cursor-pointer transition-colors">
                      <PaperClipIcon className="h-5 w-5" />
                      <span>Upload PDF</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                    </label>
                    
                    {pdfFile && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>
                          {pdfFile.isExisting ? 'Previous PDF attachment' : pdfFile.name}
                        </span>
                        {pdfFile.isExisting && (
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                // Open PDF in new tab (PDFs are better handled by browser)
                                window.open(pdfFile.url, '_blank');
                              }}
                              className="text-blue-500 hover:text-blue-700 underline text-sm cursor-pointer"
                            >
                              View PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = pdfFile.url;
                                link.download = 'previous_document.pdf';
                                link.click();
                              }}
                              className="text-green-500 hover:text-green-700 underline text-sm"
                            >
                              Download
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setPdfFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeSubmissionModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isEditing ? 'Updating...' : 'Submitting...'}
                    </div>
                  ) : (
                    isEditing ? 'Update Submission' : 'Submit Homework'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SubmitHomework;
