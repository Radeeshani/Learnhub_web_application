import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCheck, FiX, FiAlertCircle, FiCalendar, FiBookOpen, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ReminderPanel = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && token) {
      fetchReminders();
    }
  }, [isOpen, token]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/homework/reminders/user/unread', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove duplicates by homework ID and sort by priority
      const uniqueReminders = response.data.filter((reminder, index, self) => 
        index === self.findIndex(r => r.homeworkId === reminder.homeworkId)
      );
      
      // Sort by priority: URGENT > HIGH > NORMAL > LOW
      const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'NORMAL': 2, 'LOW': 3 };
      uniqueReminders.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 3;
        const priorityB = priorityOrder[b.priority] || 3;
        return priorityA - priorityB;
      });
      
      setReminders(uniqueReminders);
    } catch (err) {
      setError('Failed to load reminders');
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (reminderId) => {
    try {
      await axios.put(`/api/homework/reminders/${reminderId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove the reminder from the list
      setReminders(prev => prev.filter(r => r.id !== reminderId));
    } catch (err) {
      console.error('Error marking reminder as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/homework/reminders/mark-all-read', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setReminders([]);
    } catch (err) {
      console.error('Error marking all reminders as read:', err);
    }
  };

  const getReminderIcon = (type, priority) => {
    if (priority === 'URGENT') {
      return <FiAlertCircle className="h-6 w-6 text-red-500" />;
    } else if (priority === 'HIGH') {
      return <FiClock className="h-6 w-6 text-orange-500" />;
    } else if (type === 'OVERDUE') {
      return <FiAlertCircle className="h-6 w-6 text-red-500" />;
    } else {
      return <FiClock className="h-6 w-6 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReminderBackground = (priority, type) => {
    if (priority === 'URGENT' || type === 'OVERDUE') {
      return 'bg-red-50 border-l-4 border-red-400';
    } else if (priority === 'HIGH') {
      return 'bg-orange-50 border-l-4 border-orange-400';
    } else if (priority === 'NORMAL') {
      return 'bg-blue-50 border-l-4 border-blue-400';
    } else {
      return 'bg-gray-50 border-l-4 border-gray-400';
    }
  };

  const formatTimeAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FiClock className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Smart Reminders</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <FiAlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <FiCheck className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-500">All caught up! No pending reminders.</p>
            </div>
          ) : (
            <>
              {/* Mark All as Read Button */}
              <div className="mb-6">
                <button
                  onClick={markAllAsRead}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Mark All as Read
                </button>
              </div>

              {/* Reminders List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {reminders.map((reminder) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-4 rounded-lg ${getReminderBackground(reminder.priority, reminder.type)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getReminderIcon(reminder.type, reminder.priority)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                              {reminder.title}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(reminder.priority)}`}>
                              {reminder.priority === 'URGENT' ? 'Critical' : 
                               reminder.priority === 'HIGH' ? 'Important' : 
                               reminder.priority === 'NORMAL' ? 'Normal' : 'Low Priority'}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                            {reminder.message}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                <FiBookOpen className="h-3 w-3 mr-1" />
                                <span>{reminder.homeworkTitle || 'Homework'}</span>
                              </div>
                              <div className="flex items-center">
                                <FiCalendar className="h-3 w-3 mr-1" />
                                <span>{formatTimeAgo(reminder.createdAt)}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => markAsRead(reminder.id)}
                              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              Mark as Read
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReminderPanel;
