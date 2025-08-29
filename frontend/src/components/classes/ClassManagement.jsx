import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit3, FiTrash2, FiUsers, FiUser, FiBook, FiX, FiEye, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

const ClassManagement = () => {
  const { token, user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [showEnrollStudentModal, setShowEnrollStudentModal] = useState(false);
  const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  
  // Form states
  const [classForm, setClassForm] = useState({
    className: '',
    subject: '',
    capacity: '',
    description: '',
    scheduleInfo: '',
    roomNumber: ''
  });
  
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentGradeFilter, setStudentGradeFilter] = useState('');
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    if (token) {
      fetchClasses();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'ADMIN') {
        // Admin can see all classes and available teachers
        const [classesRes, teachersRes] = await Promise.all([
          axios.get('/api/admin/classes', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('/api/admin/classes/teachers/available', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        setClasses(classesRes.data);
        setTeachers(teachersRes.data);
      } else if (user?.role === 'TEACHER') {
        // Teacher can only see their own classes
        const classesRes = await axios.get(`/api/homework/classes/teacher/${user.id}/statistics`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        setClasses(classesRes.data);
        setTeachers([]); // Teachers don't need to see available teachers
      } else {
        showError('Access denied. Only teachers and admins can view classes.');
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    await fetchData();
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    
    // Only admins can create classes
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can create new classes.');
      return;
    }
    
    try {
      const response = await axios.post('/api/admin/classes', classForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('Class created successfully!');
      setShowCreateModal(false);
      setClassForm({
        className: '',
        subject: '',
        capacity: '',
        description: '',
        scheduleInfo: '',
        roomNumber: ''
      });
      fetchData();
    } catch (error) {
      showError('Failed to create class: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAssignTeacher = async () => {
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can assign teachers to classes.');
      return;
    }
    
    if (!selectedTeacher) {
      showError('Please select a teacher');
      return;
    }
    
    try {
      await axios.put(`/api/admin/classes/${selectedClass.id}/teacher/${selectedTeacher}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('Teacher assigned successfully!');
      setShowAssignTeacherModal(false);
      setSelectedClass(null);
      setSelectedTeacher('');
      fetchData();
    } catch (error) {
      showError('Failed to assign teacher: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEnrollStudent = async () => {
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can enroll students in classes.');
      return;
    }
    
    if (!selectedStudent) {
      showError('Please select a student');
      return;
    }
    
    try {
      await axios.post(`/api/admin/classes/${selectedClass.id}/enroll/${selectedStudent}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('Student enrolled successfully!');
      setShowEnrollStudentModal(false);
      setSelectedClass(null);
      setSelectedStudent('');
      fetchData();
    } catch (error) {
      showError('Failed to enroll student: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEnrollMultipleStudents = async () => {
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can enroll students in classes.');
      return;
    }
    
    if (selectedStudents.length === 0) {
      showError('Please select at least one student');
      return;
    }
    
    try {
      const response = await axios.post(`/api/admin/classes/${selectedClass.id}/enroll/multiple`, selectedStudents, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess(`Successfully enrolled ${selectedStudents.length} students!`);
      
      // Update the local state immediately
      setClasses(prevClasses => 
        prevClasses.map(cls => {
          if (cls.id === selectedClass.id) {
            return {
              ...cls,
              currentStudentCount: (cls.currentStudentCount || 0) + selectedStudents.length
            };
          }
          return cls;
        })
      );
      
      // Update the selectedClass state
      setSelectedClass(prev => ({
        ...prev,
        currentStudentCount: (prev.currentStudentCount || 0) + selectedStudents.length
      }));
      
      setShowEnrollStudentModal(false);
      setSelectedClass(null);
      setSelectedStudents([]);
      
      // Refresh data to get updated enrolled students list
      fetchData();
    } catch (error) {
      showError('Failed to enroll students: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(studentSearchTerm.toLowerCase());
    const matchesGrade = !studentGradeFilter || student.classGrade === studentGradeFilter;
    return matchesSearch && matchesGrade;
  });

  const availableGrades = [...new Set(students.map(student => student.classGrade).filter(Boolean))];
  
  // Filter classes based on search and filters
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.className.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
                         cls.subject.toLowerCase().includes(classSearchTerm.toLowerCase());
    const matchesSubject = !subjectFilter || cls.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });
  
  const availableSubjects = [...new Set(classes.map(cls => cls.subject).filter(Boolean))];

  const openAssignTeacherModal = (classData) => {
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can assign teachers to classes.');
      return;
    }
    setSelectedClass(classData);
    setShowAssignTeacherModal(true);
  };

  const openEnrollStudentModal = async (classData) => {
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can enroll students in classes.');
      return;
    }
    setSelectedClass(classData);
    setSelectedStudents([]);
    setStudentSearchTerm('');
    setStudentGradeFilter('');
    try {
      const response = await axios.get('/api/admin/classes/students/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStudents(response.data);
      setShowEnrollStudentModal(true);
    } catch (error) {
      showError('Failed to load available students');
    }
  };

  const openViewModal = async (classData) => {
    try {
      let response;
      if (user?.role === 'ADMIN') {
        response = await axios.get(`/api/admin/classes/${classData.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else if (user?.role === 'TEACHER') {
        // For teachers, fetch class details with enrollment information
        response = await axios.get(`/api/homework/classes/${classData.id}/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // For other roles, we already have the class data, just use it
        setSelectedClass(classData);
        setShowViewModal(true);
        return;
      }
      setSelectedClass(response.data);
      setShowViewModal(true);
    } catch (error) {
      showError('Failed to load class details');
    }
  };

  const openEditModal = (classData) => {
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can edit classes.');
      return;
    }
    setSelectedClass(classData);
    setClassForm({
      className: classData.className || '',
      subject: classData.subject || '',
      capacity: classData.capacity || '',
      description: classData.description || '',
      scheduleInfo: classData.scheduleInfo || '',
      roomNumber: classData.roomNumber || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can update classes.');
      return;
    }
    
    try {
      const response = await axios.put(`/api/admin/classes/${selectedClass.id}`, classForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('Class updated successfully!');
      setShowEditModal(false);
      setSelectedClass(null);
      setClassForm({
        className: '',
        subject: '',
        capacity: '',
        description: '',
        scheduleInfo: '',
        roomNumber: ''
      });
      fetchData();
    } catch (error) {
      showError('Failed to update class: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRemoveTeacher = async (classData) => {
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can remove teachers from classes.');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to remove the teacher from class "${classData.className}"?`)) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/classes/${classData.id}/teacher`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('Teacher removed successfully!');
      fetchData();
    } catch (error) {
      showError('Failed to remove teacher: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRemoveStudent = async (classId, studentId, studentName) => {
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can remove students from classes.');
      return;
    }
    // Set the student to remove and show the custom modal
    setStudentToRemove({ classId, studentId, studentName });
    setShowRemoveStudentModal(true);
  };

  const handleViewStudentProfile = (studentId, studentName) => {
    // Navigate to student profile page
    window.location.href = `/students/${studentId}`;
  };

  const confirmRemoveStudent = async () => {
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can remove students from classes.');
      return;
    }
    
    if (!studentToRemove) return;
    
    try {
      await axios.delete(`/api/admin/classes/${studentToRemove.classId}/enroll/${studentToRemove.studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('Student removed successfully!');
      
      // Update the local state immediately
      setClasses(prevClasses => 
        prevClasses.map(cls => {
          if (cls.id === studentToRemove.classId) {
            return {
              ...cls,
              enrolledStudents: cls.enrolledStudents?.filter(student => student.id !== studentToRemove.studentId) || [],
              currentStudentCount: (cls.currentStudentCount || 1) - 1
            };
          }
          return cls;
        })
      );
      
      // Update the selectedClass state if it's the same class
      if (selectedClass && selectedClass.id === studentToRemove.classId) {
        setSelectedClass(prev => ({
          ...prev,
          enrolledStudents: prev.enrolledStudents?.filter(student => student.id !== studentToRemove.studentId) || [],
          currentStudentCount: (prev.currentStudentCount || 1) - 1
        }));
      }
      
      setShowRemoveStudentModal(false);
      setStudentToRemove(null);
    } catch (error) {
      showError('Failed to remove student: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteClass = async (classId) => {
    if (user?.role !== 'ADMIN') {
      showError('Only administrators can delete classes.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/classes/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('Class deleted successfully!');
      fetchData();
    } catch (error) {
      showError('Failed to delete class: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-coral-50 flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              y: [0, -30, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-16 left-16 w-40 h-40 bg-gradient-to-br from-teal-200 to-coral-300 rounded-full opacity-15 blur-xl"
          />
          
          <motion.div
            animate={{
              y: [0, 25, 0],
              rotate: [0, -8, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-32 right-24 w-32 h-32 bg-gradient-to-br from-coral-200 to-teal-300 rounded-full opacity-15 blur-xl"
          />
        </div>
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-400 to-coral-500 rounded-full shadow-2xl mb-6"
          >
            <FiBook className="w-12 h-12 text-white" />
          </motion.div>
          <div className="relative">
            <div className="w-20 h-20 border-4 border-teal-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-teal-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Loading Classes</h2>
          <p className="text-gray-600">Please wait while we fetch your class data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-coral-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-16 left-16 w-40 h-40 bg-gradient-to-br from-teal-200 to-coral-300 rounded-full opacity-15 blur-xl"
        />
        
        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-32 right-24 w-32 h-32 bg-gradient-to-br from-coral-200 to-teal-300 rounded-full opacity-15 blur-xl"
        />
        
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-40 left-1/3 w-28 h-28 bg-gradient-to-br from-coral-200 to-teal-300 rounded-full opacity-15 blur-xl"
        />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-400 to-coral-500 rounded-full shadow-2xl mb-6"
          >
            <FiBook className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-coral-500 bg-clip-text text-transparent mb-4"
          >
            🏫 {user?.role === 'ADMIN' ? 'Class Management' : 'My Classes'}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            {user?.role === 'ADMIN' 
              ? 'Create, manage, and organize classes with teachers and students'
              : 'View and manage your assigned classes'
            }
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center space-x-4 mt-8"
          >
            <button
              onClick={fetchData}
              className="flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 hover:border-emerald-300"
            >
              <FiRefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
            
            {user?.role === 'ADMIN' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-teal-500 to-coral-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:from-teal-600 hover:to-coral-700"
              >
                <FiPlus className="h-5 w-5 mr-2" />
                Create Class
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Classes</label>
                <input
                  type="text"
                  value={classSearchTerm}
                  onChange={(e) => setClassSearchTerm(e.target.value)}
                  className="block w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Search by class name or subject..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Subject</label>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="block w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Subjects</option>
                  {availableSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setClassSearchTerm('');
                    setSubjectFilter('');
                  }}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-coral-100 rounded-xl flex items-center justify-center border border-teal-200">
                <FiBook className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-coral-100 to-teal-100 rounded-xl flex items-center justify-center border border-coral-200">
                <FiUsers className="h-6 w-6 text-coral-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.filter(cls => cls.isActive).length}
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-coral-100 rounded-xl flex items-center justify-center border border-teal-200">
                <FiUser className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">
                  {user?.role === 'ADMIN' ? 'Classes with Teachers' : 'Total Students'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === 'ADMIN' 
                    ? classes.filter(cls => cls.teacher).length
                    : classes.reduce((total, cls) => total + (cls.currentStudentCount || 0), 0)
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Results Count */}
        {classes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredClasses.length}</span> of <span className="font-semibold text-gray-900">{classes.length}</span> classes
                {classSearchTerm && (
                  <span className="ml-2">
                    for "<span className="font-semibold text-gray-900">{classSearchTerm}</span>"
                  </span>
                )}
                {subjectFilter && (
                  <span className="ml-2">
                    in <span className="font-semibold text-gray-900">{subjectFilter}</span>
                  </span>
                )}
              </p>
            </div>
          </motion.div>
        )}

        {/* Classes Grid */}
        {filteredClasses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="w-24 h-24 bg-gradient-to-br from-teal-100 to-coral-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-teal-200"
              >
                <FiBook className="h-12 w-12 text-teal-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {classes.length === 0 
                  ? (user?.role === 'ADMIN' ? 'No Classes Yet' : 'No Classes Assigned')
                  : 'No Classes Found'
                }
              </h3>
              <p className="text-gray-600 mb-8">
                {classes.length === 0 
                  ? (user?.role === 'ADMIN' 
                      ? "Get started by creating your first class. You'll be able to assign teachers, enroll students, and manage everything from here."
                      : "You haven't been assigned to any classes yet. Contact an administrator to get assigned to classes."
                    )
                  : "No classes match your current search criteria. Try adjusting your search terms or filters."
                }
              </p>
              {classes.length === 0 && user?.role === 'ADMIN' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-teal-500 to-coral-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:from-teal-600 hover:to-coral-700"
                >
                  <FiPlus className="h-5 w-5 mr-2" />
                  Create Your First Class
                </motion.button>
              )}
              {classes.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setClassSearchTerm('');
                    setSubjectFilter('');
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200"
                >
                  Clear Search
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {filteredClasses.map((cls) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-teal-50 to-coral-50 p-6 border-b border-gray-100 group-hover:from-teal-100 group-hover:to-coral-100 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-coral-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FiBook className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">{cls.className}</h3>
                      <p className="text-teal-600 font-medium">{cls.subject}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    cls.isActive 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {cls.isActive ? '● Active' : '● Inactive'}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <FiUsers className="h-5 w-5 text-emerald-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Students</p>
                      <p className="font-semibold text-gray-900">
                        {cls.currentStudentCount || 0}
                        {cls.maxStudents && <span className="text-gray-400"> / {cls.maxStudents}</span>}
                      </p>
                    </div>
                  </div>
                  
                  {cls.teacher ? (
                    <div className="flex items-center p-3 bg-teal-50 rounded-xl border border-teal-100">
                      <FiUser className="h-5 w-5 text-teal-600 mr-3" />
                      <div>
                        <p className="text-sm text-teal-600">Teacher</p>
                        <p className="font-semibold text-gray-900">
                          {cls.teacher.firstName} {cls.teacher.lastName}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <FiUser className="h-5 w-5 text-orange-600 mr-3" />
                      <div>
                        <p className="text-sm text-orange-600">Teacher</p>
                        <p className="font-semibold text-gray-900">Not Assigned</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {user?.role === 'ADMIN' ? (
                    <>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openAssignTeacherModal(cls)}
                          className="flex-1 px-4 py-2 text-sm font-medium bg-teal-100 text-teal-700 rounded-xl hover:bg-teal-200 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-teal-200"
                        >
                          Assign Teacher
                        </button>
                        {cls.teacher && (
                          <button 
                            onClick={() => handleRemoveTeacher(cls)}
                            className="flex-1 px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-red-200"
                          >
                            Remove Teacher
                          </button>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openEnrollStudentModal(cls)}
                          className="flex-1 px-4 py-2 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-emerald-200"
                        >
                          Enroll Student
                        </button>
                        <button 
                          onClick={() => openViewModal(cls)}
                          className="flex-1 px-4 py-2 text-sm font-medium bg-cyan-100 text-cyan-700 rounded-xl hover:bg-cyan-200 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-cyan-200"
                        >
                          View Details
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openViewModal(cls)}
                          className="flex-1 px-4 py-2 text-sm font-medium bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-orange-200"
                          title="Manage students in this class"
                        >
                          Manage Students
                        </button>
                        <button 
                          onClick={() => openEditModal(cls)}
                          className="flex-1 px-4 py-2 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-yellow-200"
                        >
                          Edit
                        </button>
                      </div>
                      
                      <button 
                        className="w-full px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-gray-200"
                      >
                        {cls.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </>
                  ) : (
                    // Teacher view - only show view details
                    <button 
                      onClick={() => openViewModal(cls)}
                      className="w-full px-4 py-2 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-emerald-200"
                    >
                      View Details
                    </button>
                  )}
                </div>
               </div>
             </motion.div>
           ))}
           </motion.div>
         )}

        {/* Create Class Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                
                <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                  <div className="bg-white px-6 pt-6 pb-6 sm:p-8 sm:pb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Create New Class</h3>
                        <p className="text-gray-600 mt-1">Fill in the details below to create a new class</p>
                      </div>
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateClass} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Class Name</label>
                        <input
                          type="text"
                          value={classForm.className}
                          onChange={(e) => setClassForm({...classForm, className: e.target.value})}
                          className="block w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                          placeholder="e.g., 1 - A, 2 - B, 3 - C"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter class name in format: Grade - Section (e.g., 1 - A, 2 - B)</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                          type="text"
                          value={classForm.subject}
                          onChange={(e) => setClassForm({...classForm, subject: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="e.g., Mathematics"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity</label>
                        <input
                          type="number"
                          value={classForm.capacity}
                          onChange={(e) => setClassForm({...classForm, capacity: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="e.g., 25"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={classForm.description}
                          onChange={(e) => setClassForm({...classForm, description: e.target.value})}
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Class description..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Schedule Info</label>
                          <select
                            value={classForm.scheduleInfo}
                            onChange={(e) => setClassForm({...classForm, scheduleInfo: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="">Select Schedule</option>
                            <option value="Monday, Wednesday, Friday 9:00 AM - 10:00 AM">Monday, Wednesday, Friday 9:00 AM - 10:00 AM</option>
                            <option value="Monday, Wednesday, Friday 10:00 AM - 11:00 AM">Monday, Wednesday, Friday 10:00 AM - 11:00 AM</option>
                            <option value="Monday, Wednesday, Friday 11:00 AM - 12:00 PM">Monday, Wednesday, Friday 11:00 AM - 12:00 PM</option>
                            <option value="Monday, Wednesday, Friday 2:00 PM - 3:00 PM">Monday, Wednesday, Friday 2:00 PM - 3:00 PM</option>
                            <option value="Monday, Wednesday, Friday 3:00 PM - 4:00 PM">Monday, Wednesday, Friday 3:00 PM - 4:00 PM</option>
                            <option value="Tuesday, Thursday 9:00 AM - 10:00 AM">Tuesday, Thursday 9:00 AM - 10:00 AM</option>
                            <option value="Tuesday, Thursday 10:00 AM - 11:00 AM">Tuesday, Thursday 10:00 AM - 11:00 AM</option>
                            <option value="Tuesday, Thursday 11:00 AM - 12:00 PM">Tuesday, Thursday 11:00 AM - 12:00 PM</option>
                            <option value="Tuesday, Thursday 2:00 PM - 3:00 PM">Tuesday, Thursday 2:00 PM - 3:00 PM</option>
                            <option value="Tuesday, Thursday 3:00 PM - 4:00 PM">Tuesday, Thursday 3:00 PM - 4:00 PM</option>
                            <option value="Monday to Friday 9:00 AM - 10:00 AM">Monday to Friday 9:00 AM - 10:00 AM</option>
                            <option value="Monday to Friday 10:00 AM - 11:00 AM">Monday to Friday 10:00 AM - 11:00 AM</option>
                            <option value="Monday to Friday 2:00 PM - 3:00 PM">Monday to Friday 2:00 PM - 3:00 PM</option>
                            <option value="Monday to Friday 3:00 PM - 4:00 PM">Monday to Friday 3:00 PM - 4:00 PM</option>
                            <option value="Saturday 9:00 AM - 12:00 PM">Saturday 9:00 AM - 12:00 PM</option>
                            <option value="Saturday 2:00 PM - 5:00 PM">Saturday 2:00 PM - 5:00 PM</option>
                            <option value="Sunday 9:00 AM - 12:00 PM">Sunday 9:00 AM - 12:00 PM</option>
                            <option value="Sunday 2:00 PM - 5:00 PM">Sunday 2:00 PM - 5:00 PM</option>
                            <option value="Custom">Custom Schedule</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Room Number</label>
                          <input
                            type="text"
                            value={classForm.roomNumber}
                            onChange={(e) => setClassForm({...classForm, roomNumber: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g., Room 201"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-4 pt-6">
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(false)}
                          className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          Create Class
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Class Modal */}
        <AnimatePresence>
          {showEditModal && selectedClass && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Edit Class</h3>
                      <button
                        onClick={() => setShowEditModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleUpdateClass} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Class Name</label>
                        <input
                          type="text"
                          value={classForm.className}
                          onChange={(e) => setClassForm({...classForm, className: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="e.g., 1 - A, 2 - B, 3 - C"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter class name in format: Grade - Section (e.g., 1 - A, 2 - B)</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                          type="text"
                          value={classForm.subject}
                          onChange={(e) => setClassForm({...classForm, subject: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity</label>
                        <input
                          type="number"
                          value={classForm.capacity}
                          onChange={(e) => setClassForm({...classForm, capacity: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={classForm.description}
                          onChange={(e) => setClassForm({...classForm, description: e.target.value})}
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Schedule Info</label>
                          <select
                            value={classForm.scheduleInfo}
                            onChange={(e) => setClassForm({...classForm, scheduleInfo: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="">Select Schedule</option>
                            <option value="Monday, Wednesday, Friday 9:00 AM - 10:00 AM">Monday, Wednesday, Friday 9:00 AM - 10:00 AM</option>
                            <option value="Monday, Wednesday, Friday 10:00 AM - 11:00 AM">Monday, Wednesday, Friday 10:00 AM - 11:00 AM</option>
                            <option value="Monday, Wednesday, Friday 11:00 AM - 12:00 PM">Monday, Wednesday, Friday 11:00 AM - 12:00 PM</option>
                            <option value="Monday, Wednesday, Friday 2:00 PM - 3:00 PM">Monday, Wednesday, Friday 2:00 PM - 3:00 PM</option>
                            <option value="Monday, Wednesday, Friday 3:00 PM - 4:00 PM">Monday, Wednesday, Friday 3:00 PM - 4:00 PM</option>
                            <option value="Tuesday, Thursday 9:00 AM - 10:00 AM">Tuesday, Thursday 9:00 AM - 10:00 AM</option>
                            <option value="Tuesday, Thursday 10:00 AM - 11:00 AM">Tuesday, Thursday 10:00 AM - 11:00 AM</option>
                            <option value="Tuesday, Thursday 11:00 AM - 12:00 PM">Tuesday, Thursday 11:00 AM - 12:00 PM</option>
                            <option value="Tuesday, Thursday 2:00 PM - 3:00 PM">Tuesday, Thursday 2:00 PM - 3:00 PM</option>
                            <option value="Tuesday, Thursday 3:00 PM - 4:00 PM">Tuesday, Thursday 3:00 PM - 4:00 PM</option>
                            <option value="Monday to Friday 9:00 AM - 10:00 AM">Monday to Friday 9:00 AM - 10:00 AM</option>
                            <option value="Monday to Friday 10:00 AM - 11:00 AM">Monday to Friday 10:00 AM - 11:00 AM</option>
                            <option value="Monday to Friday 2:00 PM - 3:00 PM">Monday to Friday 2:00 PM - 3:00 PM</option>
                            <option value="Monday to Friday 3:00 PM - 4:00 PM">Monday to Friday 3:00 PM - 4:00 PM</option>
                            <option value="Saturday 9:00 AM - 12:00 PM">Saturday 9:00 AM - 12:00 PM</option>
                            <option value="Saturday 2:00 PM - 5:00 PM">Saturday 2:00 PM - 5:00 PM</option>
                            <option value="Sunday 9:00 AM - 12:00 PM">Sunday 9:00 AM - 12:00 PM</option>
                            <option value="Sunday 2:00 PM - 5:00 PM">Sunday 2:00 PM - 5:00 PM</option>
                            <option value="Custom">Custom Schedule</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Room Number</label>
                          <input
                            type="text"
                            value={classForm.roomNumber}
                            onChange={(e) => setClassForm({...classForm, roomNumber: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g., Room 201"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowEditModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                        >
                          Update Class
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assign Teacher Modal */}
        <AnimatePresence>
          {showAssignTeacherModal && selectedClass && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Assign Teacher to {selectedClass.className}</h3>
                      <button
                        onClick={() => setShowAssignTeacherModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Select Teacher</label>
                        <select
                          value={selectedTeacher}
                          onChange={(e) => setSelectedTeacher(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          required
                        >
                          <option value="">Choose a teacher...</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.firstName} {teacher.lastName} - {teacher.subjectTaught || 'General'}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          onClick={() => setShowAssignTeacherModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAssignTeacher}
                          disabled={!selectedTeacher}
                          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                          Assign Teacher
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enroll Student Modal */}
        <AnimatePresence>
          {showEnrollStudentModal && selectedClass && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Enroll Student in {selectedClass.className}</h3>
                      <button
                        onClick={() => setShowEnrollStudentModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Class Capacity:</strong> {selectedClass.capacity || 'Unlimited'} | 
                          <strong>Current Students:</strong> {selectedClass.currentStudentCount || 0} | 
                          <strong>Available Spots:</strong> {selectedClass.capacity ? Math.max(0, selectedClass.capacity - (selectedClass.currentStudentCount || 0)) : 'Unlimited'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Search Students</label>
                        <input
                          type="text"
                          value={studentSearchTerm}
                          onChange={(e) => setStudentSearchTerm(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Search by name or email"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Filter by Grade</label>
                        <select
                          value={studentGradeFilter}
                          onChange={(e) => setStudentGradeFilter(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">All Grades</option>
                          {availableGrades.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="overflow-y-auto max-h-60">
                        {filteredStudents.map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-purple-50" onClick={() => toggleStudentSelection(student.id)}>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.id)}
                                onChange={() => {}} // This is handled by the onClick
                                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-900">
                                {student.firstName} {student.lastName} ({student.email})
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              Grade: {student.classGrade}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          onClick={() => setShowEnrollStudentModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEnrollMultipleStudents}
                          disabled={selectedStudents.length === 0}
                          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                          Enroll Selected Students ({selectedStudents.length})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Class Modal */}
        <AnimatePresence>
          {showViewModal && selectedClass && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Class Details</h3>
                      <button
                        onClick={() => setShowViewModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Class Name</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedClass.className}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Subject</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedClass.subject}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Grade Level</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedClass.gradeLevel}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Section</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedClass.section || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {selectedClass.teacher && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Teacher</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedClass.teacher.firstName} {selectedClass.teacher.lastName} ({selectedClass.teacher.email})
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Enrolled Students ({selectedClass.currentStudentCount || selectedClass.enrolledStudents?.length || 0})</label>
                        <div className="mt-2 space-y-2">
                          {selectedClass.enrolledStudents && selectedClass.enrolledStudents.length > 0 ? (
                            selectedClass.enrolledStudents.map((student) => (
                              <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm text-gray-900">
                                    {student.firstName} {student.lastName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewStudentProfile(student.id, `${student.firstName} ${student.lastName}`)}
                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                    title="View student profile"
                                  >
                                    View Profile
                                  </button>
                                  {user?.role === 'ADMIN' && (
                                    <button
                                      onClick={() => handleRemoveStudent(selectedClass.id, student.id, `${student.firstName} ${student.lastName}`)}
                                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                      title="Remove student from class"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No students enrolled</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => setShowViewModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button - Only for Admins */}
        {user?.role === 'ADMIN' && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => setShowCreateModal(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-teal-500 to-coral-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-40 flex items-center justify-center"
            title="Create New Class"
          >
            <FiPlus className="h-8 w-8" />
          </motion.button>
        )}

        {/* Remove Student Confirmation Modal */}
        <AnimatePresence>
          {showRemoveStudentModal && studentToRemove && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
                
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                  <div className="bg-white px-6 pt-6 pb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Remove Student
                      </h3>
                      <p className="text-sm text-gray-600">
                        Are you sure you want to remove <span className="font-semibold text-gray-900">{studentToRemove.studentName}</span> from this class?
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        This action cannot be undone. The student will be marked as inactive in this class.
                      </p>
                    </div>
                    
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => {
                          setShowRemoveStudentModal(false);
                          setStudentToRemove(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmRemoveStudent}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Remove Student
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClassManagement;
