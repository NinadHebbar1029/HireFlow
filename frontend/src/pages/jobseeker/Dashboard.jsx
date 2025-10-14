import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBriefcase, FaBookmark, FaClipboardList, FaChartLine, FaBell, FaRocket, FaBuilding, FaMapMarkerAlt, FaDollarSign, FaClock, FaUser, FaStar, FaTrophy, FaFire, FaLightbulb, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaCalendarAlt, FaArrowUp, FaArrowDown, FaGraduationCap, FaHandshake, FaEye, FaHeart, FaBolt, FaAward } from 'react-icons/fa';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import PersonalizedGreeting from '../../components/PersonalizedGreeting';
import ActivityFeed from '../../components/ActivityFeed';
import { LineChartComponent } from '../../components/Charts';
import { motion } from 'framer-motion';

const JobSeekerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    savedJobs: 0,
    profileCompletion: 0,
    interviewsScheduled: 0
  });
  const [recommendations, setRecommendations] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [applicationTrend, setApplicationTrend] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;
    
    let completionScore = 0;
    const totalFields = 7; // Total number of fields to check
    
    // Check each field (each worth ~14.3% to total 100%)
    if (profile.full_name) completionScore += 14.3;
    if (profile.phone) completionScore += 14.3;
    if (profile.location) completionScore += 14.3;
    if (profile.bio) completionScore += 14.3;
    if (profile.resume_url) completionScore += 14.3;
    if (profile.profile_image_url) completionScore += 14.3;
    if (profile.skills && profile.skills.length > 0) completionScore += 14.2; // Last field gets remainder
    
    return Math.round(completionScore);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch with individual error handling
      let applications = [];
      let savedJobs = [];
      let recommendationsList = [];
      let notificationsList = [];
      let profileCompletion = 0;
      
      try {
        const applicationsRes = await api.get('/applications/my-applications');
        applications = applicationsRes.data || [];
        setRecentApplications(applications.slice(0, 5));
        
        // Calculate trend
        const lastWeek = applications.filter(app => {
          const appDate = new Date(app.applied_date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return appDate >= weekAgo;
        }).length;
        const prevWeek = applications.filter(app => {
          const appDate = new Date(app.applied_date);
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return appDate >= twoWeeksAgo && appDate < weekAgo;
        }).length;
        setApplicationTrend(prevWeek > 0 ? ((lastWeek - prevWeek) / prevWeek * 100) : 0);
      } catch (err) {
        console.log('Applications not available');
      }
      
      try {
        const savedRes = await api.get('/applications/saved/my-saved-jobs');
        savedJobs = savedRes.data || [];
      } catch (err) {
        console.log('Saved jobs not available');
      }
      
      try {
        const recommendationsRes = await api.get('/job-seekers/recommendations');
        recommendationsList = recommendationsRes.data || [];
        console.log('Recommendations received:', recommendationsList.length, recommendationsList);
        setRecommendations(recommendationsList.slice(0, 6));
      } catch (err) {
        console.error('Recommendations error:', err);
      }
      
      try {
        const notificationsRes = await api.get('/notifications');
        notificationsList = notificationsRes.data || [];
        setNotifications(notificationssList.slice(0, 5));
      } catch (err) {
        console.log('Notifications not available');
      }

      try {
        const analyticsRes = await api.get('/analytics/job-seeker/stats');
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.log('Analytics not available');
      }

      // Fetch profile to calculate completion
      try {
        const profileRes = await api.get('/job-seekers/profile');
        profileCompletion = calculateProfileCompletion(profileRes.data);
      } catch (err) {
        console.log('Profile not available');
        profileCompletion = 0;
      }

      // Calculate stats with available data
      setStats({
        totalApplications: applications.length,
        savedJobs: savedJobs.length,
        profileCompletion: profileCompletion,
        interviewsScheduled: applications.filter(app => app.status === 'interviewed').length
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      // Don't show error toast - just load with default data
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, gradient, onClick, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative group cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-${gradient} transition-all duration-300`}>
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-4 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
              <Icon className="text-white text-2xl" />
            </div>
            {trend !== undefined && trend !== 0 && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend > 0 ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                <span className="text-sm font-bold">{Math.abs(trend).toFixed(0)}%</span>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <p className={`text-4xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
              {value}
            </p>
          </div>

          {/* Animated shine effect */}
          <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:left-full transition-all duration-700 ease-in-out"></div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading Your Dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PersonalizedGreeting role="Job Seeker" />

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatCard
              icon={FaBriefcase}
              title="Total Applications"
              value={stats.totalApplications}
              color="from-blue-500 to-blue-600"
              gradient="blue-500"
              onClick={() => navigate('/job-seeker/applications')}
              trend={applicationTrend}
            />
            <StatCard
              icon={FaBookmark}
              title="Saved Jobs"
              value={stats.savedJobs}
              color="from-purple-500 to-purple-600"
              gradient="purple-500"
              onClick={() => navigate('/job-seeker/saved-jobs')}
            />
            <StatCard
              icon={FaGraduationCap}
              title="Profile Strength"
              value={`${stats.profileCompletion}%`}
              color="from-green-500 to-green-600"
              gradient="green-500"
              onClick={() => navigate('/job-seeker/profile')}
            />
            <StatCard
              icon={FaCalendarAlt}
              title="Interviews"
              value={stats.interviewsScheduled}
              color="from-orange-500 to-orange-600"
              gradient="orange-500"
              onClick={() => navigate('/job-seeker/applications')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* AI Recommendations with Enhanced Design */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 opacity-90"></div>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* Header */}
                <div className="relative px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <FaRocket className="text-white text-3xl" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                          AI-Powered Recommendations
                          <FaBolt className="text-yellow-300 animate-pulse" />
                        </h2>
                        <p className="text-blue-100 text-sm">Personalized jobs matching your profile</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                      <FaStar className="text-yellow-300" />
                      <span className="text-white font-bold text-sm">{recommendations.length} Perfect Matches</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative bg-gray-50 px-8 py-8">
                  {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {recommendations.map((job, index) => (
                        <motion.div
                          key={job.job_id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          className="group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-300"
                          onClick={() => navigate(`/job-seeker/jobs/${job.job_id}`)}
                        >
                          {/* Match percentage badge */}
                          <div className="absolute top-4 right-4 z-10">
                            <div className="relative">
                              <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg">
                                <div className="flex items-center gap-1">
                                  <FaCheckCircle className="text-white text-sm" />
                                  <span className="text-white font-black text-sm">{job.match_percentage || 85}%</span>
                                </div>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur opacity-50 animate-pulse"></div>
                            </div>
                          </div>

                          <div className="p-6">
                            <h3 className="font-black text-gray-900 text-lg mb-2 pr-20 group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-gray-600 font-semibold mb-4 flex items-center gap-2">
                              <FaBuilding className="text-blue-500" />
                              {job.company_name}
                            </p>

                            {/* Job details grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                                  <FaMapMarkerAlt className="text-blue-600 text-xs" />
                                </div>
                                <span className="text-gray-600 font-medium">{job.location}</span>
                              </div>
                              {job.salary && (
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                                    <FaDollarSign className="text-green-600 text-xs" />
                                  </div>
                                  <span className="text-gray-600 font-medium">{job.salary}</span>
                                </div>
                              )}
                            </div>

                            {/* Action button */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <FaClock className="text-gray-400 text-xs" />
                                <span className="text-xs text-gray-500">
                                  {new Date(job.posted_date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold text-sm group-hover:shadow-lg transition-shadow">
                                View Details →
                              </div>
                            </div>
                          </div>

                          {/* Hover gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                        <FaLightbulb className="text-blue-600 text-5xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {stats.profileCompletion < 70 ? 'Get Personalized Recommendations' : 'No Job Matches Yet'}
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {stats.profileCompletion < 70 
                          ? 'Complete your profile and add skills to unlock AI-powered job matches!'
                          : 'No jobs are currently available that match your skills. Check back soon or browse all jobs!'}
                      </p>
                      <div className="flex gap-4 justify-center">
                        {stats.profileCompletion < 70 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/job-seeker/profile')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                          >
                            Complete Profile Now →
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate('/job-seeker/jobs')}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                          Browse All Jobs →
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Recent Applications with Modern Design */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <FaClipboardList className="text-white text-2xl" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">Recent Applications</h2>
                        <p className="text-indigo-100 text-sm">Track your application status</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/job-seeker/applications')}
                      className="hidden sm:block px-6 py-2 bg-white text-indigo-600 rounded-xl font-bold hover:shadow-lg transition-shadow"
                    >
                      View All
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {recentApplications.length > 0 ? (
                    <div className="space-y-4">
                      {recentApplications.map((app, index) => (
                        <motion.div
                          key={app.application_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01, x: 4 }}
                          className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-100 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                          onClick={() => navigate('/job-seeker/applications')}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-black text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                                {app.job_title}
                              </h3>
                              <p className="text-gray-600 font-medium flex items-center gap-2">
                                <FaBuilding className="text-gray-400" />
                                {app.company_name}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {/* Status badge */}
                              <div className={`px-4 py-2 rounded-xl font-bold text-sm shadow-md ${
                                app.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                                app.status === 'shortlisted' ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900' :
                                app.status === 'interviewed' ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-purple-900' :
                                app.status === 'hired' ? 'bg-gradient-to-r from-green-400 to-green-500 text-green-900' :
                                'bg-gradient-to-r from-red-400 to-red-500 text-red-900'
                              }`}>
                                {app.status === 'pending' && <FaHourglassHalf className="inline mr-1" />}
                                {app.status === 'shortlisted' && <FaCheckCircle className="inline mr-1" />}
                                {app.status === 'interviewed' && <FaHandshake className="inline mr-1" />}
                                {app.status === 'hired' && <FaTrophy className="inline mr-1" />}
                                {app.status === 'rejected' && <FaTimesCircle className="inline mr-1" />}
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </div>
                              
                              <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-500 font-medium">Applied</p>
                                <p className="text-sm font-bold text-gray-700">
                                  {new Date(app.applied_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-block p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4">
                        <FaBriefcase className="text-indigo-600 text-5xl" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
                      <p className="text-gray-600 mb-6">Start applying to jobs that match your skills!</p>
                      <button
                        onClick={() => navigate('/job-seeker/jobs')}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        Browse Jobs →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Application Analytics Chart */}
              {analytics?.applicationStats && analytics.applicationStats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <FaChartLine className="text-white text-2xl" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">Application Progress</h2>
                        <p className="text-blue-100 text-sm">Your journey over time</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <LineChartComponent
                      data={analytics.applicationStats}
                      dataKeys={['total', 'shortlisted', 'interviewed', 'hired']}
                      xAxisKey="date"
                      height={250}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Career Success Score */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl overflow-hidden p-8 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FaTrophy className="text-4xl" />
                  <div>
                    <h3 className="text-2xl font-black">Success Score</h3>
                    <p className="text-sm text-yellow-100">Keep improving!</p>
                  </div>
                </div>
                <div className="text-6xl font-black mb-2">{stats.profileCompletion}%</div>
                <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                  <div
                    className="bg-white h-4 rounded-full transition-all duration-1000 shadow-lg"
                    style={{ width: `${stats.profileCompletion}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FaCheckCircle />
                      <span className="font-bold">Applications</span>
                    </div>
                    <div className="text-2xl font-black">{stats.totalApplications}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FaHeart />
                      <span className="font-bold">Saved Jobs</span>
                    </div>
                    <div className="text-2xl font-black">{stats.savedJobs}</div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FaFire className="text-white text-xl" />
                    <h2 className="text-lg font-black text-white">Quick Actions</h2>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/job-seeker/jobs')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <FaBriefcase className="text-xl" />
                      </div>
                      <span>Search Jobs</span>
                    </div>
                    <FaArrowUp className="transform rotate-45 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/job-seeker/profile')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <FaUser className="text-xl" />
                      </div>
                      <span>Edit Profile</span>
                    </div>
                    <FaArrowUp className="transform rotate-45 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/job-seeker/saved-jobs')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <FaBookmark className="text-xl" />
                      </div>
                      <span>Saved Jobs</span>
                    </div>
                    <FaArrowUp className="transform rotate-45 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Activity Feed */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FaFire className="text-white text-xl" />
                    <h2 className="text-lg font-black text-white">Recent Activity</h2>
                  </div>
                </div>
                <div className="p-4">
                  <ActivityFeed userRole="job_seeker" limit={8} />
                </div>
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaBell className="text-white text-xl" />
                      <h2 className="text-lg font-black text-white">Notifications</h2>
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-3 py-1 bg-white text-indigo-600 rounded-full text-xs font-black">
                        {notifications.length}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  {notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map((notif, index) => (
                        <motion.div
                          key={notif.notification_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-bold text-sm text-gray-900 mb-1">{notif.title}</h4>
                          <p className="text-xs text-gray-600">{notif.message}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-6">
                      No new notifications
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobSeekerDashboard;
