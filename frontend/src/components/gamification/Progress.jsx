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
  GiftIcon
} from '@heroicons/react/24/outline';

const Progress = () => {
  const { user, token } = useAuth();
  const [progress, setProgress] = useState(null);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress();
    fetchBadges();
    fetchLeaderboard();
  }, [token]);

  const fetchProgress = async () => {
    try {
      const response = await axios.get('/api/gamification/progress');
      setProgress(response.data);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to fetch progress data');
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await axios.get('/api/gamification/badges');
      setBadges(response.data);
    } catch (err) {
      console.error('Error fetching badges:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/gamification/leaderboard?limit=10');
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
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

        {progress && (
          <>
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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
              transition={{ delay: 0.2 }}
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

        {/* Badges Section */}
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

        {/* Leaderboard */}
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
                      <p className="text-sm text-gray-600">{entry.user?.classGrade}</p>
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
      </div>
    </div>
  );
};

export default Progress;
