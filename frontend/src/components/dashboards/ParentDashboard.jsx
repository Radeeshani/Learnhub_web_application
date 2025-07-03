import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  XCircleIcon
} from '@heroicons/react/24/outline';
import Header from '../common/Header';

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
        `http://localhost:8080/api/users/${user.parentOfStudentId}`,
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
        `http://localhost:8080/api/homework/parent?subject=${selectedSubject}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 relative"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1974&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 to-indigo-900/90"></div>
          <div className="relative px-6 py-12">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-white font-sans">
                Welcome, {user?.firstName}!
              </h1>
              <p className="mt-2 text-sky-100 text-lg">
                Monitor your child's academic progress and upcoming assignments.
              </p>
              {studentInfo && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-sky-100/20 backdrop-blur-sm rounded-lg p-4 text-white">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm">Student Name</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {studentInfo.firstName} {studentInfo.lastName}
                    </p>
                  </div>
                  <div className="bg-sky-100/20 backdrop-blur-sm rounded-lg p-4 text-white">
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm">Grade</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">{studentInfo.classGrade}</p>
                  </div>
                </div>
              )}
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
              <p className="mt-1 text-sm text-gray-500">Your child is all caught up!</p>
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
                          {homework.completed ? (
                            <span className="inline-flex items-center text-green-600">
                              <CheckCircleIcon className="h-5 w-5 mr-1" />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-600">
                              <XCircleIcon className="h-5 w-5 mr-1" />
                              Pending
                            </span>
                          )}
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
                        </div>
                      </div>
                      {homework.fileUrl && (
                        <a
                          href={`http://localhost:8080${homework.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
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