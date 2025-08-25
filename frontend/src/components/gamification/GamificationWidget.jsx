import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  SparklesIcon,
  FlagIcon
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
      'Bronze': 'from-amber-600 to-orange-600',
      'Silver': 'from-gray-400 to-gray-600',
      'Gold': 'from-yellow-400 to-yellow-600',
      'Platinum': 'from-slate-300 to-slate-500',
      'Diamond': 'from-cyan-300 to-blue-500'
    };
    return colorMap[color] || 'from-gray-400 to-gray-600';
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow cursor-pointer" onClick={onViewDetails}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrophyIcon className="h-5 w-5 mr-2 text-sky-600" />
            Progress
          </h3>
          <span className="text-sm text-gray-500">View Details →</span>
        </div>
        
        {currentLevel && (
          <div className="text-center mb-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${getLevelColor(currentLevel.color)} rounded-full flex items-center justify-center mx-auto mb-2`}>
              <span className="text-white font-bold text-sm">{currentLevel.levelNumber}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{currentLevel.name}</p>
            <p className="text-xs text-gray-600">{progress?.totalPoints || 0} points</p>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-sky-600">{progress?.currentStreak || 0}</p>
            <p className="text-xs text-gray-600">Streak</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">{progress?.homeworkCompleted || 0}</p>
            <p className="text-xs text-gray-600">Done</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600">{getActiveChallengesCount()}</p>
            <p className="text-xs text-gray-600">Active</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <TrophyIcon className="h-6 w-6 mr-2 text-sky-600" />
          Your Progress
        </h3>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center"
          >
            View Full Dashboard
            <ArrowUpIcon className="h-4 w-4 ml-1 transform rotate-45" />
          </button>
        )}
      </div>
      
      {currentLevel && (
        <div className="text-center mb-6">
          <div className={`w-20 h-20 bg-gradient-to-r ${getLevelColor(currentLevel.color)} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
            <TrophyIcon className="h-10 w-10 text-white" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-1">
            Level {currentLevel.levelNumber}: {currentLevel.name}
          </h4>
          <p className="text-sm text-gray-600 mb-3">{currentLevel.specialPrivileges}</p>
          
          {nextLevel && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 mb-2">
                Next: {nextLevel.name} ({nextLevel.pointsRequired - (progress?.totalPoints || 0)} pts needed)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-sky-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressToNextLevel()}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Total Points', value: progress?.totalPoints || 0, icon: TrophyIcon, color: 'text-yellow-600' },
          { label: 'Current Streak', value: progress?.currentStreak || 0, icon: FireIcon, color: 'text-red-600' },
          { label: 'Homeworks', value: progress?.homeworkCompleted || 0, icon: AcademicCapIcon, color: 'text-green-600' },
          { label: 'Perfect Scores', value: progress?.perfectScores || 0, icon: StarIcon, color: 'text-purple-600' }
        ].map((stat, index) => (
          <div key={stat.label} className="text-center">
            <div className={`w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {challenges.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <FlagIcon className="h-4 w-4 mr-2 text-sky-600" />
            Active Challenges ({getActiveChallengesCount()})
          </h4>
          <div className="space-y-2">
            {challenges.slice(0, 3).map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{challenge.rewardIcon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{challenge.title}</p>
                    <p className="text-xs text-gray-600">{challenge.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {challenge.userProgress}/{challenge.target}
                  </p>
                  <div className="w-16 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-sky-500 h-1 rounded-full"
                      style={{ width: `${challenge.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {challenges.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{challenges.length - 3} more challenges
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationWidget;
