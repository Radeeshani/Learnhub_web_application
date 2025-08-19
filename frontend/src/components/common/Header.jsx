import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { CalendarIcon, ChevronDownIcon, AcademicCapIcon, BookOpenIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

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

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Calendar',
        href: '/calendar',
        icon: CalendarIcon,
        roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
      }
    ];

    if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
      baseItems.push(
        {
          name: 'Class Management',
          href: '/classes',
          icon: AcademicCapIcon,
          roles: ['ADMIN', 'TEACHER']
        },
        {
          name: 'Create Homework',
          href: '/homework/create',
          icon: BookOpenIcon,
          roles: ['TEACHER']
        }
      );
    }

    if (user?.role === 'STUDENT') {
      baseItems.push(
        {
          name: 'My Classes',
          href: '/classes/student',
          icon: UserGroupIcon,
          roles: ['STUDENT']
        }
      );
    }

    return baseItems.filter(item => item.roles.includes(user?.role));
  };

  const navigationItems = getNavigationItems();

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
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'text-white bg-purple-600 hover:bg-purple-700'
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Navigation Dropdown */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Menu
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          navigate(item.href);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                          isActive
                            ? 'text-white bg-purple-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
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