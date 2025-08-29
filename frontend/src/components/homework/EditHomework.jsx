import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiBook, 
  FiCalendar, 
  FiEdit3,
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiArrowLeft,
  FiUpload
} from 'react-icons/fi';

const EditHomework = () => {
  const { id } = useParams();
  const location = useLocation();
  const homework = location.state?.homework;
  const [formData, setFormData] = useState({
    title: homework?.title || '',
    description: homework?.description || '',
    subject: homework?.subject || '',
    grade: homework?.grade || '',
    classGrade: homework?.classGrade || '',
    classId: homework?.classId || '',
    dueDate: homework?.dueDate ? new Date(homework.dueDate).toISOString().slice(0, 16) : ''
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
        
        // If we have homework data but no classId, try to find the class by grade
        if (homework && !formData.classId && homework.classGrade) {
          const matchingClass = response.data.find(cls => cls.gradeLevel === homework.classGrade);
          if (matchingClass) {
            setFormData(prev => ({
              ...prev,
              classId: matchingClass.id,
              classGrade: matchingClass.gradeLevel || homework.classGrade,
              grade: matchingClass.gradeLevel ? parseInt(matchingClass.gradeLevel.replace(/\D/g, '')) : homework.grade
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching teacher classes:', error);
        setError('Failed to fetch your assigned classes. Please try again.');
      } finally {
        setFetchingClasses(false);
      }
    };

    fetchTeacherClasses();
  }, [token, user, homework]);

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

      await axios.put(`/api/homework/${id}`, formPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/homework/view', { state: { message: 'Homework updated successfully!' } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update homework');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full shadow-lg mb-6">
                  <FiEdit3 className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  Edit Homework
                </h1>
                <p className="text-lg text-gray-600">
                  Update the homework assignment details below
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/homework/view')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg flex items-center"
              >
                <FiArrowLeft className="h-5 w-5 mr-2" />
                Back to Homeworks
              </motion.button>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center justify-center"
              >
                <FiCheckCircle className="h-5 w-5 mr-2" />
                Homework updated successfully! Redirecting...
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <div className="relative">
                  <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter homework title"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Enter homework description"
                />
              </div>

              {/* Subject, Grade, and Class */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <div className="relative">
                    <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="pl-10 pr-10 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade
                  </label>
                  <div className="relative">
                    <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="grade"
                      required
                      value={formData.grade}
                      onChange={handleChange}
                      className="pl-10 pr-10 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
                    >
                      <option value="">Select Grade</option>
                      {[1, 2, 3, 4, 5, 6].map((grade) => (
                        <option key={grade} value={grade}>
                          Grade {grade}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>
                  <div className="relative">
                    <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="classId"
                      required
                      value={formData.classId}
                      onChange={handleChange}
                      className="pl-10 pr-10 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
                      disabled={fetchingClasses}
                    >
                      <option value="">{fetchingClasses ? 'Loading classes...' : 'Select Class'}</option>
                      {teacherClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.className} - Grade {cls.gradeLevel}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  {teacherClasses.length === 0 && !fetchingClasses && (
                    <p className="mt-2 text-sm text-red-600">
                      No classes assigned. Please contact an administrator to get assigned to classes.
                    </p>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    name="dueDate"
                    required
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment
                </label>
                <div className="mt-1">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUpload className="h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          {file ? file.name : homework?.fileName || "Click to upload a new file"}
                        </p>
                        {homework?.fileName && !file && (
                          <p className="mt-1 text-xs text-gray-400">
                            Current file: {homework.fileName}
                          </p>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Updating Homework...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FiEdit3 className="h-5 w-5 mr-2" />
                    Update Homework
                  </div>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EditHomework; 