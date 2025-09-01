import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const EmailManagement = () => {
  const [emailStatus, setEmailStatus] = useState({
    configTest: null,
    healthCheck: null,
    lastTest: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token, user } = useAuth();

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      setError('Access denied. Admin privileges required.');
    }
  }, [user]);

  const testEmailConfiguration = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.get('/api/email/test-config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setEmailStatus(prev => ({
        ...prev,
        configTest: response.data.success,
        lastTest: new Date().toLocaleString()
      }));
      
      if (response.data.success) {
        setSuccess('✅ Email configuration test passed!');
      } else {
        setError('❌ Email configuration test failed');
      }
    } catch (err) {
      setError('Failed to test email configuration: ' + (err.response?.data?.message || err.message));
      setEmailStatus(prev => ({
        ...prev,
        configTest: false,
        lastTest: new Date().toLocaleString()
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkEmailHealth = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.get('/api/email/health', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setEmailStatus(prev => ({
        ...prev,
        healthCheck: response.data.status === 'UP',
        lastTest: new Date().toLocaleString()
      }));
      
      if (response.data.status === 'UP') {
        setSuccess('✅ Email service is healthy and running');
      } else {
        setError('❌ Email service is not responding properly');
      }
    } catch (err) {
      setError('Failed to check email health: ' + (err.response?.data?.message || err.message));
      setEmailStatus(prev => ({
        ...prev,
        healthCheck: false,
        lastTest: new Date().toLocaleString()
      }));
    } finally {
      setLoading(false);
    }
  };

  const runFullEmailTest = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // First check health
      await checkEmailHealth();
      
      // Then test configuration
      await testEmailConfiguration();
      
      setSuccess('🎉 Full email system test completed!');
    } catch (err) {
      setError('Full email test failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === null) return <ExclamationTriangleIcon className="w-6 h-6 text-gray-400" />;
    if (status) return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    return <XCircleIcon className="w-6 h-6 text-red-500" />;
  };

  const getStatusText = (status) => {
    if (status === null) return 'Not Tested';
    if (status) return 'Working';
    return 'Failed';
  };

  const getStatusColor = (status) => {
    if (status === null) return 'text-gray-500';
    if (status) return 'text-green-600';
    return 'text-red-600';
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600">Admin privileges are required to access email management.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <EnvelopeIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
              <p className="text-gray-600">Manage and test the email system for homework notifications</p>
            </div>
          </div>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Configuration Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
                <p className="text-sm text-gray-600">Email settings and credentials</p>
              </div>
              {getStatusIcon(emailStatus.configTest)}
            </div>
            <div className="mt-4">
              <span className={`text-lg font-bold ${getStatusColor(emailStatus.configTest)}`}>
                {getStatusText(emailStatus.configTest)}
              </span>
            </div>
          </motion.div>

          {/* Health Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Service Health</h3>
                <p className="text-sm text-gray-600">Email service status</p>
              </div>
              {getStatusIcon(emailStatus.healthCheck)}
            </div>
            <div className="mt-4">
              <span className={`text-lg font-bold ${getStatusColor(emailStatus.healthCheck)}`}>
                {getStatusText(emailStatus.healthCheck)}
              </span>
            </div>
          </motion.div>

          {/* Last Test */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Last Test</h3>
                <p className="text-sm text-gray-600">When system was last tested</p>
              </div>
              <CogIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div className="mt-4">
              <span className="text-lg font-bold text-gray-900">
                {emailStatus.lastTest || 'Never'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email System Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={testEmailConfiguration}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <CogIcon className="w-5 h-5" />
              <span>Test Configuration</span>
            </button>

            <button
              onClick={checkEmailHealth}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Check Health</span>
            </button>

            <button
              onClick={runFullEmailTest}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              <span>Run Full Test</span>
            </button>
          </div>

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Testing email system...</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Information Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Automatic Email Sending</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>When teachers create homework, emails are automatically sent to relevant students</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Students are matched based on their grade/class</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Each email includes homework details and due date</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Testing & Monitoring</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Test email configuration to verify SMTP settings</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Monitor email service health and status</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Run comprehensive tests to ensure everything works</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center space-x-2">
              <XCircleIcon className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5" />
              <span>{success}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmailManagement;
