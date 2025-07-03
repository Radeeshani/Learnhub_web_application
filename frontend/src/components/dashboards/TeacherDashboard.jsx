import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  DocumentPlusIcon,
  ClockIcon,
  BookOpenIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Header from '../common/Header';

const TeacherDashboard = () => {
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

  const [assignments] = useState([
    {
      id: 1,
      title: 'Quadratic Equations',
      class: 'Grade 8',
      dueDate: '2024-03-25',
      submitted: 18,
      total: 25
    },
    {
      id: 2,
      title: 'Linear Algebra',
      class: 'Grade 7',
      dueDate: '2024-03-23',
      submitted: 22,
      total: 28
    },
    {
      id: 3,
      title: 'Geometry Basics',
      class: 'Grade 6',
      dueDate: '2024-03-22',
      submitted: 27,
      total: 30
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      message: 'New homework submission from John Doe',
      time: '1 hour ago'
    },
    {
      id: 2,
      message: 'Parent meeting scheduled for tomorrow',
      time: '2 hours ago'
    },
    {
      id: 3,
      message: 'Grade 8 test results ready for review',
      time: '3 hours ago'
    }
  ]);

  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/homework/teacher', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setHomeworks(response.data);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Header />
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage your class assignments and track student progress
                </p>
              </div>
              <Link
                to="/create-homework"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                <DocumentPlusIcon className="h-5 w-5 mr-2" />
                Create Homework
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-sky-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Total Assignments
                </h3>
                <p className="text-2xl font-semibold text-sky-600">
                  {homeworks.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-indigo-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Pending Review
                </h3>
                <p className="text-2xl font-semibold text-indigo-600">
                  0
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-sky-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Class Grade
                </h3>
                <p className="text-2xl font-semibold text-sky-600">
                  {user?.classGrade || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-8 w-8 text-indigo-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Subject
                </h3>
                <p className="text-2xl font-semibold text-indigo-600">
                  {user?.subjectTaught || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Homeworks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recent Assignments
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : homeworks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No assignments created yet
              </div>
            ) : (
              <div className="space-y-6">
                {homeworks.map((homework) => (
                  <motion.div
                    key={homework.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-50 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {homework.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {homework.description}
                        </p>
                        <div className="mt-4 flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <BookOpenIcon className="h-4 w-4 mr-1" />
                            {homework.subject}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            Grade {homework.classGrade}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
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
                          className="flex items-center text-sm text-sky-600 hover:text-sky-700"
                        >
                          <DocumentTextIcon className="h-5 w-5 mr-1" />
                          {homework.fileName}
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 