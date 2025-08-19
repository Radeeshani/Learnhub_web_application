import React from 'react';
import { 
  XMarkIcon, 
  CheckIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';

const NotificationPanel = () => {
  const { 
    notifications, 
    showNotificationPanel, 
    setShowNotificationPanel, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAllNotifications 
  } = useNotifications();

  if (!showNotificationPanel) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'DUE_SOON':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      case 'OVERDUE':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'GRADED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'NEW_HOMEWORK':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'DUE_SOON':
        return 'border-l-orange-500 bg-orange-50';
      case 'OVERDUE':
        return 'border-l-red-500 bg-red-50';
      case 'GRADED':
        return 'border-l-green-500 bg-green-50';
      case 'NEW_HOMEWORK':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => setShowNotificationPanel(false)}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <button
              onClick={() => setShowNotificationPanel(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
              <button
                onClick={clearAllNotifications}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <BellIcon className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`mb-3 p-3 rounded-lg border-l-4 transition-all duration-200 ${
                      getNotificationColor(notification.type)
                    } ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        
                        {notification.message && (
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        )}
                        
                        {notification.homeworkTitle && (
                          <p className="text-xs text-gray-500 mt-1">
                            📚 {notification.homeworkTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end mt-2 space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        >
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Mark read
                        </button>
                      )}
                      
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
