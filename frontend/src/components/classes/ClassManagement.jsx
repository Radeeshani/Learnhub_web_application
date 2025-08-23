import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon, UserGroupIcon, BookOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ClassFormModal from './ClassFormModal';
import ClassViewModal from './ClassViewModal';

const ClassManagement = () => {
  const { user, token, getDashboardRoute } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [filteredClasses, setFilteredClasses] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    className: '',
    subject: '',
    gradeLevel: '',
    description: '',
    scheduleInfo: '',
    roomNumber: '',
    academicYear: '',
    semester: '',
    maxStudents: 25
  });

  // Check if user can manage classes
  const canManageClasses = user && (user.role === 'TEACHER' || user.role === 'ADMIN');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    console.log('ClassManagement Component - User Info:', {
      user: user,
      role: user?.role,
      id: user?.id,
      token: token ? 'Present' : 'Missing'
    });
  }, [user, token]);

  useEffect(() => {
    filterClasses();
  }, [classes, searchQuery]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      
      // Always fetch all classes first for better user experience
              let url = '/api/homework/classes';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched classes data:', data);
        console.log('User role:', user?.role);
        console.log('User ID:', user?.id);
        setClasses(data);
      } else {
        showError('Failed to fetch classes');
      }
    } catch (error) {
      showError('Error fetching classes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    if (!searchQuery.trim()) {
      setFilteredClasses(classes);
      return;
    }
    
    const filtered = classes.filter(cls => 
      cls.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.gradeLevel?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClasses(filtered);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      // Debug user information
      console.log('Current user:', user);
      console.log('User role:', user?.role);
      console.log('User ID:', user?.id);
      console.log('Token present:', !!token);
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');

      // Prepare the request data
      const requestData = {
        className: formData.className,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel || null,
        description: formData.description || null,
        scheduleInfo: formData.scheduleInfo || null,
        roomNumber: formData.roomNumber || null,
        academicYear: formData.academicYear || null,
        semester: formData.semester || null,
        maxStudents: parseInt(formData.maxStudents) || 25,
        teacherId: user.id
      };

      console.log('Sending request data:', requestData);

              const response = await fetch('/api/homework/classes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const newClass = await response.json();
        console.log('Created class:', newClass);
        setClasses([...classes, newClass]);
        setShowCreateModal(false);
        resetForm();
        showSuccess('Class created successfully!');
        fetchClasses(); // Refresh the list
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        showError(`Failed to create class: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Exception during class creation:', error);
      showError('Error creating class: ' + error.message);
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
              const response = await fetch(`/api/homework/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          teacherId: user.id
        })
      });

      if (response.ok) {
        const updatedClass = await response.json();
        setClasses(classes.map(cls => cls.id === selectedClass.id ? updatedClass : cls));
        setShowEditModal(false);
        setSelectedClass(null);
        resetForm();
        showSuccess('Class updated successfully!');
        fetchClasses(); // Refresh the list
      } else {
        const errorData = await response.text();
        showError('Failed to update class: ' + errorData);
      }
    } catch (error) {
      showError('Error updating class: ' + error.message);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to deactivate this class? This action cannot be undone.')) {
      return;
    }

    try {
              const response = await fetch(`/api/homework/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setClasses(classes.map(cls => 
          cls.id === classId ? { ...cls, isActive: false } : cls
        ));
        showSuccess('Class deactivated successfully!');
        fetchClasses(); // Refresh the list
      } else {
        showError('Failed to deactivate class');
      }
    } catch (error) {
      showError('Error deactivating class: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      className: '',
      subject: '',
      gradeLevel: '',
      description: '',
      scheduleInfo: '',
      roomNumber: '',
      academicYear: '',
      semester: '',
      maxStudents: 25
    });
  };

  const openEditModal = (cls) => {
    setSelectedClass(cls);
    setFormData({
      className: cls.className || '',
      subject: cls.subject || '',
      gradeLevel: cls.gradeLevel || '',
      description: cls.description || '',
      scheduleInfo: cls.scheduleInfo || '',
      roomNumber: cls.roomNumber || '',
      academicYear: cls.academicYear || '',
      semester: cls.semester || '',
      maxStudents: cls.maxStudents || 25
    });
    setShowEditModal(true);
  };

  const openViewModal = async (cls) => {
    try {
              const response = await fetch(`/api/homework/classes/${cls.id}/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const classWithStats = await response.json();
        setSelectedClass(classWithStats);
        setShowViewModal(true);
      } else {
        showError('Failed to fetch class statistics');
      }
    } catch (error) {
      showError('Error fetching class statistics: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-purple-600 font-semibold">Loading Classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                🎓 Class Management
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage your classes, students, and homeworks
              </p>
            </div>
            
            {canManageClasses && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="group inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl animate-pulse"
              >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-bold">Create New Class</span>
              </button>
            )}
            <button
              onClick={() => navigate(getDashboardRoute())}
              className="group inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl animate-pulse"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-bold">Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-100">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes by name, subject, or grade level..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredClasses.length} of {classes.length} classes
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              {/* Class Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {cls.className || cls.subject}
                  </h3>
                  <p className="text-sm text-purple-600 font-semibold">
                    {cls.subject}
                  </p>
                  {cls.gradeLevel && (
                    <p className="text-xs text-gray-500 mt-1">
                      {cls.gradeLevel}
                    </p>
                  )}
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  cls.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {cls.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Class Description */}
              {cls.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {cls.description}
                </p>
              )}

              {/* Class Details */}
              <div className="space-y-2 mb-4">
                {cls.scheduleInfo && (
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpenIcon className="h-4 w-4 mr-2 text-purple-500" />
                    {cls.scheduleInfo}
                  </div>
                )}
                
                {cls.roomNumber && (
                  <div className="flex items-center text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2 text-blue-500" />
                    Room {cls.roomNumber}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-semibold mr-2">Max Students:</span>
                  {cls.maxStudents}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openViewModal(cls)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </button>
                
                {canManageClasses && (
                  <>
                    <button
                      onClick={() => openEditModal(cls)}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredClasses.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {searchQuery ? 'No classes found matching your search.' : 'No classes available yet.'}
            </div>
            {canManageClasses && !searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Create Your First Class
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <ClassFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateClass}
          formData={formData}
          setFormData={setFormData}
          title="Create New Class"
          submitText="Create Class"
        />
      )}

      {/* Edit Class Modal */}
      {showEditModal && (
        <ClassFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateClass}
          formData={formData}
          setFormData={setFormData}
          title="Edit Class"
          submitText="Update Class"
        />
      )}

      {/* View Class Modal */}
      {showViewModal && selectedClass && (
        <ClassViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          classData={selectedClass}
        />
      )}
    </div>
  );
};

export default ClassManagement;
