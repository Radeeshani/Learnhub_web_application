import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { CalendarIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserRoleDisplay = () => {
    if (!user?.role) return '';
    
    switch (user.role) {
      case 'ADMIN':
        return '👑 Administrator';
      case 'TEACHER':
        return '👨‍🏫 Teacher';
      case 'STUDENT':
        return '👨‍🎓 Student';
      case 'PARENT':
        return '👨‍👩‍👧‍👦 Parent';
      default:
        return user.role;
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Homework Portal
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Calendar Button */}
            <button
              onClick={() => navigate('/calendar')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Calendar
            </button>
            
            {/* Notification Bell */}
            <NotificationBell />
            
            {/* User Info */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-500">
                {getUserRoleDisplay()}
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 