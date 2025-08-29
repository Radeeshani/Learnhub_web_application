import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FiFileText, FiDownload, FiCalendar, FiUser, FiBookOpen, 
  FiCheckCircle, FiTrendingUp, FiTrendingDown, FiStar, FiEye, FiXCircle
} from 'react-icons/fi';

const StudentReports = () => {
  const { user, token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports/student', {
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

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleDownloadReport = async (reportId) => {
    try {
      setDownloading(true);
      const response = await axios.get(`/api/reports/${reportId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create a blob and download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_report_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

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

  const getCompletionRateColor = (rate) => {
    if (!rate) return 'text-gray-500';
    if (rate >= 90) return 'text-emerald-600';
    if (rate >= 80) return 'text-blue-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (rate) => {
    if (!rate) return <FiTrendingDown className="w-5 h-5 text-gray-400" />;
    if (rate >= 90) return <FiTrendingUp className="w-5 h-5 text-emerald-500" />;
    if (rate >= 80) return <FiTrendingUp className="w-5 h-5 text-blue-500" />;
    if (rate >= 70) return <FiTrendingUp className="w-5 h-5 text-yellow-500" />;
    return <FiTrendingDown className="w-5 h-5 text-red-500" />;
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
          <h1 className="page-title">My Academic Reports</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            View your academic progress reports and track your performance across all subjects
          </p>
        </motion.div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-gradient group hover:scale-105 cursor-pointer"
              onClick={() => handleViewReport(report)}
            >
              {/* Report Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{report.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                    <span>{report.className || 'Class'}</span>
                  </div>
                  <p className="text-sm text-gray-500">{report.subject || 'Subject'}</p>
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
                      {report.homeworkCompletionRate ? `${Math.round(report.homeworkCompletionRate)}%` : '100%'}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewReport(report);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiEye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadReport(report.id);
                  }}
                  disabled={downloading}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 py-2 rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiDownload className="w-4 h-4" />
                  {downloading ? 'Downloading...' : 'Download'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {reports.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="card-gradient max-w-md mx-auto">
              <FiFileText className="w-20 h-20 text-teal-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No reports available</h3>
              <p className="text-gray-600 mb-6">
                Your teachers haven't created any reports yet. Reports will appear here once they're available.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Report View Modal */}
      <AnimatePresence>
        {showReportModal && selectedReport && (
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
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-coral-500 bg-clip-text text-transparent">
                    Academic Report
                  </h2>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiXCircle className="w-8 h-8" />
                  </button>
                </div>

                {/* Student and Class Info */}
                <div className="bg-gradient-to-r from-teal-50 to-coral-50 p-6 rounded-2xl mb-8 border border-teal-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-teal-700 mb-2">Student</label>
                      <p className="text-lg font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coral-700 mb-2">Class</label>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedReport?.className || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-purple-700 mb-2">Subject</label>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedReport?.subject || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Report Title</label>
                      <p className="text-lg text-gray-900">{selectedReport?.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Grade</label>
                      <div className={`inline-flex items-center justify-center px-4 py-2 rounded-full ${getGradeBgColor(selectedReport?.overallGrade)}`}>
                        <span className={`text-lg font-bold ${getGradeColor(selectedReport?.overallGrade)}`}>
                          {selectedReport?.overallGrade || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedReport?.description && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <p className="text-gray-900 bg-gray-50 p-4 rounded-xl">
                        {selectedReport.description}
                      </p>
                    </div>
                  )}

                  {selectedReport?.strengths && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Strengths</label>
                      <p className="text-gray-900 bg-emerald-50 p-4 rounded-xl border-l-4 border-emerald-400">
                        {selectedReport.strengths}
                      </p>
                    </div>
                  )}

                  {selectedReport?.areasForImprovement && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Areas for Improvement</label>
                      <p className="text-gray-900 bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-400">
                        {selectedReport.areasForImprovement}
                      </p>
                    </div>
                  )}

                  {selectedReport?.teacherNotes && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Teacher Notes</label>
                      <p className="text-gray-900 bg-blue-50 p-4 rounded-xl border-l-4 border-blue-400">
                        {selectedReport.teacherNotes}
                      </p>
                    </div>
                  )}

                  {selectedReport?.recommendations && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Recommendations</label>
                      <p className="text-gray-900 bg-purple-50 p-4 rounded-xl border-l-4 border-purple-400">
                        {selectedReport.recommendations}
                      </p>
                    </div>
                  )}

                  {/* Performance Analytics */}
                  <div className="bg-gradient-to-r from-gray-50 to-teal-50 p-6 rounded-2xl border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Analytics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">
                          {selectedReport?.totalHomeworksAssigned || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total Assigned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedReport?.totalHomeworksCompleted || 0}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          {selectedReport?.averageScore ? `${Math.round(selectedReport.averageScore)}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Average Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-coral-600">
                          {selectedReport?.homeworkCompletionRate ? `${Math.round(selectedReport.homeworkCompletionRate)}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-200">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDownloadReport(selectedReport.id)}
                    disabled={downloading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiDownload className="w-5 h-5" />
                    {downloading ? 'Downloading...' : 'Download PDF'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentReports;
