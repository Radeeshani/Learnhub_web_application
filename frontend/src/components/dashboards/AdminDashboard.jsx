import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user.firstName}!</h1>
          <p className="text-gray-600">System Administrator</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
            <div className="space-y-4">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Add New User
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Manage Teachers
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Manage Students
              </button>
            </div>
          </div>

          {/* System Statistics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Total Users</p>
                  <p className="text-sm text-gray-600">Active accounts</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">250</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Teachers</p>
                  <p className="text-sm text-gray-600">Currently employed</p>
                </div>
                <span className="text-2xl font-bold text-green-600">25</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Students</p>
                  <p className="text-sm text-gray-600">Currently enrolled</p>
                </div>
                <span className="text-2xl font-bold text-purple-600">200</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">Just now</p>
                <p className="text-gray-900">New teacher account created</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600">2 hours ago</p>
                <p className="text-gray-900">System backup completed</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <p className="text-sm text-gray-600">Yesterday</p>
                <p className="text-gray-900">Server maintenance performed</p>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-3">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center space-x-2 bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors">
                <span className="font-medium">System Configuration</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors">
                <span className="font-medium">Email Settings</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors">
                <span className="font-medium">Backup & Restore</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 