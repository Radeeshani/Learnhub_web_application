import React from 'react';
import { XMarkIcon, UserGroupIcon, BookOpenIcon, MapPinIcon, CalendarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const ClassViewModal = ({ isOpen, onClose, classData }) => {
  if (!isOpen || !classData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border-0 w-[700px] shadow-2xl rounded-3xl bg-gradient-to-br from-white via-purple-50 to-pink-50 border-2 border-purple-200">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              📚 {classData.className || classData.subject}
            </h3>
            <button
              onClick={onClose}
              className="text-purple-400 hover:text-purple-600 p-2 rounded-full hover:bg-purple-100 transition-all duration-300 transform hover:scale-110"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Class Information */}
          <div className="space-y-6">
            {/* Basic Details */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-700 mb-4 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Class Information
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-semibold text-gray-600">Subject:</span>
                  <p className="text-gray-900 font-medium">{classData.subject}</p>
                </div>
                
                {classData.gradeLevel && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Grade Level:</span>
                    <p className="text-gray-900 font-medium">{classData.gradeLevel}</p>
                  </div>
                )}
                
                {classData.roomNumber && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Room:</span>
                    <p className="text-gray-900 font-medium">{classData.roomNumber}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-semibold text-gray-600">Max Students:</span>
                  <p className="text-gray-900 font-medium">{classData.maxStudents}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {classData.description && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Description</h4>
                <p className="text-gray-800 leading-relaxed">{classData.description}</p>
              </div>
            )}

            {/* Schedule Information */}
            {classData.scheduleInfo && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Schedule
                </h4>
                <p className="text-blue-800">{classData.scheduleInfo}</p>
              </div>
            )}

            {/* Academic Details */}
            {(classData.academicYear || classData.semester) && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                <h4 className="text-lg font-semibold text-green-700 mb-3">Academic Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  {classData.academicYear && (
                    <div>
                      <span className="text-sm font-semibold text-green-600">Academic Year:</span>
                      <p className="text-green-800 font-medium">{classData.academicYear}</p>
                    </div>
                  )}
                  
                  {classData.semester && (
                    <div>
                      <span className="text-sm font-semibold text-green-600">Semester:</span>
                      <p className="text-green-800 font-medium">{classData.semester}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Teacher Information */}
            {classData.teacherName && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-700 mb-3">Teacher</h4>
                <div className="space-y-2">
                  <p className="text-yellow-800 font-medium">{classData.teacherName}</p>
                  {classData.teacherEmail && (
                    <p className="text-yellow-700 text-sm">{classData.teacherEmail}</p>
                  )}
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
              <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Class Statistics
              </h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {classData.currentStudentCount || 0}
                  </div>
                  <div className="text-sm text-indigo-700 font-semibold">Current Students</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {classData.totalAssignments || 0}
                  </div>
                  <div className="text-sm text-purple-700 font-semibold">Total Assignments</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {classData.maxStudents - (classData.currentStudentCount || 0)}
                  </div>
                  <div className="text-sm text-pink-700 font-semibold">Available Spots</div>
                </div>
              </div>
            </div>

            {/* Recent Assignments */}
            {classData.recentAssignments && classData.recentAssignments.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Recent Assignments
                </h4>
                <div className="space-y-2">
                  {classData.recentAssignments.map((assignment, index) => (
                    <div key={index} className="text-gray-700 text-sm bg-gray-50 p-2 rounded-lg">
                      {assignment}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Status</h4>
              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  classData.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {classData.isActive ? '🟢 Active' : '🔴 Inactive'}
                </div>
                
                <div className="text-sm text-gray-600">
                  Created: {new Date(classData.createdAt).toLocaleDateString()}
                </div>
                
                {classData.updatedAt && (
                  <div className="text-sm text-gray-600">
                    Updated: {new Date(classData.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              ✨ Close ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassViewModal;
