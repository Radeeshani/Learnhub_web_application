import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  DocumentPlusIcon,
  ClockIcon,
  BookOpenIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BellIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Header from '../common/Header';

const TeacherDashboard = () => {
  const location = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [classes] = useState([
    {
      id: 1,
      name: 'Mathematics - Grade 8',
      students: 25,
      time: '09:00 AM',
      room: 'Room 101',
      attendance: 92
    },
    {
      id: 2,
      name: 'Mathematics - Grade 7',
      students: 28,
      time: '10:30 AM',
      room: 'Room 102',
      attendance: 88
    },
    {
      id: 3,
      name: 'Mathematics - Grade 6',
      students: 30,
      time: '01:00 PM',
      room: 'Room 103',
      attendance: 95
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      message: 'New homework submission from John Doe',
      time: '1 hour ago',
      type: 'submission'
    },
    {
      id: 2,
      message: 'Parent meeting scheduled for tomorrow',
      time: '2 hours ago',
      type: 'meeting'
    },
    {
      id: 3,
      message: 'Grade 8 test results ready for review',
      time: '3 hours ago',
      type: 'grades'
    }
  ]);

  const [homeworks, setHomeworks] = useState([]);
  const [homeworksByGrade, setHomeworksByGrade] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowSuccessMessage(true);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/homework/teacher', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setHomeworks(response.data);
        
        // Group homeworks by grade
        const byGrade = response.data.reduce((acc, homework) => {
          const grade = homework.classGrade;
          if (!acc[grade]) {
            acc[grade] = [];
          }
          acc[grade].push(homework);
          return acc;
        }, {});
        setHomeworksByGrade(byGrade);
      } catch (err) {
        setError('Failed to fetch homeworks');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworks();
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // Calculate total students across all classes
  const totalStudents = classes.reduce((sum, cls) => sum + cls.students, 0);

  // Calculate average attendance
  const avgAttendance = Math.round(
    classes.reduce((sum, cls) => sum + cls.attendance, 0) / classes.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl text-base flex items-center justify-center shadow-md"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {successMessage}
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 relative"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 to-indigo-900/90"></div>
          <div className="relative px-6 py-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white font-sans">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="mt-2 text-sky-100 text-lg">
                  Your educational dashboard awaits. Let's make learning engaging!
                </p>
              </div>
              <Link
                to="/homework/create"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <DocumentPlusIcon className="h-5 w-5 mr-2" />
                Create Assignment
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Assignments by Grade */}
          {classes.map((cls) => {
            const gradeNumber = cls.name.split('Grade ')[1];
            const gradeHomeworks = homeworksByGrade[gradeNumber] || [];
            return (
              <motion.div
                key={cls.id}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-sky-100">
                    <DocumentTextIcon className="h-8 w-8 text-sky-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Grade {gradeNumber} Assignments</p>
                    <p className="text-2xl font-semibold text-sky-600">{gradeHomeworks.length}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Active Students */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100">
                <UserGroupIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Students</p>
                <p className="text-2xl font-semibold text-indigo-600">{totalStudents}</p>
              </div>
            </div>
          </motion.div>

          {/* Average Attendance */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Attendance</p>
                <p className="text-2xl font-semibold text-green-600">{avgAttendance}%</p>
              </div>
            </div>
          </motion.div>

          {/* Subject */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpenIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Subject</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {user?.subjectTaught || 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <AcademicCapIcon className="h-6 w-6 mr-2 text-sky-600" />
                  Today's Classes
                </h2>
                <div className="space-y-4">
                  {classes.map((cls, index) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {cls.time}
                            <span className="mx-2">•</span>
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {cls.room}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{cls.students} Students</p>
                          <p className="text-sm text-sky-600">{cls.attendance}% Attendance</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BellIcon className="h-6 w-6 mr-2 text-sky-600" />
                  Notifications
                </h2>
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-sky-600" />
                Recent Assignments
              </h2>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : homeworks.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new assignment.</p>
                  <div className="mt-6">
                    <Link
                      to="/create-homework"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                      <DocumentPlusIcon className="h-5 w-5 mr-2" />
                      New Assignment
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {homeworks.map((homework, index) => (
                    <motion.div
                      key={homework.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{homework.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">Due: {formatDate(homework.dueDate)}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-800">
                            Grade {homework.classGrade}
                          </span>
                          <button className="text-sky-600 hover:text-sky-800">
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 