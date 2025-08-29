import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// SECURITY: Manual progress updates have been removed to prevent cheating
// Challenge progress now updates automatically based on actual actions only
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  ChartBarIcon,
  GiftIcon,
  SparklesIcon,
  FlagIcon,
  ClockIcon,
  ArrowUpIcon,
  BoltIcon,
  HeartIcon,
  HomeIcon,
  UserGroupIcon,
  BookOpenIcon,
  ArrowRightIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const GamificationDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [progress, setProgress] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [allLevels, setAllLevels] = useState([]);
  
  // Animation states
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showChallengeComplete, setShowChallengeComplete] = useState(false);

  useEffect(() => {
    if (token) {
      fetchAllGamificationData();
    }
  }, [token]);

  const fetchAllGamificationData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [
        progressRes,
        currentLevelRes,
        nextLevelRes,
        challengesRes,
        badgesRes,
        leaderboardRes,
        allLevelsRes
      ] = await Promise.all([
        axios.get('/api/gamification/progress', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/gamification/levels/current', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/gamification/levels/next', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/gamification/challenges', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/gamification/badges', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/gamification/leaderboard?limit=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/gamification/levels/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setProgress(progressRes.data);
      setCurrentLevel(currentLevelRes.data);
      setNextLevel(nextLevelRes.data);
      setChallenges(challengesRes.data);
      setBadges(badgesRes.data);
      setLeaderboard(leaderboardRes.data);
      setAllLevels(allLevelsRes.data);
      
    } catch (err) {
      console.error('Error fetching gamification data:', err);
      setError('Failed to load gamification data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // REMOVED: Manual challenge progress update function to prevent cheating
  // Progress is now automatically updated through actual actions only

  const getLevelColor = (color) => {
    const colorMap = {
      'Bronze': 'from-amber-500 to-orange-600',
      'Silver': 'from-gray-400 to-gray-600',
      'Gold': 'from-yellow-400 to-orange-500',
      'Platinum': 'from-teal-400 to-coral-500',
      'Diamond': 'from-purple-500 to-yellow-500'
    };
    return colorMap[color] || 'from-teal-400 to-coral-500';
  };

  const getProgressToNextLevel = () => {
    if (!progress || !nextLevel) return 0;
    const currentLevelPoints = currentLevel?.pointsRequired || 0;
    const nextLevelPoints = nextLevel.pointsRequired;
    const userPoints = progress.totalPoints;
    
    if (nextLevelPoints <= userPoints) return 100;
    
    const pointsRange = nextLevelPoints - currentLevelPoints;
    const userProgress = userPoints - currentLevelPoints;
    
    return Math.min(100, Math.max(0, (userProgress / pointsRange) * 100));
  };

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'STUDENT':
        return '/student';
      case 'TEACHER':
        return '/teacher';
      case 'ADMIN':
        return '/admin';
      case 'PARENT':
        return '/parent';
      default:
        return '/';
    }
  };

  const getDashboardName = () => {
    switch (user?.role) {
      case 'STUDENT':
        return 'Student Dashboard';
      case 'TEACHER':
        return 'Teacher Dashboard';
      case 'ADMIN':
        return 'Admin Dashboard';
      case 'PARENT':
        return 'Parent Dashboard';
      default:
        return 'Dashboard';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-teal-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-teal-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-xl text-teal-700 font-semibold mt-6">Loading your gamification journey...</p>
          <p className="text-coral-500 mt-2">Preparing amazing rewards and challenges!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={fetchAllGamificationData}
              className="btn-primary bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate(getDashboardRoute())}
              className="btn-secondary bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              Go to {getDashboardName()}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-coral-50">
      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-gradient-to-r from-teal-500 to-coral-500 rounded-full p-12 shadow-2xl border-4 border-white">
              <div className="text-center text-white">
                <TrophyIcon className="h-32 w-32 mx-auto mb-6 text-yellow-300" />
                <h2 className="text-5xl font-bold mb-4">🎉 LEVEL UP! 🎉</h2>
                <p className="text-2xl">Congratulations! You've reached {nextLevel?.name}!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Complete Animation */}
      <AnimatePresence>
        {showChallengeComplete && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-40 border-2 border-white/20"
          >
            <div className="flex items-center space-x-3">
              <StarIcon className="h-8 w-8 text-yellow-300" />
              <span className="text-xl font-bold">Challenge Completed! 🎉</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-teal-400 to-coral-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-r from-purple-400 to-yellow-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-r from-coral-400 to-teal-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-10 w-14 h-14 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-white/20 to-coral-50/30 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(20,184,166,0.1),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.1),transparent_50%)] pointer-events-none"></div>
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-coral-600 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-coral-500 rounded-3xl flex items-center justify-center mr-6 shadow-2xl">
                  <TrophyIcon className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-6xl font-bold bg-gradient-to-r from-teal-600 to-coral-600 bg-clip-text text-transparent mb-2">
                    🎮 Learning Adventure Hub
                  </h1>
                  <p className="text-2xl text-gray-700">
                    Level up, complete challenges, and earn amazing rewards!
                  </p>
                </div>
              </div>
              
              {/* Enhanced Description */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-100 to-coral-100 px-6 py-3 rounded-2xl border border-teal-200">
                  <SparklesIcon className="h-6 w-6 text-teal-600" />
                  <span className="text-teal-800 font-semibold">Track your progress, earn rewards, and level up your learning journey!</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-3 shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-coral-50/50 opacity-60"></div>
            
            <div className="relative z-10 flex space-x-2">
              {[
                { id: 'overview', label: 'Overview', icon: ChartBarIcon, color: 'from-teal-500 to-coral-500' },
                { id: 'levels', label: 'Levels', icon: SparklesIcon, color: 'from-purple-500 to-yellow-500' },
                { id: 'challenges', label: 'Challenges', icon: FlagIcon, color: 'from-coral-500 to-pink-500' },
                { id: 'badges', label: 'Badges', icon: GiftIcon, color: 'from-yellow-500 to-orange-500' },
                { id: 'leaderboard', label: 'Leaderboard', icon: TrophyIcon, color: 'from-teal-500 to-blue-500' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 flex items-center space-x-3 relative overflow-hidden group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-teal-600 to-coral-600 text-white shadow-xl transform scale-105'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/80 hover:shadow-lg'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Active tab indicator */}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-teal-600 to-coral-600 rounded-2xl"
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : `bg-gradient-to-r ${tab.color} text-white`
                    }`}>
                      <tab.icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">{tab.label}</span>
                  </div>
                  
                  {/* Hover effect */}
                  {activeTab !== tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-100 to-coral-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Current Level Display */}
            {currentLevel && (
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-coral-600 rounded-3xl blur-3xl opacity-20"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
                  <div className={`w-40 h-40 bg-gradient-to-r ${getLevelColor(currentLevel.color)} rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-110 transition-transform duration-300`}>
                    <TrophyIcon className="h-20 w-20 text-white" />
                  </div>
                  <h2 className="text-5xl font-bold text-gray-900 mb-4">
                    Level {currentLevel.levelNumber}: {currentLevel.name}
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">{currentLevel.specialPrivileges}</p>
                  
                  {nextLevel && (
                    <div className="card-gradient bg-gradient-to-r from-teal-500 to-coral-500 rounded-2xl p-8 border border-white/20">
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center">
                        <ArrowRightIcon className="h-6 w-6 mr-2" />
                        Next Level: {nextLevel.name}
                      </h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg text-white font-semibold">
                          {nextLevel.pointsRequired - progress.totalPoints} points needed
                        </span>
                        <span className="text-lg text-white font-semibold">
                          {Math.round(getProgressToNextLevel())}% complete
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-4">
                        <motion.div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-1000"
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgressToNextLevel()}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Points', value: progress.totalPoints, icon: TrophyIcon, color: 'from-yellow-400 to-orange-500', bgColor: 'from-yellow-50 to-orange-50' },
                { label: 'Current Streak', value: progress.currentStreak, icon: FireIcon, color: 'from-red-400 to-pink-500', bgColor: 'from-red-50 to-pink-50' },
                { label: 'Homeworks Completed', value: progress.homeworkCompleted, icon: AcademicCapIcon, color: 'from-teal-400 to-coral-500', bgColor: 'from-teal-50 to-coral-50' },
                { label: 'Perfect Scores', value: progress.perfectScores, icon: StarIcon, color: 'from-purple-400 to-yellow-500', bgColor: 'from-purple-50 to-yellow-50' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="relative overflow-hidden group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.bgColor} rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300`}></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20">
                    <div className={`w-20 h-20 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <stat.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                    <p className="text-gray-600 font-semibold">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Progress Bars */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-coral-600 rounded-2xl blur-3xl opacity-10"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center justify-center">
                  <ChartBarIcon className="h-8 w-8 mr-3 text-teal-600" />
                  Progress Breakdown
                </h2>
                
                <div className="space-y-8">
                  {[
                    { label: 'On-time Submissions', current: progress.onTimeSubmissions, total: progress.totalSubmissions, color: 'from-teal-400 to-coral-500', bgColor: 'from-teal-50 to-coral-50' },
                    { label: 'Perfect Score Rate', current: progress.perfectScores, total: progress.totalSubmissions, color: 'from-purple-400 to-yellow-500', bgColor: 'from-purple-50 to-yellow-50' }
                  ].map((item, index) => (
                    <div key={item.label} className="relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.bgColor} rounded-xl blur-xl opacity-30`}></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold text-gray-700">{item.label}</span>
                          <span className="text-lg font-bold text-gray-900">
                            {item.current} / {item.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <motion.div 
                            className={`bg-gradient-to-r ${item.color} h-4 rounded-full transition-all duration-1000`}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.total > 0 ? (item.current / item.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Levels Tab */}
        {activeTab === 'levels' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-coral-600 rounded-2xl blur-3xl opacity-10"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 mr-3 text-teal-600" />
                Level Progression System
              </h2>
              
              <div className="space-y-6">
                {allLevels.map((level, index) => {
                  const isCurrentLevel = currentLevel && currentLevel.levelNumber === level.levelNumber;
                  const isUnlocked = progress && progress.totalPoints >= level.pointsRequired;
                  
                  return (
                    <motion.div
                      key={level.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isCurrentLevel
                          ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-coral-50 shadow-xl'
                          : isUnlocked
                          ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg ${
                            isCurrentLevel
                              ? 'bg-gradient-to-r from-teal-500 to-coral-500 text-white'
                              : isUnlocked
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : 'bg-gray-400 text-white'
                          }`}>
                            {level.levelNumber}
                          </div>
                          <div>
                            <h3 className={`text-2xl font-bold ${
                              isCurrentLevel ? 'text-teal-800' : isUnlocked ? 'text-green-800' : 'text-gray-600'
                            }`}>
                              {level.name}
                            </h3>
                            <p className="text-gray-600 text-lg">{level.specialPrivileges}</p>
                            <p className="text-sm text-gray-500 mt-2 font-semibold">
                              Required: {level.pointsRequired} points
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {isCurrentLevel && (
                            <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-bold">
                              Current Level
                            </div>
                          )}
                          {isUnlocked && !isCurrentLevel && (
                            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold">
                              Unlocked
                            </div>
                          )}
                          {!isUnlocked && (
                            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-bold">
                              Locked
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-yellow-600 rounded-2xl blur-3xl opacity-10"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center justify-center">
                <FlagIcon className="h-8 w-8 mr-3 text-purple-600" />
                Active Challenges
              </h2>
              
              {challenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {challenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative overflow-hidden border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${
                        challenge.isCompleted
                          ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="text-4xl">{challenge.rewardIcon}</div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            challenge.type === 'DAILY' ? 'bg-blue-100 text-blue-800' :
                            challenge.type === 'WEEKLY' ? 'bg-purple-100 text-purple-800' :
                            challenge.type === 'MONTHLY' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {challenge.type}
                          </span>
                          <p className="text-xl font-bold text-gray-700 mt-3">
                            {challenge.pointsReward} points
                          </p>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{challenge.title}</h3>
                      <p className="text-gray-600 mb-6 text-lg">{challenge.description}</p>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-600 font-semibold">Progress</span>
                          <span className="font-bold">
                            {challenge.userProgress} / {challenge.target}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <motion.div 
                            className={`h-4 rounded-full transition-all duration-500 ${
                              challenge.isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-yellow-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${challenge.completionPercentage || 0}%` }}
                          />
                        </div>
                      </div>
                      
                      {!challenge.isCompleted && (
                        <div className="text-center py-3">
                          <p className="text-sm text-gray-600">
                            Progress updates automatically when you complete homework!
                          </p>
                        </div>
                      )}
                      
                      {challenge.isCompleted && (
                        <div className="p-4 bg-green-100 rounded-xl text-center">
                          <p className="text-green-800 font-bold text-lg">🎉 Challenge Completed!</p>
                          <p className="text-green-600 mt-1">
                            Earned {challenge.pointsReward} points
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <FlagIcon className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                  <p className="text-2xl font-semibold">No active challenges available</p>
                  <p className="text-lg mt-3">Check back later for new challenges!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-yellow-600 rounded-2xl blur-3xl opacity-10"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center justify-center">
                <GiftIcon className="h-8 w-8 mr-3 text-purple-600" />
                Your Badges & Achievements
              </h2>
              
              {badges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative overflow-hidden border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="text-6xl mb-6">{badge.iconUrl}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{badge.name}</h3>
                      <p className="text-gray-600 mb-6 text-lg">{badge.description}</p>
                      <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 text-sm rounded-full font-bold">
                        {badge.pointsRequired} points required
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <GiftIcon className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                  <p className="text-2xl font-semibold">No badges earned yet</p>
                  <p className="text-lg mt-3">Keep working hard to earn your first badge!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-coral-600 rounded-2xl blur-3xl opacity-10"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center justify-center">
                <TrophyIcon className="h-8 w-8 mr-3 text-teal-600" />
                Top Performers Leaderboard
              </h2>
              
              {leaderboard.length > 0 ? (
                <div className="space-y-6">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative overflow-hidden flex items-center justify-between p-6 rounded-2xl transition-all duration-300 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 shadow-xl' :
                        index === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300 shadow-lg' :
                        index === 2 ? 'bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 shadow-lg' :
                        'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-6">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-500 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {entry.user?.firstName} {entry.user?.lastName}
                          </p>
                          <p className="text-gray-600 text-lg">Level {entry.currentLevel || 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">{entry.totalPoints} pts</p>
                        <p className="text-lg text-gray-600">{entry.homeworkCompleted} homeworks</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <TrophyIcon className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                  <p className="text-2xl font-semibold">No leaderboard data available yet</p>
                  <p className="text-lg mt-3">Start completing homeworks to appear on the leaderboard!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GamificationDashboard;
