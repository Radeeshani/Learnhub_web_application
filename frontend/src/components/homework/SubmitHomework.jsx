import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  MicrophoneIcon,
  CameraIcon,
  DocumentTextIcon,
  PaperClipIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Header from '../common/Header';

const SubmitHomework = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
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
  
  // Get homework details from location state
  const homework = location.state?.homework;
  const editingSubmission = location.state?.editingSubmission;
  const isEditing = location.state?.isEditing || false;
  
  // Initialize form with existing submission data if editing
  React.useEffect(() => {
    if (isEditing && editingSubmission) {
      setSubmissionText(editingSubmission.submissionText || '');
      setSubmissionType(editingSubmission.submissionType || 'TEXT');
      // Note: File handling for editing would need more complex logic
      // For now, we'll focus on text updates
    }
  }, [isEditing, editingSubmission]);
  
  if (!homework) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Homework Selected</h1>
            <p className="text-gray-600 mb-6">Please select a homework assignment to submit.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhotoFile(file);
      setSubmissionType('PHOTO');
      setVoiceRecording(null);
      setPdfFile(null);
    } else {
      setError('Please select a valid image file.');
    }
  };

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdfFile(file);
      setSubmissionType('PDF');
    }
  };

  const removeAttachment = () => {
    setVoiceRecording(null);
    setPhotoFile(null);
    setPdfFile(null);
    setSubmissionType('TEXT');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      
      const submissionData = {
        homeworkId: homework.id,
        submissionText: submissionText,
        submissionType: submissionType,
        audioData: voiceRecording ? await convertBlobToBase64(voiceRecording.blob) : null,
        imageData: photoFile ? await convertFileToBase64(photoFile) : null,
        pdfData: pdfFile ? await convertFileToBase64(pdfFile) : null
      };
      
      formData.append('submission', new Blob([JSON.stringify(submissionData)], {
        type: 'application/json'
      }));
      
      if (voiceRecording) {
        formData.append('voiceFile', voiceRecording.blob, 'voice_recording.wav');
      }
      
      if (photoFile) {
        formData.append('photoFile', photoFile);
      }
      
      if (pdfFile) {
        formData.append('pdfFile', pdfFile);
      }
      
      let response;
      if (isEditing) {
        // Update existing submission
        response = await axios.put(
          `http://localhost:8080/api/homework/submissions/${editingSubmission.id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Create new submission
        response = await axios.post(
          'http://localhost:8080/api/homework/submit',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/student', { 
          state: { message: isEditing ? 'Submission updated successfully!' : 'Homework submitted successfully!' }
        });
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || (isEditing ? 'Failed to update submission' : 'Failed to submit homework'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? 'Edit Homework Submission' : 'Submit Homework'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update your homework submission' : 'Complete your homework assignment'}
            </p>
          </div>

          {/* Homework Details */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">{homework.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <span className="font-medium">Subject:</span> {homework.subject}
              </div>
              <div>
                <span className="font-medium">Grade:</span> {homework.classGrade}
              </div>
              <div>
                <span className="font-medium">Due:</span> {new Date(homework.dueDate).toLocaleDateString()}
              </div>
            </div>
            {homework.description && (
              <p className="text-blue-700 mt-3">{homework.description}</p>
            )}
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text Submission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Written Response (Optional)
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your answer here..."
              />
            </div>

            {/* Submission Methods */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Choose Submission Method
              </label>
              
              {/* Voice Recording */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Voice Recording
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 mb-2">
                    💡 <strong>Voice Recording:</strong> Record your answer using the microphone. 
                    The recording will be captured and submitted with your homework.
                  </p>
                  <p className="text-xs text-blue-700">
                    🎧 <strong>Note:</strong> You'll be able to play back your voice recording after submission to review what you recorded.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <MicrophoneIcon className="h-4 w-4 mr-2" />
                      Start Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <MicrophoneIcon className="h-4 w-4 mr-2" />
                      Stop Recording ({recordingTime}s)
                    </button>
                  )}
                  
                  {voiceRecording && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">✓ Recording saved</span>
                      <button
                        type="button"
                        onClick={() => setVoiceRecording(null)}
                        className="text-red-600 hover:text-red-700 text-sm underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-green-500 text-green-600 hover:bg-green-50 cursor-pointer transition-colors">
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
                    <span>{photoFile.name}</span>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* PDF Upload */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-purple-500 text-purple-600 hover:bg-purple-50 cursor-pointer transition-colors">
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
                    <span>{pdfFile.name}</span>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                Homework submitted successfully! Redirecting...
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/student')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
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
    </div>
  );
};

export default SubmitHomework;
