import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiUsers, FiBookOpen, FiCalendar, FiAward, FiSettings, 
  FiMenu, FiX, FiChevronLeft, FiChevronRight, FiUser, FiLogOut,
  FiPlus, FiGrid, FiBell, FiStar, FiBook, FiFileText
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadReminders, setUnreadReminders] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showRemindersPopup, setShowRemindersPopup] = useState(false);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCounts = async () => {
    try {
      // Fetch unread reminders count
      const remindersResponse = await axios.get('/api/reminders/user/unread');
      setUnreadReminders(remindersResponse.data.length);
      
      // Fetch unread notifications count
      const notificationsResponse = await axios.get('/api/homework/notifications/user');
      const unreadNotificationsCount = notificationsResponse.data.filter(n => n.readStatus === 'UNREAD').length;
      setUnreadNotifications(unreadNotificationsCount);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await axios.get('/api/reminders/user');
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/homework/notifications/user');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markReminderAsRead = async (reminderId) => {
    try {
      await axios.put(`/api/reminders/${reminderId}/read`);
      setReminders(prev => prev.map(r => 
        r.id === reminderId ? { ...r, isRead: true } : r
      ));
      // Update unread count locally instead of fetching again
      setUnreadReminders(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking reminder as read:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/homework/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, readStatus: 'READ' } : n
      ));
      // Update unread count locally instead of fetching again
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleRemindersClick = () => {
    if (!showRemindersPopup) {
      fetchReminders();
    }
    setShowRemindersPopup(!showRemindersPopup);
    setShowNotificationsPopup(false); // Close other popup
  };

  const handleNotificationsClick = () => {
    if (!showNotificationsPopup) {
      fetchNotifications();
    }
    setShowNotificationsPopup(!showNotificationsPopup);
    setShowRemindersPopup(false); // Close other popup
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', icon: FiHome, path: `/${user?.role?.toLowerCase()}`, color: 'teal' },
      { name: 'Calendar', icon: FiCalendar, path: '/calendar', color: 'purple' },
    ];

    if (user?.role === 'ADMIN') {
      baseItems.splice(1, 0, { name: 'Users', icon: FiUsers, path: '/admin/users', color: 'purple' });
      baseItems.splice(2, 0, { name: 'Classes', icon: FiGrid, path: '/admin/classes', color: 'coral' });
    }

    if (user?.role === 'TEACHER') {
      baseItems.splice(2, 0, { name: 'Classes', icon: FiGrid, path: '/classes', color: 'coral' });
      baseItems.splice(3, 0, { name: 'View Homeworks', icon: FiBookOpen, path: '/homework/view', color: 'blue' });
      baseItems.splice(4, 0, { name: 'Library', icon: FiBook, path: '/library', color: 'purple' });
      baseItems.splice(5, 0, { name: 'Create Homework', icon: FiPlus, path: '/homework/create', color: 'yellow' });
      baseItems.splice(6, 0, { name: 'Reports', icon: FiFileText, path: '/reports', color: 'indigo' });
    }

    if (user?.role === 'STUDENT') {
      baseItems.splice(2, 0, { name: 'Classes', icon: FiGrid, path: '/classes/student', color: 'coral' });
      baseItems.splice(3, 0, { name: 'Library', icon: FiBook, path: '/library', color: 'purple' });
      baseItems.splice(4, 0, { name: 'Submit Homework', icon: FiPlus, path: '/submit-homework', color: 'yellow' });
      baseItems.splice(5, 0, { name: 'Gamification', icon: FiStar, path: '/gamification', color: 'yellow' });
      baseItems.splice(6, 0, { name: 'Reports', icon: FiFileText, path: '/reports/student', color: 'indigo' });
    }

    if (user?.role === 'PARENT') {
      baseItems.splice(2, 0, { name: 'Gamification', icon: FiStar, path: '/gamification', color: 'yellow' });
    }

    return baseItems;
  };

  const getColorClasses = (color) => {
    const colorMap = {
      teal: 'from-teal-500 to-teal-600',
      coral: 'from-coral-500 to-coral-600',
      purple: 'from-purple-500 to-purple-600',
      yellow: 'from-yellow-500 to-yellow-600',
      blue: 'from-blue-500 to-blue-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };
    return colorMap[color] || 'from-teal-500 to-teal-600';
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const mobileVariants = {
    open: { x: 0 },
    closed: { x: -280 }
  };

  const NavigationItem = ({ item }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`sidebar-item group ${isActive(item.path) ? 'active' : ''}`}
      onClick={() => navigate(item.path)}
    >
      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${getColorClasses(item.color)} 
                      flex items-center justify-center text-white shadow-lg mr-3 sidebar-icon`}>
        <item.icon className="w-5 h-5" />
      </div>
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-semibold"
        >
          {item.name}
        </motion.span>
      )}
    </motion.div>
  );

  const SidebarContent = () => (
    <div className="sidebar-container bg-white">
      {/* Logo Section */}
      <div className="sidebar-header p-6 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-center">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-coral-500 rounded-3xl flex items-center justify-center shadow-lg">
                <FiBookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-coral-500 bg-clip-text text-transparent">
                  LearnHub
                </h1>
                <p className="text-xs text-gray-500">Creative Learning</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-12 h-12 bg-gradient-to-r from-teal-500 to-coral-500 rounded-3xl flex items-center justify-center shadow-lg"
            >
              <FiBookOpen className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation Items - Scrollable Area */}
      <div className="sidebar-navigation px-4 py-6 space-y-2 bg-white sidebar-scrollable">
        {getNavigationItems().map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavigationItem item={item} />
          </motion.div>
        ))}
        
        {/* Reminders and Notifications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="sidebar-item group relative" onClick={handleRemindersClick}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 
                            flex items-center justify-center text-white shadow-lg mr-3 sidebar-icon">
              <FiBell className="w-5 h-5" />
            </div>
            {!isCollapsed && <span className="font-semibold">Reminders</span>}
            
            {/* Unread Count Badge */}
            {unreadReminders > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {unreadReminders > 9 ? '9+' : unreadReminders}
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="sidebar-item group relative" onClick={handleNotificationsClick}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 
                            flex items-center justify-center text-white shadow-lg mr-3 sidebar-icon">
              <FiStar className="w-5 h-5" />
            </div>
            {!isCollapsed && <span className="font-semibold">Notifications</span>}
            
            {/* Unread Count Badge */}
            {unreadNotifications > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="sidebar-footer p-4 border-t border-gray-100 space-y-2 bg-white">
        <div className="sidebar-item group" onClick={() => navigate('/profile')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 
                          flex items-center justify-center text-white shadow-lg mr-3 sidebar-icon">
            <FiUser className="w-5 h-5" />
          </div>
          {!isCollapsed && <span className="font-semibold">Profile</span>}
        </div>
        
        <div className="sidebar-item group" onClick={handleLogout}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 
                          flex items-center justify-center text-white shadow-lg mr-3 sidebar-icon">
            <FiLogOut className="w-5 h-5" />
          </div>
          {!isCollapsed && <span className="font-semibold">Logout</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        className={`hidden lg:flex flex-col bg-white shadow-2xl border-r border-gray-100 h-full relative z-10 sidebar-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{ minWidth: isCollapsed ? 80 : 280 }}
      >
        <SidebarContent />
        
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-20 w-8 h-8 bg-gradient-to-r from-teal-500 to-coral-500 
                     rounded-full flex items-center justify-center text-white shadow-lg 
                     hover:shadow-xl transition-all duration-300 z-20"
        >
          {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
        </button>
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            variants={mobileVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl"
          >
            <div className="relative h-full">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
              <SidebarContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`main-content-area ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-100 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="w-10 h-10 bg-gradient-to-r from-teal-500 to-coral-500 rounded-2xl flex items-center justify-center text-white shadow-lg"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                <FiBell className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-coral-500 rounded-full flex items-center justify-center text-white">
                <FiUser className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="content-scroll-area bg-gradient-to-br from-teal-50 via-white to-coral-50">
          <div className="page-content-wrapper">
            {children}
          </div>
        </div>
      </div>

      {/* Popup Components */}
      <AnimatePresence>
        {/* Reminders Popup */}
        {showRemindersPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowRemindersPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                      <FiBell className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Reminders</h3>
                      <p className="text-orange-100 text-sm">{reminders.length} total</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRemindersPopup(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {reminders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiBell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No reminders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reminders.slice(0, 5).map((reminder) => (
                      <div
                        key={reminder.id}
                        className={`p-4 rounded-2xl border-l-4 ${
                          reminder.isRead ? 'bg-gray-50 border-gray-300' : 'bg-orange-50 border-orange-400'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-semibold ${reminder.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                              {reminder.title}
                            </h4>
                            <p className={`text-sm mt-1 ${reminder.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                              {reminder.message}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-500">
                                {new Date(reminder.reminderTime).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                reminder.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                reminder.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {reminder.priority}
                              </span>
                            </div>
                          </div>
                          {!reminder.isRead && (
                            <button
                              onClick={() => markReminderAsRead(reminder.id)}
                              className="ml-3 px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {reminders.length > 5 && (
                      <div className="text-center pt-4">
                        <button
                          onClick={() => {
                            setShowRemindersPopup(false);
                            navigate('/reminders');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
                        >
                          View All Reminders
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Notifications Popup */}
        {showNotificationsPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowNotificationsPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                      <FiStar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Notifications</h3>
                      <p className="text-blue-100 text-sm">{notifications.length} total</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotificationsPopup(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiStar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-2xl border-l-4 ${
                          notification.readStatus === 'READ' ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-semibold ${notification.readStatus === 'READ' ? 'text-gray-600' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm mt-1 ${notification.readStatus === 'READ' ? 'text-gray-500' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                notification.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {notification.priority}
                              </span>
                            </div>
                          </div>
                          {notification.readStatus === 'UNREAD' && (
                            <button
                              onClick={() => markNotificationAsRead(notification.id)}
                              className="ml-3 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {notifications.length > 5 && (
                      <div className="text-center pt-4">
                        <button
                          onClick={() => {
                            setShowNotificationsPopup(false);
                            navigate('/notifications');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                        >
                          View All Notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;
