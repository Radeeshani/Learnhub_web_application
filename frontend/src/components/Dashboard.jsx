import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { FiUser } from 'react-icons/fi';

const Dashboard = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-500';
      case 'TEACHER': return 'bg-green-500';
      case 'STUDENT': return 'bg-blue-500';
      case 'PARENT': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return '⚙️';
      case 'TEACHER': return '👨‍🏫';
      case 'STUDENT': return '🎓';
      case 'PARENT': return '👨‍👩‍👧‍👦';
      default: return '👤';
    }
  };

  const quickActions = {
    ADMIN: [
      { title: 'Manage Users', icon: UsersIcon, description: 'Add, edit, or remove users', color: 'bg-purple-500' },
      { title: 'System Settings', icon: Cog6ToothIcon, description: 'Configure system preferences', color: 'bg-gray-500' },
      { title: 'Analytics', icon: ChartBarIcon, description: 'View system analytics', color: 'bg-indigo-500' },
      { title: 'Announcements', icon: BellIcon, description: 'Manage announcements', color: 'bg-yellow-500' }
    ],
    TEACHER: [
      { title: 'Create Homework', icon: ClipboardDocumentListIcon, description: 'Assign new homework tasks', color: 'bg-green-500' },
      { title: 'View Submissions', icon: BookOpenIcon, description: 'Check student submissions', color: 'bg-blue-500' },
      { title: 'My Classes', icon: UsersIcon, description: 'Manage your classes', color: 'bg-purple-500' },
      { title: 'Announcements', icon: BellIcon, description: 'Post announcements', color: 'bg-yellow-500' }
    ],
    STUDENT: [
      { title: 'My Homework', icon: BookOpenIcon, description: 'View assigned homework', color: 'bg-blue-500' },
              { title: 'Submit Work', icon: ClipboardDocumentListIcon, description: 'Submit completed homeworks', color: 'bg-green-500' },
      { title: 'Announcements', icon: BellIcon, description: 'View announcements', color: 'bg-yellow-500' },
      { title: 'My Progress', icon: ChartBarIcon, description: 'Track your progress', color: 'bg-indigo-500' }
    ],
    PARENT: [
      { title: "Child's Homework", icon: BookOpenIcon, description: 'View assigned homework', color: 'bg-blue-500' },
      { title: "Child's Progress", icon: ChartBarIcon, description: 'Track progress', color: 'bg-indigo-500' },
      { title: 'Announcements', icon: BellIcon, description: 'View school announcements', color: 'bg-yellow-500' },
      { title: 'Contact Teachers', icon: UsersIcon, description: 'Communicate with teachers', color: 'bg-purple-500' }
    ]
  };

  const userActions = quickActions[user?.role] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                  LearnHub
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className={`${getRoleColor(user?.role)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                {getRoleIcon(user?.role)} {user?.role}
              </div>
              
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-xl text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 mr-2"
              >
                <FiUser className="h-4 w-4 mr-1" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-xl text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 font-poppins">
                  Welcome back, {user?.firstName}! 👋
                </h2>
                <p className="mt-2 text-gray-600">
                  {hasRole('ADMIN') && 'Manage LearnHub platform'}
                  {hasRole('TEACHER') && 'Ready to inspire and educate your students'}
                  {hasRole('STUDENT') && 'Time to learn and grow'}
                  {hasRole('PARENT') && "Keep track of your child's educational journey"}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="text-6xl">
                  {getRoleIcon(user?.role)}
                </div>
              </div>
            </div>

            {/* User Info Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {user?.classGrade && (
                <div className="bg-sky-50 rounded-xl p-4">
                  <h4 className="font-medium text-sky-900">Class/Grade</h4>
                  <p className="text-sky-700">{user.classGrade}</p>
                </div>
              )}
              {user?.subjectTaught && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-medium text-green-900">Subject</h4>
                  <p className="text-green-700">{user.subjectTaught}</p>
                </div>
              )}
              {user?.studentId && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900">Student ID</h4>
                  <p className="text-blue-700">{user.studentId}</p>
                </div>
              )}
              {user?.parentOfStudentId && (
                <div className="bg-orange-50 rounded-xl p-4">
                  <h4 className="font-medium text-orange-900">Child's Student ID</h4>
                  <p className="text-orange-700">{user.parentOfStudentId}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-xl"
              >
                <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h4>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">Recent Activity</h3>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center py-12">
              <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h4>
              <p className="text-gray-600">
                {hasRole('ADMIN') && 'System activity will appear here'}
                {hasRole('TEACHER') && 'Student submissions and homework activity will appear here'}
                {hasRole('STUDENT') && 'Your homework activity and submissions will appear here'}
                {hasRole('PARENT') && "Your child's homework activity will appear here"}
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard; 