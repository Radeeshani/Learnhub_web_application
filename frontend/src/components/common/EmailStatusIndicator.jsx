import React from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const EmailStatusIndicator = ({ status, studentCount, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'sending':
        return {
          icon: <ClockIcon className="w-5 h-5 text-blue-500" />,
          text: `Sending emails to ${studentCount || 'students'}...`,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'success':
        return {
          icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
          text: `✅ Emails sent successfully to ${studentCount || 'students'}`,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
          text: '❌ Failed to send some emails',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'pending':
        return {
          icon: <EnvelopeIcon className="w-5 h-5 text-gray-500" />,
          text: `📧 Will send emails to ${studentCount || 'students'} when homework is created`,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          icon: <EnvelopeIcon className="w-5 h-5 text-gray-400" />,
          text: '📧 Email notifications will be sent automatically',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center space-x-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
    >
      {config.icon}
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
      
      {status === 'sending' && (
        <div className="ml-auto">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </motion.div>
  );
};

export default EmailStatusIndicator;
