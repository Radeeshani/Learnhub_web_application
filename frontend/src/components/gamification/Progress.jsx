import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  ChartBarIcon,
  GiftIcon,
  SparklesIcon,
  FlagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Progress = () => {
  const { user, token } = useAuth();
  const [progress, setProgress] = useState(null);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProgress(),
        fetchBadges(),
        fetchLeaderboard(),
        fetchCurrentLevel(),
        fetchNextLevel(),
        fetchChallenges()
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get('/api/gamification/progress', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProgress(response.data);
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await axios.get('/api/gamification/badges', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBadges(response.data);
    } catch (err) {
      console.error('Error fetching badges:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/gamification/leaderboard?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const fetchCurrentLevel = async () => {
    try {
      const response = await axios.get('/api/gamification/levels/current', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCurrentLevel(response.data);
    } catch (err) {
      console.error('Error fetching current level:', err);
    }
  };

  const fetchNextLevel = async () => {
    try {
      const response = await axios.get('/api/gamification/levels/next', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNextLevel(response.data);
    } catch (err) {
      console.error('Error fetching next level:', err);
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await axios.get('/api/gamification/challenges', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setChallenges(response.data);
    } catch (err) {
      console.error('Error fetching challenges:', err);
    }
  };

  const getLevelColor = (color) => {
    const colorMap = {
      'Bronze': 'from-amber-600 to-orange-600',
      'Silver': 'from-gray-400 to-gray-600',
      'Gold': 'from-yellow-400 to-yellow-600',
      'Platinum': 'from-slate-300 to-slate-500',
      'Diamond': 'from-cyan-300 to-blue-500'
    };
    return colorMap[color] || 'from-gray-400 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Progress & Achievements
          </h1>
          <p className="text-xl text-gray-600">
            Track your learning journey and celebrate your accomplishments!
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-lg p-1 shadow-lg">
            {['overview', 'levels', 'challenges', 'badges', 'leaderboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-sky-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && progress && (
          <>
            {/* Level Display */}
            {currentLevel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-center"
              >
                <div className={`w-24 h-24 bg-gradient-to-r ${getLevelColor(currentLevel.color)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <TrophyIcon className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Level {currentLevel.levelNumber}: {currentLevel.name}
                </h2>
                <p className="text-gray-600 mb-4">{currentLevel.specialPrivileges}</p>
                
                {nextLevel && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Next Level: {nextLevel.name} ({nextLevel.pointsRequired - progress.totalPoints} points needed)
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-sky-500 h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, Math.max(0, ((progress.totalPoints - (nextLevel.pointsRequired - (nextLevel.pointsRequired - progress.totalPoints))) / (nextLevel.pointsRequired - (nextLevel.pointsRequired - (nextLevel.pointsRequired - progress.totalPoints)))) * 100))}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {/* Total Points */}
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrophyIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{progress.totalPoints}</h3>
                <p className="text-gray-600">Total Points</p>
              </div>

              {/* Current Streak */}
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FireIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{progress.currentStreak}</h3>
                <p className="text-gray-600">Day Streak</p>
              </div>

              {/* Homework Completed */}
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{progress.homeworkCompleted}</h3>
                <p className="text-gray-600">Homeworks</p>
              </div>

              {/* Perfect Scores */}
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{progress.perfectScores}</h3>
                <p className="text-gray-600">Perfect Scores</p>
              </div>
            </motion.div>

            {/* Progress Bars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2 text-sky-600" />
                Progress Breakdown
              </h2>
              
              <div className="space-y-6">
                {/* On-time Submissions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">On-time Submissions</span>
                    <span className="text-sm text-gray-500">
                      {progress.onTimeSubmissions} / {progress.totalSubmissions}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.totalSubmissions > 0 ? (progress.onTimeSubmissions / progress.totalSubmissions) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Perfect Score Rate */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Perfect Score Rate</span>
                    <span className="text-sm text-gray-500">
                      {progress.perfectScores} / {progress.totalSubmissions}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.totalSubmissions > 0 ? (progress.perfectScores / progress.totalSubmissions) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Levels Tab */}
        {activeTab === 'levels' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <SparklesIcon className="h-6 w-6 mr-2 text-sky-600" />
              Level Progression
            </h2>
            
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((level) => {
                const isCurrentLevel = currentLevel && currentLevel.levelNumber === level;
                const isUnlocked = progress && progress.totalPoints >= (level === 1 ? 0 : level === 2 ? 100 : level === 3 ? 500 : level === 4 ? 1000 : 2500);
                
                return (
                  <div
                    key={level}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCurrentLevel
                        ? 'border-sky-500 bg-sky-50'
                        : isUnlocked
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCurrentLevel
                            ? 'bg-sky-500 text-white'
                            : isUnlocked
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-400 text-white'
                        }`}>
                          {level}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${
                            isCurrentLevel ? 'text-sky-800' : isUnlocked ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            Level {level}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {level === 1 ? 'Novice' : level === 2 ? 'Apprentice' : level === 3 ? 'Scholar' : level === 4 ? 'Master' : 'Grandmaster'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {level === 1 ? '0' : level === 2 ? '100' : level === 3 ? '500' : level === 4 ? '1000' : '2500'} points
                        </p>
                        {isCurrentLevel && (
                          <p className="text-xs text-sky-600">Current Level</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FlagIcon className="h-6 w-6 mr-2 text-sky-600" />
              Active Challenges
            </h2>
            
            {challenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      challenge.isCompleted
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">{challenge.rewardIcon}</div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full">
                          {challenge.type}
                        </span>
                        <p className="text-sm font-medium text-gray-700 mt-1">
                          {challenge.pointsReward} points
                        </p>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {challenge.userProgress} / {challenge.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            challenge.isCompleted ? 'bg-green-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${challenge.completionPercentage}%` }}
                        ></div>
                      </div>
                </div>
                    
                    {challenge.isCompleted && (
                      <div className="mt-3 p-2 bg-green-100 rounded-lg text-center">
                        <p className="text-sm text-green-800 font-medium">🎉 Challenge Completed!</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FlagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No active challenges available at the moment.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <GiftIcon className="h-6 w-6 mr-2 text-sky-600" />
              Your Badges
            </h2>
            
            {badges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-2 border-gray-200 rounded-xl p-4 text-center hover:border-sky-300 transition-colors"
                  >
                    <div className="text-4xl mb-2">{badge.iconUrl}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                    <div className="inline-flex items-center px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full">
                      {badge.pointsRequired} points
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GiftIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No badges earned yet. Keep working hard to earn your first badge!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrophyIcon className="h-6 w-6 mr-2 text-sky-600" />
              Top Performers
            </h2>
            
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300' :
                      index === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300' :
                      index === 2 ? 'bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300' :
                      'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-500 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-sky-500 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {entry.user?.firstName} {entry.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">Level {entry.currentLevel}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{entry.totalPoints} pts</p>
                      <p className="text-sm text-gray-600">{entry.homeworkCompleted} homeworks</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No leaderboard data available yet.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Progress;
