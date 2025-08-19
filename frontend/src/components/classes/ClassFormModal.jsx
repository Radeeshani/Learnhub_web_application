import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ClassFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, title, submitText }) => {
  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border-0 w-[600px] shadow-2xl rounded-3xl bg-gradient-to-br from-white via-purple-50 to-pink-50 border-2 border-purple-200">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {title}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1 inline" />
                Back
              </button>
              <button
                onClick={onClose}
                className="text-purple-400 hover:text-purple-600 p-2 rounded-full hover:bg-purple-100 transition-all duration-300 transform hover:scale-110"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class Name *
                </label>
                <input
                  type="text"
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="e.g., Advanced Mathematics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Physical Education">Physical Education</option>
                  <option value="Art">Art</option>
                  <option value="Music">Music</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Foreign Language">Foreign Language</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Literature">Literature</option>
                  <option value="Biology">Biology</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                  <option value="Algebra">Algebra</option>
                  <option value="Geometry">Geometry</option>
                  <option value="Calculus">Calculus</option>
                  <option value="Economics">Economics</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Philosophy">Philosophy</option>
                  <option value="Other">Other</option>
                </select>
                
                {/* Custom Subject Input */}
                {formData.subject === 'Other' && (
                  <input
                    type="text"
                    name="customSubject"
                    placeholder="Enter custom subject name"
                    required
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    value={formData.subject === 'Other' ? formData.subject : ''}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Select Grade Level</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Students
                </label>
                <input
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  min="1"
                  max="50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="25"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Describe what this class covers..."
              />
            </div>

            {/* Schedule Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Schedule Info
                </label>
                <select
                  name="scheduleInfo"
                  value={formData.scheduleInfo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Select Schedule</option>
                  <option value="Monday, Wednesday, Friday 9:00 AM - 10:00 AM">Monday, Wednesday, Friday 9:00 AM - 10:00 AM</option>
                  <option value="Monday, Wednesday, Friday 10:00 AM - 11:00 AM">Monday, Wednesday, Friday 10:00 AM - 11:00 AM</option>
                  <option value="Monday, Wednesday, Friday 11:00 AM - 12:00 PM">Monday, Wednesday, Friday 11:00 AM - 12:00 PM</option>
                  <option value="Tuesday, Thursday 9:00 AM - 10:00 AM">Tuesday, Thursday 9:00 AM - 10:00 AM</option>
                  <option value="Tuesday, Thursday 10:00 AM - 11:00 AM">Tuesday, Thursday 10:00 AM - 11:00 AM</option>
                  <option value="Tuesday, Thursday 11:00 AM - 12:00 PM">Tuesday, Thursday 11:00 AM - 12:00 PM</option>
                  <option value="Tuesday, Thursday 2:00 PM - 3:00 PM">Tuesday, Thursday 2:00 PM - 3:00 PM</option>
                  <option value="Monday, Wednesday, Friday 2:00 PM - 3:00 PM">Monday, Wednesday, Friday 2:00 PM - 3:00 PM</option>
                  <option value="Daily 8:00 AM - 9:00 AM">Daily 8:00 AM - 9:00 AM</option>
                  <option value="Daily 1:00 PM - 2:00 PM">Daily 1:00 PM - 2:00 PM</option>
                  <option value="Custom Schedule">Custom Schedule</option>
                </select>
                
                {/* Custom Schedule Input */}
                {formData.scheduleInfo === 'Custom Schedule' && (
                  <input
                    type="text"
                    name="customSchedule"
                    placeholder="Enter custom schedule (e.g., Monday 3:00 PM, Wednesday 4:00 PM)"
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduleInfo: e.target.value }))}
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="e.g., Room 201"
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="e.g., 2024-2025"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Select Semester</option>
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Full Year">Full Year</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                {submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassFormModal;
