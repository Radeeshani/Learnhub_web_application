import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  AcademicCapIcon, 
  BookOpenIcon, 
  CalendarIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [student, setStudent] = useState(null);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [homeworkStats, setHomeworkStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && studentId) {
      fetchStudentProfile();
    }
  }, [token, studentId]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch student details
      const [studentRes, classesRes, statsRes] = await Promise.all([
        axios.get(`/api/admin/users/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`/api/homework/classes/student/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`/api/homework/statistics/student/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      setStudent(studentRes.data);
      setEnrolledClasses(classesRes.data);
      setHomeworkStats(statsRes.data || {});
    } catch (error) {
      console.error('Error fetching student profile:', error);
      showError('Failed to load student profile', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/classes');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-xl text-teal-600 font-semibold">Loading Student Profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-6">The student profile you're looking for doesn't exist.</p>
          <button
            onClick={goBack}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="group inline-flex items-center px-4 py-3 border-2 border-teal-300 shadow-lg text-sm leading-4 font-medium rounded-xl text-teal-700 bg-white hover:bg-teal-50 hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Classes
              </button>
            </div>
            
            <div className="text-right">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-coral-500 bg-clip-text text-transparent">
                👤 Student Profile
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Viewing profile for {student.firstName} {student.lastName}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            {/* Student Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-teal-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-coral-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-teal-600 font-semibold">Student</p>
              </div>

              {/* Student Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{student.email}</span>
                </div>
                
                {student.phoneNumber && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{student.phoneNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{student.classGrade || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">
                    Joined: {new Date(student.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-teal-200 mt-6">
              <h3 className="text-lg font-semibold text-teal-700 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Quick Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Enrolled Classes:</span>
                  <span className="font-semibold text-teal-600">{enrolledClasses.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Homeworks:</span>
                  <span className="font-semibold text-coral-600">{homeworkStats.totalHomeworks || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-semibold text-green-600">{homeworkStats.completedHomeworks || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-semibold text-orange-600">{homeworkStats.pendingHomeworks || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Classes and Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Enrolled Classes */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-teal-200">
              <h3 className="text-xl font-semibold text-teal-700 mb-4 flex items-center">
                <UserGroupIcon className="h-6 w-6 mr-2" />
                Enrolled Classes ({enrolledClasses.length})
              </h3>
              
              {enrolledClasses.length > 0 ? (
                <div className="space-y-4">
                  {enrolledClasses.map((cls) => (
                    <div key={cls.id} className="border border-gray-200 rounded-xl p-4 hover:border-teal-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{cls.className}</h4>
                          <p className="text-gray-600">{cls.subject}</p>
                          {cls.gradeLevel && (
                            <p className="text-sm text-gray-500">{cls.gradeLevel}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Enrolled</div>
                          <div className="text-xs text-gray-400">
                            {new Date(cls.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserGroupIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No classes enrolled yet</p>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-coral-200">
              <h3 className="text-xl font-semibold text-coral-700 mb-4 flex items-center">
                <ClockIcon className="h-6 w-6 mr-2" />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Enrolled in {enrolledClasses.length} class(es)
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-coral-50 rounded-lg">
                  <div className="w-2 h-2 bg-coral-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Profile last updated: {new Date(student.updatedAt || student.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>


          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
