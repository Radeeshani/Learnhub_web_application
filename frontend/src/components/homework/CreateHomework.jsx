import React, { useState, useEffect } from 'react';
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
    grade: '',
    classGrade: '',
    classId: '',
    dueDate: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState('');
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [fetchingClasses, setFetchingClasses] = useState(true);
  const navigate = useNavigate();
  const { token, user } = useAuth();

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

  // Fetch teacher's assigned classes
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!token || user?.role !== 'TEACHER') return;
      
      try {
        setFetchingClasses(true);
        const response = await axios.get(`/api/homework/classes/teacher/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Teacher classes fetched:', response.data);
        setTeacherClasses(response.data);
      } catch (error) {
        console.error('Error fetching teacher classes:', error);
        setError('Failed to fetch your assigned classes. Please try again.');
      } finally {
        setFetchingClasses(false);
      }
    };

    fetchTeacherClasses();
  }, [token, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'classId') {
      // When class is selected, also set the classGrade and grade
      const selectedClass = teacherClasses.find(cls => cls.id.toString() === value);
      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          classGrade: selectedClass.gradeLevel || '',
          grade: selectedClass.gradeLevel ? parseInt(selectedClass.gradeLevel.replace(/\D/g, '')) : ''
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

    // Validate required fields
    if (!formData.classId) {
      setError('Please select a class for this homework assignment');
      setLoading(false);
      return;
    }
    
    if (!formData.grade) {
      setError('Please select a grade for this homework assignment');
      setLoading(false);
      return;
    }

    try {
      const formPayload = new FormData();
      if (file) {
        formPayload.append('file', file);
      }
      
      // Convert date string to ISO format
      const dueDate = new Date(formData.dueDate).toISOString();
      
      // Debug: Log the form data
      console.log('Form data being submitted:', {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        grade: formData.grade,
        classGrade: formData.classGrade,
        classId: formData.classId,
        dueDate: dueDate
      });
      
      // Append individual fields
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('subject', formData.subject);
      formPayload.append('grade', parseInt(formData.grade, 10));
      formPayload.append('classGrade', formData.classGrade);
      formPayload.append('classId', formData.classId);
      formPayload.append('dueDate', dueDate);

             await axios.post('/api/homework', formPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        grade: '',
        classGrade: '',
        classId: '',
        dueDate: ''
      });
      setFile(null);
      setPreview('');
      
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-16 left-16 w-40 h-40 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full opacity-15 blur-xl"
        />
        
        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-32 right-24 w-32 h-32 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full opacity-15 blur-xl"
        />
        
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-40 left-1/3 w-28 h-28 bg-gradient-to-br from-teal-200 to-emerald-300 rounded-full opacity-15 blur-xl"
        />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="px-6 py-8">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-2xl mb-4"
              >
                <DocumentPlusIcon className="h-10 w-10 text-white" />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
              >
                Create New Homework
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-2 text-sm text-gray-600"
              >
                Fill in the details below to create a new homework assignment
              </motion.p>
            </motion.div>

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

            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <div className="mt-1 relative group">
                  <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter homework title"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="px-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter homework description"
                  />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-3"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <div className="mt-1 relative group">
                    <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 group-focus-within:text-emerald-500 transition-colors" />
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white/50 backdrop-blur-sm transition-all duration-200"
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Grade
                  </label>
                  <div className="mt-1 relative group">
                    <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 group-focus-within:text-emerald-500 transition-colors" />
                    <select
                      name="grade"
                      required
                      value={formData.grade}
                      onChange={handleChange}
                      className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white/50 backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select Grade</option>
                      {[1, 2, 3, 4, 5, 6].map((grade) => (
                        <option key={grade} value={grade}>
                          Grade {grade}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Class
                  </label>
                  <div className="mt-1 relative group">
                    <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 group-focus-within:text-emerald-500 transition-colors" />
                    <select
                      name="classId"
                      required
                      value={formData.classId}
                      onChange={handleChange}
                      className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white/50 backdrop-blur-sm transition-all duration-200"
                      disabled={fetchingClasses}
                    >
                      <option value="">{fetchingClasses ? 'Loading classes...' : 'Select Class'}</option>
                      {teacherClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.className} - Grade {cls.gradeLevel} ({cls.subject})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  {teacherClasses.length === 0 && !fetchingClasses && (
                    <p className="mt-1 text-sm text-red-600">
                      No classes assigned. Please contact an administrator to get assigned to classes.
                    </p>
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <div className="mt-1 relative group">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="datetime-local"
                    name="dueDate"
                    required
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Attachment
                </label>
                <div className="mt-1">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-emerald-300 border-dashed rounded-xl cursor-pointer hover:bg-emerald-50 transition-all duration-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PaperClipIcon className="h-10 w-10 text-emerald-500" />
                        <p className="mt-2 text-sm text-emerald-600 font-medium">
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
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-2"
                    >
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-32 w-auto rounded-lg shadow-lg"
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Homework...
                  </div>
                ) : (
                  'Create Homework'
                )}
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateHomework; 