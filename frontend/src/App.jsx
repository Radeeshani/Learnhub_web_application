import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/dashboards/AdminDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import ParentDashboard from './components/dashboards/ParentDashboard';
import CreateHomework from './components/homework/CreateHomework';
import EditHomework from './components/homework/EditHomework';
import Welcome from './components/Welcome';

const App = () => {
  return (
    <AuthProvider>
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
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 