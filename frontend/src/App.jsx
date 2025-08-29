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
import ViewHomeworks from './components/homework/ViewHomeworks';
import Calendar from './components/calendar/Calendar';
import ClassManagement from './components/classes/ClassManagement';
import StudentClassView from './components/classes/StudentClassView';
import UserManagement from './components/admin/UserManagement';
import Welcome from './components/Welcome';
import NotificationPanel from './components/common/NotificationPanel';
import ToastContainerWrapper from './components/common/ToastContainerWrapper';
import GamificationDashboard from './components/gamification/GamificationDashboard';
import Profile from './components/profile/Profile';
import StudentProfile from './components/profile/StudentProfile';
import Sidebar from './components/common/Sidebar';
import Reminders from './components/reminders/Reminders';
import Notifications from './components/notifications/Notifications';
import Library from './components/library/Library';
import Reports from './components/reports/Reports';
import StudentReports from './components/reports/StudentReports';

const App = () => {
  return (
    <div className="w-screen h-screen overflow-hidden">
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
                      <Sidebar>
                        <AdminDashboard />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/teacher/*"
                  element={
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                      <Sidebar>
                        <TeacherDashboard />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/student/*"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Sidebar>
                        <StudentDashboard />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/parent/*"
                  element={
                    <ProtectedRoute allowedRoles={['PARENT']}>
                      <Sidebar>
                        <ParentDashboard />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/homework/create"
                  element={
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                      <Sidebar>
                        <CreateHomework />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/homework/view"
                  element={
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                      <Sidebar>
                        <ViewHomeworks />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/homework/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                      <Sidebar>
                        <EditHomework />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/submit-homework"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Sidebar>
                        <SubmitHomework />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
                      <Sidebar>
                        <Calendar />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Routes */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <Sidebar>
                        <UserManagement />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                {/* Class Management Routes */}
                <Route
                  path="/admin/classes"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <Sidebar>
                        <ClassManagement />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/classes"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                      <Sidebar>
                        <ClassManagement />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/classes/student"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Sidebar>
                        <StudentClassView />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                {/* Student Profile Route */}
                <Route
                  path="/students/:studentId"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                      <Sidebar>
                        <StudentProfile />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                {/* Library Routes */}
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute allowedRoles={['TEACHER', 'STUDENT']}>
                      <Sidebar>
                        <Library />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                {/* Gamification Routes */}
                <Route
                  path="/gamification"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
                      <Sidebar>
                        <GamificationDashboard />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                {/* Profile Route */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
                      <Sidebar>
                        <Profile />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                {/* Reminders Route */}
                <Route
                  path="/reminders"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
                      <Sidebar>
                        <Reminders />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                {/* Notifications Route */}
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
                      <Sidebar>
                        <Notifications />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                {/* Reports Routes */}
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                      <Sidebar>
                        <Reports />
                      </Sidebar>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/reports/student"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Sidebar>
                        <StudentReports />
                      </Sidebar>
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
    </div>
  );
};

export default App; 