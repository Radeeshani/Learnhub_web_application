import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiSearch, FiFilter, FiFileText, FiEdit, FiTrash2, FiEye, FiXCircle } from 'react-icons/fi';

const Reports = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');

  // Form state for creating/editing reports
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    studentId: '',
    classId: '',
    overallGrade: '',
    strengths: '',
    areasForImprovement: '',
    teacherNotes: '',
    recommendations: ''
  });

  useEffect(() => {
    fetchReports();
    fetchClasses();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports/teacher', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/homework/classes/teacher/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudentsByClass = async (classId) => {
    try {
      const response = await axios.get(`/api/reports/class/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/reports', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        studentId: '',
        classId: '',
        overallGrade: '',
        strengths: '',
        areasForImprovement: '',
        teacherNotes: '',
        recommendations: ''
      });
      
      fetchReports();
    } catch (error) {
      console.error('Error creating report:', error);
      setError('Failed to create report');
    }
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/reports/${selectedReport.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowViewModal(false);
      setSelectedReport(null);
      setFormData({
        title: '',
        description: '',
        studentId: '',
        classId: '',
        overallGrade: '',
        strengths: '',
        areasForImprovement: '',
        teacherNotes: '',
        recommendations: ''
      });
      
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      setError('Failed to update report');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await axios.delete(`/api/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        setError('Failed to delete report');
      }
    }
  };

  const handleClassChange = (classId) => {
    setFormData(prev => ({ ...prev, classId, studentId: '' }));
    if (classId) {
      fetchStudentsByClass(classId);
    } else {
      setStudents([]);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || report.classId?.toString() === filterClass;
    return matchesSearch && matchesClass;
  });

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-500';
    if (grade.includes('A') || grade.includes('9') || grade.includes('8')) return 'text-emerald-600';
    if (grade.includes('B') || grade.includes('7') || grade.includes('6')) return 'text-blue-600';
    if (grade.includes('C') || grade.includes('5') || grade.includes('4')) return 'text-yellow-600';
    if (grade.includes('D') || grade.includes('3') || grade.includes('2')) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBgColor = (grade) => {
    if (!grade) return 'bg-gray-100';
    if (grade.includes('A') || grade.includes('9') || grade.includes('8')) return 'bg-emerald-100';
    if (grade.includes('B') || grade.includes('7') || grade.includes('6')) return 'bg-blue-100';
    if (grade.includes('C') || grade.includes('5') || grade.includes('4')) return 'bg-yellow-100';
    if (grade.includes('D') || grade.includes('3') || grade.includes('2')) return 'bg-orange-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="page-title">Student Reports</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create and manage comprehensive student progress reports with detailed analytics and insights
          </p>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Class Filter */}
            <div className="flex-1 max-w-xs">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="input-field"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.className}</option>
                ))}
              </select>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Create Report
            </button>
          </div>
        </motion.div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-gradient group hover:scale-105"
            >
              {/* Report Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{report.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                    <span>{report.studentName || 'Student'}</span>
                  </div>
                  <p className="text-sm text-gray-500">{report.className || 'Class'}</p>
                </div>
              </div>

              {/* Report Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getGradeBgColor(report.overallGrade)} mb-2`}>
                    <span className={`text-2xl font-bold ${getGradeColor(report.overallGrade)}`}>
                      {report.overallGrade || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Overall Grade</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-coral-100 to-coral-200 mb-2">
                    <span className="text-2xl font-bold text-coral-600">
                      {report.completionRate || '100%'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Completion Rate</p>
                </div>
              </div>

              {/* Report Description Preview */}
              {report.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {report.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedReport(report);
                    setFormData({
                      title: report.title,
                      description: report.description,
                      studentId: report.studentId,
                      classId: report.classId,
                      overallGrade: report.overallGrade,
                      strengths: report.strengths,
                      areasForImprovement: report.areasForImprovement,
                      teacherNotes: report.teacherNotes,
                      recommendations: report.recommendations
                    });
                    setIsViewMode(true);
                    setShowViewModal(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiEye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => {
                    setSelectedReport(report);
                    setFormData({
                      title: report.title,
                      description: report.description,
                      studentId: report.studentId,
                      classId: report.classId,
                      overallGrade: report.overallGrade,
                      strengths: report.strengths,
                      areasForImprovement: report.areasForImprovement,
                      teacherNotes: report.teacherNotes,
                      recommendations: report.recommendations
                    });
                    setIsViewMode(false);
                    setShowViewModal(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 py-2 rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiEdit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteReport(report.id)}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredReports.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="card-gradient max-w-md mx-auto">
              <FiFileText className="w-20 h-20 text-teal-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No reports found</h3>
              <p className="text-gray-600 mb-6">Create your first student report to get started with tracking progress.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Create First Report
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Report Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-coral-500 bg-clip-text text-transparent">
                    Create Student Report
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiXCircle className="w-8 h-8" />
                  </button>
                </div>

                <form onSubmit={handleCreateReport} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="input-field"
                        placeholder="Enter report title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
                      <select
                        required
                        value={formData.classId}
                        onChange={(e) => handleClassChange(e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.className}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Student</label>
                      <select
                        required
                        value={formData.studentId}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                        className="input-field"
                        disabled={!formData.classId}
                      >
                        <option value="">Select Student</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.firstName} {student.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Grade</label>
                      <input
                        type="text"
                        value={formData.overallGrade}
                        onChange={(e) => setFormData(prev => ({ ...prev, overallGrade: e.target.value }))}
                        placeholder="e.g., A, B+, 85%"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="input-field"
                      placeholder="Brief description of the report"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Strengths</label>
                    <textarea
                      value={formData.strengths}
                      onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                      rows={3}
                      className="input-field"
                      placeholder="Student's key strengths and achievements"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Areas for Improvement</label>
                    <textarea
                      value={formData.areasForImprovement}
                      onChange={(e) => setFormData(prev => ({ ...prev, areasForImprovement: e.target.value }))}
                      rows={3}
                      className="input-field"
                      placeholder="Areas where the student can improve"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Teacher Notes</label>
                    <textarea
                      value={formData.teacherNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, teacherNotes: e.target.value }))}
                      rows={3}
                      className="input-field"
                      placeholder="Additional notes and observations"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Recommendations</label>
                    <textarea
                      value={formData.recommendations}
                      onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                      rows={3}
                      className="input-field"
                      placeholder="Recommendations for future development"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Create Report
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View/Edit Report Modal */}
      <AnimatePresence>
        {showViewModal && selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-coral-500 bg-clip-text text-transparent">
                    {isViewMode ? 'View Report' : 'Edit Report'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setIsViewMode(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiXCircle className="w-8 h-8" />
                  </button>
                </div>

                <form onSubmit={isViewMode ? (e) => e.preventDefault() : handleUpdateReport} className="space-y-6">
                  {/* Student and Class Info for View Mode */}
                  {isViewMode && (
                    <div className="bg-gradient-to-r from-teal-50 to-coral-50 p-6 rounded-2xl mb-6 border border-teal-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-teal-700 mb-2">Student</label>
                          <p className="text-lg font-medium text-gray-900">{selectedReport?.studentName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-coral-700 mb-2">Class</label>
                          <p className="text-lg font-medium text-gray-900">{selectedReport?.className || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Same form fields as create modal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        required={!isViewMode}
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        readOnly={isViewMode}
                        className={`input-field ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Grade</label>
                      <input
                        type="text"
                        value={formData.overallGrade}
                        onChange={(e) => setFormData(prev => ({ ...prev, overallGrade: e.target.value }))}
                        placeholder="e.g., A, B+, 85%"
                        readOnly={isViewMode}
                        className={`input-field ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      readOnly={isViewMode}
                      className={`input-field ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Strengths</label>
                    <textarea
                      value={formData.strengths}
                      onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                      rows={3}
                      readOnly={isViewMode}
                      className={`input-field ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Areas for Improvement</label>
                    <textarea
                      value={formData.areasForImprovement}
                      onChange={(e) => setFormData(prev => ({ ...prev, areasForImprovement: e.target.value }))}
                      rows={3}
                      readOnly={isViewMode}
                      className={`input-field ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Teacher Notes</label>
                    <textarea
                      value={formData.teacherNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, teacherNotes: e.target.value }))}
                      rows={3}
                      readOnly={isViewMode}
                      className={`input-field ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Recommendations</label>
                    <textarea
                      value={formData.recommendations}
                      onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                      rows={3}
                      readOnly={isViewMode}
                      className={`input-field ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowViewModal(false);
                        setIsViewMode(false);
                      }}
                      className="btn-secondary"
                    >
                      {isViewMode ? 'Close' : 'Cancel'}
                    </button>
                    {!isViewMode && (
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Update Report
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
