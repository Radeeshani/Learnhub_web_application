import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  BellIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  StarIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/homework/notifications/user');
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/homework/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, readStatus: 'READ' } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_HOMEWORK': return BookOpenIcon;
      case 'DUE_SOON': return ClockIcon;
      case 'OVERDUE': return ExclamationTriangleIcon;
      case 'GRADED': return CheckCircleIcon;
      case 'SUBMISSION': return StarIcon;
      default: return InformationCircleIcon;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'NEW_HOMEWORK': return 'from-blue-500 to-blue-600';
      case 'DUE_SOON': return 'from-orange-500 to-yellow-500';
      case 'OVERDUE': return 'from-red-500 to-pink-500';
      case 'GRADED': return 'from-green-500 to-teal-500';
      case 'SUBMISSION': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return notification.readStatus === 'UNREAD';
    if (filter === 'read') return notification.readStatus === 'READ';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-teal-600 font-semibold">Loading notifications...</p>
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
            onClick={fetchNotifications}
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
              className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <StarIcon className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-4"
            >
              Notifications
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-700 mb-8"
            >
              Stay updated with your learning activities and important updates
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center space-x-2"
        >
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: notifications.filter(n => n.readStatus === 'UNREAD').length },
            { id: 'read', label: 'Read', count: notifications.filter(n => n.readStatus === 'READ').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <StarIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Notifications</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You're all caught up! No notifications yet." 
                : filter === 'unread' 
                  ? "No unread notifications." 
                  : "No read notifications."
              }
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            {filteredNotifications.map((notification, index) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`bg-white rounded-2xl shadow-lg border-l-4 border-l-${notification.readStatus === 'READ' ? 'gray' : 'purple'}-500 p-6 hover:shadow-xl transition-all duration-300 ${
                    notification.readStatus === 'READ' ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getNotificationColor(notification.type)} flex items-center justify-center text-white shadow-lg`}>
                          <NotificationIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${notification.readStatus === 'READ' ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{formatDate(notification.createdAt)}</span>
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPriorityColor(notification.priority)} text-white`}>
                              {notification.priority}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                              {notification.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className={`text-gray-600 mb-4 ${notification.readStatus === 'READ' ? 'line-through' : ''}`}>
                        {notification.message}
                      </p>
                      
                      {notification.homeworkTitle && (
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                          <p className="text-sm text-purple-700 font-medium">
                            Related to: {notification.homeworkTitle}
                          </p>
                        </div>
                      )}
                      
                      {notification.actionText && notification.actionUrl && (
                        <div className="mt-4">
                          <button
                            onClick={() => window.open(notification.actionUrl, '_blank')}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            {notification.actionText}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {notification.readStatus === 'UNREAD' && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
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

export default Notifications;
