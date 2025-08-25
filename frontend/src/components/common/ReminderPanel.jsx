import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCheck, FiX, FiAlertCircle, FiCalendar } from 'react-icons/fi';
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
      
      const response = await axios.get('http://localhost:8080/api/reminders/user/unread', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setReminders(response.data);
    } catch (err) {
      setError('Failed to load reminders');
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (reminderId) => {
    try {
      await axios.put(`http://localhost:8080/api/reminders/${reminderId}/read`, {}, {
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
      await axios.put('http://localhost:8080/api/reminders/mark-all-read', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setReminders([]);
    } catch (err) {
      console.error('Error marking all reminders as read:', err);
    }
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'DUE_SOON_24H':
        return <FiCalendar className="h-5 w-5 text-blue-500" />;
      case 'DUE_SOON_12H':
        return <FiClock className="h-5 w-5 text-orange-500" />;
      case 'DUE_SOON_6H':
        return <FiClock className="h-5 w-5 text-yellow-500" />;
      case 'DUE_SOON_1H':
        return <FiClock className="h-5 w-5 text-red-500" />;
      case 'OVERDUE':
        return <FiAlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getReminderColor = (type) => {
    switch (type) {
      case 'DUE_SOON_24H':
        return 'border-l-blue-500 bg-blue-50';
      case 'DUE_SOON_12H':
        return 'border-l-orange-500 bg-orange-50';
      case 'DUE_SOON_6H':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'DUE_SOON_1H':
        return 'border-l-red-500 bg-red-50';
      case 'OVERDUE':
        return 'border-l-red-600 bg-red-100';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getReminderPriority = (type) => {
    switch (type) {
      case 'DUE_SOON_1H':
      case 'OVERDUE':
        return 'High Priority';
      case 'DUE_SOON_6H':
        return 'Medium Priority';
      case 'DUE_SOON_12H':
      case 'DUE_SOON_24H':
        return 'Low Priority';
      default:
        return 'Normal Priority';
    }
  };

  const formatReminderTime = (reminderTime) => {
    const now = new Date();
    const reminderDate = new Date(reminderTime);
    const diffInHours = Math.floor((reminderDate - now) / (1000 * 60 * 60));
    
    if (diffInHours > 0) {
      return `in ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    } else if (diffInHours === 0) {
      const diffInMinutes = Math.floor((reminderDate - now) / (1000 * 60));
      return `in ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
    } else {
      return 'now';
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
            <h2 className="text-xl font-semibold text-gray-900">Homework Reminders</h2>
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
              <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <FiCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No pending reminders!</p>
              <p className="text-sm text-gray-500 mt-2">You're all caught up with your homework.</p>
            </div>
          ) : (
            <>
              {/* Mark All as Read Button */}
              <div className="mb-4">
                <button
                  onClick={markAllAsRead}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
                      transition={{ duration: 0.2 }}
                      className={`p-4 rounded-lg border-l-4 ${getReminderColor(reminder.reminderType)} shadow-sm`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getReminderIcon(reminder.reminderType)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {reminder.title}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatReminderTime(reminder.reminderTime)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                            {reminder.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                              {getReminderPriority(reminder.reminderType)}
                            </span>
                            
                            <button
                              onClick={() => markAsRead(reminder.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
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

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Reminders are automatically generated for homework due dates
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReminderPanel;
