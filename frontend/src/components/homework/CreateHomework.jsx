import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  DocumentPlusIcon, 
  CalendarIcon, 
  BookOpenIcon,
  UserGroupIcon,
  PaperClipIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const CreateHomework = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    classGrade: '',
    dueDate: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Create preview for supported file types
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formPayload = new FormData();
      if (file) {
        formPayload.append('file', file);
      }
      
      // Convert date string to ISO format
      const dueDate = new Date(formData.dueDate).toISOString();
      
      // Append individual fields
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('subject', formData.subject);
      formPayload.append('classGrade', formData.classGrade);
      formPayload.append('dueDate', dueDate);

             await axios.post('/api/homework', formPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      // Wait for 1.5 seconds to show success message before navigating
      setTimeout(() => {
        navigate('/teacher', { state: { message: 'Homework created successfully!' } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create homework');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <DocumentPlusIcon className="mx-auto h-12 w-12 text-sky-500" />
              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                Create New Homework
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Fill in the details below to create a new homework assignment
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center justify-center"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Homework created successfully! Redirecting...
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <div className="mt-1 relative">
                  <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter homework title"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="px-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter homework description"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <div className="mt-1 relative">
                    <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Class Grade
                  </label>
                  <div className="mt-1 relative">
                    <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <select
                      name="classGrade"
                      required
                      value={formData.classGrade}
                      onChange={handleChange}
                      className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select Grade</option>
                      {['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade'].map((grade, index) => (
                        <option key={index + 1} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <div className="mt-1 relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    name="dueDate"
                    required
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Attachment
                </label>
                <div className="mt-1">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PaperClipIcon className="h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          {file ? file.name : "Click to upload a file"}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {preview && (
                    <div className="mt-2">
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-32 w-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Homework'
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateHomework; 