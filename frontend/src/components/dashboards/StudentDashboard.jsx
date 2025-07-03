import React from 'react';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user.firstName}!</h1>
          <p className="text-gray-600">Class: {user.classGrade}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Homework & Assignments */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Homework & Assignments</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <p className="text-sm text-gray-600">Due Today</p>
                <p className="text-gray-900">Math Problems - Chapter 5</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="text-sm text-gray-600">Due Tomorrow</p>
                <p className="text-gray-900">Science Project</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600">Due Next Week</p>
                <p className="text-gray-900">English Essay</p>
              </div>
            </div>
          </div>

          {/* Recent Grades */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Grades</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Mathematics Quiz</p>
                  <p className="text-sm text-gray-600">Chapter 4</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">95%</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Science Test</p>
                  <p className="text-sm text-gray-600">Unit 3</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">88%</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">English Assignment</p>
                  <p className="text-sm text-gray-600">Essay</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">92%</span>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Mathematics</p>
                  <p className="text-sm text-gray-600">Mr. Johnson</p>
                </div>
                <p className="text-sm text-gray-600">9:00 AM</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Science</p>
                  <p className="text-sm text-gray-600">Mrs. Smith</p>
                </div>
                <p className="text-sm text-gray-600">10:30 AM</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">English</p>
                  <p className="text-sm text-gray-600">Ms. Davis</p>
                </div>
                <p className="text-sm text-gray-600">1:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 