import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, BookOpenIcon, UserGroupIcon, CalendarIcon, AcademicCapIcon, EyeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ClassViewModal from './ClassViewModal';

const StudentClassView = () => {
  const { user, token, getDashboardRoute } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();
  
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' or 'available'
  
  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [allClasses, searchQuery, activeTab]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      
      // Fetch enrolled classes
      const enrolledResponse = await fetch(`http://localhost:8080/api/homework/classes/student/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (enrolledResponse.ok) {
        const enrolledData = await enrolledResponse.json();
        setEnrolledClasses(enrolledData);
      }
      
      // Fetch all available classes
      const allClassesResponse = await fetch('http://localhost:8080/api/homework/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (allClassesResponse.ok) {
        const allClassesData = await allClassesResponse.json();
        setAllClasses(allClassesData);
      }
    } catch (error) {
      showError('Error fetching classes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let classesToFilter = activeTab === 'enrolled' ? enrolledClasses : allClasses;
    
    if (!searchQuery.trim()) {
      setFilteredClasses(classesToFilter);
      return;
    }
    
    const filtered = classesToFilter.filter(cls => 
      cls.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.gradeLevel?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClasses(filtered);
  };

  const openViewModal = async (cls) => {
    try {
      const response = await fetch(`http://localhost:8080/api/homework/classes/${cls.id}`, {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-purple-600 font-semibold">Loading Your Classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                🎓 My Classes
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                View your enrolled classes and discover new ones
              </p>
            </div>
            
            <button
              onClick={() => navigate(getDashboardRoute())}
              className="group inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-bold">Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white p-1 rounded-2xl shadow-lg border-2 border-purple-100">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'enrolled'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              📚 Enrolled Classes ({enrolledClasses.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'available'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              🔍 Available Classes ({allClasses.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-100">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'enrolled' ? 'enrolled' : 'available'} classes...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                isEnrolled(cls.id) 
                  ? 'border-green-300 hover:border-green-400' 
                  : 'border-transparent hover:border-purple-300'
              }`}
            >
              {/* Enrollment Badge */}
              {isEnrolled(cls.id) && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    ✅ Enrolled
                  </span>
                </div>
              )}

              {/* Class Header */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {cls.className || cls.subject}
                </h3>
                <p className="text-sm text-purple-600 font-semibold">
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
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {cls.description}
                </p>
              )}

              {/* Class Details */}
              <div className="space-y-2 mb-4">
                {cls.scheduleInfo && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2 text-purple-500" />
                    {cls.scheduleInfo}
                  </div>
                )}
                
                {cls.roomNumber && (
                  <div className="flex items-center text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2 text-blue-500" />
                    Room {cls.roomNumber}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <AcademicCapIcon className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-semibold mr-2">Teacher:</span>
                  {cls.teacherName || 'TBD'}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                <button
                  onClick={() => openViewModal(cls)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredClasses.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {activeTab === 'enrolled' 
                ? 'You are not enrolled in any classes yet.' 
                : 'No classes available matching your search.'
              }
            </div>
            {activeTab === 'enrolled' && (
              <p className="text-gray-500 mt-2">
                Contact your teacher or administrator to get enrolled in classes.
              </p>
            )}
          </div>
        )}
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
