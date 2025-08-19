import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, PlusIcon, ArrowLeftIcon, SparklesIcon, StarIcon, FireIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Calendar = () => {
  const { user, token } = useAuth();
  const { showSuccess, showError } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    allDay: false,
    eventType: 'CUSTOM',
    color: '#3B82F6',
    location: ''
  });

  // Check if user can add events (only teachers and admins)
  const canAddEvents = user && (user.role === 'TEACHER' || user.role === 'ADMIN');

  // Navigate back to dashboard
  const navigateBack = () => {
    window.history.back();
  };

  // Fetch calendar events
  const fetchEvents = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/homework/calendar/events?view=${view}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || data); // Handle both response formats
      } else {
        showError('Failed to fetch calendar events', 'Please try again later');
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      showError('Failed to fetch calendar events', 'Please check your connection');
    } finally {
      setLoading(false);
    }
  };

  // Search events
  const searchEvents = async () => {
    if (!searchQuery.trim() || !token) return;
    
    try {
      setLoading(true);
      // For now, we'll implement search in the backend later
      // For now, just fetch all events and filter client-side
      const response = await fetch(`http://localhost:8080/api/homework/calendar/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allEvents = data.events || data;
        // Filter events by search query
        const filteredEvents = allEvents.filter(event => 
          event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setEvents(filteredEvents);
      } else {
        showError('Search failed', 'Please try again later');
      }
    } catch (error) {
      console.error('Error searching events:', error);
      showError('Search failed', 'Please check your connection');
    } finally {
      setLoading(false);
    }
  };

  // Create new event
  const createEvent = async () => {
    if (!token || !canAddEvents) return;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/homework/calendar/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEvent)
      });
      
      if (response.ok) {
        showSuccess('Event created successfully', 'The calendar event has been added');
        setShowAddEventModal(false);
        setNewEvent({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          allDay: false,
          eventType: 'CUSTOM',
          color: '#3B82F6',
          location: ''
        });
        fetchEvents(); // Refresh events
      } else {
        showError('Failed to create event', 'Please try again later');
      }
    } catch (error) {
      console.error('Error creating event', error);
      showError('Failed to create event', 'Please check your connection');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get month data
  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateObj = new Date(startDate);
    
    while (currentDateObj <= lastDay || days.length < 42) {
      days.push(new Date(currentDateObj));
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get event type color with fun gradients
  const getEventTypeColor = (eventType) => {
    const colors = {
      'HOMEWORK_DUE': 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
      'HOMEWORK_ASSIGNED': 'linear-gradient(135deg, #4ECDC4, #44A08D)',
      'CLASS_SESSION': 'linear-gradient(135deg, #A8E6CF, #7FCDCD)',
      'EXAM': 'linear-gradient(135deg, #FFD93D, #FF6B6B)',
      'HOLIDAY': 'linear-gradient(135deg, #FF9A9E, #FECFEF)',
      'MEETING': 'linear-gradient(135deg, #A8CABA, #5D4E75)',
      'REMINDER': 'linear-gradient(135deg, #FFB347, #FFCC5C)',
      'CUSTOM': 'linear-gradient(135deg, #B8E6B8, #7FB3D3)'
    };
    return colors[eventType] || 'linear-gradient(135deg, #B8E6B8, #7FB3D3)';
  };

  // Get event type icon with fun emojis
  const getEventTypeIcon = (eventType) => {
    const icons = {
      'HOMEWORK_DUE': '📚',
      'HOMEWORK_ASSIGNED': '📝',
      'CLASS_SESSION': '🏫',
      'EXAM': '📋',
      'HOLIDAY': '🎉',
      'MEETING': '🤝',
      'REMINDER': '⏰',
      'CUSTOM': '✨'
    };
    return icons[eventType] || '✨';
  };

  // Get fun background patterns for calendar days
  const getDayBackground = (date, isCurrentMonth, isToday) => {
    if (isToday) {
      return 'bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 animate-pulse';
    }
    if (!isCurrentMonth) {
      return 'bg-gray-100';
    }
    // Add subtle patterns for current month days
    const dayOfWeek = date.getDay();
    const patterns = [
      'bg-gradient-to-br from-blue-50 to-indigo-50',
      'bg-gradient-to-br from-green-50 to-emerald-50',
      'bg-gradient-to-br from-purple-50 to-pink-50',
      'bg-gradient-to-br from-yellow-50 to-orange-50',
      'bg-gradient-to-br from-red-50 to-pink-50',
      'bg-gradient-to-br from-indigo-50 to-purple-50',
      'bg-gradient-to-br from-emerald-50 to-teal-50'
    ];
    return patterns[dayOfWeek];
  };

  useEffect(() => {
    fetchEvents();
  }, [view, currentDate]);

  const monthData = getMonthData();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fun Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={navigateBack}
                className="group inline-flex items-center px-4 py-3 border-2 border-purple-300 shadow-lg text-sm leading-4 font-medium rounded-xl text-purple-700 bg-white hover:bg-purple-50 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                <span className="font-bold">Back to Dashboard</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <SparklesIcon className="h-8 w-8 text-yellow-500 animate-pulse" />
                  <StarIcon className="h-8 w-8 text-pink-500 animate-bounce" />
                  <FireIcon className="h-8 w-8 text-orange-500 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  ✨ Student Calendar ✨
                </h1>
              </div>
            </div>
            
            {/* Add Event Button - Only for Teachers and Admins */}
            {canAddEvents && (
              <button
                onClick={() => setShowAddEventModal(true)}
                className="group inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl animate-pulse"
              >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-bold">Add Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Fun Search and View Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <div className="relative group">
              <input
                type="text"
                placeholder="🔍 Search for exciting events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300 transform group-hover:scale-105 shadow-lg"
              />
              <MagnifyingGlassIcon className="h-6 w-6 text-purple-400 absolute left-4 top-4 group-hover:animate-bounce" />
            </div>
          </div>
          
          <div className="flex gap-3">
            {['today', 'week', 'month'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`group px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                  view === viewType 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl scale-110' 
                    : 'bg-white text-gray-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 shadow-lg hover:shadow-xl'
                }`}
              >
                <span className="capitalize">{viewType}</span>
                {view === viewType && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Fun Month Navigation */}
        <div className="mb-8 flex items-center justify-between bg-white rounded-3xl p-6 shadow-2xl border-2 border-purple-100">
          <button
            onClick={goToPreviousMonth}
            className="group p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
          >
            <ChevronLeftIcon className="h-8 w-8 text-purple-600 group-hover:animate-bounce" />
          </button>
          
          <div className="flex items-center space-x-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToToday}
              className="group px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 hover:shadow-xl animate-pulse"
            >
              🎯 Today
            </button>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="group p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
          >
            <ChevronRightIcon className="h-8 w-8 text-purple-600 group-hover:animate-bounce" />
          </button>
        </div>

        {/* Month Summary - Shows event statistics and busy days */}
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 shadow-lg border-2 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-green-800 flex items-center">
              📊 {monthNames[currentDate.getMonth()]} Summary
              <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Event Overview
              </span>
            </h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Events */}
            <div className="bg-white p-3 rounded-xl border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-600">
                {events.filter(event => {
                  const eventDate = new Date(event.startTime);
                  return eventDate.getMonth() === currentDate.getMonth() && 
                         eventDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </div>
              <div className="text-sm text-green-700 font-semibold">Total Events</div>
            </div>
            
            {/* Days with Events */}
            <div className="bg-white p-3 rounded-xl border border-green-200 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(() => {
                  const daysWithEvents = new Set(events
                    .filter(event => {
                      const eventDate = new Date(event.startTime);
                      return eventDate.getMonth() === currentDate.getMonth() && 
                             eventDate.getFullYear() === currentDate.getFullYear();
                    })
                    .map(event => new Date(event.startTime).getDate())
                  );
                  return daysWithEvents.size;
                })()}
              </div>
              <div className="text-sm text-blue-700 font-semibold">Busy Days</div>
            </div>
            
            {/* Multiple Events Days */}
            <div className="bg-white p-3 rounded-xl border border-green-200 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(() => {
                  const dayEventCounts = {};
                  events.filter(event => {
                    const eventDate = new Date(event.startTime);
                    return eventDate.getMonth() === currentDate.getMonth() && 
                           eventDate.getFullYear() === currentDate.getFullYear();
                  }).forEach(event => {
                    const day = new Date(event.startTime).getDate();
                    dayEventCounts[day] = (dayEventCounts[day] || 0) + 1;
                  });
                  return Object.values(dayEventCounts).filter(count => count > 1).length;
                })()}
              </div>
              <div className="text-sm text-purple-700 font-semibold">Multi-Event Days</div>
            </div>
            
            {/* Event Types */}
            <div className="bg-white p-3 rounded-xl border border-green-200 text-center">
              <div className="text-2xl font-bold text-pink-600">
                {(() => {
                  const eventTypes = new Set(events
                    .filter(event => {
                      const eventDate = new Date(event.startTime);
                      return eventDate.getMonth() === currentDate.getMonth() && 
                             eventDate.getFullYear() === currentDate.getFullYear();
                    })
                    .map(event => event.eventType)
                  );
                  return eventTypes.size;
                })()}
              </div>
              <div className="text-sm text-pink-700 font-semibold">Event Types</div>
            </div>
          </div>
          
          {/* Busy Days Highlight */}
          {(() => {
            const dayEventCounts = {};
            events.filter(event => {
              const eventDate = new Date(event.startTime);
              return eventDate.getMonth() === currentDate.getMonth() && 
                     eventDate.getFullYear() === currentDate.getFullYear();
            }).forEach(event => {
              const day = new Date(event.startTime).getDate();
              dayEventCounts[day] = (dayEventCounts[day] || 0) + 1;
            });
            
            const busyDays = Object.entries(dayEventCounts)
              .filter(([day, count]) => count > 1)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);
            
            if (busyDays.length === 0) return null;
            
            return (
              <div className="mt-4 pt-4 border-t border-green-200">
                <h5 className="text-sm font-semibold text-green-700 mb-2">🔥 Busiest Days This Month:</h5>
                <div className="flex flex-wrap gap-2">
                  {busyDays.map(([day, count]) => (
                    <div key={day} className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold border border-orange-200">
                      {monthNames[currentDate.getMonth()]} {day}: {count} events
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Quick Jump to Events - Shows months with events */}
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 shadow-lg border-2 border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-yellow-800 flex items-center">
              🚀 Quick Jump to Events
              <span className="ml-2 text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Navigate quickly
              </span>
            </h4>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(() => {
              // Get unique months with events
              const monthsWithEvents = [...new Set(events.map(event => {
                const eventDate = new Date(event.startTime);
                return `${eventDate.getFullYear()}-${eventDate.getMonth()}`;
              }))].sort();
              
              return monthsWithEvents.map(monthKey => {
                const [year, month] = monthKey.split('-').map(Number);
                const monthName = monthNames[month];
                const monthEvents = events.filter(event => {
                  const eventDate = new Date(event.startTime);
                  return eventDate.getFullYear() === year && eventDate.getMonth() === month;
                });
                
                const isCurrentMonth = year === currentDate.getFullYear() && month === currentDate.getMonth();
                
                return (
                  <button
                    key={monthKey}
                    onClick={() => {
                      setCurrentDate(new Date(year, month, 1));
                    }}
                    className={`group px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      isCurrentMonth
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105'
                        : 'bg-white text-yellow-700 border-2 border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{monthName} {year}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        isCurrentMonth
                          ? 'bg-white/20 text-white'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {monthEvents.length} events
                      </span>
                    </span>
                  </button>
                );
              });
            })()}
            
            {events.length === 0 && (
              <div className="text-yellow-600 text-sm italic">
                No events scheduled yet
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events Widget - Shows events from next 30 days */}
        <div className="mb-8 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-3xl p-6 shadow-xl border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
              🔮 Upcoming Events
              <span className="ml-2 text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
                Next 30 Days
              </span>
            </h3>
            <button
              onClick={() => {
                // Show upcoming events in a modal or expand the widget
                setView('upcoming');
              }}
              className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors"
            >
              View All →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events
              .filter(event => {
                const eventDate = new Date(event.startTime);
                const now = new Date();
                const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
                return eventDate > now && eventDate <= thirtyDaysFromNow;
              })
              .slice(0, 6) // Show max 6 upcoming events
              .map((event, index) => (
                <div
                  key={event.id || index}
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventModal(true);
                  }}
                  className="group bg-white p-4 rounded-2xl shadow-lg border-2 border-transparent hover:border-purple-300 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                      style={{ background: getEventTypeColor(event.eventType) }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getEventTypeIcon(event.eventType)}</span>
                        <h4 className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                          {event.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {event.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-600 font-semibold">
                          {new Date(event.startTime).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {event.eventType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            
            {events.filter(event => {
              const eventDate = new Date(event.startTime);
              const now = new Date();
              const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
              return eventDate > now && eventDate <= thirtyDaysFromNow;
            }).length === 0 && (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-400 text-lg">
                  🎉 No upcoming events in the next 30 days!
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  Enjoy your free time! ✨
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fun Calendar Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              <div className="mt-4 text-center">
                <p className="text-xl font-bold text-purple-600 animate-pulse">Loading exciting events...</p>
                <p className="text-purple-400">✨ Getting your calendar ready ✨</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-100 transform hover:scale-[1.02] transition-transform duration-500">
            {/* Fun Day Headers */}
            <div className="grid grid-cols-7 gap-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} className="px-4 py-4 text-center">
                  <div className="text-white font-bold text-lg animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
                    {day}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Fun Calendar Days */}
            <div className="grid grid-cols-7 gap-1 bg-gradient-to-br from-purple-50 to-pink-50">
              {monthData.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();
                const dayEvents = getEventsForDate(date);
                
                // Check if there are events in future months
                const hasFutureEvents = events.some(event => {
                  const eventDate = new Date(event.startTime);
                  return eventDate.getMonth() > currentDate.getMonth() && 
                         eventDate.getFullYear() >= currentDate.getFullYear();
                });
                
                return (
                  <div
                    key={index}
                    className={`min-h-[140px] p-3 transition-all duration-300 transform hover:scale-105 hover:shadow-lg relative ${getDayBackground(date, isCurrentMonth, isToday)}`}
                  >
                    <div className={`text-lg font-bold mb-2 transition-all duration-300 ${
                      isToday 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg animate-bounce' 
                        : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    {/* Event Count Badge for Multiple Events */}
                    {dayEvents.length > 1 && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                          {dayEvents.length}
                        </div>
                      </div>
                    )}
                    
                    {/* Fun Events for this day */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event, eventIndex) => (
                        <div
                          key={event.id || eventIndex}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className="group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:rotate-1"
                          style={{ background: getEventTypeColor(event.eventType) }}
                        >
                          <div className="text-white font-bold text-xs p-2 rounded-lg shadow-lg border-2 border-white/20 group-hover:border-white/40 group-hover:shadow-xl">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm group-hover:animate-bounce">{getEventTypeIcon(event.eventType)}</span>
                              <span className="truncate group-hover:animate-pulse">{event.title}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Enhanced Multiple Events Display */}
                      {dayEvents.length > 3 && (
                        <div className="space-y-1">
                          {/* Show event count with fun styling */}
                          <div className="text-center">
                            <div className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse cursor-pointer hover:scale-110 transition-transform duration-300"
                                 onClick={() => {
                                   // Show all events for this day in a special modal
                                   setSelectedEvent({ 
                                     title: `${dayEvents.length} Events on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                                     description: `Multiple events scheduled for this day`,
                                     events: dayEvents,
                                     isMultiEvent: true
                                   });
                                   setShowEventModal(true);
                                 }}
                                 title={`Click to see all ${dayEvents.length} events`}>
                              +{dayEvents.length - 3} more events ✨
                            </div>
                          </div>
                          
                          {/* Event Type Summary */}
                          <div className="flex flex-wrap gap-1 justify-center">
                            {(() => {
                              const eventTypes = [...new Set(dayEvents.map(e => e.eventType))];
                              return eventTypes.slice(0, 3).map((eventType, idx) => (
                                <div key={idx} className="w-2 h-2 rounded-full animate-pulse"
                                     style={{ background: getEventTypeColor(eventType) }}></div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Future Events Indicator */}
                    {!isCurrentMonth && hasFutureEvents && (
                      <div className="mt-2 text-center">
                        <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse cursor-pointer hover:scale-110 transition-transform duration-300"
                             title="Click to see future events"
                             onClick={() => {
                               // Show future events modal
                               const futureEvents = events.filter(event => {
                                 const eventDate = new Date(event.startTime);
                                 return eventDate.getMonth() > currentDate.getMonth() && 
                                        eventDate.getFullYear() >= currentDate.getFullYear();
                               });
                               if (futureEvents.length > 0) {
                                 // Show a preview of future events
                                 alert(`🔮 You have ${futureEvents.length} events in future months!\n\nCheck the "Upcoming Events" widget above to see them all!`);
                               }
                             }}>
                          🔮 Future Events
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fun Search Button */}
        {searchQuery.trim() && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={searchEvents}
              className="group px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white text-lg font-bold rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl animate-pulse"
            >
              🔍 Search Events
            </button>
          </div>
        )}

        {/* Future Events Summary - Shows events beyond current month */}
        {(() => {
          const futureEvents = events.filter(event => {
            const eventDate = new Date(event.startTime);
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            return (eventDate.getFullYear() > currentYear) || 
                   (eventDate.getFullYear() === currentYear && eventDate.getMonth() > currentMonth);
          });
          
          if (futureEvents.length === 0) return null;
          
          return (
            <div className="mt-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 shadow-xl border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                  🌟 Future Events Beyond {monthNames[currentDate.getMonth()]}
                  <span className="ml-2 text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
                    {futureEvents.length} events
                  </span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {futureEvents.slice(0, 6).map((event, index) => (
                  <div
                    key={event.id || index}
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventModal(true);
                    }}
                    className="group bg-white p-4 rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-300 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                        style={{ background: getEventTypeColor(event.eventType) }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getEventTypeIcon(event.eventType)}</span>
                          <h4 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                            {event.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {event.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-indigo-600 font-semibold">
                            {new Date(event.startTime).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                            {event.eventType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {futureEvents.length > 6 && (
                  <div className="col-span-full text-center py-4">
                    <button
                      onClick={() => {
                        // Navigate to the month with the most future events
                        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                        setCurrentDate(nextMonth);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    >
                      🚀 View More Future Events
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Fun Event Details Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border-0 w-[600px] shadow-2xl rounded-3xl bg-gradient-to-br from-white via-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {selectedEvent.isMultiEvent ? (
                      <span>📅 {selectedEvent.title}</span>
                    ) : (
                      <span>{getEventTypeIcon(selectedEvent.eventType)} {selectedEvent.title}</span>
                    )}
                  </h3>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="text-purple-400 hover:text-purple-600 p-2 rounded-full hover:bg-purple-100 transition-all duration-300 transform hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
                
                {selectedEvent.isMultiEvent ? (
                  /* Multi-Event View */
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border-l-4 border-purple-500">
                      <p className="text-gray-800 text-lg font-semibold">
                        {selectedEvent.description}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedEvent.events.map((event, index) => (
                        <div
                          key={event.id || index}
                          className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                          onClick={() => {
                            // Show individual event details
                            setSelectedEvent(event);
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                              style={{ background: getEventTypeColor(event.eventType) }}
                            ></div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-xl">{getEventTypeIcon(event.eventType)}</span>
                                <h4 className="font-bold text-gray-900 hover:text-purple-600 transition-colors">
                                  {event.title}
                                </h4>
                              </div>
                              
                              {event.description && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="text-purple-600 font-semibold">⏰ Start:</span>
                                  <span className="text-gray-700">
                                    {new Date(event.startTime).toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      hour12: true 
                                    })}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-purple-600 font-semibold">🏁 End:</span>
                                  <span className="text-gray-700">
                                    {new Date(event.endTime).toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      hour12: true 
                                    })}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-purple-600 font-semibold">🎯 Type:</span>
                                  <span className="text-gray-700 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                                    {event.eventType.replace('_', ' ')}
                                  </span>
                                </div>
                                
                                {event.location && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-purple-600 font-semibold">📍 Location:</span>
                                    <span className="text-gray-700">{event.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setShowEventModal(false)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                      >
                        ✨ Close ✨
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Single Event View */
                  <div className="space-y-6">
                    {/* Fun Description Section */}
                    {selectedEvent.description ? (
                      <div className="group">
                        <h4 className="text-lg font-bold text-purple-700 mb-3 flex items-center">
                          📝 Description
                          <span className="ml-2 text-sm bg-purple-100 text-purple-600 px-2 py-1 rounded-full">✨</span>
                        </h4>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border-l-4 border-purple-500 shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                          <p className="text-gray-800 text-lg leading-relaxed">
                            {selectedEvent.description}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-gray-400 text-lg italic bg-gray-100 p-4 rounded-2xl">
                          🎭 No description provided
                        </div>
                      </div>
                    )}
                    
                    {/* Fun Event Details */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200">
                          <span className="text-sm font-bold text-blue-700">🎯 Event Type</span>
                          <div className="text-blue-900 bg-white px-3 py-1 rounded-lg mt-1 font-semibold">
                            {selectedEvent.eventType.replace('_', ' ')}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
                          <span className="text-sm font-bold text-green-700">⏰ Start Time</span>
                          <div className="text-green-900 bg-white px-3 py-1 rounded-lg mt-1 font-semibold">
                            {new Date(selectedEvent.startTime).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200">
                          <span className="text-sm font-bold text-purple-700">🏁 End Time</span>
                          <div className="text-purple-900 bg-white px-3 py-1 rounded-lg mt-1 font-semibold">
                            {new Date(selectedEvent.endTime).toLocaleString()}
                          </div>
                        </div>
                        
                        {selectedEvent.location && (
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-xl border border-yellow-200">
                            <span className="text-sm font-bold text-yellow-700">📍 Location</span>
                            <div className="text-yellow-900 bg-white px-3 py-1 rounded-lg mt-1 font-semibold">
                              {selectedEvent.location}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {selectedEvent.allDay && (
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-xl border border-green-300">
                          <span className="text-sm font-bold text-green-700">🌟 Duration</span>
                          <div className="text-green-900 bg-white px-3 py-1 rounded-lg mt-1 font-semibold animate-pulse">
                            🎉 All Day Event 🎉
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.recurring && (
                        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-xl border border-blue-300">
                          <span className="text-sm font-bold text-blue-700">🔄 Recurring</span>
                          <div className="text-blue-900 bg-white px-3 py-1 rounded-lg mt-1 font-semibold animate-pulse">
                            {selectedEvent.recurrencePattern || '🔄 Recurring Event 🔄'}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={() => setShowEventModal(false)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                      >
                        ✨ Close ✨
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fun Add Event Modal - Only for Teachers and Admins */}
        {showAddEventModal && canAddEvents && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border-0 w-[500px] shadow-2xl rounded-3xl bg-gradient-to-br from-white via-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ✨ Add New Event ✨
                  </h3>
                  <button
                    onClick={() => setShowAddEventModal(false)}
                    className="text-blue-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-all duration-300 transform hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-2">🎯 Event Title</label>
                    <input
                      type="text"
                      name="title"
                      value={newEvent.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 text-lg transition-all duration-300 transform focus:scale-105"
                      placeholder="Enter exciting event title..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-2">📝 Description</label>
                    <textarea
                      name="description"
                      value={newEvent.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 text-lg transition-all duration-300 transform focus:scale-105"
                      placeholder="Describe your amazing event..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-blue-700 mb-2">🚀 Start Time</label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={newEvent.startTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 transform focus:scale-105"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-blue-700 mb-2">🏁 End Time</label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={newEvent.endTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 transform focus:scale-105"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-blue-700 mb-2">🎨 Event Type</label>
                      <select
                        name="eventType"
                        value={newEvent.eventType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 transform focus:scale-105"
                      >
                        <option value="CUSTOM">✨ Custom</option>
                        <option value="CLASS_SESSION">🏫 Class Session</option>
                        <option value="EXAM">📋 Exam</option>
                        <option value="HOLIDAY">🎉 Holiday</option>
                        <option value="MEETING">🤝 Meeting</option>
                        <option value="REMINDER">⏰ Reminder</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-blue-700 mb-2">🎨 Color</label>
                      <input
                        type="color"
                        name="color"
                        value={newEvent.color}
                        onChange={handleInputChange}
                        className="w-full h-12 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 transform focus:scale-105"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-2">📍 Location</label>
                    <input
                      type="text"
                      name="location"
                      value={newEvent.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 text-lg transition-all duration-300 transform focus:scale-105"
                      placeholder="Where's the event happening?"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="allDay"
                      checked={newEvent.allDay}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 focus:ring-4 focus:ring-blue-200 border-blue-300 rounded-lg transition-all duration-300"
                    />
                    <label className="ml-3 block text-lg font-bold text-blue-700">🌟 All day event</label>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowAddEventModal(false)}
                    className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    ❌ Cancel
                  </button>
                  <button
                    onClick={createEvent}
                    disabled={loading || !newEvent.title || !newEvent.startTime}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? '✨ Creating... ✨' : '🚀 Create Event 🚀'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
