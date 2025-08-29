import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  BellIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      console.log('Fetching reminders...');
      console.log('User:', user);
      console.log('Auth header:', axios.defaults.headers.common['Authorization']);
      
      const response = await axios.get('/api/reminders/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Reminders response:', response.data);
      setReminders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      console.error('Error details:', err.response?.data);
      setError(`Failed to fetch reminders: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (reminderId) => {
    try {
      await axios.put(`/api/reminders/${reminderId}/read`);
      // Update local state
      setReminders(prev => prev.map(r => 
        r.id === reminderId ? { ...r, isRead: true } : r
      ));
    } catch (err) {
      console.error('Error marking reminder as read:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'from-red-500 to-pink-500';
      case 'MEDIUM': return 'from-orange-500 to-yellow-500';
      case 'LOW': return 'from-green-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return ExclamationTriangleIcon;
      case 'MEDIUM': return ClockIcon;
      case 'LOW': return CheckCircleIcon;
      default: return BellIcon;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getReminderTime = (reminder) => {
    // For pending reminders, use reminderTime, for notifications use createdAt
    return reminder.reminderTime || reminder.createdAt;
  };

  const getReminderType = (reminder) => {
    // Handle both reminder types and notification types
    if (reminder.type === 'NOTIFICATION') {
      return 'REMINDER';
    }
    return reminder.type || 'REMINDER';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-teal-600 font-semibold">Loading reminders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={fetchReminders}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-coral-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-coral-600 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-coral-500 opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(20,184,166,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.1),transparent_50%)]"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-teal-400 to-coral-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-r from-purple-400 to-yellow-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-r from-coral-400 to-teal-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-r from-teal-500 to-coral-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <BellIcon className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-coral-600 bg-clip-text text-transparent mb-4"
            >
              My Reminders
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-700 mb-8"
            >
              Stay on top of your important tasks and deadlines
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Reminders List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {reminders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <BellIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Reminders</h3>
            <p className="text-gray-500">You're all caught up! No pending reminders.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            {reminders.map((reminder, index) => {
              const PriorityIcon = getPriorityIcon(reminder.priority);
              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`bg-white rounded-2xl shadow-lg border-l-4 border-l-${reminder.isRead ? 'gray' : 'teal'}-500 p-6 hover:shadow-xl transition-all duration-300 ${
                    reminder.isRead ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getPriorityColor(reminder.priority)} flex items-center justify-center text-white shadow-lg`}>
                          <PriorityIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${reminder.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                            {reminder.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{formatDate(getReminderTime(reminder))}</span>
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPriorityColor(reminder.priority)} text-white`}>
                              {reminder.priority}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                              {getReminderType(reminder)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className={`text-gray-600 mb-4 ${reminder.isRead ? 'line-through' : ''}`}>
                        {reminder.message}
                      </p>
                      
                      {reminder.homeworkTitle && (
                        <div className="bg-gradient-to-r from-teal-50 to-coral-50 rounded-xl p-3 border border-teal-100">
                          <p className="text-sm text-teal-700 font-medium">
                            Related to: {reminder.homeworkTitle}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {!reminder.isRead && (
                      <button
                        onClick={() => markAsRead(reminder.id)}
                        className="ml-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-coral-500 text-white text-sm font-medium rounded-xl hover:from-teal-600 hover:to-coral-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Reminders;
