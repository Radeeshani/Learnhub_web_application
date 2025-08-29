import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  SparklesIcon,
  FlagIcon,
  ArrowUpIcon,
  BoltIcon,
  HeartIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const GamificationWidget = ({ compact = false, onViewDetails }) => {
  const { user, token } = useAuth();
  const [progress, setProgress] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchGamificationData();
    }
  }, [token]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      
      const [progressRes, currentLevelRes, nextLevelRes, challengesRes] = await Promise.all([
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
        })
      ]);

      setProgress(progressRes.data);
      setCurrentLevel(currentLevelRes.data);
      setNextLevel(nextLevelRes.data);
      setChallenges(challengesRes.data);
      
    } catch (err) {
      console.error('Error fetching gamification data:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const getActiveChallengesCount = () => {
    return challenges.filter(c => !c.isCompleted).length;
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-teal-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-teal-200 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-teal-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="card-gradient bg-gradient-to-r from-purple-500 to-yellow-500 p-4 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105" onClick={onViewDetails}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center">
            <TrophyIcon className="h-6 w-6 mr-2 text-yellow-300" />
            Learning Progress
          </h3>
          <span className="text-sm text-white/90 font-medium">View Details →</span>
        </div>
        
        {currentLevel && (
          <div className="text-center mb-3">
            <div className={`w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-white/30`}>
              <span className="text-white font-bold text-lg">{currentLevel.levelNumber}</span>
            </div>
            <p className="text-sm font-semibold text-white">{currentLevel.name}</p>
            <p className="text-xs text-white/80">{progress?.totalPoints || 0} points</p>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 border border-white/30">
            <p className="text-lg font-bold text-white">{progress?.currentStreak || 0}</p>
            <p className="text-xs text-white/80">Streak</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 border border-white/30">
            <p className="text-lg font-bold text-white">{progress?.homeworkCompleted || 0}</p>
            <p className="text-xs text-white/80">Done</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 border border-white/30">
            <p className="text-lg font-bold text-white">{getActiveChallengesCount()}</p>
            <p className="text-xs text-white/80">Active</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-teal-100 to-coral-100 rounded-2xl flex items-center justify-center">
            <TrophyIcon className="h-6 w-6 text-teal-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            Your Learning Journey
          </h3>
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="btn-secondary bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            View Full Dashboard
            <ArrowUpIcon className="h-4 w-4 ml-2" />
          </button>
        )}
      </div>
      
      {currentLevel && (
        <div className="text-center mb-8">
          <div className="relative">
            <div className={`w-24 h-24 bg-gradient-to-r ${getLevelColor(currentLevel.color)} rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl border-4 border-white`}>
              <TrophyIcon className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
          </div>
          <h4 className="text-2xl font-bold text-gray-900 mb-2">
            Level {currentLevel.levelNumber}: {currentLevel.name}
          </h4>
          <p className="text-sm text-gray-600 mb-4 px-4">{currentLevel.specialPrivileges}</p>
          
          {nextLevel && (
            <div className="card-gradient bg-gradient-to-r from-teal-500 to-coral-500 p-4 rounded-2xl">
              <p className="text-sm text-white font-semibold mb-3">
                🚀 Next Level: {nextLevel.name} ({nextLevel.pointsRequired - (progress?.totalPoints || 0)} pts needed)
              </p>
              <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                <motion.div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressToNextLevel()}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-white/80 text-center">
                {Math.round(getProgressToNextLevel())}% Complete
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Total Points', value: progress?.totalPoints || 0, icon: TrophyIcon, color: 'from-yellow-400 to-orange-500', bgColor: 'from-yellow-50 to-orange-50' },
          { label: 'Current Streak', value: progress?.currentStreak || 0, icon: FireIcon, color: 'from-red-400 to-pink-500', bgColor: 'from-red-50 to-pink-50' },
          { label: 'Homeworks', value: progress?.homeworkCompleted || 0, icon: AcademicCapIcon, color: 'from-green-400 to-emerald-500', bgColor: 'from-green-50 to-emerald-50' },
          { label: 'Perfect Scores', value: progress?.perfectScores || 0, icon: StarIcon, color: 'from-purple-400 to-indigo-500', bgColor: 'from-purple-50 to-indigo-50' }
        ].map((stat, index) => (
          <motion.div 
            key={stat.label} 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className={`w-16 h-16 bg-gradient-to-r ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-gray-100 shadow-lg`}>
              <stat.icon className={`h-8 w-8 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
            <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>
      
      {challenges.length > 0 && (
        <div className="border-t border-teal-200 pt-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-yellow-100 rounded-xl flex items-center justify-center">
              <FlagIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">
              Active Challenges ({getActiveChallengesCount()})
            </h4>
          </div>
          <div className="space-y-3">
            {challenges.slice(0, 3).map((challenge, index) => (
              <motion.div 
                key={challenge.id} 
                className="card hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-yellow-100 rounded-xl flex items-center justify-center">
                      <span className="text-lg">{challenge.rewardIcon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{challenge.title}</p>
                      <p className="text-xs text-gray-600">{challenge.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      {challenge.userProgress}/{challenge.target}
                    </p>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-purple-500 to-yellow-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${challenge.completionPercentage || 0}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {challenges.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500 font-medium">
                  +{challenges.length - 3} more challenges
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationWidget;
