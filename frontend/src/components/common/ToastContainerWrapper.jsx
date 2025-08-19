import React from 'react';
import { useToast } from '../../context/ToastContext';
import ToastContainer from './ToastContainer';

const ToastContainerWrapper = () => {
  const { toasts, removeToast } = useToast();
  
  return <ToastContainer toasts={toasts} onClose={removeToast} />;
};

export default ToastContainerWrapper;
