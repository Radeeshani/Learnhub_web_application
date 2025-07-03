import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiCalendar, FiClock, FiAward, FiTrendingUp, FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Header from '../common/Header';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [assignments] = useState([
    {
      id: 1,
      subject: 'Mathematics',
      title: 'Quadratic Equations',
      dueDate: '2024-03-25',
      status: 'pending',
      progress: 0
    },
    {
      id: 2,
      subject: 'Science',
      title: 'Cell Biology',
      dueDate: '2024-03-23',
      status: 'in-progress',
      progress: 60
    },
    {
      id: 3,
      subject: 'English',
      title: 'Essay Writing',
      dueDate: '2024-03-22',
      status: 'completed',
      progress: 100
    }
  ]);

  const [upcomingClasses] = useState([
    {
      id: 1,
      subject: 'Mathematics',
      time: '09:00 AM',
      teacher: 'Mr. Johnson',
      room: 'Room 101'
    },
    {
      id: 2,
      subject: 'Science',
      time: '10:30 AM',
      teacher: 'Mrs. Smith',
      room: 'Lab 203'
    },
    {
      id: 3,
      subject: 'English',
      time: '01:00 PM',
      teacher: 'Ms. Davis',
      room: 'Room 105'
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      message: 'New assignment posted in Mathematics',
      time: '1 hour ago'
    },
    {
      id: 2,
      message: 'Your Science project has been graded',
      time: '2 hours ago'
    },
    {
      id: 3,
      message: 'Upcoming test in English next week',
      time: '3 hours ago'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
            <img
              src="https://img.freepik.com/free-vector/students-watching-webinar-computer-studying-online_74855-15522.jpg"
              alt="Student"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, Student!</h1>
          <p className="text-sky-100">Track your progress and stay on top of your assignments</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg"
            >
              <div className="flex items-center">
                <FiBook className="h-8 w-8 mr-4" />
                <div>
                  <p className="text-sky-100">Active Assignments</p>
                  <h3 className="text-2xl font-bold">5</h3>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg"
            >
              <div className="flex items-center">
                <FiTrendingUp className="h-8 w-8 mr-4" />
                <div>
                  <p className="text-sky-100">Average Grade</p>
                  <h3 className="text-2xl font-bold">85%</h3>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg"
            >
              <div className="flex items-center">
                <FiAward className="h-8 w-8 mr-4" />
                <div>
                  <p className="text-sky-100">Completed Tasks</p>
                  <h3 className="text-2xl font-bold">12</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignments Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Current Assignments</h2>
                <button className="text-sky-600 hover:text-sky-700 font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <motion.div
                    key={assignment.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-500">{assignment.subject}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>Progress</span>
                        <span>{assignment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-sky-500 rounded-full h-2 transition-all duration-300"
                          style={{ width: `${assignment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-2" />
                      Due: {assignment.dueDate}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Schedule Section */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Schedule</h2>
              <div className="space-y-4">
                {upcomingClasses.map((class_) => (
                  <motion.div
                    key={class_.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0 h-12 w-12 bg-sky-100 rounded-xl flex items-center justify-center">
                      <FiClock className="h-6 w-6 text-sky-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{class_.subject}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{class_.time}</span>
                        <span className="mx-2">•</span>
                        <span>{class_.room}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiBell className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 