import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Welcome from './components/Welcome';
import AdminDashboard from './components/dashboards/AdminDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Teacher Routes */}
            <Route 
              path="/teacher/*" 
              element={
                <ProtectedRoute requiredRoles={['TEACHER']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Student/Parent Routes */}
            <Route 
              path="/student/*" 
              element={
                <ProtectedRoute requiredRoles={['STUDENT', 'PARENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Legacy dashboard route - redirect based on role */}
            <Route 
              path="/dashboard" 
              element={<Navigate to="/student" replace />} 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 