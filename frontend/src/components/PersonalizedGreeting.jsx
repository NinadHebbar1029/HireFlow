import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const PersonalizedGreeting = ({ stats = {}, userRole = 'job_seeker' }) => {
  const { user } = useSelector((state) => state.auth);
  const [greeting, setGreeting] = useState('');
  const [motivationalMessage, setMotivationalMessage] = useState('');

  useEffect(() => {
    generateGreeting();
    generateMotivationalMessage();
  }, [stats, userRole]);

  const generateGreeting = () => {
    const hour = new Date().getHours();
    const userName = user?.email?.split('@')[0] || 'there';
    
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    setGreeting(`${timeGreeting}, ${userName}! 👋`);
  };

  const generateMotivationalMessage = () => {
    if (userRole === 'job_seeker') {
      const applications = stats.totalApplications || 0;
      const profileCompletion = stats.profileCompletion || 0;
      
      if (applications === 0 && profileCompletion < 50) {
        setMotivationalMessage('Complete your profile and start applying to unlock opportunities!');
      } else if (applications === 0) {
        setMotivationalMessage('Your profile looks great! Ready to find your dream job?');
      } else if (applications < 5) {
        setMotivationalMessage(`Great start! You've applied to ${applications} ${applications === 1 ? 'job' : 'jobs'}. Keep the momentum going!`);
      } else if (applications < 10) {
        setMotivationalMessage(`Excellent progress! ${applications} applications submitted. Opportunities are coming your way!`);
      } else {
        setMotivationalMessage(`Amazing dedication! ${applications}+ applications show your commitment. Success is around the corner!`);
      }
    } else if (userRole === 'recruiter') {
      const activeJobs = stats.activeJobs || 0;
      const pendingReview = stats.pendingReview || 0;
      
      if (activeJobs === 0) {
        setMotivationalMessage('Start finding top talent by posting your first job!');
      } else if (pendingReview > 5) {
        setMotivationalMessage(`You have ${pendingReview} applications waiting for review. Great talent awaits!`);
      } else if (pendingReview > 0) {
        setMotivationalMessage(`${pendingReview} new ${pendingReview === 1 ? 'application' : 'applications'} to review. Find your next star performer!`);
      } else {
        setMotivationalMessage(`Managing ${activeJobs} active ${activeJobs === 1 ? 'position' : 'positions'}. Your hiring pipeline is strong!`);
      }
    } else if (userRole === 'admin') {
      const totalUsers = stats.totalUsers || 0;
      const activeJobs = stats.activeJobs || 0;
      
      if (totalUsers > 1000) {
        setMotivationalMessage(`Platform thriving with ${totalUsers.toLocaleString()} users and ${activeJobs} active jobs!`);
      } else if (totalUsers > 100) {
        setMotivationalMessage(`Growing strong with ${totalUsers} registered users. Keep up the great work!`);
      } else {
        setMotivationalMessage('Building a great platform for connecting talent with opportunity!');
      }
    }
  };

  const getEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 18) return '🌤️';
    return '🌙';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 mt-8"
    >
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 md:p-10 text-white overflow-hidden group hover:shadow-3xl transition-all duration-300">
        {/* Animated Background Effects */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-yellow-300 opacity-5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 opacity-5 rounded-full blur-3xl"></div>
        
        {/* Sparkle Effect */}
        <div className="absolute top-8 right-12 text-4xl animate-pulse opacity-70">✨</div>
        <div className="absolute bottom-10 right-20 text-3xl animate-pulse opacity-60" style={{ animationDelay: '0.5s' }}>⭐</div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <motion.h1 
                className="text-3xl md:text-5xl font-black mb-4 flex items-center gap-3 flex-wrap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-100 to-white drop-shadow-lg">
                  {greeting}
                </span>
                <span className="text-5xl animate-wave inline-block">{getEmoji()}</span>
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-white font-medium leading-relaxed max-w-2xl backdrop-blur-sm bg-white bg-opacity-10 rounded-xl p-4 shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="inline-block mr-2">💡</span>
                {motivationalMessage}
              </motion.p>
            </div>
          </div>
          
          {/* Quick Stats Bar - Enhanced */}
          {userRole === 'job_seeker' && stats.totalApplications > 0 && (
            <motion.div 
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 bg-white bg-opacity-20 backdrop-blur-md rounded-xl px-5 py-3 shadow-lg hover:bg-opacity-30 transition-all">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="text-sm font-semibold">
                  {stats.profileCompletion}% Profile Complete
                </span>
              </div>
              {stats.interviewsScheduled > 0 && (
                <div className="flex items-center gap-3 bg-white bg-opacity-20 backdrop-blur-md rounded-xl px-5 py-3 shadow-lg hover:bg-opacity-30 transition-all">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                  <span className="text-sm font-semibold">
                    {stats.interviewsScheduled} Interview{stats.interviewsScheduled !== 1 ? 's' : ''} Scheduled
                  </span>
                </div>
              )}
            </motion.div>
          )}
          
          {userRole === 'recruiter' && stats.activeJobs > 0 && (
            <motion.div 
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 bg-white bg-opacity-20 backdrop-blur-md rounded-xl px-5 py-3 shadow-lg hover:bg-opacity-30 transition-all">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                <span className="text-sm font-semibold">
                  {stats.activeJobs} Active {stats.activeJobs === 1 ? 'Job' : 'Jobs'}
                </span>
              </div>
              {stats.shortlisted > 0 && (
                <div className="flex items-center gap-3 bg-white bg-opacity-20 backdrop-blur-md rounded-xl px-5 py-3 shadow-lg hover:bg-opacity-30 transition-all">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
                  <span className="text-sm font-semibold">
                    {stats.shortlisted} Shortlisted Candidate{stats.shortlisted !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalizedGreeting;
