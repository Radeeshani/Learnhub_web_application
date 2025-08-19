import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell = () => {
  const { unreadCount, toggleNotificationPanel } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={toggleNotificationPanel}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;
