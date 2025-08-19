import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/dashboards/AdminDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import ParentDashboard from './components/dashboards/ParentDashboard';
import CreateHomework from './components/homework/CreateHomework';
import EditHomework from './components/homework/EditHomework';
import SubmitHomework from './components/homework/SubmitHomework';
import Welcome from './components/Welcome';
import NotificationPanel from './components/common/NotificationPanel';
import ToastContainerWrapper from './components/common/ToastContainerWrapper';

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/teacher/*"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/parent/*"
                element={
                  <ProtectedRoute allowedRoles={['PARENT']}>
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/homework/create"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <CreateHomework />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/homework/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <EditHomework />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/submit-homework"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <SubmitHomework />
                  </ProtectedRoute>
                }
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Global Notification Components */}
            <NotificationPanel />
            <ToastContainerWrapper />
          </Router>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App; 