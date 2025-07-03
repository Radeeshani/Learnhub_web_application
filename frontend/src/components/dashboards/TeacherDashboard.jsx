import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiClock, FiCheckCircle, FiTrendingUp, FiBell, FiBook } from 'react-icons/fi';
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
            <img
              src="https://img.freepik.com/free-vector/teacher-standing-near-blackboard-holding-stick-isolated-flat-vector-illustration_74855-3725.jpg"
              alt="Teacher"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, Teacher!</h1>
          <p className="text-indigo-100">Manage your classes and track student progress</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg"
            >
              <div className="flex items-center">
                <FiUsers className="h-8 w-8 mr-4" />
                <div>
                  <p className="text-indigo-100">Total Students</p>
                  <h3 className="text-2xl font-bold">83</h3>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg"
            >
              <div className="flex items-center">
                <FiBook className="h-8 w-8 mr-4" />
                <div>
                  <p className="text-indigo-100">Classes</p>
                  <h3 className="text-2xl font-bold">3</h3>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg"
            >
              <div className="flex items-center">
                <FiCheckCircle className="h-8 w-8 mr-4" />
                <div>
                  <p className="text-indigo-100">Avg. Attendance</p>
                  <h3 className="text-2xl font-bold">92%</h3>
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
                  <p className="text-indigo-100">Assignments</p>
                  <h3 className="text-2xl font-bold">12</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classes Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Today's Classes</h2>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium">View Schedule</button>
              </div>
              <div className="space-y-4">
                {classes.map((class_) => (
                  <motion.div
                    key={class_.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <FiClock className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900">{class_.name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{class_.time}</span>
                            <span className="mx-2">•</span>
                            <span>{class_.room}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiUsers className="mr-1" />
                          <span>{class_.students} students</span>
                        </div>
                        <div className="text-sm font-medium text-indigo-600">
                          {class_.attendance}% attendance
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Assignments Section */}
            <div className="bg-white rounded-3xl shadow-sm p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Active Assignments</h2>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium">Create New</button>
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
                        <p className="text-sm text-gray-500">{assignment.class}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Due: {assignment.dueDate}</div>
                        <div className="text-sm font-medium text-indigo-600">
                          {assignment.submitted}/{assignment.total} submitted
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>Submission Progress</span>
                        <span>{Math.round((assignment.submitted / assignment.total) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 rounded-full h-2 transition-all duration-300"
                          style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                        ></div>
                      </div>
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
            {/* Calendar Section */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                  <FiCalendar className="h-5 w-5" />
                </button>
              </div>
              {/* Calendar component would go here */}
              <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500">Calendar Component</p>
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

export default TeacherDashboard; 