import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpenIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  HeartIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ParentDashboard = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
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

  useEffect(() => {
    fetchStudentInfo();
    fetchHomeworks();
  }, [token, sortBy, sortOrder, selectedSubject]);

  const fetchStudentInfo = async () => {
    try {
             const response = await axios.get(
         `/api/users/${user.parentOfStudentId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setStudentInfo(response.data);
    } catch (err) {
      console.error('Error fetching student info:', err);
    }
  };

  const fetchHomeworks = async () => {
    try {
      setLoading(true);
             const response = await axios.get(
         `/api/homework/parent?subject=${selectedSubject}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setHomeworks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch homeworks');
      console.error('Error fetching homeworks:', err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50">
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
              <HeartIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome, {user?.firstName}! 💝
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Monitor your child's academic progress and support their learning journey
            </p>
            {studentInfo && (
              <div className="flex justify-center items-center space-x-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <UserIcon className="h-5 w-5 text-white/80" />
                    <span className="text-sm text-white/80 font-medium">Student Name</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {studentInfo.firstName} {studentInfo.lastName}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <AcademicCapIcon className="h-5 w-5 text-white/80" />
                    <span className="text-sm text-white/80 font-medium">Grade</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{studentInfo.classGrade}</p>
                </div>
              </div>
            )}
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

        {/* Homework List */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-coral-100 to-teal-100 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 text-coral-600" />
            </div>
            <h2 className="section-title text-coral-700">Your Child's Homework</h2>
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
                <StarIcon className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up! 🎉</h3>
              <p className="text-gray-600">Your child is all caught up with homework assignments!</p>
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
                          {homework.completed ? (
                            <span className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-2xl border border-green-300">
                              <CheckCircleIcon className="h-5 w-5 mr-2" />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-100 to-red-200 text-red-800 rounded-2xl border border-red-300">
                              <XCircleIcon className="h-5 w-5 mr-2" />
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-lg mb-4">{homework.description}</p>
                        
                        {/* Homework Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                        </div>
                      </div>
                      {homework.fileUrl && (
                        <a
                          href={`/api/v1/files/download/homework/${homework.fileUrl.split('/').pop()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <DocumentTextIcon className="h-5 w-5 mr-2" />
                          View Material
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ParentDashboard; 