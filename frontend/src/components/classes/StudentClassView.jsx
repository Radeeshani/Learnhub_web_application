import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, BookOpenIcon, UserGroupIcon, CalendarIcon, AcademicCapIcon, EyeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { FiBook, FiUsers, FiCalendar, FiUser, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ClassViewModal from './ClassViewModal';

const StudentClassView = () => {
  const { user, token, getDashboardRoute } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();
  
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  
  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [enrolledClasses, searchQuery]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      
      // Fetch enrolled classes for the logged-in student
      const enrolledResponse = await fetch(`/api/homework/classes/student/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (enrolledResponse.ok) {
        const enrolledData = await enrolledResponse.json();
        console.log('Enrolled classes data:', enrolledData);
        setEnrolledClasses(enrolledData);
        // Set filtered classes to enrolled classes by default
        setFilteredClasses(enrolledData);
      } else {
        console.error('Failed to fetch enrolled classes:', enrolledResponse.status, enrolledResponse.statusText);
        const errorData = await enrolledResponse.text();
        console.error('Error response:', errorData);
        showError('Failed to fetch enrolled classes. Please try again later.');
      }
      

    } catch (error) {
      showError('Error fetching classes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    // For students, we only show enrolled classes
    let classesToFilter = enrolledClasses;
    
    if (!searchQuery.trim()) {
      setFilteredClasses(classesToFilter);
      return;
    }
    
    const filtered = classesToFilter.filter(cls => 
      cls.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.gradeLevel?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClasses(filtered);
  };

  const openViewModal = async (cls) => {
    try {
              const response = await fetch(`/api/homework/classes/${cls.id}/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const classData = await response.json();
        setSelectedClass(classData);
        setShowViewModal(true);
      } else {
        showError('Failed to fetch class details');
      }
    } catch (error) {
      showError('Error fetching class details: ' + error.message);
    }
  };

  const isEnrolled = (classId) => {
    return enrolledClasses.some(cls => cls.id === classId);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-300/30 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 to-blue-50/30" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-2xl mb-6"
            >
              <FiBook className="h-12 w-12 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4"
            >
              Loading Your Classes
            </motion.h2>
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 to-blue-50/30" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg mb-6"
                >
                  <FiBook className="h-10 w-10 text-white" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4"
                >
                  My Classes
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-2 text-lg text-gray-600"
                >
                  View your enrolled classes and discover new ones
                </motion.p>
              </div>
              
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                onClick={() => navigate(getDashboardRoute())}
                className="group inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <FiArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-bold">Back to Dashboard</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Enrolled Classes Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-6"
          >
            <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mr-3">
                  <FiBook className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">
                  Enrolled Classes ({enrolledClasses.length})
                </h2>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-6 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="relative">
              <FiSearch className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your enrolled classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Classes Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-8"
          >
            {filteredClasses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-6">
                  <FiBook className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Found</h3>
                <p className="text-gray-600 mb-6">
                  {enrolledClasses.length === 0 
                    ? 'You are not enrolled in any classes yet.' 
                    : 'No enrolled classes match your search.'
                  }
                </p>
                {enrolledClasses.length === 0 && (
                  <p className="text-gray-500 mb-6">
                    Contact your teacher or administrator to get enrolled in classes.
                  </p>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Clear Search
                </button>
              </motion.div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold text-emerald-600">{filteredClasses.length}</span> enrolled classes
                  </p>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClasses.map((cls, index) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
                      onClick={() => openViewModal(cls)}
                    >
                      {/* Enrollment Badge */}
                      {isEnrolled(cls.id) && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                            ✅ Enrolled
                          </span>
                        </div>
                      )}

                      {/* Class Header */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                          {cls.className || cls.subject}
                        </h3>
                        <p className="text-sm text-emerald-600 font-semibold">
                          {cls.subject}
                        </p>
                        {cls.gradeLevel && (
                          <p className="text-xs text-gray-500 mt-1">
                            {cls.gradeLevel}
                          </p>
                        )}
                      </div>

                      {/* Class Description */}
                      {cls.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {cls.description}
                        </p>
                      )}

                      {/* Class Details */}
                      <div className="space-y-2 mb-4">
                        {cls.scheduleInfo && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FiCalendar className="h-4 w-4 mr-2 text-emerald-500" />
                            {cls.scheduleInfo}
                          </div>
                        )}
                        
                        {cls.roomNumber && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FiUsers className="h-4 w-4 mr-2 text-teal-500" />
                            Room {cls.roomNumber}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <FiUser className="h-4 w-4 mr-2 text-cyan-500" />
                          <span className="font-semibold mr-2">Teacher:</span>
                          {cls.teacherName || 'TBD'}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4">
                        <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center">
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

        </div>
      </div>

      {/* View Class Modal */}
      {showViewModal && selectedClass && (
        <ClassViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          classData={selectedClass}
        />
      )}
    </div>
  );
};

export default StudentClassView;
